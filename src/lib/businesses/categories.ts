// src/lib/businesses/categories.ts

export type MainCategory =
  | "food-drink"
  | "home-trades"
  | "health-beauty"
  | "auto"
  | "family-kids"
  | "professional"
  | "events-venues"
  | "fitness-sport";

// You can tweak labels / subcategories anytime.
// Keep `key` stable; `label` is the human name you show in UI (and likely what's stored in DB).
export const BUSINESS_CATEGORIES: Array<{
  key: MainCategory;
  label: string;
  icon?: string; // optional, for future use
  subcategories: string[];
}> = [
  {
    key: "food-drink",
    label: "Food & Drink",
    subcategories: ["Cafe", "Coffee shop", "Restaurant", "Takeaway", "Pub / Bar", "Bakery", "Catering"],
  },
  {
    key: "home-trades",
    label: "Home & Trades",
    subcategories: ["Plumbing", "Electrical", "Joinery", "Roofing", "Landscaping", "Cleaning", "Removals"],
  },
  {
    key: "health-beauty",
    label: "Health & Beauty",
    subcategories: ["Hair", "Barber", "Nails", "Spa", "Aesthetics", "Massage", "Dentist", "Optician"],
  },
  {
    key: "auto",
    label: "Auto",
    subcategories: ["Sales", "Repairs", "Tyres", "Valeting", "Detailing", "Parts"],
  },
  {
    key: "family-kids",
    label: "Family & Kids",
    subcategories: ["Nursery", "Activities", "Classes", "Tutoring", "Photography", "Party services"],
  },
  {
    key: "professional",
    label: "Professional Services",
    subcategories: ["Accountancy", "Legal", "IT & Web", "Marketing", "Consulting", "Financial advice"],
  },
  {
    key: "events-venues",
    label: "Events & Venues",
    subcategories: ["Venues", "Caterers", "Photographers", "Entertainers", "Hire", "Planners"],
  },
  {
    key: "fitness-sport",
    label: "Fitness & Sport",
    subcategories: ["Gyms", "PT", "Clubs", "Yoga", "Pilates", "Martial arts", "Coaching"],
  },
];