"use client";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { notifyNewMessage, requestNotificationPermission } from "@/utils/notifications";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL;

// Notification sound using audio file
function playSound(type) {
  try {
    const audio = new Audio("/notification.mp3");
    // Adjust volume based on type
    if (type === "send") {
      audio.volume = 0.6;
    } else if (type === "receive") {
      audio.volume = 0.6;
    } else {
      audio.volume = 0.4;
    }
    audio.play().catch(() => {}); // Ignore autoplay errors
  } catch {}
}

export default function ChatWindow({ chatId, role = "customer", senderName = "Customer" }) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [online, setOnline] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);
  const bottomRef = useRef(null);
  const hasJoinedRef = useRef(false);

  useEffect(() => {
    if (!chatId) return;

    // Request notification permission
    requestNotificationPermission();

    const s = io(SOCKET_URL);
    setSocket(s);

    s.on("connect", () => {
      s.emit("join-room", { chatId, role });
    });

    s.on("room-joined", ({ messages: msgs, order: ord }) => {
      setMessages(msgs);
      setOrder(ord);
      setConnected(true);
      setError("");
      hasJoinedRef.current = true;
    });

    s.on("receive-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
      // Play sound — different tone for own vs others
      if (msg.role !== role) {
        playSound("receive");
        // Show browser notification for messages from others
        if (document.hidden) {
          notifyNewMessage(msg.sender, msg.message, msg.role);
        }
      }
    });

    s.on("user-status", ({ message, online: isOnline, role: statusRole }) => {
      if (role === "customer" && statusRole === "admin") setOnline(isOnline);
      if (role === "admin" && statusRole === "customer") setOnline(isOnline);
      // Show as system message in chat
      if (hasJoinedRef.current) {
        setMessages((prev) => [
          ...prev,
          { id: "sys-" + Date.now(), type: "system", message, timestamp: new Date().toISOString() },
        ]);
        playSound("system");
      }
    });

    s.on("error-message", ({ message }) => {
      setError(message);
      setConnected(false);
    });

    return () => {
      s.disconnect();
    };
  }, [chatId, role]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socket || !connected) return;
    socket.emit("send-message", {
      chatId,
      message: input.trim(),
      sender: senderName,
      role,
    });
    playSound("send");
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (error) {
    return (
      <div className="rounded-2xl border-4 border-amber-900 bg-amber-50 shadow-[6px_6px_0px_#78350f] overflow-hidden">
        <div className="flex items-center gap-2 bg-amber-900 px-4 py-2">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
          <span className="ml-3 text-xs font-bold uppercase tracking-widest text-amber-100">
            ERROR
          </span>
        </div>
        <div className="p-8 text-center">
          <p className="text-lg font-black text-red-600 uppercase">{error}</p>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="rounded-2xl border-4 border-amber-900 bg-amber-50 shadow-[6px_6px_0px_#78350f] overflow-hidden">
        <div className="flex items-center gap-2 bg-amber-900 px-4 py-2">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
          <span className="ml-3 text-xs font-bold uppercase tracking-widest text-amber-100">
            CONNECTING...
          </span>
        </div>
        <div className="p-8 text-center">
          <div className="animate-pulse text-lg font-black text-amber-900 uppercase">
            Connecting to chat room...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-4 border-amber-900 bg-amber-50 shadow-[6px_6px_0px_#78350f] overflow-hidden flex flex-col max-h-[600px]">
      {/* Header */}
      <div className="flex items-center gap-2 bg-amber-900 px-4 py-2 shrink-0">
        <span className="h-3 w-3 rounded-full bg-red-400" />
        <span className="h-3 w-3 rounded-full bg-yellow-400" />
        <span className="h-3 w-3 rounded-full bg-green-400" />
        <span className="ml-3 text-xs font-bold uppercase tracking-widest text-amber-100">
          {chatId}
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              online ? "bg-green-400" : "bg-gray-400"
            }`}
          />
          <span className="text-xs font-bold text-amber-200">
            {online
              ? role === "customer"
                ? "Admin Online"
                : "Customer Online"
              : "Offline"}
          </span>
        </span>
      </div>

      {/* Order info bar (if available) */}
      {order && role === "admin" && (
        <div className="bg-amber-100 border-b-2 border-amber-900/20 px-4 py-2 text-xs font-bold text-amber-800 shrink-0">
          {order.name} — Room {order.room}, {order.block} — ₹{order.total}
        </div>
      )}

      {/* Messages */}
      <div className={`overflow-y-auto p-4 space-y-3 bg-amber-50 ${messages.length === 0 ? 'min-h-[200px]' : 'min-h-[150px]'}`}>
        {messages.length === 0 && (
          <p className="text-center text-sm text-amber-600 font-bold mt-8">
            No messages yet. Start the conversation!
          </p>
        )}
        {messages.map((msg) =>
          msg.type === "system" ? (
            <div key={msg.id} className="flex justify-center">
              <span className="text-[11px] font-bold text-amber-600 bg-amber-200/60 px-3 py-1 rounded-full">
                {msg.message}
              </span>
            </div>
          ) : (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === role ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] rounded-xl px-4 py-2 ${
                  msg.role === role
                    ? "bg-orange-500 text-white rounded-br-sm"
                    : "bg-amber-200 text-amber-900 border-2 border-amber-900/20 rounded-bl-sm"
                }`}
              >
                <p className="text-xs font-black uppercase mb-0.5 opacity-70">
                  {msg.sender}
                </p>
                <p className="text-sm font-bold">{msg.message}</p>
                <p className="text-[10px] opacity-50 mt-1 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          )
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t-2 border-amber-900/20 bg-amber-100 p-3 flex flex-col sm:flex-row gap-2 shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 rounded-lg border-2 border-amber-900 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          className="rounded-lg border-2 border-amber-900 bg-orange-500 px-5 py-2 text-sm font-black uppercase text-white hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          SEND
        </button>
      </div>
    </div>
  );
}
