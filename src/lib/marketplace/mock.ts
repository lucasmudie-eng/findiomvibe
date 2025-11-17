import { Listing } from "./types";

const now = new Date().toISOString();

export const MOCK_LISTINGS: Listing[] = [
  {
    id: "mk-1",
    category: "electronics",
    title: "iPhone 13 Pro 256GB - Graphite",
    seller: "John D.",
    area: "Douglas",
    pricePence: 55000,
    negotiable: true,
    condition: "Like New",
    dateListed: now,
    boosted: true,
    images: ["/placeholder/iphone.jpg"],
    description: "Unlocked iPhone 13 Pro, 256GB, excellent condition, boxed with charger.",
  },
  {
    id: "mk-2",
    category: "home-garden",
    title: "Solid oak dining table + 4 chairs",
    seller: "Sarah K.",
    area: "Onchan",
    pricePence: 12000,
    negotiable: false,
    condition: "Lightly Used",
    dateListed: now,
    boosted: true,
    images: ["/placeholder/table.jpg"],
    description: "Beautiful oak table, 150cm, with 4 matching chairs. Collection only.",
  },
  {
    id: "mk-3",
    category: "sports-outdoors",
    title: "Road bike - Medium frame",
    seller: "Mike R.",
    area: "Peel",
    pricePence: 30000,
    negotiable: true,
    condition: "Used",
    dateListed: now,
    boosted: false,
    images: ["/placeholder/bike.jpg"],
    description: "Alloy road bike, regularly serviced. Great starter bike.",
  },
  // add more as needed
];