// src/app/community-spotlight/stories.ts

export type SpotlightStory = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  location?: string;
  readTime: string;
  tag: string;
  image: string;
};

export const STORIES: SpotlightStory[] = [
  {
    slug: "laxey-bakery-local-legend",
    title: "How A Laxey Bakery Turned Local Loaves Into Island-Wide Hype",
    excerpt:
      "A small family bakery used ManxHive to showcase daily specials, win new wholesale partners, and sell out limited bakes within hours.",
    date: "2024-11-01",
    location: "Laxey",
    readTime: "4 min read",
    tag: "Local Business",
    image: "/images/spotlight-bakery.jpg",
  },
  {
    slug: "peel-fc-community-night",
    title: "Peel FC’s Friday Night Football Became a Community Ritual",
    excerpt:
      "Listing fixtures and club events on ManxHive helped Peel FC drive bigger crowds, volunteers, and sponsors.",
    date: "2024-10-24",
    location: "Peel",
    readTime: "3 min read",
    tag: "Sports & Community",
    image: "/images/spotlight-football.jpg",
  },
  {
    slug: "artisan-makers-market",
    title: "The Island Makers Who Sold Out Their First Artisan Market",
    excerpt:
      "A group of independent makers used ManxHive marketplace and events to coordinate, promote, and sell out their launch event.",
    date: "2024-10-10",
    location: "Douglas",
    readTime: "5 min read",
    tag: "Events",
    image: "/images/spotlight-market.jpg",
  },
];