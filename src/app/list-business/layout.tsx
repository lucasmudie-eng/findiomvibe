import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "List Your Business – Get on ManxHive",
  description: "Add your Isle of Man business to ManxHive. Reach locals searching for services, trades, food, retail and more. Free to list — takes less than 5 minutes.",
  alternates: { canonical: "https://manxhive.com/list-business" },
  openGraph: {
    title: "List Your Business | ManxHive",
    description: "Get your Isle of Man business in front of locals on ManxHive.",
    url: "https://manxhive.com/list-business",
  },
};

export default function ListBusinessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
