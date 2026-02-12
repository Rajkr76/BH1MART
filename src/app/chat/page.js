"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import ChatWindow from "@/components/ChatWindow";
import { Suspense } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ;

function ChatContent() {
  const searchParams = useSearchParams();
  const prefilledId = searchParams.get("id") || "";
  const prefilledName = searchParams.get("name") || "";
  const [chatId, setChatId] = useState(prefilledId);
  const [joined, setJoined] = useState(!!prefilledId);
  const [nameInput, setNameInput] = useState(prefilledName);
  const [name, setName] = useState(prefilledName || "Customer");
  const [idInput, setIdInput] = useState(prefilledId);
  const [verifyError, setVerifyError] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!idInput.trim()) return;
    const id = idInput.trim().toUpperCase();

    setVerifying(true);
    setVerifyError("");
    try {
      const res = await fetch(`${API_URL}/api/verify-chat/${id}`);
      const data = await res.json();
      if (!data.valid) {
        setVerifyError("Invalid Chat ID. Please use the Chat ID you received after placing an order.");
        setVerifying(false);
        return;
      }
    } catch {
      setVerifyError("Cannot connect to server. Please try again.");
      setVerifying(false);
      return;
    }
    setVerifying(false);
    setChatId(id);
    setName(nameInput.trim() || "Customer");
    setJoined(true);
  };

  if (!joined) {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="rounded-2xl border-4 border-amber-900 bg-amber-50 shadow-[6px_6px_0px_#78350f] overflow-hidden">
          <div className="flex items-center gap-2 bg-amber-900 px-4 py-2">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
            <span className="ml-3 text-xs font-bold uppercase tracking-widest text-amber-100">
              JOIN CHAT
            </span>
          </div>
          <form onSubmit={handleJoin} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wide text-amber-900 mb-1">
                Chat ID *
              </label>
              <input
                value={idInput}
                onChange={(e) => { setIdInput(e.target.value); setVerifyError(""); }}
                placeholder="e.g. CHAT-8F32K9"
                required
                className="w-full rounded-lg border-2 border-amber-900 bg-amber-100 px-3 py-2 text-amber-900 font-bold uppercase focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {verifyError && (
                <p className="mt-2 text-xs font-bold text-red-600">{verifyError}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wide text-amber-900 mb-1">
                Your Name
              </label>
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Optional"
                className="w-full rounded-lg border-2 border-amber-900 bg-amber-100 px-3 py-2 text-amber-900 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button
              type="submit"
              disabled={verifying}
              className="w-full rounded-xl border-3 border-amber-900 bg-orange-500 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {verifying ? "VERIFYING..." : "JOIN CHAT ROOM"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        onClick={() => { setJoined(false); setChatId(""); setIdInput(""); }}
        className="mb-4 rounded-lg border-2 border-amber-900 bg-amber-100 px-4 py-2 text-xs font-black uppercase text-amber-900 hover:bg-amber-200 transition-colors"
      >
        ← BACK
      </button>
      <ChatWindow chatId={chatId} role="customer" senderName={name} />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto px-4 py-8 text-center">
        <p className="text-amber-900 font-black uppercase">Loading...</p>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
