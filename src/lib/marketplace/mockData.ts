import { Listing, CategorySlug, ItemCondition } from "./types";

const AREAS = ["Douglas", "Peel", "Ramsey", "Castletown", "Onchan", "Port Erin", "Laxey"];
const CONDITIONS: ItemCondition[] = ["New", "Like New", "Lightly Used", "Used", "For Parts"];
const TITLES: Record<CategorySlug, string[]> = {
  electronics: ["iPhone 13", "Gaming PC RTX 3070", 'Samsung 4K TV 55"', "iPad Air", "PS5 Console"],
  fashion: ["Men’s Nike Trainers", "Zara Coat M", "Gold Plated Necklace", "Leather Handbag", "Adidas Hoodie"],
  "home-garden": ["IKEA Sofa", "Dining Table Set", "Cordless Drill Set", "Floor Lamp", "Rug 200x300"],
  "health-beauty": ["Dyson Hair Dryer", "Skincare Bundle", "Massage Gun", "Oral-B Toothbrush", "Nail Kit"],
  "toys-games": ["LEGO Technic", "Board Game Bundle", "Nintendo Switch", "RC Car", "Kids Bike"],
  "sports-outdoors": ["Treadmill", "Dumbbell Set", "Camping Tent", "Football Boots", "Road Bike"],
  media: ["Books Bundle", "Vinyl Records", "Blu-Ray Set", "Kindle", "Music Keyboard"],
  automotive: ["Alloy Wheels", "Roof Rack", "Car Seat", "Dash Cam", "Tyres 17in"],
  "pet-supplies": ["Dog Crate", "Cat Tree", "Aquarium", "Pet Carrier", "Pet Grooming Kit"],
};

function rand<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }
function price(min: number, max: number) { return Math.floor((min + Math.random() * (max - min)) * 100); }
function dateDaysAgo(days: number) { const d = new Date(); d.setDate(d.getDate() - days); return d.toISOString(); }
const IMAGE = (w:number,h:number) => `https://picsum.photos/seed/${Math.random().toString(36).slice(2)}/${w}/${h}`;

function buildListing(cat: CategorySlug, i: number): Listing {
  const title = rand(TITLES[cat]);
  const imgCount = 1 + Math.floor(Math.random() * 5);
  return {
    id: `${cat}-${i + 1}`,
    category: cat,
    title,
    seller: ["Chris", "Alex", "Morgan", "Sam", "Taylor", "Jordan"][i % 6],
    area: rand(AREAS),
    pricePence: price(10, 800),
    negotiable: Math.random() > 0.5,
    condition: rand(CONDITIONS),
    dateListed: dateDaysAgo(Math.floor(Math.random() * 21)),
    boosted: i < 12 ? Math.random() > 0.4 : false, // some boosted
    images: Array.from({ length: imgCount }, () => IMAGE(800, 600)),
    description:
      `${title} in great condition. Lightly used and well looked after. ` +
      `Available in ${rand(AREAS)}. Can deliver locally.`,
  };
}

const CATS: CategorySlug[] = [
  "electronics","fashion","home-garden","health-beauty","toys-games",
  "sports-outdoors","media","automotive","pet-supplies",
];

export const MOCK_LISTINGS: Listing[] = CATS.flatMap((cat) =>
  Array.from({ length: 30 }, (_, i) => buildListing(cat, i))
);

export function getBoosted(limit = 10) {
  const boosted = MOCK_LISTINGS.filter(l => l.boosted).sort(
    (a,b) => new Date(b.dateListed).getTime() - new Date(a.dateListed).getTime()
  );
  return boosted.slice(0, limit);
}

export function getByCategory(cat: CategorySlug, page = 1, perPage = 20) {
  const all = MOCK_LISTINGS
    .filter(l => l.category === cat)
    .sort((a,b)=> new Date(b.dateListed).getTime() - new Date(a.dateListed).getTime());
  const start = (page - 1) * perPage;
  return { items: all.slice(start, start + perPage), page, perPage, total: all.length };
}

export function getById(id: string) {
  return MOCK_LISTINGS.find(l => l.id === id) || null;
}