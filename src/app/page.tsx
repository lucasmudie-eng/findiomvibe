import type { Metadata } from "next";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = {
  title: "ManxHive – Isle of Man Events, Marketplace & Local Life",
  description:
    "See what's on, discover marketplace listings, browse deals, sports results and community stories — all in one island hub.",
  alternates: {
    canonical: "https://manxhive.com/",
  },
  openGraph: {
    title: "ManxHive – Isle of Man Events & Marketplace",
    description:
      "Discover events, marketplace listings, deals, sports results and community stories across the Isle of Man.",
    url: "https://manxhive.com/",
    images: ["/og-image.jpg"],
  },
};

export default function HomePage() {
  return <HomePageClient />;
}