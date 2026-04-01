import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit an Event – What's On Isle of Man",
  description: "Share your Isle of Man event with the ManxHive community. Gigs, community meet-ups, sports fixtures and more. Free to submit — reviewed within 1–2 working days.",
  alternates: { canonical: "https://manxhive.com/whats-on/submit" },
  openGraph: {
    title: "Submit an Event | ManxHive",
    description: "Get your Isle of Man event listed on ManxHive's What's On guide.",
    url: "https://manxhive.com/whats-on/submit",
  },
};

export default function SubmitEventLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
