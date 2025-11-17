// src/lib/marketplace/types.ts

export type CategorySlug =
  | "electronics"
  | "fashion"
  | "home-garden"
  | "health-beauty"
  | "toys-games"
  | "sports-outdoors"
  | "media"
  | "automotive"
  | "pet-supplies";

export const CATEGORY_LABELS: Record<CategorySlug, string> = {
  electronics: "Electronics & Tech",
  fashion: "Fashion & Accessories",
  "home-garden": "Home & Garden",
  "health-beauty": "Health & Beauty",
  "toys-games": "Toys & Games",
  "sports-outdoors": "Sports & Outdoors",
  media: "Books, Music & Media",
  automotive: "Motors & Automotive",
  "pet-supplies": "Pet Supplies",
};

export type ItemCondition =
  | "New"
  | "Like New"
  | "Lightly Used"
  | "Used"
  | "For Parts";

export type Listing = {
  id: string;
  title: string;
  description?: string;
  category: CategorySlug;
  pricePence: number;
  negotiable?: boolean;
  condition?: string;
  seller?: string;
  area?: string;
  boosted?: boolean;
  approved?: boolean;
  dateListed: string;
  images?: string[] | null;
};