"use client";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
    setQty(1);
  };

  return (
    <div className="group rounded-2xl border-4 border-amber-900 bg-amber-50 shadow-[6px_6px_0px_#78350f] overflow-hidden transition-transform duration-300 hover:scale-[1.03] hover:shadow-[8px_8px_0px_#78350f]">
      {/* Dots bar */}
      <div className="flex items-center gap-2 bg-amber-900 px-4 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
      </div>

      {/* Image */}
      <div className="relative w-full h-48 bg-amber-100 flex items-center justify-center overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-black uppercase tracking-wide text-amber-900 leading-tight">
          {product.name}
        </h3>
        <p className="text-sm text-amber-700 mt-1">{product.tagline}</p>
        <p className="text-2xl font-black text-orange-600 mt-2">
          ₹{product.price}
        </p>

        {/* Quantity */}
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-8 h-8 rounded-lg border-2 border-amber-900 bg-amber-100 font-black text-amber-900 hover:bg-amber-200 transition-colors"
          >
            -
          </button>
          <span className="font-black text-amber-900 text-lg w-6 text-center">
            {qty}
          </span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="w-8 h-8 rounded-lg border-2 border-amber-900 bg-amber-100 font-black text-amber-900 hover:bg-amber-200 transition-colors"
          >
            +
          </button>
        </div>

        {/* Add button */}
        <button
          onClick={handleAdd}
          className={`mt-4 w-full rounded-xl border-3 border-amber-900 py-2.5 text-sm font-black uppercase tracking-wider transition-all duration-300 ${
            added
              ? "bg-green-500 text-white border-green-700"
              : "bg-orange-500 text-white hover:bg-orange-600"
          }`}
        >
          {added ? "✓ ADDED!" : "ADD TO CART"}
        </button>
      </div>
    </div>
  );
}
