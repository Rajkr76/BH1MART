"use client";
import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ;

export default function ProductManagement({ token }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image: "",
    category: "Snacks",
    priority: 100,
  });

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

  const addProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          image: newProduct.image,
          category: newProduct.category,
          priority: parseInt(newProduct.priority),
          inStock: true,
        }),
      });
      if (res.ok) {
        setNewProduct({ name: "", price: "", image: "", category: "Snacks", priority: 100 });
        setShowAddForm(false);
        fetchProducts();
        alert("Product added successfully!");
      } else {
        const data = await res.json();
        alert(`Failed to add product: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Failed to add product:", err);
      alert("Failed to add product. Check console for details.");
    }
  };

  const seedProducts = async () => {
    if (!confirm("This will add 12 default products to the database. Continue?")) return;
    try {
      const res = await fetch(`${API_URL}/api/products/seed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Success! Added ${data.count} products to database.`);
        fetchProducts();
      } else {
        const data = await res.json();
        alert(`Failed to seed products: ${data.error || data.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Failed to seed products:", err);
      alert("Failed to seed products. Check console for details.");
    }
  };

  if (loading) {
    return <p className="text-center text-amber-700 font-bold py-4">Loading products...</p>;
  }

  return (
    <div className="space-y-4">
      {/* Add Product Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-black uppercase text-amber-900">
          📦 Products ({products.length})
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded-lg border-2 border-amber-900 bg-orange-500 px-4 py-2 text-xs font-black uppercase text-white hover:bg-orange-600 transition-colors"
        >
          {showAddForm ? "CANCEL" : "+ ADD PRODUCT"}
        </button>
      </div>

      {/* Add Product Form */}
      {showAddForm && (
        <div className="rounded-xl border-2 border-green-400 bg-green-50 p-4">
          <h3 className="text-sm font-black uppercase text-green-700 mb-3">
            ➕ Add New Product
          </h3>
          <form onSubmit={addProduct} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black uppercase text-amber-900 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  required
                  placeholder="e.g., Maggi Noodles"
                  className="w-full rounded-lg border-2 border-amber-900 bg-white px-3 py-2 text-amber-900 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-amber-900 mb-1">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  required
                  placeholder="e.g., 30"
                  className="w-full rounded-lg border-2 border-amber-900 bg-white px-3 py-2 text-amber-900 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-amber-900 mb-1">
                  Image URL *
                </label>
                <input
                  type="text"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  required
                  placeholder="/maggie.jpeg or https://..."
                  className="w-full rounded-lg border-2 border-amber-900 bg-white px-3 py-2 text-amber-900 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-amber-900 mb-1">
                  Category
                </label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full rounded-lg border-2 border-amber-900 bg-white px-3 py-2 text-amber-900 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Snacks">Snacks</option>
                  <option value="Noodles">Noodles</option>
                  <option value="Chips">Chips</option>
                  <option value="Biscuits">Biscuits</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-amber-900 mb-1">
                  Priority (lower = higher priority)
                </label>
                <input
                  type="number"
                  value={newProduct.priority}
                  onChange={(e) => setNewProduct({ ...newProduct, priority: e.target.value })}
                  placeholder="100"
                  className="w-full rounded-lg border-2 border-amber-900 bg-white px-3 py-2 text-amber-900 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full rounded-lg border-2 border-green-700 bg-green-500 px-4 py-3 text-sm font-black uppercase text-white hover:bg-green-600 transition-colors"
            >
              ✓ CREATE PRODUCT
            </button>
          </form>
        </div>
      )}

      {/* Out of Stock Alert */}
      {products.filter((p) => !p.inStock).length > 0 && (
        <div className="rounded-xl border-2 border-red-400 bg-red-50 p-4">
          <h3 className="text-sm font-black uppercase text-red-600 mb-2">
            ⚠️ OUT OF STOCK ({products.filter((p) => !p.inStock).length})
          </h3>
          <div className="space-y-1">
            {products.filter((p) => !p.inStock).map((product) => (
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

      {/* No Products Message */}
      {products.length === 0 && (
        <div className="rounded-xl border-2 border-amber-900/30 bg-amber-100 p-8 text-center">
          <p className="text-lg font-black text-amber-900 mb-2">📦 No Products Yet</p>
          <p className="text-sm font-bold text-amber-700 mb-4">
            Click "Add Product" above to start adding products manually, or use the button below to seed 12 default products.
          </p>
          <button
            onClick={seedProducts}
            className="rounded-lg border-2 border-amber-900 bg-blue-500 px-6 py-3 text-sm font-black uppercase text-white hover:bg-blue-600 transition-colors"
          >
            🌱 SEED DEFAULT PRODUCTS
          </button>
        </div>
      )}

      {/* Products List */}
      <div className="space-y-3">{products.map((product) => {
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