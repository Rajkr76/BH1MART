"use client";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { validatePhone } from "@/utils/validatePhone";
import { validateName } from "@/utils/validateName";
import { checkClientBlock, recordFailedValidation, resetClientAttempts } from "@/utils/clientBlockCheck";
import BlockedPopup from "@/components/BlockedPopup";

const WHATSAPP_NUMBER = "917250336842";

export default function OrderModal({ onClose }) {
  const { cart, total, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedUntil, setBlockedUntil] = useState(null);
  const [showBlockedPopup, setShowBlockedPopup] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    room: "",
  });

  // Check block status on mount
  useEffect(() => {
    const blockStatus = checkClientBlock();
    if (blockStatus.isBlocked) {
      setIsBlocked(true);
      setBlockedUntil(blockStatus.blockedUntil);
      setShowBlockedPopup(true);
    }
  }, []);

  const handleChange = (e) => {
    // Phone: strip non-digits, max 10
    if (e.target.name === "phone") {
      const stripped = e.target.value.replace(/\D/g, "").slice(0, 10);
      setForm({ ...form, phone: stripped });
      return;
    }
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError("");

    // Check if blocked before submission
    const blockStatus = checkClientBlock();
    if (blockStatus.isBlocked) {
      setIsBlocked(true);
      setBlockedUntil(blockStatus.blockedUntil);
      setShowBlockedPopup(true);
      return;
    }

    // --- Validation ---

    // Cart must not be empty
    if (!cart || cart.length === 0) {
      setSubmitError("Your cart is empty. Add some items first.");
      return;
    }

    // Validate name
    const nameResult = validateName(form.name);
    if (!nameResult.valid) {
      setSubmitError("Please enter a valid name.");
      recordFailedValidation();
      const newBlockStatus = checkClientBlock();
      if (newBlockStatus.isBlocked) {
        setIsBlocked(true);
        setBlockedUntil(newBlockStatus.blockedUntil);
        setShowBlockedPopup(true);
      }
      return;
    }

    // Validate phone
    const phoneResult = validatePhone(form.phone);
    if (!phoneResult.valid) {
      setSubmitError("Phone number is invalid.");
      recordFailedValidation();
      const newBlockStatus = checkClientBlock();
      if (newBlockStatus.isBlocked) {
        setIsBlocked(true);
        setBlockedUntil(newBlockStatus.blockedUntil);
        setShowBlockedPopup(true);
      }
      return;
    }

    // Room details required
    if (!form.room.trim()) {
      setSubmitError("Please enter your room details.");
      return;
    }

    // --- All valid → build WhatsApp message ---
    setSubmitting(true);

    const itemLines = cart
      .map((item) => `• ${item.name} × ${item.quantity}`)
      .join("\n");

    const message = `Hello, I want to place an order.

Name: ${form.name.trim()}
Mobile: ${phoneResult.phone}
Room Details: ${form.room.trim()}

Order Items:
${itemLines}

Total: ₹${total}

Please confirm my order.`;

    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    // Reset client-side block attempts on successful validation
    resetClientAttempts();

    // Small loading state before redirect
    setTimeout(() => {
      clearCart();
      window.location.href = whatsappURL;
      setSubmitting(false);
    }, 400);
  };

  return (
    <>
      {showBlockedPopup && (
        <BlockedPopup
          blockedUntil={blockedUntil}
          onClose={() => {
            setShowBlockedPopup(false);
            onClose();
          }}
        />
      )}
      <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 animate-fadeIn">
        <div className="w-full max-w-lg rounded-2xl border-4 border-amber-900 bg-amber-50 shadow-[8px_8px_0px_#78350f] overflow-hidden max-h-[90vh] flex flex-col">
          {/* Dots bar */}
          <div className="flex items-center gap-2 bg-amber-900 px-4 py-2">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
            <span className="ml-3 text-xs font-bold uppercase tracking-widest text-amber-100">
              PLACE ORDER
            </span>
            <button
              onClick={onClose}
              className="ml-auto text-amber-100 hover:text-white font-bold text-lg"
            >
              ✕
            </button>
          </div>

          <div className="overflow-y-auto p-6">
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
                  placeholder="Your full name"
                  className="w-full rounded-lg border-2 border-amber-900 bg-amber-100 px-3 py-2 text-amber-900 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wide text-amber-900 mb-1">
                  Mobile Number *
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  type="tel"
                  placeholder="10-digit mobile number"
                  className="w-full rounded-lg border-2 border-amber-900 bg-amber-100 px-3 py-2 text-amber-900 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wide text-amber-900 mb-1">
                  Room Details *
                </label>
                <input
                  name="room"
                  value={form.room}
                  onChange={handleChange}
                  required
                  placeholder="Room No. 203"
                  className="w-full rounded-lg border-2 border-amber-900 bg-amber-100 px-3 py-2 text-amber-900 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
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
                <p className="text-xs font-bold text-red-600 bg-red-100 border border-red-300 rounded-lg p-2 mt-2">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl border-3 border-amber-900 bg-green-500 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  "REDIRECTING TO WHATSAPP..."
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    PLACE ORDER ON WHATSAPP
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
