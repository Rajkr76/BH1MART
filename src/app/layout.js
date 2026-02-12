import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { LoadingProvider } from "@/components/LoadingBar";
import Navbar from "@/components/Navbar";
import PWARegister from "@/components/PWARegister";
import InstallButton from "@/components/InstallButton";

export const metadata = {
  title: "Bhaskar B1 MART — Hostel Convenience Store",
  description: "Order snacks and essentials from your hostel room",
  manifest: "/manifest.json",
  themeColor: "#78350f",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/icon-192.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "B1 MART",
    startupImage: "/icon-512.svg",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-linear-to-br from-orange-200 via-amber-100 to-orange-300">
        <PWARegister />
        <InstallButton />
        <LoadingProvider>
          <CartProvider>
            <Navbar />
            <main className="pb-12">{children}</main>
          </CartProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
