// src/app/api/feed/marketplace/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  // replace with Supabase query later
  return NextResponse.json({
    items: [
      { id: 'm1', title: 'IKEA Malm Desk – like new', price: '£60', href: '/marketplace/item/ikea-desk' },
      { id: 'm2', title: 'Kids bike 20”', price: '£30', href: '/marketplace/item/kids-bike' },
    ],
  });
}