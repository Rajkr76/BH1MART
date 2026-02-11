"use client";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function generateChatId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "CHAT-";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function OrderModal({ onClose }) {
  const { cart, total, clearCart } = useCart();
  const [step, setStep] = useState("form"); // form | confirmation
  const [orderData, setOrderData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    room: "",
    phase: "Phase 1",
    block: "Boys Block 1",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const chatId = generateChatId();

    const order = {
      chatId,
      ...form,
      items: cart.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      total,
    };

    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch(`${API_URL}/api/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Server error");
      }
    } catch (err) {
      setSubmitting(false);
      setSubmitError("Failed to place order: " + err.message + ". Make sure the server is running.");
      return;
    }
    setSubmitting(false);

    setOrderData(order);
    setStep("confirmation");
    clearCart();
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl border-4 border-amber-900 bg-amber-50 shadow-[8px_8px_0px_#78350f] overflow-hidden max-h-[90vh] flex flex-col">
        {/* Dots bar */}
        <div className="flex items-center gap-2 bg-amber-900 px-4 py-2">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
          <span className="ml-3 text-xs font-bold uppercase tracking-widest text-amber-100">
            {step === "form" ? "PLACE ORDER" : "ORDER CONFIRMED"}
          </span>
          <button
            onClick={onClose}
            className="ml-auto text-amber-100 hover:text-white font-bold text-lg"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          {step === "form" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wide text-amber-900 mb-1">
                  Full Name *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border-2 border-amber-900 bg-amber-100 px-3 py-2 text-amber-900 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wide text-amber-900 mb-1">
                  Phone Number *
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  type="tel"
                  className="w-full rounded-lg border-2 border-amber-900 bg-amber-100 px-3 py-2 text-amber-900 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wide text-amber-900 mb-1">
                  Room Number *
                </label>
                <input
                  name="room"
                  value={form.room}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border-2 border-amber-900 bg-amber-100 px-3 py-2 text-amber-900 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wide text-amber-900 mb-1">
                    Phase
                  </label>
                  <select
                    name="phase"
                    value={form.phase}
                    onChange={handleChange}
                    className="w-full rounded-lg border-2 border-amber-900 bg-amber-100 px-3 py-2 text-amber-900 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option>Phase 1</option>
                    <option>Phase 2</option>
                    <option>Phase 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wide text-amber-900 mb-1">
                    Block
                  </label>
                  <select
                    name="block"
                    value={form.block}
                    onChange={handleChange}
                    className="w-full rounded-lg border-2 border-amber-900 bg-amber-100 px-3 py-2 text-amber-900 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n}>Boys Block {n}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Order summary in modal */}
              <div className="rounded-lg border-2 border-amber-900/30 bg-amber-100 p-3 mt-4">
                <h4 className="font-black uppercase text-xs text-amber-900 mb-2">
                  Order Summary
                </h4>
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm text-amber-800 font-bold"
                  >
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
                <div className="border-t-2 border-amber-900/20 mt-2 pt-2 flex justify-between font-black text-amber-900">
                  <span>TOTAL</span>
                  <span>₹{total}</span>
                </div>
              </div>

              {submitError && (
                <p className="text-xs font-bold text-red-600 bg-red-100 border border-red-300 rounded-lg p-2 mt-2">{submitError}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl border-3 border-amber-900 bg-orange-500 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {submitting ? "PLACING ORDER..." : "CONFIRM ORDER"}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-5xl">🎉</div>
              <h2 className="text-xl font-black uppercase text-amber-900">
                Order Confirmed!
              </h2>
              <p className="text-sm text-amber-700 font-bold">
                Your order will arrive in a few minutes.
                <br />
                Please stay in your room.
              </p>

              <div className="rounded-lg border-2 border-amber-900/30 bg-amber-100 p-4 text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs font-black uppercase text-amber-900">
                    Chat ID
                  </span>
                  <span className="font-black text-orange-600">
                    {orderData.chatId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-black uppercase text-amber-900">
                    Name
                  </span>
                  <span className="font-bold text-amber-800">
                    {orderData.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-black uppercase text-amber-900">
                    Phone
                  </span>
                  <span className="font-bold text-amber-800">
                    {orderData.phone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-black uppercase text-amber-900">
                    Room
                  </span>
                  <span className="font-bold text-amber-800">
                    {orderData.room} — {orderData.block}, {orderData.phase}
                  </span>
                </div>
                <div className="border-t-2 border-amber-900/20 pt-2 mt-2">
                  <span className="text-xs font-black uppercase text-amber-900">
                    Items
                  </span>
                  {orderData.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between text-sm text-amber-800 font-bold"
                    >
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="flex justify-between mt-1 font-black text-amber-900">
                    <span>TOTAL</span>
                    <span>₹{orderData.total}</span>
                  </div>
                </div>
              </div>

              <a
                href={`/chat?id=${orderData.chatId}&name=${encodeURIComponent(orderData.name)}`}
                className="inline-block w-full rounded-xl border-3 border-amber-900 bg-orange-500 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-orange-600 transition-colors text-center"
              >
                GO TO CHAT →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
