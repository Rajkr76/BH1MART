"use client";
import Link from "next/link";

export default function ChatPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="rounded-2xl border-4 border-amber-900 bg-amber-50 shadow-[6px_6px_0px_#78350f] overflow-hidden">
        <div className="flex items-center gap-2 bg-amber-900 px-4 py-2">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
          <span className="ml-3 text-xs font-bold uppercase tracking-widest text-amber-100">
            CHAT
          </span>
        </div>
        <div className="p-8 text-center">
          <div className="text-5xl mb-4">💬</div>
          <h2 className="text-xl font-black uppercase text-amber-900 mb-2">
            Chat on WhatsApp
          </h2>
          <p className="text-sm text-amber-700 font-bold mb-6">
            All orders are now handled via WhatsApp. Place your order from the cart to get started!
          </p>
          <Link
            href="/"
            className="inline-block rounded-xl border-3 border-amber-900 bg-orange-500 px-6 py-2.5 text-sm font-black uppercase tracking-wider text-white hover:bg-orange-600 transition-colors"
          >
            BROWSE MENU
          </Link>
        </div>
      </div>
    </div>
  );
}
