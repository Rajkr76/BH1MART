"use client";
import ProductCard from "@/components/ProductCard";

const PRODUCTS = [
  // TOP PRIORITY
  { id: 1, name: "Maggi", tagline: "Maggie(bulk reduce price-@27)", price: 30, image: "/maggie.jpeg" },
  { id: 2, name: "Kurkure", tagline: "Masala Munch Crunch", price: 35, image: "/kurkure.jpeg" },
  { id: 3, name: "Maggi Cup Noodles", tagline: "Instant Cup Delight", price: 85, image: "/Maggie cup noodles.jpeg" },
  // REMAINING PRODUCTS
  { id: 4, name: "Blue Lays", tagline: "Classic Salted Crisp", price: 65, image: "/blue lays.jpeg" },
  { id: 5, name: "Dark Fantasy", tagline: "Choco Filled Indulgence", price: 40, image: "/dark fantasy choco biscuits .jpeg" },
  { id: 6, name: "Oreo Strawberry", tagline: "Berry Cream Twist", price: 45, image: "/Oreo(strawberry).jpeg" },
  { id: 7, name: "Ramen Chicken", tagline: "Spicy Korean Noodles", price: 70, image: "/Ramen Spicy Chicken noodles.jpeg" },
  { id: 8, name: "Ramen Veg", tagline: "Spicy Veggie Bowl", price: 73, image: "/Ramen Spicy veg noodles.jpeg" },
  { id: 9, name: "TooYumm Bhoot", tagline: "Ghost Pepper Heat", price: 67, image: "/too yum bhoot chips .jpeg" },
  { id: 10, name: "TooYumm Onion", tagline: "Crispy Onion Rings", price: 67, image: "/too yum onion chhips.jpeg" },
  { id: 11, name: "Mad Angles", tagline: "Achari Masti Twist", price: 65, image: "/Mad angles achari masti.jpeg" },
  { id: 12, name: "Bikaji Bhel", tagline: "Tangy Mumbai Mix", price: 63, image: "/bikaji bhel.jpeg" },
];

export default function HomePage() {
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
            B1 MART
          </h1>
          <p className="text-lg text-amber-700 font-bold mt-2">
            Your Hostel Convenience Store — Order From Your Room
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
