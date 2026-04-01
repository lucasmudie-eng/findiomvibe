// src/app/api/track/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type TrackPayload = {
  event?: string;
  refType?: string; // e.g. "marketplace_listing", "business"
  refId?: string;

  // Optional identity from client
  userId?: string | null;
  providerId?: string | null; // preferred
  sellerUserId?: string | null; // marketplace fallback

  // Optional context
  source?: string | null;
  [key: string]: any;
};

function mapEventToDeltas(eventType: string) {
  let impressions = 0;
  let views = 0;
  let enquiries = 0;
  let boosts = 0;

  switch (eventType) {
    case "listing_impression":
    case "business_impression":
      impressions = 1;
      break;

    case "listing_click":
    case "business_view":
      views = 1;
      break;

    case "listing_enquiry":
    case "business_enquiry":
      enquiries = 1;
      break;

    case "listing_boost":
    case "boost_applied":
      boosts = 1;
      break;

    default:
      // Unknown events still logged to analytics_events, just no rollup
      break;
  }

  return { impressions, views, enquiries, boosts };
}

export async function POST(req: Request) {
  try {
    let payload: TrackPayload | null = null;
    try {
      payload = (await req.json()) as TrackPayload;
    } catch {
      // Empty / invalid body – just acknowledge
      return NextResponse.json({ ok: true, skipped: "no_json" });
    }

    if (!payload || !payload.event) {
      return NextResponse.json({ ok: true, skipped: "no_event" });
    }

    if (!supabaseAdmin) {
      console.warn("[api/track] supabaseAdmin not configured, skipping DB write");
      return NextResponse.json({ ok: true, skipped: "no_admin" });
    }

    const eventType = payload.event;
    const now = new Date();
    const day = now.toISOString().slice(0, 10); // YYYY-MM-DD

    // Derive IDs from payload
    let providerId: string | null =
      (payload.providerId as string | null) ??
      (payload.sellerUserId as string | null) ??
      null;

    let listingId: string | null = null;
    let businessId: string | null = null;

    if (payload.refType === "marketplace_listing") {
      listingId = (payload.refId as string) ?? null;
    } else if (payload.refType === "business") {
      businessId = (payload.refId as string) ?? null;
    }

    // 🔧 SERVER-SIDE BACKFILL:
    // If providerId is still null but we have a listing_id, look up seller_user_id
    if (!providerId && listingId) {
      const { data, error } = await supabaseAdmin
        .from("marketplace_listings")
        .select("seller_user_id")
        .eq("id", listingId)
        .maybeSingle();

      if (error) {
        console.error(
          "[api/track] lookup marketplace_listings.seller_user_id error",
          error
        );
      } else if (data?.seller_user_id) {
        providerId = data.seller_user_id as string;
      }
    }

    // 1) Insert raw event (even if providerId is still null)
    const { error: insertError } = await supabaseAdmin
      .from("analytics_events")
      .insert({
        user_id: payload.userId ?? null,
        provider_id: providerId,
        listing_id: listingId,
        business_id: businessId,
        event_type: eventType,
        source: payload.source ?? null,
        meta: payload,
      });

    if (insertError) {
      console.error("[api/track] insert analytics_events error", insertError);
      // Don't throw; we still return ok to keep UI smooth
    }

    // 2) Increment daily rollup only when we have a providerId
    const { impressions, views, enquiries, boosts } = mapEventToDeltas(
      eventType
    );

    if (providerId && (impressions || views || enquiries || boosts)) {
      const { error: rpcError } = await supabaseAdmin.rpc(
        "increment_analytics_daily",
        {
          p_day: day,
          p_provider_id: providerId,
          p_listing_id: listingId,
          p_impressions: impressions,
          p_views: views,
          p_enquiries: enquiries,
          p_boosts: boosts,
        }
      );

      if (rpcError) {
        console.error("[api/track] increment_analytics_daily error", rpcError);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/track] error", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}