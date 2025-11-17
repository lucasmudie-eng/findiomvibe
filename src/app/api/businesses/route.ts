// src/app/api/businesses/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const subcategory = searchParams.get("subcategory");
  const boosted = searchParams.get("boosted") === "1";
  const hottest = searchParams.get("hottest") === "1";
  const limit = Math.min(Number(searchParams.get("limit") || 30), 100);

  const supabase = createClient(url, anon, { auth: { persistSession: false } });

  let q = supabase
    .from("businesses")
    .select(
      "id, name, slug, category, subcategory, area, tagline, boosted, logo_url, website_url, popularity_score, created_at"
    );

  if (category) q = q.eq("category", category);
  if (subcategory) q = q.eq("subcategory", subcategory);
  if (boosted) q = q.eq("boosted", true);

  if (hottest) {
    q = q.order("popularity_score", { ascending: false }).order("created_at", {
      ascending: false,
    });
  } else {
    // sensible default: boosted first, newest next
    q = q.order("boosted", { ascending: false }).order("created_at", {
      ascending: false,
    });
  }

  q = q.limit(limit);

  const { data, error } = await q;
  if (error) {
    console.error("[api/businesses] error", error);
    return NextResponse.json({ items: [], error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data ?? [] });
}