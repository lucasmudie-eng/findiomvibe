// src/app/api/track-business/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type TrackBusinessPayload = {
  event?: string;
  providerId?: string;
  businessId?: string;
  userId?: string | null;
  source?: string | null;
  meta?: Record<string, any>;
};

export async function POST(req: Request) {
  if (!supabaseAdmin) {
    console.error("[api/track-business] supabaseAdmin not configured");
    return NextResponse.json(
      { ok: false, error: "Supabase admin not configured" },
      { status: 500 }
    );
  }

  let payload: TrackBusinessPayload | null = null;

  try {
    payload = (await req.json()) as TrackBusinessPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const eventType = (payload.event || "").trim();
  const providerId = payload.providerId || payload.businessId || null;
  const businessId = payload.businessId || null;

  if (!eventType || !providerId || !businessId) {
    return NextResponse.json(
      { ok: false, error: "Missing eventType / providerId / businessId" },
      { status: 400 }
    );
  }

  const meta = payload.meta ?? {};
  const source = payload.source ?? null;

  try {
    // 1) Raw event row (analytics_events)
    await supabaseAdmin.from("analytics_events").insert({
      event_type: eventType,
      provider_id: providerId,
      business_id: businessId,
      user_id: payload.userId ?? null,
      source,
      meta,
    });

    // 2) Daily rollup (analytics_business_daily)
    const today = new Date().toISOString().slice(0, 10);

    let incImpressions = 0;
    let incClicks = 0;

    if (eventType === "business_impression") {
      incImpressions = 1;
    } else if (eventType === "business_click") {
      incClicks = 1;
    }

    if (incImpressions || incClicks) {
      // Fetch existing row
      const { data: existing, error: fetchErr } = await supabaseAdmin
        .from("analytics_business_daily")
        .select("id, impressions, clicks")
        .eq("day", today)
        .eq("provider_id", providerId)
        .eq("business_id", businessId)
        .maybeSingle();

      if (fetchErr && fetchErr.code !== "PGRST116") {
        console.error(
          "[api/track-business] fetch daily error:",
          fetchErr.message
        );
      } else if (!existing) {
        // Insert new
        await supabaseAdmin.from("analytics_business_daily").insert({
          day: today,
          provider_id: providerId,
          business_id: businessId,
          impressions: incImpressions,
          clicks: incClicks,
        });
      } else {
        // Update counters
        await supabaseAdmin
          .from("analytics_business_daily")
          .update({
            impressions: (existing.impressions || 0) + incImpressions,
            clicks: (existing.clicks || 0) + incClicks,
          })
          .eq("id", existing.id);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/track-business] error", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET() {
  // simple health check
  return NextResponse.json({ ok: true });
}