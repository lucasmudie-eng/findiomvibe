// src/lib/deals/types.ts

export type DealCategory =
  | "food-drink"
  | "shopping"
  | "activities"
  | "beauty-wellness"
  | "services"
  | "other";

export const DEAL_CATEGORY_LABELS: Record<DealCategory, string> = {
  "food-drink": "Food & Drink",
  shopping: "Shopping & Retail",
  activities: "Activities & Leisure",
  "beauty-wellness": "Beauty & Wellness",
  services: "Local Services",
  other: "Other",
};

export type Deal = {
  id: string;
  business_name: string | null;
  title: string;
  description: string | null;
  category: DealCategory | null;
  area: string | null;
  discount_label: string | null;
  redemption_url: string | null;
  image_url: string | null;
  boosted: boolean;
  approved: boolean;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
};