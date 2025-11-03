// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "ManxHive",
  description: "Find trusted local providers on the Isle of Man",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">
        <Header />
        <div className="h-20 md:h-24" />
        <main className="relative z-0">{children}</main>
        <Footer />
      </body>
    </html>
  );
}