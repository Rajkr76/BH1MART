"use client";
import { getBlockTimeRemaining } from "@/utils/clientBlockCheck";

export default function BlockedPopup({ blockedUntil, onClose }) {
  const timeRemaining = getBlockTimeRemaining(blockedUntil);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl border-4 border-red-600 bg-red-50 shadow-[12px_12px_0px_rgba(220,38,38,0.5)] overflow-hidden animate-shake">
        {/* Header */}
        <div className="flex items-center gap-2 bg-red-600 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-red-900" />
          <span className="h-3 w-3 rounded-full bg-red-800" />
          <span className="h-3 w-3 rounded-full bg-red-700" />
          <span className="ml-3 text-xs font-black uppercase tracking-widest text-white">
            🚫 ACCESS BLOCKED
          </span>
        </div>

        <div className="p-8 text-center">
          <div className="text-7xl mb-4">🚫</div>
          
          <h2 className="text-2xl font-black uppercase text-red-900 mb-3 leading-tight">
            YOU ARE BLOCKED
          </h2>
          
          <div className="bg-red-100 border-2 border-red-400 rounded-xl p-4 mb-4">
            <p className="text-sm font-black text-red-800 mb-2">
              ⚠️ SECURITY VIOLATION DETECTED
            </p>
            <p className="text-xs font-bold text-red-700">
              Multiple attempts to submit fake or invalid information have been detected from your device.
            </p>
          </div>

          <div className="bg-white border-2 border-red-300 rounded-xl p-4 mb-4">
            <p className="text-xs font-black uppercase text-red-600 mb-1">
              Block Duration
            </p>
            <p className="text-2xl font-black text-red-900">
              24 HOURS
            </p>
            {timeRemaining && timeRemaining !== "expired" && (
              <p className="text-xs font-bold text-red-700 mt-1">
                Time Remaining: {timeRemaining}
              </p>
            )}
          </div>

          <p className="text-xs font-bold text-red-800 mb-4">
            You will not be able to place orders or submit requests until the block expires.
          </p>

          <div className="bg-amber-100 border-2 border-amber-400 rounded-lg p-3 mb-4">
            <p className="text-[10px] font-black uppercase text-amber-800 mb-1">
              ℹ️ THIS ACTION IS PERMANENT
            </p>
            <p className="text-xs font-bold text-amber-700">
              This security measure protects our system from abuse. If you believe this is an error, contact support.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full rounded-xl border-3 border-red-700 bg-red-600 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-red-700 transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
