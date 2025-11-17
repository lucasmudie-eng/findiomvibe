// src/app/api/deals/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { DealCategory } from "@/lib/deals/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const MOCK_DEALS = [
  {
    id: "mock-1",
    business_name: "Sample Coffee Co.",
    title: "20% off all coffees before 10am",
    category: "food-drink" as DealCategory,
    area: "Douglas",
    discount_label: "20% OFF",
    description: "Morning offer on all barista coffees, Monday–Friday.",
    image_url: null,
    boosted: true,
    starts_at: new Date().toISOString(),
    expires_at: null,
    redemption_url: "https://example.com",
  },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const approvedOnly = searchParams.get("approved") !== "0";
  const limit = Number(searchParams.get("limit") || "100");

  if (!supabaseUrl || !supabaseAnon) {
    const sliced = MOCK_DEALS.slice(0, limit > 0 ? limit : 100);
    return NextResponse.json({ deals: sliced });
  }

  const supabase = createClient(supabaseUrl, supabaseAnon, {
    auth: { persistSession: false },
  });

  let query = supabase
    .from("deals")
    .select(
      `
        id,
        business_name,
        title,
        category,
        area,
        discount_label,
        description,
        image_url,
        boosted,
        starts_at,
        expires_at,
        redemption_url,
        approved,
        created_at
      `
    )
    .order("boosted", { ascending: false })
    .order("created_at", { ascending: false });

  if (approvedOnly) {
    query = query.eq("approved", true);
  }

  if (limit && !Number.isNaN(limit) && limit > 0) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[api/deals] error:", error);
    return NextResponse.json({ deals: [] });
  }

  const deals =
    data?.map((d) => ({
      id: d.id,
      business_name: d.business_name ?? null,
      title: d.title,
      category: (d.category as DealCategory) ?? null,
      area: d.area ?? null,
      discount_label: d.discount_label ?? null,
      description: d.description ?? null,
      image_url: d.image_url ?? null,
      boosted: !!d.boosted,
      starts_at: d.starts_at,
      expires_at: d.expires_at,
      redemption_url: d.redemption_url ?? null,
    })) ?? [];

  return NextResponse.json({ deals });
}