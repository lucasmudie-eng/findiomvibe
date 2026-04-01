import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin"; // use your admin helper

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { eventType, providerId, listingId, businessId, source, meta } =
      await req.json();

    if (!eventType) {
      return NextResponse.json({ error: "Missing eventType" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Analytics API is not configured." },
        { status: 501 }
      );
    }

    const sb = supabaseAdmin;

    // 1) insert raw event
    await sb.from("analytics_events").insert({
      event_type: eventType,
      provider_id: providerId ?? null,
      listing_id: listingId ?? null,
      business_id: businessId ?? null,
      source: source ?? null,
      meta: meta ?? {},
    });

    // 2) bump daily rollup
    const day = new Date().toISOString().slice(0, 10);

    const { data: existing } = await sb
      .from("analytics_daily")
      .select("id, impressions, views, enquiries, boosts")
      .eq("day", day)
      .eq("provider_id", providerId)
      .eq("listing_id", listingId ?? null)
      .maybeSingle();

    const inc = (field: string) =>
      eventType === field ? 1 : 0;

    if (!existing) {
      await sb.from("analytics_daily").insert({
        day,
        provider_id: providerId,
        listing_id: listingId ?? null,
        impressions: inc("impression"),
        views: inc("view"),
        enquiries: inc("enquiry"),
        boosts: inc("boost_start"),
      });
    } else {
      await sb
        .from("analytics_daily")
        .update({
          impressions: existing.impressions + inc("impression"),
          views: existing.views + inc("view"),
          enquiries: existing.enquiries + inc("enquiry"),
          boosts: existing.boosts + inc("boost_start"),
        })
        .eq("id", existing.id);
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: "Analytics event failed" },
      { status: 500 }
    );
  }
}
