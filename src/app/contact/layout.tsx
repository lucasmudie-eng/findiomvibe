import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us – ManxHive",
  description:
    "Get in touch with the ManxHive team. Report a bug, enquire about advertising, submit feedback, or ask about your listing.",
  alternates: { canonical: "https://manxhive.com/contact" },
  openGraph: {
    title: "Contact ManxHive",
    description: "Reach the ManxHive team for support, advertising, press, and more.",
    url: "https://manxhive.com/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
