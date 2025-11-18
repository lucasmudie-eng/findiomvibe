// src/app/api/marketplace/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If missing at build-time → return null, DO NOT throw
  if (!url || !anon) {
    console.warn("[api/marketplace] Missing Supabase env – endpoint disabled.");
    return null;
  }

  return createClient(url, anon, {
    auth: { persistSession: false },
  });
}

export async function GET(req: Request) {
  const supabase = getClient();

  // If no env on Vercel → return safe fallback
  if (!supabase) {
    return NextResponse.json(
      {
        items: [],
        error: "Marketplace API not configured.",
      },
      { status: 501 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? "50"), 200);

    const category = searchParams.get("category");
    const type = (searchParams.get("type") || "").toLowerCase();
    const dealer = searchParams.get("dealer");
    const make = searchParams.get("make");
    const model = searchParams.get("model");
    const priceMax = searchParams.get("priceMax");
    const yearMin = searchParams.get("yearMin");
    const mileageMax = searchParams.get("mileageMax");

    const sellerTypeRaw = (searchParams.get("sellerType") || "all").toLowerCase();
    const sellerType: "all" | "dealer" | "private" =
      sellerTypeRaw === "dealer"
        ? "dealer"
        : sellerTypeRaw === "private"
        ? "private"
        : "all";

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
      const { data: bizBySlug } = await supabase
        .from("businesses")
        .select("id")
        .eq("slug", dealer)
        .maybeSingle();

      const businessId = bizBySlug?.id || dealer;
      q = q.eq("business_id", businessId);
    }

    if (make) q = q.eq("attrs->>make", make);
    if (model) q = q.eq("attrs->>model", model);

    const { data, error } = await q;
    if (error) {
      console.error("[api/marketplace] query error", error);
      return NextResponse.json({ items: [], error: "Query error" }, { status: 500 });
    }

    let items = (data || []).map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      area: r.area,
      pricePence: r.price_pence,
      negotiable: r.negotiable,
      condition: r.condition,
      images: Array.isArray(r.images)
        ? r.images
        : r.images
        ? [r.images]
        : [],
      boosted: r.boosted,
      approved: r.approved,
      dateListed: r.date_listed,
      businessId: r.business_id,
      type: r.type,
      attrs: r.attrs,
    }));

    const pMax = priceMax ? Number(priceMax) : undefined;
    const yMin = yearMin ? Number(yearMin) : undefined;
    const mMax = mileageMax ? Number(mileageMax) : undefined;

    if (pMax !== undefined && !Number.isNaN(pMax))
      items = items.filter((i) => ((i.pricePence ?? 0) / 100) <= pMax);

    if (yMin !== undefined && !Number.isNaN(yMin))
      items = items.filter((i) => (i.attrs?.year ?? 0) >= yMin);

    if (mMax !== undefined && !Number.isNaN(mMax))
      items = items.filter((i) => (i.attrs?.mileage ?? 0) <= mMax);

    return NextResponse.json({ items });
  } catch (err) {
    console.error("[api/marketplace] fatal", err);
    return NextResponse.json(
      { items: [], error: "Unexpected error" },
      { status: 500 }
    );
  }
}