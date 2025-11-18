// src/app/api/marketplace/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: { persistSession: false },
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const limit = Math.min(Number(searchParams.get("limit") ?? "50"), 200);

    // Filters
    const category = searchParams.get("category");
    const type = (searchParams.get("type") || "").toLowerCase(); // e.g. "car"
    const dealer = searchParams.get("dealer"); // business slug or id
    const make = searchParams.get("make");
    const model = searchParams.get("model");
    const priceMax = searchParams.get("priceMax");
    const yearMin = searchParams.get("yearMin");
    const mileageMax = searchParams.get("mileageMax");

    // dealer / private filter
    const sellerTypeRaw = (searchParams.get("sellerType") || "all").toLowerCase();
    const sellerType: "all" | "dealer" | "private" =
      sellerTypeRaw === "dealer" ? "dealer" : sellerTypeRaw === "private" ? "private" : "all";

    // Base query
    let q = supabase
      .from("marketplace_listings")
      .select(
        `
        id,
        title,
        description,
        category,
        area,
        price_pence,
        negotiable,
        condition,
        images,
        boosted,
        approved,
        date_listed,
        business_id,
        type,
        attrs
      `
      )
      .eq("approved", true)
      .order("boosted", { ascending: false })
      .order("date_listed", { ascending: false })
      .limit(limit);

    if (category) q = q.eq("category", category);
    if (type) q = q.eq("type", type);

    if (sellerType === "dealer") q = q.not("business_id", "is", null);
    if (sellerType === "private") q = q.is("business_id", null);

    if (dealer) {
      // accept either a slug or an id
      const { data: bizBySlug } = await supabase
        .from("businesses")
        .select("id")
        .eq("slug", dealer)
        .maybeSingle();
      const businessId = bizBySlug?.id || dealer;
      q = q.eq("business_id", businessId);
    }

    // Server-side JSON attr filters (cars)
    if (make) q = q.eq("attrs->>make", make);
    if (model) q = q.eq("attrs->>model", model);

    const { data, error } = await q;
    if (error) {
      console.error("[api/marketplace] query error", error);
      return NextResponse.json({ items: [], error: "Query error" }, { status: 500 });
    }

    // Map to camelCase for the frontend
    let items = (data || []).map((r: any) => ({
      id: r.id as string,
      title: r.title as string,
      description: r.description as string | null,
      category: r.category as string | null,
      area: r.area as string | null,
      pricePence: r.price_pence as number | null,
      negotiable: r.negotiable as boolean | null,
      condition: r.condition as string | null,
      images: Array.isArray(r.images) ? (r.images as string[]) : r.images ? [r.images] : [],
      boosted: r.boosted as boolean | null,
      approved: r.approved as boolean | null,
      dateListed: r.date_listed as string | null,
      businessId: r.business_id as string | null,
      type: (r.type as string | null) ?? null,
      attrs: (r.attrs as any) ?? null,
    }));

    // Light post-filtering for numeric ranges (applies to mapped items)
    const pMax = priceMax ? Number(priceMax) : undefined;
    const yMin = yearMin ? Number(yearMin) : undefined;
    const mMax = mileageMax ? Number(mileageMax) : undefined;

    if (pMax !== undefined && !Number.isNaN(pMax)) {
      items = items.filter((i) => ((i.pricePence ?? 0) / 100) <= pMax);
    }
    if (yMin !== undefined && !Number.isNaN(yMin)) {
      items = items.filter((i) => (i.attrs?.year ?? 0) >= yMin);
    }
    if (mMax !== undefined && !Number.isNaN(mMax)) {
      items = items.filter((i) => (i.attrs?.mileage ?? 0) <= mMax);
    }

    return NextResponse.json({ items });
  } catch (err) {
    console.error("[api/marketplace] fatal", err);
    return NextResponse.json({ items: [], error: "Unexpected error" }, { status: 500 });
  }
}