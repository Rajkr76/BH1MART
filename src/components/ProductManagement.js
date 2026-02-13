"use client";
import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ;

export default function ProductManagement({ token }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleStock = async (productId) => {
    const product = products.find((p) => p._id === productId);
    if (!product) return;
    try {
      const res = await fetch(`${API_URL}/api/products/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ inStock: !product.inStock }),
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (err) {
      console.error("Failed to update stock:", err);
    }
  };

  const deleteProduct = async (productId) => {
    if (!confirm("Remove this product?")) return;
    try {
      const res = await fetch(`${API_URL}/api/products/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  const outOfStockProducts = products.filter((p) => !p.inStock);

  if (loading) {
    return <p className="text-center text-amber-700 font-bold py-4">Loading products...</p>;
  }

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
              <div key={product._id} className="flex items-center justify-between text-xs font-bold text-red-700">
                <span>{product.name} - ₹{product.price}</span>
                <button
                  onClick={() => toggleStock(product._id)}
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
        {products.map((product) => {
          const inStock = product.inStock !== false;

          return (
            <div
              key={product._id}
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
                    onClick={() => toggleStock(product._id)}
                    className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase border-2 transition-colors ${
                      inStock
                        ? "bg-yellow-400 text-yellow-900 border-yellow-600 hover:bg-yellow-500"
                        : "bg-green-400 text-green-900 border-green-600 hover:bg-green-500"
                    }`}
                  >
                    {inStock ? "OUT" : "IN"}
                  </button>
                  <button
                    onClick={() => deleteProduct(product._id)}
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
    </div>
  );
}
