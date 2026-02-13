"use client";
import { useState, useEffect } from "react";
import ChatWindow from "@/components/ChatWindow";
import ProductManagement from "@/components/ProductManagement";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const STATUSES = ["pending", "preparing", "delivered", "cancelled"];
const STATUS_COLORS = {
  pending: "bg-yellow-400 text-yellow-900",
  preparing: "bg-blue-400 text-blue-900",
  delivered: "bg-green-400 text-green-900",
  cancelled: "bg-red-400 text-red-900",
};

// ─── Login Screen ───
function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }
      localStorage.setItem("b1mart_admin_token", data.token);
      localStorage.setItem("b1mart_admin_info", JSON.stringify(data.admin));
      onLogin(data);
    } catch {
      setError("Cannot connect to server.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border-4 border-amber-900 bg-amber-50 shadow-[8px_8px_0px_#78350f] overflow-hidden">
        <div className="flex items-center gap-2 bg-amber-900 px-4 py-2">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
          <span className="ml-3 text-xs font-bold uppercase tracking-widest text-amber-100">
            ADMIN LOGIN
          </span>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-center mb-2">
            <div className="text-4xl mb-2">🔐</div>
            <h2 className="text-lg font-black uppercase text-amber-900">Bhaskar B1 MART Admin</h2>
            <p className="text-xs text-amber-600 font-bold">Enter your credentials to continue</p>
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-wide text-amber-900 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@example.com"
              className="w-full rounded-lg border-2 border-amber-900 bg-amber-100 px-3 py-2 text-amber-900 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-wide text-amber-900 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-lg border-2 border-amber-900 bg-amber-100 px-3 py-2 text-amber-900 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          {error && (
            <p className="text-xs font-bold text-red-600 bg-red-100 border border-red-300 rounded-lg p-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl border-3 border-amber-900 bg-orange-500 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {loading ? "LOGGING IN..." : "LOGIN"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main Admin Panel ───
export default function AdminPage() {
  const [isAuth, setIsAuth] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);
  const [checking, setChecking] = useState(true);
  const [chatId, setChatId] = useState("");
  const [joined, setJoined] = useState(false);
  const [idInput, setIdInput] = useState("");
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [tab, setTab] = useState("orders");
  const [requests, setRequests] = useState([]);
  const [blockedDevices, setBlockedDevices] = useState([]);

  const getToken = () => localStorage.getItem("b1mart_admin_token");

  // Check existing token on mount
  useEffect(() => {
    const verifyToken = async () => {
      const token = getToken();
      if (!token) { setChecking(false); return; }
      try {
        const res = await fetch(`${API_URL}/api/admin/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const stored = localStorage.getItem("b1mart_admin_info");
          const info = stored ? JSON.parse(stored) : {};
          setAdminInfo(info);
          setIsAuth(true);
        } else {
          localStorage.removeItem("b1mart_admin_token");
          localStorage.removeItem("b1mart_admin_info");
        }
      } catch {
        // Server offline — keep token, let user retry
      }
      setChecking(false);
    };
    verifyToken();
  }, []);

  // Fetch orders with auth
  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const data = await res.json();
      setOrders(data);
    } catch {
      // Server might be offline
    }
  };

  // Fetch food requests with auth
  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_URL}/api/food-requests`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const data = await res.json();
      setRequests(data);
    } catch {
      // Server might be offline
    }
  };

  // Fetch blocked devices with auth
  const fetchBlockedDevices = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/blocked-devices`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      setBlockedDevices(data);
    } catch {}
  };

  const unblockDevice = async (fingerprint) => {
    if (!confirm("Are you sure you want to unblock this device?")) return;
    try {
      await fetch(`${API_URL}/api/admin/unblock-device/${fingerprint}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      fetchBlockedDevices();
    } catch {}
  };

  useEffect(() => {
    if (!isAuth) return;
    fetchOrders();
    fetchRequests();
    fetchBlockedDevices();
    const interval = setInterval(() => {
      fetchOrders();
      fetchRequests();
      fetchBlockedDevices();
    }, 5000);
    return () => clearInterval(interval);
  }, [isAuth]);

  const handleLogin = (data) => {
    setAdminInfo(data.admin);
    setIsAuth(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("b1mart_admin_token");
    localStorage.removeItem("b1mart_admin_info");
    setIsAuth(false);
    setAdminInfo(null);
  };

  const updateStatus = async (ordChatId, newStatus) => {
    try {
      await fetch(`${API_URL}/api/order/${ordChatId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchOrders();
    } catch {}
  };

  const updateRequestStatus = async (requestId, newStatus) => {
    try {
      await fetch(`${API_URL}/api/food-request/${requestId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchRequests();
    } catch {}
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!idInput.trim()) return;
    setChatId(idInput.trim().toUpperCase());
    setJoined(true);
  };

  const openChat = (id) => {
    setChatId(id);
    setIdInput(id);
    setJoined(true);
    setTab("chat");
  };

  const viewOrder = (order) => {
    setSelectedOrder(selectedOrder?.chatId === order.chatId ? null : order);
  };

  // ─── Loading ───
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-amber-900 font-black uppercase text-sm">Checking session...</p>
      </div>
    );
  }

  // ─── Login Gate ───
  if (!isAuth) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  // ─── Chat View ───
  if (joined && tab === "chat") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => { setJoined(false); setChatId(""); setIdInput(""); setTab("orders"); }}
          className="mb-4 rounded-lg border-2 border-amber-900 bg-amber-100 px-4 py-2 text-xs font-black uppercase text-amber-900 hover:bg-amber-200 transition-colors"
        >
          ← BACK TO PANEL
        </button>
        <ChatWindow chatId={chatId} role="admin" senderName={adminInfo?.name || "bhaskar"} />
      </div>
    );
  }

  // ─── Admin Panel ───
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header + Chat join */}
      <div className="rounded-2xl border-4 border-amber-900 bg-amber-50 shadow-[6px_6px_0px_#78350f] overflow-hidden">
        <div className="flex items-center gap-2 bg-amber-900 px-4 py-2">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
          <span className="ml-3 text-xs font-bold uppercase tracking-widest text-amber-100">
            ADMIN PANEL
          </span>
          <button
            onClick={handleLogout}
            className="ml-auto text-[10px] font-black uppercase bg-red-500/80 text-white px-3 py-1 rounded-full hover:bg-red-600 transition-colors"
          >
            LOGOUT
          </button>
        </div>
        <form onSubmit={handleJoin} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black uppercase text-amber-900">
              Quick Chat Join
            </h2>
            <span className="text-xs font-bold bg-amber-200 text-amber-900 px-3 py-1 rounded-full border border-amber-900/30">
              {adminInfo?.name || "bhaskar"} | {adminInfo?.chatId || "CHAT-GIRI04"}
            </span>
          </div>
          <div className="flex gap-3">
            <input
              value={idInput}
              onChange={(e) => setIdInput(e.target.value)}
              placeholder="Enter Chat ID (e.g. CHAT-8F32K9)"
              className="flex-1 rounded-lg border-2 border-amber-900 bg-amber-100 px-3 py-2 text-amber-900 font-bold uppercase focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="submit"
              onClick={() => setTab("chat")}
              className="rounded-lg border-2 border-amber-900 bg-orange-500 px-6 py-2 text-sm font-black uppercase text-white hover:bg-orange-600 transition-colors"
            >
              JOIN CHAT
            </button>
          </div>
        </form>
      </div>

      {/* Tab Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("orders")}
          className={`flex-1 rounded-xl border-3 py-3 text-sm font-black uppercase tracking-wider transition-colors ${
            tab === "orders"
              ? "border-amber-900 bg-orange-500 text-white shadow-[4px_4px_0px_#78350f]"
              : "border-amber-900/30 bg-amber-100 text-amber-900 hover:bg-amber-200"
          }`}
        >
          📦 ORDERS ({orders.length})
        </button>
        <button
          onClick={() => setTab("requests")}
          className={`flex-1 rounded-xl border-3 py-3 text-sm font-black uppercase tracking-wider transition-colors ${
            tab === "requests"
              ? "border-amber-900 bg-orange-500 text-white shadow-[4px_4px_0px_#78350f]"
              : "border-amber-900/30 bg-amber-100 text-amber-900 hover:bg-amber-200"
          }`}
        >
          🍜 REQUESTS ({requests.length})
        </button>
        <button
          onClick={() => setTab("products")}
          className={`flex-1 rounded-xl border-3 py-3 text-sm font-black uppercase tracking-wider transition-colors ${
            tab === "products"
              ? "border-amber-900 bg-orange-500 text-white shadow-[4px_4px_0px_#78350f]"
              : "border-amber-900/30 bg-amber-100 text-amber-900 hover:bg-amber-200"
          }`}
        >
          🛒 PRODUCTS
        </button>
        <button
          onClick={() => { setTab("security"); fetchBlockedDevices(); }}
          className={`flex-1 rounded-xl border-3 py-3 text-sm font-black uppercase tracking-wider transition-colors ${
            tab === "security"
              ? "border-amber-900 bg-orange-500 text-white shadow-[4px_4px_0px_#78350f]"
              : "border-amber-900/30 bg-amber-100 text-amber-900 hover:bg-amber-200"
          }`}
        >
          🛡️ SECURITY ({blockedDevices.filter(d => d.isBlocked).length})
        </button>
      </div>

      {/* Orders Section */}
      {tab === "orders" && (
        <div className="rounded-2xl border-4 border-amber-900 bg-amber-50 shadow-[6px_6px_0px_#78350f] overflow-hidden">
        <div className="flex items-center gap-2 bg-amber-900 px-4 py-2">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
          <span className="ml-3 text-xs font-bold uppercase tracking-widest text-amber-100">
            ALL ORDERS ({orders.length})
          </span>
        </div>
        <div className="p-6">
          {orders.length === 0 ? (
            <p className="text-center text-amber-700 font-bold py-4">
              No orders yet. Waiting for customers...
            </p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.chatId} className="rounded-xl border-2 border-amber-900/30 bg-amber-100 overflow-hidden">
                  {/* Order header row */}
                  <div className="flex flex-wrap items-center gap-3 p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-amber-900 uppercase text-sm">
                          {order.chatId}
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-amber-700 mt-1">
                        {order.name} — {order.phone}
                      </p>
                      <p className="text-xs font-bold text-amber-600">
                        Room {order.room}, {order.block}, {order.phase}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-orange-600">₹{order.total}</p>
                      <p className="text-[10px] text-amber-600 font-bold">
                        {new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewOrder(order)}
                        className="rounded-lg border-2 border-amber-900/30 bg-amber-50 px-3 py-1.5 text-[10px] font-black uppercase text-amber-900 hover:bg-amber-200 transition-colors"
                      >
                        {selectedOrder?.chatId === order.chatId ? "HIDE" : "DETAILS"}
                      </button>
                      <button
                        onClick={() => openChat(order.chatId)}
                        className="rounded-lg border-2 border-amber-900 bg-orange-500 px-3 py-1.5 text-[10px] font-black uppercase text-white hover:bg-orange-600 transition-colors"
                      >
                        CHAT
                      </button>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {selectedOrder?.chatId === order.chatId && (
                    <div className="border-t-2 border-amber-900/20 p-4 bg-amber-50 space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <p className="text-[10px] font-black uppercase text-amber-600">Name</p>
                          <p className="text-sm font-bold text-amber-900">{order.name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-amber-600">Phone</p>
                          <p className="text-sm font-bold text-amber-900">{order.phone}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-amber-600">Room</p>
                          <p className="text-sm font-bold text-amber-900">{order.room}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-amber-600">Location</p>
                          <p className="text-sm font-bold text-amber-900">{order.block}, {order.phase}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-black uppercase text-amber-600 mb-1">Ordered Items</p>
                        <div className="rounded-lg border border-amber-900/20 bg-amber-100 overflow-hidden">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between px-3 py-1.5 text-sm font-bold text-amber-800 even:bg-amber-50">
                              <span>{item.name} × {item.quantity}</span>
                              <span>₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                          <div className="flex justify-between px-3 py-2 font-black text-amber-900 border-t border-amber-900/20 bg-amber-200">
                            <span>TOTAL</span>
                            <span>₹{order.total}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-black uppercase text-amber-600 mb-1">Update Status</p>
                        <div className="flex gap-2 flex-wrap">
                          {STATUSES.map((s) => (
                            <button
                              key={s}
                              onClick={() => updateStatus(order.chatId, s)}
                              className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase border-2 transition-colors ${
                                order.status === s
                                  ? `${STATUS_COLORS[s]} border-amber-900`
                                  : "bg-amber-50 text-amber-700 border-amber-900/20 hover:bg-amber-200"
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 text-[10px] font-bold text-amber-600">
                        <span>Chat ID: {order.chatId}</span>
                        <span>•</span>
                        <span>{order.messageCount} messages</span>
                        <span>•</span>
                        <span>{order.isRoomActive ? "🟢 Room active" : "⚪ Room inactive"}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      )}

      {/* Food Requests Section */}
      {tab === "requests" && (
        <div className="rounded-2xl border-4 border-amber-900 bg-amber-50 shadow-[6px_6px_0px_#78350f] overflow-hidden">
          <div className="flex items-center gap-2 bg-amber-900 px-4 py-2">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
            <span className="ml-3 text-xs font-bold uppercase tracking-widest text-amber-100">
              FOOD REQUESTS ({requests.length})
            </span>
          </div>
          <div className="p-6">
            {requests.length === 0 ? (
              <p className="text-center text-amber-700 font-bold py-4">
                No food requests yet. Waiting for customer suggestions...
              </p>
            ) : (
              <div className="space-y-4">
                {requests.map((req) => (
                  <div key={req._id} className="rounded-xl border-2 border-amber-900/30 bg-amber-100 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="text-lg font-black text-orange-600">{req.foodItem}</span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            req.status === "pending" ? "bg-yellow-400 text-yellow-900" :
                            req.status === "approved" ? "bg-green-400 text-green-900" :
                            "bg-red-400 text-red-900"
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        {req.description && (
                          <p className="text-sm font-bold text-amber-700 mb-2">{req.description}</p>
                        )}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-bold text-amber-600">
                          <div>
                            <span className="text-[10px] uppercase text-amber-500">Name:</span> {req.name}
                          </div>
                          <div>
                            <span className="text-[10px] uppercase text-amber-500">Phone:</span> {req.phone}
                          </div>
                          <div>
                            <span className="text-[10px] uppercase text-amber-500">Room:</span> {req.room}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-[10px] font-bold text-amber-500">
                        {new Date(req.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase text-amber-600 mb-1">Update Status</p>
                      <div className="flex gap-2 flex-wrap">
                        {["pending", "approved", "rejected"].map((s) => (
                          <button
                            key={s}
                            onClick={() => updateRequestStatus(req._id, s)}
                            className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase border-2 transition-colors ${
                              req.status === s
                                ? `${s === "pending" ? "bg-yellow-400 text-yellow-900" : s === "approved" ? "bg-green-400 text-green-900" : "bg-red-400 text-red-900"} border-amber-900`
                                : "bg-amber-50 text-amber-700 border-amber-900/20 hover:bg-amber-200"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Security / Blocked Devices Section */}
      {tab === "security" && (
        <div className="rounded-2xl border-4 border-amber-900 bg-amber-50 shadow-[6px_6px_0px_#78350f] overflow-hidden">
          <div className="flex items-center gap-2 bg-amber-900 px-4 py-2">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
            <span className="ml-3 text-xs font-bold uppercase tracking-widest text-amber-100">
              DEVICE SECURITY ({blockedDevices.length} tracked)
            </span>
          </div>
          <div className="p-6">
            {blockedDevices.length === 0 ? (
              <p className="text-center text-amber-700 font-bold py-4">
                No flagged devices yet.
              </p>
            ) : (
              <div className="space-y-4">
                {blockedDevices.map((device) => (
                  <div key={device.fingerprint} className={`rounded-xl border-2 p-4 ${
                    device.isBlocked
                      ? "border-red-400 bg-red-50"
                      : "border-amber-900/30 bg-amber-100"
                  }`}>
                    <div className="flex flex-wrap items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            device.isBlocked
                              ? "bg-red-400 text-red-900"
                              : "bg-green-400 text-green-900"
                          }`}>
                            {device.isBlocked ? "BLOCKED" : "ACTIVE"}
                          </span>
                          <span className="text-[10px] font-bold text-amber-600">
                            {device.invalidAttempts} invalid attempt{device.invalidAttempts !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <p className="text-xs font-mono font-bold text-amber-900 break-all">
                          {device.fingerprint}
                        </p>
                        {device.blockedReason && (
                          <p className="text-xs font-bold text-red-600 mt-1">
                            Reason: {device.blockedReason}
                          </p>
                        )}
                        <p className="text-[10px] font-bold text-amber-500 mt-1">
                          Updated: {new Date(device.updatedAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                        </p>

                        {/* Recent logs */}
                        {device.recentLogs && device.recentLogs.length > 0 && (
                          <div className="mt-2">
                            <p className="text-[10px] font-black uppercase text-amber-600 mb-1">Recent Activity</p>
                            <div className="rounded-lg border border-amber-900/20 bg-white/50 overflow-hidden">
                              {device.recentLogs.map((log, i) => (
                                <div key={log._id || i} className="flex items-center gap-2 px-2 py-1 text-[10px] font-bold even:bg-amber-50">
                                  <span className={`px-1.5 py-0.5 rounded ${
                                    log.status === "valid" ? "bg-green-200 text-green-800" :
                                    log.status === "invalid" ? "bg-yellow-200 text-yellow-800" :
                                    "bg-red-200 text-red-800"
                                  }`}>
                                    {log.status.toUpperCase()}
                                  </span>
                                  <span className="text-amber-700">{log.phone || "—"}</span>
                                  <span className="text-amber-500">{log.ip || "—"}</span>
                                  {log.reason && <span className="text-red-500 truncate">{log.reason}</span>}
                                  <span className="ml-auto text-amber-400 whitespace-nowrap">
                                    {new Date(log.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {device.isBlocked && (
                        <button
                          onClick={() => unblockDevice(device.fingerprint)}
                          className="rounded-lg border-2 border-green-700 bg-green-500 px-4 py-2 text-[10px] font-black uppercase text-white hover:bg-green-600 transition-colors shrink-0"
                        >
                          UNBLOCK
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Products Section */}
      {tab === "products" && (
        <div className="rounded-2xl border-4 border-amber-900 bg-amber-50 shadow-[6px_6px_0px_#78350f] overflow-hidden">
          <div className="flex items-center gap-2 bg-amber-900 px-4 py-2">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
            <span className="ml-3 text-xs font-bold uppercase tracking-widest text-amber-100">
              PRODUCT MANAGEMENT
            </span>
          </div>
          <div className="p-6">
            <ProductManagement token={getToken()} />
          </div>
        </div>
      )}
    </div>
  );
}
