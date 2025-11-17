// src/app/api/marketplace/[id]/route.ts
import { NextResponse } from "next/server";

// Shared mock listings. Keep in sync with /api/marketplace.
const MOCK_LISTINGS = [
  {
    id: "iphone-14-pro",
    category: "electronics",
    title: "iPhone 14 Pro 256GB Deep Purple (Unlocked)",
    seller: "IsleTech Resale",
    area: "Douglas",
    pricePence: 75000,
    negotiable: true,
    condition: "Like New",
    dateListed: "2025-11-08T09:56:02.043Z",
    boosted: true,
    images: ["/placeholder/iphone.jpg"],
    description:
      "Immaculate condition, boxed with accessories. Battery health 96%. Collection in Douglas or Island-wide delivery.",
  },
  {
    id: "oak-dining-table-4-chairs",
    category: "home-garden",
    title: "Solid Oak Dining Table & 4 Chairs",
    seller: "Home Move Sale",
    area: "Peel",
    pricePence: 18000,
    negotiable: false,
    condition: "Lightly Used",
    dateListed: "2025-11-08T09:56:02.043Z",
    boosted: true,
    images: ["/placeholder/table.jpg"],
    description:
      "Quality oak table with four matching chairs. Minor wear, very sturdy. Perfect for apartment or small home.",
  },
  {
    id: "ps5-console",
    category: "electronics",
    title: "PlayStation 5 Disc Edition + 2 controllers",
    seller: "Gamer House",
    area: "Onchan",
    pricePence: 32000,
    negotiable: true,
    condition: "Used",
    dateListed: "2025-11-08T09:56:02.043Z",
    boosted: false,
    images: [],
    description:
      "PS5 in great working order, includes 2 controllers and HDMI cable.",
  },
];

function getMockListings() {
  return MOCK_LISTINGS;
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  if (!id) {
    return NextResponse.json(
      { error: "Missing listing id" },
      { status: 400 }
    );
  }

  const listing =
    getMockListings().find((l) => l.id === id) ?? null;

  if (!listing) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(listing);
}