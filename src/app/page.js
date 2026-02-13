"use client";
import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { io } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Fallback products if API is unavailable
const FALLBACK_PRODUCTS = [
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

export default function HomePage() {
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(`${API_URL}/api/products`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            // Map API products, using _id as id
            setProducts(data.map((p) => ({ ...p, id: p._id || p.id })));
          }
        }
      } catch {
        // Use fallback products
      }
    }
    fetchProducts();
    
    // Set up Socket.io for real-time stock updates
    const socket = io(API_URL);
    
    socket.on("connect", () => {
      console.log("Connected to real-time stock updates");
    });
    
    socket.on("stock-update", ({ productId, inStock }) => {
      // Update the specific product in real-time
      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p._id === productId || p.id === productId
            ? { ...p, inStock }
            : p
        )
      );
    });
    
    // Poll for full sync every 30 seconds (backup)
    const interval = setInterval(fetchProducts, 30000);
    
    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="rounded-2xl border-4 border-amber-900 bg-amber-50 shadow-[6px_6px_0px_#78350f] overflow-hidden mb-10">
        <div className="flex items-center gap-2 bg-amber-900 px-4 py-2">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
          <span className="ml-3 text-xs font-bold uppercase tracking-widest text-amber-100">
            WELCOME
          </span>
        </div>
        <div className="p-8 text-center">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-wider text-amber-900">
            Bhaskar B1 MART
          </h1>
          <p className="text-lg text-amber-700 font-bold mt-2">
            Your Hostel Convenience Store — Order From Your Room
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
