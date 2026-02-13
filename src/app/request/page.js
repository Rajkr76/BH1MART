"use client";
import { useState, useEffect } from "react";
import { validatePhone } from "@/utils/validatePhone";
import { validateName } from "@/utils/validateName";
import { validateInappropriateContent } from "@/config/inappropriateWords";
import { checkClientBlock, recordFailedValidation, resetClientAttempts } from "@/utils/clientBlockCheck";
import BlockedPopup from "@/components/BlockedPopup";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const STATUS_COLORS = {
  pending: "bg-yellow-400 text-yellow-900",
  approved: "bg-green-400 text-green-900",
  rejected: "bg-red-400 text-red-900",
};

const STATUS_MESSAGES = {
  pending: "Your request is under review.",
  approved: "Your request has been approved! The item will be added to the menu soon.",
  rejected: "Your request was not approved. Please try requesting a different item.",
};

export default function RequestPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    room: "",
    foodItem: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedUntil, setBlockedUntil] = useState(null);
  const [showBlockedPopup, setShowBlockedPopup] = useState(false);
  const [pastRequests, setPastRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Check block status on mount
  useEffect(() => {
    const blockStatus = checkClientBlock();
    if (blockStatus.isBlocked) {
      setIsBlocked(true);
      setBlockedUntil(blockStatus.blockedUntil);
      setShowBlockedPopup(true);
    }
    
    // Load past requests
    loadPastRequests();
  }, []);

  const loadPastRequests = async () => {
    try {
      setLoadingRequests(true);
      const stored = localStorage.getItem("b1mart_user_requests");
      if (!stored) {
        setLoadingRequests(false);
        return;
      }

      const requestIds = JSON.parse(stored);
      const requestPromises = requestIds.map((id) =>
        fetch(`${API_URL}/api/food-request/${id}`)
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null)
      );

      const results = await Promise.all(requestPromises);
      const validRequests = results.filter((req) => req !== null);
      setPastRequests(validRequests);
    } catch (err) {
      console.error("Failed to load past requests:", err);
    }
    setLoadingRequests(false);
  };

  const handleChange = (e) => {
    if (e.target.name === "phone") {
      const stripped = e.target.value.replace(/\D/g, "").slice(0, 10);
      setForm({ ...form, phone: stripped });
      return;
    }
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    // Check if blocked before submission
    const blockStatus = checkClientBlock();
    if (blockStatus.isBlocked) {
      setIsBlocked(true);
      setBlockedUntil(blockStatus.blockedUntil);
      setShowBlockedPopup(true);
      return;
    }

    // Validate name
    const nameResult = validateName(form.name);
    if (!nameResult.valid) {
      setFormError("Please enter a valid name.");
      // Record failed attempt and check if should block
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
      setFormError("Phone number is invalid.");
      // Record failed attempt and check if should block
      recordFailedValidation();
      const newBlockStatus = checkClientBlock();
      if (newBlockStatus.isBlocked) {
        setIsBlocked(true);
        setBlockedUntil(newBlockStatus.blockedUntil);
        setShowBlockedPopup(true);
      }
      return;
    }

    // Validate food item name for inappropriate content
    const foodItemCheck = validateInappropriateContent(form.foodItem);
    if (!foodItemCheck.valid) {
      setFormError("Please use appropriate language for food item requests.");
      // Record failed attempt and check if should block
      recordFailedValidation();
      const newBlockStatus = checkClientBlock();
      if (newBlockStatus.isBlocked) {
        setIsBlocked(true);
        setBlockedUntil(newBlockStatus.blockedUntil);
        setShowBlockedPopup(true);
      }
      return;
    }

    // Validate description for inappropriate content
    if (form.description) {
      const descCheck = validateInappropriateContent(form.description);
      if (!descCheck.valid) {
        setFormError("Please use appropriate language in the description.");
        // Record failed attempt and check if should block
        recordFailedValidation();
        const newBlockStatus = checkClientBlock();
        if (newBlockStatus.isBlocked) {
          setIsBlocked(true);
          setBlockedUntil(newBlockStatus.blockedUntil);
          setShowBlockedPopup(true);
        }
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/food-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, phone: phoneResult.phone }),
      });
      if (res.ok) {
        const data = await res.json();
        // Reset client-side block attempts on successful submission
        resetClientAttempts();
        
        // Save request ID to localStorage for tracking
        if (data.requestId) {
          try {
            const stored = localStorage.getItem("b1mart_user_requests");
            const requestIds = stored ? JSON.parse(stored) : [];
            if (!requestIds.includes(data.requestId)) {
              requestIds.unshift(data.requestId); // Add to beginning
              localStorage.setItem("b1mart_user_requests", JSON.stringify(requestIds));
            }
          } catch (err) {
            console.warn("Failed to save request ID:", err);
          }
        }
        
        setShowSuccess(true);
        setForm({ name: "", phone: "", room: "", foodItem: "", description: "" });
        setTimeout(() => setShowSuccess(false), 4000);
        
        // Reload past requests to show the new one
        loadPastRequests();
      }
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  return (
    <>
      {showBlockedPopup && (
        <BlockedPopup 
          blockedUntil={blockedUntil} 
          onClose={() => setShowBlockedPopup(false)} 
        />
      )}
      <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="rounded-2xl border-4 border-amber-900 bg-amber-50 shadow-[6px_6px_0px_#78350f] overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 bg-amber-900 px-4 py-2">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
          <span className="ml-3 text-xs font-bold uppercase tracking-widest text-amber-100">
            REQUEST NEW FOOD ITEMS
          </span>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🍽️</div>
            <h2 className="text-2xl font-black uppercase text-amber-900 mb-2">
              Can&apos;t Find Your Favorite?
            </h2>
            <p className="text-sm text-amber-700 font-bold">
              Request new food items and we&apos;ll add them to the menu soon!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wide text-amber-900 mb-1">
                Your Name *
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

            <div>
              <label className="block text-xs font-black uppercase tracking-wide text-amber-900 mb-1">
                Food Item Name *
              </label>
              <input
                name="foodItem"
                value={form.foodItem}
                onChange={handleChange}
                required
                placeholder="e.g.,  Pasta..."
                className="w-full rounded-lg border-2 border-amber-900 bg-amber-100 px-3 py-2 text-amber-900 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wide text-amber-900 mb-1">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="3"
                placeholder="Any specific details about the food item..."
                className="w-full rounded-lg border-2 border-amber-900 bg-amber-100 px-3 py-2 text-amber-900 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>

            {formError && (
              <p className="text-xs font-bold text-red-600 bg-red-100 border border-red-300 rounded-lg p-2">{formError}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl border-3 border-amber-900 bg-orange-500 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {submitting ? "SUBMITTING..." : "SUBMIT REQUEST"}
            </button>
          </form>
        </div>
      </div>

      {/* Past Requests Section */}
      {pastRequests.length > 0 && (
        <div className="mt-6 rounded-2xl border-4 border-amber-900 bg-amber-50 shadow-[6px_6px_0px_#78350f] overflow-hidden">
          <div className="flex items-center gap-2 bg-amber-900 px-4 py-2">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
            <span className="ml-3 text-xs font-bold uppercase tracking-widest text-amber-100">
              YOUR PAST REQUESTS ({pastRequests.length})
            </span>
          </div>
          <div className="p-6 space-y-4">
            {loadingRequests ? (
              <p className="text-center text-amber-700 font-bold">Loading your requests...</p>
            ) : (
              pastRequests.map((request) => (
                <div
                  key={request._id}
                  className="rounded-xl border-2 border-amber-900/30 bg-amber-100 overflow-hidden"
                >
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-black text-amber-900">{request.foodItem}</span>
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${STATUS_COLORS[request.status]}`}
                          >
                            {request.status}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-amber-700">
                          {new Date(request.createdAt).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                    </div>

                    {request.description && (
                      <div className="rounded-lg border-2 border-amber-900/20 bg-amber-50 p-3">
                        <p className="text-xs font-bold text-amber-800">{request.description}</p>
                      </div>
                    )}

                    <div className="rounded-lg border-2 border-amber-900/30 bg-white/50 p-3">
                      <p className="text-xs font-bold text-amber-700">{STATUS_MESSAGES[request.status]}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl border-4 border-amber-900 bg-amber-50 shadow-[8px_8px_0px_#78350f] overflow-hidden">
            <div className="flex items-center gap-2 bg-green-700 px-4 py-2">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
              <span className="ml-3 text-xs font-bold uppercase tracking-widest text-white">
                SUCCESS
              </span>
            </div>
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-black uppercase text-amber-900 mb-3">
                Request Submitted!
              </h3>
              <p className="text-sm text-amber-800 font-bold">
                Your request has been received and will be added to the menu shortly.
              </p>
              <button
                onClick={() => setShowSuccess(false)}
                className="mt-6 rounded-xl border-3 border-amber-900 bg-orange-500 px-6 py-2 text-sm font-black uppercase text-white hover:bg-orange-600 transition-colors"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
