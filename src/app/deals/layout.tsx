import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Local Deals – Isle of Man Offers & Discounts",
  description: "Time-limited offers and discounts from Isle of Man businesses. Support local and save with curated deals across food, shopping, activities and more.",
  alternates: { canonical: "https://manxhive.com/deals" },
  openGraph: {
    title: "Local Deals | ManxHive",
    description: "Curated offers from Isle of Man businesses — food, shopping, activities and more.",
    url: "https://manxhive.com/deals",
  },
};

export default function DealsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
