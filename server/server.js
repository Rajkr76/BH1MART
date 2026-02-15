const fs = require("fs");
const path = require("path");

// Load .env from current directory (deployment) or parent directory (local dev)
const envPath = fs.existsSync(path.resolve(__dirname, ".env"))
  ? path.resolve(__dirname, ".env")
  : path.resolve(__dirname, "../.env");

require("dotenv").config({ path: envPath });

const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Admin = require("./models/Admin");
const FoodRequest = require("./models/FoodRequest");
const Product = require("./models/Product");
const { validateInappropriateContent } = require("./utils/validateInappropriateContent");

const app = express();
const server = http.createServer(app);

const ADMIN_NAME = process.env.ADMIN_NAME ;
const JWT_SECRET = process.env.JWT_SECRET ;

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
        });
        console.log("✓ Admin user seeded:", process.env.ADMIN_EMAIL);
      } else {
        console.log("✓ Admin user exists:", existing.email);
      }
    } catch (err) {
      console.error("Admin seed error:", err);
    }

    // Seed products if database is empty
    try {
      const productCount = await Product.countDocuments();
      if (productCount === 0) {
        const seedProducts = [
          { name: "Maggi", category: "Noodles", price: 30, image: "/maggie.jpeg", priority: 1, inStock: true },
          { name: "Kurkure", category: "Snacks", price: 35, image: "/kurkure.jpeg", priority: 2, inStock: true },
          { name: "Maggi Cup Noodles", category: "Noodles", price: 85, image: "/Maggie cup noodles.jpeg", priority: 3, inStock: true },
          { name: "Blue Lays", category: "Chips", price: 65, image: "/blue lays.jpeg", priority: 4, inStock: true },
          { name: "Dark Fantasy", category: "Biscuits", price: 40, image: "/dark fantasy choco biscuits .jpeg", priority: 5, inStock: true },
          { name: "Oreo Strawberry", category: "Biscuits", price: 45, image: "/Oreo(strawberry).jpeg", priority: 6, inStock: true },
          { name: "Ramen Chicken", category: "Noodles", price: 70, image: "/Ramen Spicy Chicken noodles.jpeg", priority: 7, inStock: true },
          { name: "Ramen Veg", category: "Noodles", price: 73, image: "/Ramen Spicy veg noodles.jpeg", priority: 8, inStock: true },
          { name: "TooYumm Bhoot", category: "Chips", price: 67, image: "/too yum bhoot chips .jpeg", priority: 9, inStock: true },
          { name: "TooYumm Onion", category: "Chips", price: 67, image: "/too yum onion chhips.jpeg", priority: 10, inStock: true },
          { name: "Mad Angles", category: "Snacks", price: 65, image: "/Mad angles achari masti.jpeg", priority: 11, inStock: true },
          { name: "Bikaji Bhel", category: "Snacks", price: 63, image: "/bikaji bhel.jpeg", priority: 12, inStock: true },
        ];
        await Product.insertMany(seedProducts);
        console.log(`✓ Products seeded: ${seedProducts.length} products added to database`);
      } else {
        console.log(`✓ Products exist: ${productCount} products in database`);
      }
    } catch (err) {
      console.error("Product seed error:", err);
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
      { id: admin._id, email: admin.email, name: admin.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({
      success: true,
      token,
      admin: { name: admin.name, email: admin.email },
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

// ─── Food Request Routes ───

// Submit food request
app.post("/api/food-request", async (req, res) => {
  try {
    const { name, phone, room, foodItem, description } = req.body;
    if (!name || !phone || !room || !foodItem) {
      return res.status(400).json({ error: "Name, phone, room, and food item are required" });
    }

    // Validate food item for inappropriate content
    const foodItemCheck = validateInappropriateContent(foodItem);
    if (!foodItemCheck.valid) {
      return res.status(400).json({ error: "Please use appropriate language for food item requests." });
    }

    // Validate description for inappropriate content
    if (description) {
      const descCheck = validateInappropriateContent(description);
      if (!descCheck.valid) {
        return res.status(400).json({ error: "Please use appropriate language in the description." });
      }
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

// Get a single food request by ID (public - for users to track their own requests)
app.get("/api/food-request/:id", async (req, res) => {
  try {
    const request = await FoodRequest.findById(req.params.id).lean();
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }
    res.json(request);
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

// Seed products (admin only) - one-time setup to populate initial products
app.post("/api/products/seed", requireAdmin, async (req, res) => {
  try {
    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
      return res.status(400).json({ 
        error: "Products already exist in database", 
        count: existingCount,
        message: "Delete existing products first or use manual add"
      });
    }

    const seedProducts = [
      { name: "Maggi", category: "Noodles", price: 30, image: "/maggie.jpeg", priority: 1 },
      { name: "Kurkure", category: "Snacks", price: 35, image: "/kurkure.jpeg", priority: 2 },
      { name: "Maggi Cup Noodles", category: "Noodles", price: 85, image: "/Maggie cup noodles.jpeg", priority: 3 },
      { name: "Blue Lays", category: "Chips", price: 65, image: "/blue lays.jpeg", priority: 4 },
      { name: "Dark Fantasy", category: "Biscuits", price: 40, image: "/dark fantasy choco biscuits .jpeg", priority: 5 },
      { name: "Oreo Strawberry", category: "Biscuits", price: 45, image: "/Oreo(strawberry).jpeg", priority: 6 },
      { name: "Ramen Chicken", category: "Noodles", price: 70, image: "/Ramen Spicy Chicken noodles.jpeg", priority: 7 },
      { name: "Ramen Veg", category: "Noodles", price: 73, image: "/Ramen Spicy veg noodles.jpeg", priority: 8 },
      { name: "TooYumm Bhoot", category: "Chips", price: 67, image: "/too yum bhoot chips .jpeg", priority: 9 },
      { name: "TooYumm Onion", category: "Chips", price: 67, image: "/too yum onion chhips.jpeg", priority: 10 },
      { name: "Mad Angles", category: "Snacks", price: 65, image: "/Mad angles achari masti.jpeg", priority: 11 },
      { name: "Bikaji Bhel", category: "Snacks", price: 63, image: "/bikaji bhel.jpeg", priority: 12 },
    ];

    const createdProducts = await Product.insertMany(seedProducts);
    res.json({ 
      success: true, 
      message: `Successfully seeded ${createdProducts.length} products`,
      count: createdProducts.length,
      products: createdProducts
    });
  } catch (err) {
    console.error("Seed products error:", err);
    res.status(500).json({ error: "Failed to seed products" });
  }
});

const PORT = process.env.PORT ;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
