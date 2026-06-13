import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import AIChat from "@/components/ai-chat";

export const metadata: Metadata = {
  title: "Trendy Suits AI - Luxury Fashion Price Comparison Platform",
  description: "Find premium clothing, shoes, watches, and accessories at the lowest prices across Amazon, Flipkart, Meesho, Myntra, Zudio, Zara, and Trends.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="dark font-sans">
        <Navbar />
        <main className="min-h-[calc(100vh-16rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-transition">
          {children}
        </main>
        <Footer />
        <AIChat />
      </body>
    </html>
  );
}
