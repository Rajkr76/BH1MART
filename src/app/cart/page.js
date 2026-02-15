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
                className="mt-4 w-full rounded-xl border-3 border-amber-900 bg-green-500 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                PLACE ORDER ON WHATSAPP
              </button>
            </>
          )}
        </div>
      </div>

      {showOrder && <OrderModal onClose={() => setShowOrder(false)} />}
    </div>
  );
}
