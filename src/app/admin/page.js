"use client";
import { useState, useEffect } from "react";
import ProductManagement from "@/components/ProductManagement";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// â”€â”€â”€ Login Screen â”€â”€â”€
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
            <div className="text-4xl mb-2">ðŸ”</div>
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
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
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

// â”€â”€â”€ Main Admin Panel â”€â”€â”€
export default function AdminPage() {
  const [isAuth, setIsAuth] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState("requests");
  const [requests, setRequests] = useState([]);

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
        // Server offline â€” keep token, let user retry
      }
      setChecking(false);
    };
    verifyToken();
  }, []);

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

  useEffect(() => {
    if (!isAuth) return;
    fetchRequests();
    const interval = setInterval(() => {
      fetchRequests();
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

  // â”€â”€â”€ Loading â”€â”€â”€
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-amber-900 font-black uppercase text-sm">Checking session...</p>
      </div>
    );
  }

  // â”€â”€â”€ Login Gate â”€â”€â”€
  if (!isAuth) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  // â”€â”€â”€ Admin Panel â”€â”€â”€
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
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
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black uppercase text-amber-900">
              Welcome, {adminInfo?.name || "Admin"}
            </h2>
            <span className="text-xs font-bold bg-amber-200 text-amber-900 px-3 py-1 rounded-full border border-amber-900/30">
              Orders via WhatsApp
            </span>
          </div>
        </div>
      </div>

      {/* Tab Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("requests")}
          className={`flex-1 rounded-xl border-3 py-3 text-sm font-black uppercase tracking-wider transition-colors ${
            tab === "requests"
              ? "border-amber-900 bg-orange-500 text-white shadow-[4px_4px_0px_#78350f]"
              : "border-amber-900/30 bg-amber-100 text-amber-900 hover:bg-amber-200"
          }`}
        >
          ðŸœ REQUESTS ({requests.length})
        </button>
        <button
          onClick={() => setTab("products")}
          className={`flex-1 rounded-xl border-3 py-3 text-sm font-black uppercase tracking-wider transition-colors ${
            tab === "products"
              ? "border-amber-900 bg-orange-500 text-white shadow-[4px_4px_0px_#78350f]"
              : "border-amber-900/30 bg-amber-100 text-amber-900 hover:bg-amber-200"
          }`}
        >
          ðŸ›’ PRODUCTS
        </button>
      </div>

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
