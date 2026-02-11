"use client";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import OrderModal from "@/components/OrderModal";

export default function CartPage() {
  const { cart, total, removeFromCart, updateQuantity } = useCart();
  const [showOrder, setShowOrder] = useState(false);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="rounded-2xl border-4 border-amber-900 bg-amber-50 shadow-[6px_6px_0px_#78350f] overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 bg-amber-900 px-4 py-2">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
          <span className="ml-3 text-xs font-bold uppercase tracking-widest text-amber-100">
            YOUR CART
          </span>
        </div>

        <div className="p-6">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-5xl mb-4">🛒</p>
              <p className="text-lg font-black uppercase text-amber-900">
                Your cart is empty
              </p>
              <p className="text-sm text-amber-700 font-bold mt-1">
                Add some items from the menu!
              </p>
              <a
                href="/"
                className="inline-block mt-4 rounded-xl border-3 border-amber-900 bg-orange-500 px-6 py-2.5 text-sm font-black uppercase tracking-wider text-white hover:bg-orange-600 transition-colors"
              >
                BROWSE MENU
              </a>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border-2 border-amber-900/20 bg-amber-100 p-4"
                  >
                    {/* Top row: image + name + remove */}
                    <div className="flex items-start gap-3 mb-3">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg border-2 border-amber-900/30 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black uppercase text-amber-900 text-sm leading-tight">
                          {item.name}
                        </h3>
                        <p className="text-sm font-bold text-orange-600">
                          ₹{item.price} each
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 font-black text-lg shrink-0"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Bottom row: quantity controls + subtotal */}
                    <div className="flex items-center justify-between pl-[76px]">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="w-8 h-8 rounded-lg border-2 border-amber-900 bg-amber-50 font-black text-amber-900 hover:bg-amber-200 text-sm flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="font-black text-amber-900 text-lg w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-8 h-8 rounded-lg border-2 border-amber-900 bg-amber-50 font-black text-amber-900 hover:bg-amber-200 text-sm flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                      <p className="font-black text-amber-900 text-lg">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-6 rounded-xl border-2 border-amber-900/30 bg-amber-100 p-4 flex items-center justify-between">
                <span className="text-lg font-black uppercase text-amber-900">
                  Total
                </span>
                <span className="text-2xl font-black text-orange-600">
                  ₹{total}
                </span>
              </div>

              <button
                onClick={() => setShowOrder(true)}
                className="mt-4 w-full rounded-xl border-3 border-amber-900 bg-orange-500 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-orange-600 transition-colors"
              >
                ORDER NOW
              </button>
            </>
          )}
        </div>
      </div>

      {showOrder && <OrderModal onClose={() => setShowOrder(false)} />}
    </div>
  );
}
