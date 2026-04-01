// src/app/api/businesses/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const supabase = supabaseServer();

  if (!supabase) {
    console.warn("[api/businesses] Supabase not configured — returning empty list.");
    return NextResponse.json({ items: [] });
  }

  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const boostedOnly = searchParams.get("boosted") === "1";
    const hottest = searchParams.get("hottest") === "1";
    const withStats = searchParams.get("with_stats") === "1";
    const limitRaw = searchParams.get("limit");
    const limit =
      limitRaw && !Number.isNaN(Number(limitRaw)) ? Number(limitRaw) : 200;

    let query = supabase
      .from("businesses")
      .select(
        `
        id,
        name,
        slug,
        provider_id,
        tagline,
        category,
        subcategory,
        area,
        logo_url,
        images,
        hero_url,
        website_url,
        approved,
        boosted
      `
      )
      .or("approved.is.null,approved.eq.true");

    if (category) {
      query = query.eq("category", category);
    }

    if (boostedOnly) {
      query = query.eq("boosted", true);
    }

    if (hottest) {
      query = query.order("boosted", { ascending: false });
    }

    query = query.order("name", { ascending: true });

    if (limit && limit > 0) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[api/businesses] query error", error);
      return NextResponse.json({ items: [] });
    }

    let statsMap: Record<
      string,
      { impressions_30d: number; clicks_30d: number }
    > = {};

    if (withStats && data?.length) {
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const startISO = since.toISOString().slice(0, 10);

      const ids = data.map((b: any) => b.id);
      const { data: stats, error: statsError } = await supabase
        .from("analytics_business_daily")
        .select("business_id, impressions, clicks")
        .in("business_id", ids)
        .gte("day", startISO);

      if (statsError) {
        console.error("[api/businesses] stats error", statsError);
      } else if (stats) {
        statsMap = stats.reduce((acc: any, row: any) => {
          const key = row.business_id;
          if (!acc[key]) {
            acc[key] = { impressions_30d: 0, clicks_30d: 0 };
          }
          acc[key].impressions_30d += row.impressions || 0;
          acc[key].clicks_30d += row.clicks || 0;
          return acc;
        }, {});
      }
    }

    const items =
      data?.map((row: any) => ({
        ...row,
        ...(statsMap[row.id] ?? { impressions_30d: 0, clicks_30d: 0 }),
      })) ?? [];

    return NextResponse.json({ items });
  } catch (e) {
    console.error("[api/businesses] fatal", e);
    return NextResponse.json({ items: [] });
  }
}
