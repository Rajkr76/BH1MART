import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "B1 MART — Hostel Convenience Store",
  description: "Order snacks and essentials from your hostel room",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-linear-to-br from-orange-200 via-amber-100 to-orange-300">
        <CartProvider>
          <Navbar />
          <main className="pb-12">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
