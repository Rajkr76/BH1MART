"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const STATUS_COLORS = {
  "order placed": "bg-yellow-400 text-yellow-900",
  "on way": "bg-blue-400 text-blue-900",
  delivered: "bg-green-400 text-green-900",
  rejected: "bg-red-400 text-red-900",
};

const STATUS_ICONS = {
  "order placed": "⏳",
  "on way": "🚚",
  delivered: "✅",
  rejected: "❌",
};

const STATUS_MESSAGES = {
  "order placed": "Your order has been received and is being processed.",
  "on way": "Your order is on the way! It will arrive soon.",
  delivered: "Your order has been delivered. Enjoy your meal!",
  rejected: "This order was rejected. Please contact support for details.",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchChatId, setSearchChatId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrdersFromStorage();
  }, []);

  const loadOrdersFromStorage = () => {
    try {
      // Get orders from localStorage (stored when user places orders)
      const stored = localStorage.getItem("b1mart_user_orders");
      if (stored) {
        const chatIds = JSON.parse(stored);
        fetchOrders(chatIds);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
      setLoading(false);
    }
  };

  const fetchOrders = async (chatIds) => {
    try {
      const orderPromises = chatIds.map((chatId) =>
        fetch(`${API_URL}/api/order/${chatId}`)
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null)
      );
      const results = await Promise.all(orderPromises);
      const validOrders = results.filter((order) => order !== null);
      setOrders(validOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
    setLoading(false);
  };

  const handleSearchOrder = async (e) => {
    e.preventDefault();
    setError("");
    if (!searchChatId.trim()) return;

    const chatId = searchChatId.trim().toUpperCase();
    
    try {
      const res = await fetch(`${API_URL}/api/order/${chatId}`);
      if (res.ok) {
        const order = await res.json();
        
        // Add to orders list if not already there
        if (!orders.find((o) => o.chatId === order.chatId)) {
          setOrders([order, ...orders]);
          
          // Save to localStorage
          const stored = localStorage.getItem("b1mart_user_orders");
          const chatIds = stored ? JSON.parse(stored) : [];
          if (!chatIds.includes(chatId)) {
            chatIds.unshift(chatId);
            localStorage.setItem("b1mart_user_orders", JSON.stringify(chatIds));
          }
        }
        setSearchChatId("");
      } else {
        setError("Order not found. Please check your Chat ID.");
      }
    } catch (err) {
      setError("Failed to fetch order. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="rounded-2xl border-4 border-amber-900 bg-amber-50 shadow-[6px_6px_0px_#78350f] overflow-hidden mb-6">
        <div className="flex items-center gap-2 bg-amber-900 px-4 py-2">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
          <span className="ml-3 text-xs font-bold uppercase tracking-widest text-amber-100">
            MY ORDERS
          </span>
        </div>
        <div className="p-6">
          <div className="text-center mb-4">
            <div className="text-5xl mb-3">📦</div>
            <h1 className="text-3xl font-black uppercase text-amber-900 mb-2">
              Your Orders
            </h1>
            <p className="text-sm text-amber-700 font-bold">
              Track your orders and contact support
            </p>
          </div>

          {/* Search Order */}
          <form onSubmit={handleSearchOrder} className="flex gap-2">
            <input
              type="text"
              value={searchChatId}
              onChange={(e) => setSearchChatId(e.target.value.toUpperCase())}
              placeholder="Enter Chat ID (e.g. CHAT-ABC123)"
              className="flex-1 rounded-lg border-2 border-amber-900 bg-amber-100 px-3 py-2 text-amber-900 font-bold uppercase focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="submit"
              className="rounded-lg border-2 border-amber-900 bg-orange-500 px-6 py-2 text-sm font-black uppercase text-white hover:bg-orange-600 transition-colors"
            >
              FIND
            </button>
          </form>
          {error && (
            <p className="text-xs font-bold text-red-600 bg-red-100 border border-red-300 rounded-lg p-2 mt-2">
              {error}
            </p>
          )}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-lg font-bold text-amber-900">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border-4 border-amber-900 bg-amber-50 shadow-[6px_6px_0px_#78350f] overflow-hidden">
          <div className="flex items-center gap-2 bg-amber-900 px-4 py-2">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <div className="p-8 text-center">
            <div className="text-5xl mb-4">🛒</div>
            <p className="text-lg font-black uppercase text-amber-900 mb-2">
              No Orders Yet
            </p>
            <p className="text-sm text-amber-700 font-bold mb-4">
              You haven&apos;t placed any orders yet. Start shopping!
            </p>
            <Link
              href="/"
              className="inline-block rounded-xl border-3 border-amber-900 bg-orange-500 px-6 py-2.5 text-sm font-black uppercase tracking-wider text-white hover:bg-orange-600 transition-colors"
            >
              BROWSE MENU
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.chatId}
              className="rounded-2xl border-4 border-amber-900 bg-amber-50 shadow-[6px_6px_0px_#78350f] overflow-hidden"
            >
              {/* Order Header */}
              <div className="flex items-center gap-2 bg-amber-900 px-4 py-2">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-3 text-xs font-bold uppercase tracking-widest text-amber-100">
                  ORDER #{order.chatId}
                </span>
              </div>

              <div className="p-6 space-y-4">
                {/* Status Badge */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{STATUS_ICONS[order.status]}</span>
                    <div>
                      <span
                        className={`inline-block text-xs font-black uppercase px-3 py-1.5 rounded-full ${STATUS_COLORS[order.status]}`}
                      >
                        {order.status}
                      </span>
                      <p className="text-xs font-bold text-amber-700 mt-1">
                        {new Date(order.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-orange-600">₹{order.total}</p>
                  </div>
                </div>

                {/* Status Message */}
                <div className="rounded-lg border-2 border-amber-900/30 bg-amber-100 p-3">
                  <p className="text-sm font-bold text-amber-800">
                    {STATUS_MESSAGES[order.status]}
                  </p>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs font-black uppercase text-amber-600">Name</p>
                    <p className="font-bold text-amber-900">{order.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase text-amber-600">Phone</p>
                    <p className="font-bold text-amber-900">{order.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase text-amber-600">Room</p>
                    <p className="font-bold text-amber-900">{order.room}</p>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase text-amber-600">Location</p>
                    <p className="font-bold text-amber-900">
                      {order.block}, {order.phase}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <p className="text-xs font-black uppercase text-amber-900 mb-2">
                    Items Ordered
                  </p>
                  <div className="rounded-lg border-2 border-amber-900/30 bg-amber-100 overflow-hidden">
                    {order.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between px-3 py-2 text-sm font-bold text-amber-800 even:bg-amber-50"
                      >
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="flex justify-between px-3 py-2 font-black text-amber-900 border-t-2 border-amber-900/30 bg-amber-200">
                      <span>TOTAL</span>
                      <span>₹{order.total}</span>
                    </div>
                  </div>
                </div>

                {/* Chat Button */}
                <Link
                  href={`/chat?id=${order.chatId}&name=${encodeURIComponent(order.name)}`}
                  className="block w-full text-center rounded-xl border-3 border-amber-900 bg-orange-500 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-orange-600 transition-colors"
                >
                  💬 OPEN CHAT
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
