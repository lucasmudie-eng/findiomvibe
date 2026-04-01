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
    const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 50);
    const offset = Math.max(Number(searchParams.get("offset") ?? "0"), 0);

    const category = searchParams.get("category");
    const type = (searchParams.get("type") || "").toLowerCase();
    const searchQuery = (searchParams.get("q") || "").trim();
    const boostedParam = searchParams.get("boosted");
    const dealer = searchParams.get("dealer");
    const make = searchParams.get("make");
    const model = searchParams.get("model");
    const condition = searchParams.get("condition");
    const sort = (searchParams.get("sort") || "newest").toLowerCase();
    const negotiableParam = searchParams.get("negotiable");
    const priceMax = searchParams.get("priceMax");
    const priceMin = searchParams.get("priceMin");
    const yearMin = searchParams.get("yearMin");
    const mileageMax = searchParams.get("mileageMax");

    const sellerTypeRaw = (searchParams.get("sellerType") || "all").toLowerCase();
    const sellerType: "all" | "dealer" | "private" =
      sellerTypeRaw === "dealer"
        ? "dealer"
        : sellerTypeRaw === "private"
        ? "private"
        : "all";

    let query = supabase
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
      .range(offset, offset + limit - 1);

    if (sort === "price_asc") {
      query = query.order("price_pence", { ascending: true });
      query = query.order("date_listed", { ascending: false });
    } else if (sort === "price_desc") {
      query = query.order("price_pence", { ascending: false });
      query = query.order("date_listed", { ascending: false });
    } else if (sort === "oldest") {
      query = query.order("date_listed", { ascending: true });
    } else {
      query = query.order("boosted", { ascending: false });
      query = query.order("date_listed", { ascending: false });
    }

    if (category) query = query.eq("category", category);
    if (type) query = query.eq("type", type);
    if (boostedParam === "1") query = query.eq("boosted", true);
    if (condition) query = query.eq("condition", condition);
    if (negotiableParam === "1") query = query.eq("negotiable", true);
    if (sellerType === "dealer") query = query.not("business_id", "is", null);
    if (sellerType === "private") query = query.is("business_id", null);

    if (searchQuery) {
      query = query.or(
        [
          `title.ilike.%${searchQuery}%`,
          `description.ilike.%${searchQuery}%`,
          `area.ilike.%${searchQuery}%`,
          `condition.ilike.%${searchQuery}%`,
        ].join(",")
      );
    }

    if (dealer) {
      const { data: bizBySlug } = await supabase
        .from("businesses")
        .select("id")
        .eq("slug", dealer)
        .maybeSingle();

      const businessId = bizBySlug?.id || dealer;
      query = query.eq("business_id", businessId);
    }

    if (make) query = query.eq("attrs->>make", make);
    if (model) query = query.eq("attrs->>model", model);

    const pMax = priceMax ? Number(priceMax) : undefined;
    const pMin = priceMin ? Number(priceMin) : undefined;
    if (pMax !== undefined && !Number.isNaN(pMax)) {
      query = query.lte("price_pence", Math.round(pMax * 100));
    }
    if (pMin !== undefined && !Number.isNaN(pMin)) {
      query = query.gte("price_pence", Math.round(pMin * 100));
    }

    const { data, error } = await query;
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

    const yMin = yearMin ? Number(yearMin) : undefined;
    const mMax = mileageMax ? Number(mileageMax) : undefined;

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
