// src/app/layout.tsx
import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, Cormorant_Garamond } from "next/font/google";
import "mapbox-gl/dist/mapbox-gl.css";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const siteName = "ManxHive";
const siteUrl = "https://manxhive.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "ManxHive – What's On, Marketplace, Deals & Community",
    template: "%s | ManxHive"
  },

  description:
    "What's on, marketplace, deals, sports and community on the Isle of Man. The island's hub for events, listings, offers and local businesses.",

  openGraph: {
    type: "website",
    locale: "en_GB",
    url: siteUrl,
    siteName,
    title: "ManxHive – What's On, Marketplace & Local Life",
    description:
      "Discover events, marketplace listings, deals, sports results and community stories across the Isle of Man.",
  },

  twitter: {
    card: "summary_large_image",
    title: "ManxHive – Isle of Man Events & Marketplace",
    description:
      "What's on, marketplace, deals, sports and community in one place.",
  },

  icons: {
    icon: "/favicon.ico"
  },

  alternates: {
    canonical: siteUrl
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${cormorant.variable}`}>
      <body className="min-h-screen bg-white text-slate-900 antialiased" style={{ fontFamily: "var(--font-dm-sans, 'DM Sans', system-ui, sans-serif)" }}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
