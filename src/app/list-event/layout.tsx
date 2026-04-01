import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit an Event – What's On Isle of Man",
  description: "Share your Isle of Man event with the ManxHive community. Gigs, community meet-ups, sports fixtures and more. Free to submit — reviewed within 24 hours.",
  alternates: { canonical: "https://manxhive.com/list-event" },
  openGraph: {
    title: "Submit an Event | ManxHive",
    description: "Get your Isle of Man event listed on ManxHive's What's On guide.",
    url: "https://manxhive.com/list-event",
  },
};

export default function ListEventLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
