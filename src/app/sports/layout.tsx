import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sports – Isle of Man",
  description: "Results, tables, fixtures and scores for Isle of Man sports — football, rugby, cricket and more.",
  alternates: { canonical: "https://manxhive.com/sports" },
  openGraph: {
    title: "IOM Sports Hub | ManxHive",
    description: "Live sports results and fixtures from across the Isle of Man.",
    url: "https://manxhive.com/sports",
  },
};

export default function SportsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
