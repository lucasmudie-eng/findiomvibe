// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

const siteName = "ManxHive";
const siteUrl = "https://manxhive.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "ManxHive – What’s On, Marketplace, Deals & Community",
    template: "%s | ManxHive"
  },

  description:
    "What’s on, marketplace, deals, sports and community on the Isle of Man. The island’s hub for events, listings, offers and local businesses.",

  openGraph: {
    type: "website",
    locale: "en_GB",
    url: siteUrl,
    siteName,
    title: "ManxHive – What’s On, Marketplace & Local Life",
    description:
      "Discover events, marketplace listings, deals, sports results and community stories across the Isle of Man.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ManxHive"
      }
    ]
  },

  twitter: {
    card: "summary_large_image",
    title: "ManxHive – Isle of Man Events & Marketplace",
    description:
      "What’s on, marketplace, deals, sports and community in one place.",
    images: ["/og-image.jpg"]
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
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        <Header />
        <div className="h-20 md:h-24" />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}