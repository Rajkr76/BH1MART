"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

export default function Navbar() {
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/", label: "HOME" },
    { href: "/cart", label: `CART${itemCount > 0 ? ` (${itemCount})` : ""}` },
    { href: "/request", label: "REQUEST" },
    { href: "/chat", label: "CHAT" },
  ];

  return (
    <nav className="sticky top-0 z-50 mx-auto max-w-5xl px-4 pt-4">
      <div className="rounded-2xl border-4 border-amber-900 bg-amber-50 shadow-[6px_6px_0px_#78350f] overflow-hidden">
        {/* Retro dots bar */}
        <div className="flex items-center gap-2 bg-amber-900 px-4 py-2">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
          <span className="ml-3 text-xs font-bold uppercase tracking-widest text-amber-100">
            Bhaskar B1 MART
          </span>
        </div>

        {/* Nav links */}
        <div className="flex items-center justify-between px-6 py-3">
          <Link
            href="/"
            className="text-2xl font-black uppercase tracking-wider text-amber-900"
          >
            B1 MART
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-extrabold uppercase tracking-wide text-amber-900 hover:text-orange-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-amber-900 font-bold text-xl"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile links */}
        {menuOpen && (
          <div className="md:hidden flex flex-col gap-2 px-6 pb-4 border-t-2 border-amber-900/20 pt-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-extrabold uppercase tracking-wide text-amber-900 hover:text-orange-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
