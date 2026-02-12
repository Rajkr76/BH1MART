"use client";
import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ;

// Same products array as homepage — admin manages stock/price/delete from here
const ALL_PRODUCTS = [
  { id: 1, name: "Maggi", category: "Noodles", price: 30, image: "/maggie.jpeg" },
  { id: 2, name: "Kurkure", category: "Snacks", price: 35, image: "/kurkure.jpeg" },
  { id: 3, name: "Maggi Cup Noodles", category: "Noodles", price: 85, image: "/Maggie cup noodles.jpeg" },
  { id: 4, name: "Blue Lays", category: "Chips", price: 65, image: "/blue lays.jpeg" },
  { id: 5, name: "Dark Fantasy", category: "Biscuits", price: 40, image: "/dark fantasy choco biscuits .jpeg" },
  { id: 6, name: "Oreo Strawberry", category: "Biscuits", price: 45, image: "/Oreo(strawberry).jpeg" },
  { id: 7, name: "Ramen Chicken", category: "Noodles", price: 70, image: "/Ramen Spicy Chicken noodles.jpeg" },
  { id: 8, name: "Ramen Veg", category: "Noodles", price: 73, image: "/Ramen Spicy veg noodles.jpeg" },
  { id: 9, name: "TooYumm Bhoot", category: "Chips", price: 67, image: "/too yum bhoot chips .jpeg" },
  { id: 10, name: "TooYumm Onion", category: "Chips", price: 67, image: "/too yum onion chhips.jpeg" },
  { id: 11, name: "Mad Angles", category: "Snacks", price: 65, image: "/Mad angles achari masti.jpeg" },
  { id: 12, name: "Bikaji Bhel", category: "Snacks", price: 63, image: "/bikaji bhel.jpeg" },
];

export default function ProductManagement({ token }) {
  // Stock overrides stored in localStorage (persists per admin browser)
  const [stockStatus, setStockStatus] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState("");
  const [hiddenItems, setHiddenItems] = useState([]);

  useEffect(() => {
    // Load stock status from localStorage
    const saved = localStorage.getItem("b1mart_stock_status");
    if (saved) setStockStatus(JSON.parse(saved));
    const hidden = localStorage.getItem("b1mart_hidden_items");
    if (hidden) setHiddenItems(JSON.parse(hidden));
  }, []);

  const saveStockStatus = (newStatus) => {
    setStockStatus(newStatus);
    localStorage.setItem("b1mart_stock_status", JSON.stringify(newStatus));
  };

  const saveHidden = (newHidden) => {
    setHiddenItems(newHidden);
    localStorage.setItem("b1mart_hidden_items", JSON.stringify(newHidden));
  };

  const toggleStock = (productId) => {
    const isCurrentlyOut = stockStatus[productId] === false;
    const newStatus = { ...stockStatus, [productId]: isCurrentlyOut ? true : false };
    // If setting back to in-stock, just remove the override
    if (isCurrentlyOut) {
      delete newStatus[productId];
    }
    saveStockStatus(newStatus);
  };

  const hideProduct = (productId) => {
    if (!confirm("Remove this product from the list?")) return;
    saveHidden([...hiddenItems, productId]);
  };

  const restoreProduct = (productId) => {
    saveHidden(hiddenItems.filter((id) => id !== productId));
  };

  const isInStock = (productId) => {
    return stockStatus[productId] !== false;
  };

  const visibleProducts = ALL_PRODUCTS.filter((p) => !hiddenItems.includes(p.id));
  const removedProducts = ALL_PRODUCTS.filter((p) => hiddenItems.includes(p.id));
  const outOfStockProducts = visibleProducts.filter((p) => !isInStock(p.id));

  return (
    <div className="space-y-4">
      {/* Out of Stock Alert */}
      {outOfStockProducts.length > 0 && (
        <div className="rounded-xl border-2 border-red-400 bg-red-50 p-4">
          <h3 className="text-sm font-black uppercase text-red-600 mb-2">
            ⚠️ OUT OF STOCK ({outOfStockProducts.length})
          </h3>
          <div className="space-y-1">
            {outOfStockProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between text-xs font-bold text-red-700">
                <span>{product.name} - ₹{product.price}</span>
                <button
                  onClick={() => toggleStock(product.id)}
                  className="text-[10px] font-black uppercase px-2 py-0.5 bg-green-400 text-green-900 rounded-lg border border-green-600 hover:bg-green-500"
                >
                  RESTOCK
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products List */}
      <div className="space-y-3">
        {visibleProducts.map((product) => {
          const inStock = isInStock(product.id);

          return (
            <div
              key={product.id}
              className={`rounded-xl border-2 p-3 ${
                inStock
                  ? "border-amber-900/30 bg-amber-100"
                  : "border-red-400 bg-red-50 opacity-70"
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-14 h-14 object-cover rounded-lg border-2 border-amber-900/30 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-black text-amber-900 truncate">{product.name}</h4>
                    <span className="text-[10px] font-bold text-amber-500 bg-amber-200 px-2 py-0.5 rounded-full">
                      {product.category}
                    </span>
                    {!inStock && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-400 text-red-900">
                        OUT
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-black text-orange-600">₹{product.price}</span>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleStock(product.id)}
                    className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase border-2 transition-colors ${
                      inStock
                        ? "bg-yellow-400 text-yellow-900 border-yellow-600 hover:bg-yellow-500"
                        : "bg-green-400 text-green-900 border-green-600 hover:bg-green-500"
                    }`}
                  >
                    {inStock ? "OUT" : "IN"}
                  </button>
                  <button
                    onClick={() => hideProduct(product.id)}
                    className="rounded-lg px-2 py-1 text-[10px] font-black uppercase bg-red-400 text-red-900 border-2 border-red-600 hover:bg-red-500 transition-colors"
                  >
                    DEL
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Removed Products */}
      {removedProducts.length > 0 && (
        <div className="rounded-xl border-2 border-amber-900/20 bg-amber-50 p-4">
          <h3 className="text-sm font-black uppercase text-amber-600 mb-2">
            🗑️ REMOVED ITEMS ({removedProducts.length})
          </h3>
          <div className="space-y-2">
            {removedProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between text-xs font-bold text-amber-700">
                <span>{product.name} - ₹{product.price}</span>
                <button
                  onClick={() => restoreProduct(product.id)}
                  className="text-[10px] font-black uppercase px-2 py-0.5 bg-blue-400 text-blue-900 rounded-lg border border-blue-600 hover:bg-blue-500"
                >
                  RESTORE
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
