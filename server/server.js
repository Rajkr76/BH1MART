const fs = require("fs");
const path = require("path");

// Load .env from current directory (deployment) or parent directory (local dev)
const envPath = fs.existsSync(path.resolve(__dirname, ".env"))
  ? path.resolve(__dirname, ".env")
  : path.resolve(__dirname, "../.env");

require("dotenv").config({ path: envPath });

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Order = require("./models/Order");
const Admin = require("./models/Admin");
const Message = require("./models/Message");
const FoodRequest = require("./models/FoodRequest");
const Product = require("./models/Product");
const DeviceSecurity = require("./models/DeviceSecurity");
const OrderLog = require("./models/OrderLog");
const checkDeviceBlock = require("./middleware/checkDeviceBlock");
const { validateOrder } = require("./utils/orderValidator");
const { checkAbuseBlock, recordFailedAttempt, resetAttempts } = require("./middleware/abuseGuard");
const rateLimit = require("express-rate-limit");

// Rate limiter: 5 requests per 10 minutes per IP for POST /api/order
const orderRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) return forwarded.split(",")[0].trim();
    return req.socket.remoteAddress || "unknown";
  },
  handler: (req, res) => {
    res.status(429).json({ error: "Too many order attempts. Please try again after 10 minutes." });
  },
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "https://bh-1-mart.vercel.app", methods: ["GET", "POST"], credentials: true },
});

const ADMIN_NAME = process.env.ADMIN_NAME ;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID ;
const JWT_SECRET = process.env.JWT_SECRET ;

// In-memory active users per room (messages now in MongoDB)
const chatRooms = {}; // { chatId: { users: [] } }

// CORS — allow frontend (Next.js) to call API
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://bh-1-mart.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});
app.use(express.json());

// ─── MongoDB Connection ───
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("MongoDB connected");
    // Seed admin user if not exists
    try {
      const existing = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
      if (!existing) {
        await Admin.create({
          email: process.env.ADMIN_EMAIL,
          password: process.env.ADMIN_PASSWORD,
          name: ADMIN_NAME,
          chatId: ADMIN_CHAT_ID,
        });
        console.log("Admin user seeded:", process.env.ADMIN_EMAIL);
      } else {
        console.log("Admin user exists:", existing.email);
      }
    } catch (err) {
      console.error("Admin seed error:", err);
    }
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// ─── Auth Middleware ───
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// ─── REST API ───

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", db: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

// ─── Admin Auth Routes ───

// Admin login
app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = jwt.sign(
      { id: admin._id, email: admin.email, name: admin.name, chatId: admin.chatId },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({
      success: true,
      token,
      admin: { name: admin.name, email: admin.email, chatId: admin.chatId },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Verify token
app.get("/api/admin/verify", requireAdmin, (req, res) => {
  res.json({ valid: true, admin: req.admin });
});

// ─── Order Routes ───

// Helper: Extract real client IP (proxy-safe)
function getClientIP(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.socket.remoteAddress || "unknown";
}

// Create order (saves to MongoDB + creates chat room)
app.post("/api/order", orderRateLimiter, checkDeviceBlock, checkAbuseBlock, async (req, res) => {
  try {
    const { chatId, name, phone, room, phase, block, items, total, fingerprint } = req.body;
    const clientIP = getClientIP(req);

    // Backend quantity enforcement: max 5 per item
    const MAX_QTY_PER_ITEM = 5;
    if (items && Array.isArray(items)) {
      const bulkItems = items.filter((item) => item.quantity > MAX_QTY_PER_ITEM);
      if (bulkItems.length > 0) {
        return res.status(400).json({
          error: "Bulk orders are handled manually. Redirect to WhatsApp.",
          bulkItems: bulkItems.map((i) => ({ name: i.name, quantity: i.quantity })),
        });
      }
    }

    // Validate the order
    const validation = await validateOrder({ phone, name, room, fingerprint });

    if (!validation.isValid) {
      // Only count HARD fraud signals toward device blocking (not format typos)
      if (validation.severity === "hard" && fingerprint) {
        const device = await DeviceSecurity.findOneAndUpdate(
          { fingerprint },
          {
            $inc: { invalidAttempts: 1 },
            $setOnInsert: { fingerprint },
          },
          { upsert: true, new: true }
        );

        // Auto-block if 2+ hard invalid attempts (high severity like MNCs)
        if (device.invalidAttempts >= 2 && !device.isBlocked) {
          device.isBlocked = true;
          device.blockedReason = "Multiple fake order attempts detected";
          await device.save();
        }

        // Also record in Attempt collection (24h block after 2 failures)
        await recordFailedAttempt(fingerprint);
      }

      // Log attempt
      await OrderLog.create({
        fingerprint: fingerprint || "unknown",
        phone,
        ip: clientIP,
        status: "invalid",
        reason: validation.reason,
      });

      // Return generic user-friendly message (don't reveal validation details for security)
      // Only show specific messages for soft errors (format issues)
      if (validation.severity === "soft") {
        return res.status(400).json({ error: validation.reason });
      } else {
        // Hard fraud detection - generic message
        return res.status(400).json({ error: "Invalid order information. Please check your details and try again." });
      }
    }

    // Valid order — create it
    const order = await Order.create({ chatId, name, phone, room, phase, block, items, total, fingerprint: fingerprint || "" });
    chatRooms[chatId] = { users: [] };

    // Reset abuse attempts on successful order
    if (fingerprint) {
      await resetAttempts(fingerprint);
    }

    // Log valid order
    await OrderLog.create({
      fingerprint: fingerprint || "unknown",
      phone,
      ip: clientIP,
      status: "valid",
      reason: "",
    });

    res.json({ success: true, chatId: order.chatId });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Get single order by chatId
app.get("/api/order/:chatId", async (req, res) => {
  try {
    const order = await Order.findOne({ chatId: req.params.chatId }).lean();
    if (order) res.json(order);
    else res.status(404).json({ error: "Order not found" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get ALL orders (for admin panel — requires auth)
app.get("/api/orders", requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    // Attach live message count from MongoDB
    const enriched = await Promise.all(orders.map(async (o) => {
      const messageCount = await Message.countDocuments({ chatId: o.chatId, type: "message" });
      return {
        ...o,
        messageCount,
        isRoomActive: !!chatRooms[o.chatId] && chatRooms[o.chatId].users.length > 0,
      };
    }));
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update order status (admin — requires auth)
app.patch("/api/order/:chatId/status", requireAdmin, async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { chatId: req.params.chatId },
      { status: req.body.status },
      { new: true }
    ).lean();
    if (order) res.json(order);
    else res.status(404).json({ error: "Order not found" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Check if a chat ID is valid (exists in DB)
app.get("/api/verify-chat/:chatId", async (req, res) => {
  try {
    const exists = await Order.exists({ chatId: req.params.chatId });
    res.json({ valid: !!exists });
  } catch {
    res.json({ valid: false });
  }
});

// ─── Device Security Routes (Admin) ───

// Get all blocked devices
app.get("/api/admin/blocked-devices", requireAdmin, async (req, res) => {
  try {
    const devices = await DeviceSecurity.find().sort({ updatedAt: -1 }).lean();
    // Attach recent order logs for each device
    const enriched = await Promise.all(
      devices.map(async (d) => {
        const logs = await OrderLog.find({ fingerprint: d.fingerprint })
          .sort({ createdAt: -1 })
          .limit(5)
          .lean();
        return { ...d, recentLogs: logs };
      })
    );
    res.json(enriched);
  } catch (err) {
    console.error("Fetch blocked devices error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Unblock a device by fingerprint
app.patch("/api/admin/unblock-device/:fingerprint", requireAdmin, async (req, res) => {
  try {
    const device = await DeviceSecurity.findOneAndUpdate(
      { fingerprint: req.params.fingerprint },
      { isBlocked: false, invalidAttempts: 0, blockedReason: "" },
      { new: true }
    ).lean();
    if (device) res.json({ success: true, device });
    else res.status(404).json({ error: "Device not found" });
  } catch (err) {
    console.error("Unblock device error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get order logs (admin only)
app.get("/api/admin/order-logs", requireAdmin, async (req, res) => {
  try {
    const logs = await OrderLog.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ─── Food Request Routes ───

// Submit food request
app.post("/api/food-request", async (req, res) => {
  try {
    const { name, phone, room, foodItem, description } = req.body;
    if (!name || !phone || !room || !foodItem) {
      return res.status(400).json({ error: "Name, phone, room, and food item are required" });
    }
    const request = await FoodRequest.create({ name, phone, room, foodItem, description });
    res.json({ success: true, requestId: request._id });
  } catch (err) {
    console.error("Food request error:", err);
    res.status(500).json({ error: "Failed to submit request" });
  }
});

// Get all food requests (admin only)
app.get("/api/food-requests", requireAdmin, async (req, res) => {
  try {
    const requests = await FoodRequest.find().sort({ createdAt: -1 }).lean();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update food request status (admin only)
app.patch("/api/food-request/:id/status", requireAdmin, async (req, res) => {
  try {
    const request = await FoodRequest.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).lean();
    if (request) res.json(request);
    else res.status(404).json({ error: "Request not found" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ─── Product Routes ───

// Get all products (public)
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ priority: 1, createdAt: -1 }).lean();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Add new product (admin only)
app.post("/api/products", requireAdmin, async (req, res) => {
  try {
    const { name, price, image, category, inStock, priority } = req.body;
    if (!name || !price || !image) {
      return res.status(400).json({ error: "Name, price, and image are required" });
    }
    const product = await Product.create({ name, price, image, category, inStock, priority });
    res.json({ success: true, product });
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// Update product (admin only)
app.patch("/api/products/:id", requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).lean();
    if (product) res.json(product);
    else res.status(404).json({ error: "Product not found" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Delete product (admin only)
app.delete("/api/products/:id", requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (product) res.json({ success: true, message: "Product deleted" });
    else res.status(404).json({ error: "Product not found" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ─── Socket.io ───
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", async ({ chatId, role }) => {
    // Validate: only allow joining if the order exists in DB
    const orderExists = await Order.exists({ chatId });
    if (!orderExists) {
      socket.emit("error-message", { message: "Invalid Chat ID. No order found for this ID." });
      return;
    }

    // Create in-memory room for active users if not exists
    if (!chatRooms[chatId]) {
      chatRooms[chatId] = { users: [] };
    }

    socket.join(chatId);
    chatRooms[chatId].users.push({ socketId: socket.id, role });

    // Fetch order from DB for context
    const order = await Order.findOne({ chatId }).lean();

    // Load all past messages from MongoDB
    const pastMessages = await Message.find({ chatId }).sort({ timestamp: 1 }).lean();
    const formattedMessages = pastMessages.map((m) => ({
      id: m._id.toString(),
      type: m.type,
      message: m.message,
      sender: m.sender,
      role: m.role,
      timestamp: m.timestamp.toISOString(),
    }));

    // Send past messages + order to the joining user
    socket.emit("room-joined", {
      chatId,
      messages: formattedMessages,
      order,
    });

    // System message — save to DB
    const sysMsg = {
      chatId,
      type: "system",
      message: `${role === "admin" ? `Admin (${ADMIN_NAME})` : "Customer"} joined the chat`,
      sender: "",
      role: "system",
      timestamp: new Date(),
    };
    await Message.create(sysMsg);
    io.to(chatId).emit("user-status", { message: sysMsg.message, online: true, role });
  });

  socket.on("send-message", async ({ chatId, message, sender, role }) => {
    if (!chatRooms[chatId]) return;
    const msg = {
      chatId,
      type: "message",
      message,
      sender,
      role,
      timestamp: new Date(),
    };
    // Save to MongoDB
    const saved = await Message.create(msg);
    const emitMsg = {
      id: saved._id.toString(),
      message,
      sender,
      role,
      timestamp: saved.timestamp.toISOString(),
    };
    io.to(chatId).emit("receive-message", emitMsg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    for (const chatId in chatRooms) {
      const room = chatRooms[chatId];
      const userIndex = room.users.findIndex((u) => u.socketId === socket.id);
      if (userIndex !== -1) {
        const user = room.users[userIndex];
        room.users.splice(userIndex, 1);
        const leaveMsg = {
          chatId,
          type: "system",
          message: `${user.role === "admin" ? `Admin (${ADMIN_NAME})` : "Customer"} left the chat`,
          sender: "",
          role: "system",
          timestamp: new Date(),
        };
        Message.create(leaveMsg).catch(() => {});
        io.to(chatId).emit("user-status", { message: leaveMsg.message, online: false, role: user.role });
      }
    }
  });
});

const PORT = process.env.PORT ;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
