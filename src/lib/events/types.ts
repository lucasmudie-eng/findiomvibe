// src/lib/events/types.ts

export type WhatsOnCategorySlug =
  | "family"
  | "sports"
  | "nightlife"
  | "live-music"
  | "community"
  | "business"
  | "arts-culture"
  | "education";

export const WHATS_ON_CATEGORY_LABELS: Record<WhatsOnCategorySlug, string> = {
  family: "Family & Kids",
  sports: "Sport & Fitness",
  nightlife: "Nightlife & Social",
  "live-music": "Live Music",
  community: "Community & Charity",
  business: "Business & Networking",
  "arts-culture": "Arts & Culture",
  education: "Talks, Classes & Workshops",
};

export type WhatsOnEvent = {
  id: string;
  slug: string | null;
  title: string;
  description: string;
  category: string;
  start_at: string;
  end_at: string | null;
  venue: string | null;
  area: string | null;
  image_url: string | null;
  organiser_name: string | null;
  organiser_email: string | null;
  external_url: string | null;
  is_free: boolean | null;
  price_from_pence: number | null;
  featured: boolean | null;
  approved: boolean | null;
  created_by: string | null;
  created_at: string;
};