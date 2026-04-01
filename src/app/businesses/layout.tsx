import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Local Businesses – Isle of Man Directory",
  description: "Browse trusted local businesses and services across the Isle of Man. From trades and food to retail, health and professional services.",
  alternates: { canonical: "https://manxhive.com/businesses" },
  openGraph: {
    title: "Local Businesses | ManxHive",
    description: "Trusted Isle of Man businesses and services in one place.",
    url: "https://manxhive.com/businesses",
  },
};

export default function BusinessesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
