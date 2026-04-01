import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type TrackEventPayload = {
  eventType?: string;
  eventId?: string;
  submittedBy?: string | null;
  userId?: string | null;
  source?: string | null;
  meta?: Record<string, any>;
};

function mapEventToDeltas(eventType: string) {
  return {
    impressions: eventType === "event_impression" ? 1 : 0,
    views: eventType === "event_view" ? 1 : 0,
    clicks: eventType === "event_click" ? 1 : 0,
    ticketClicks: eventType === "event_ticket_click" ? 1 : 0,
  };
}

export async function POST(req: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { ok: false, error: "Supabase admin not configured" },
      { status: 500 }
    );
  }

  let payload: TrackEventPayload | null = null;
  try {
    payload = (await req.json()) as TrackEventPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = (payload.eventType || "").trim();
  const eventId = payload.eventId ? String(payload.eventId) : null;
  const submittedBy = payload.submittedBy ? String(payload.submittedBy) : null;

  if (!eventType || !eventId) {
    return NextResponse.json(
      { ok: false, error: "Missing eventType or eventId" },
      { status: 400 }
    );
  }

  const now = new Date();
  const day = now.toISOString().slice(0, 10);

  const { impressions, views, clicks, ticketClicks } =
    mapEventToDeltas(eventType);

  try {
    await supabaseAdmin.from("analytics_events").insert({
      event_type: eventType,
      event_id: eventId,
      submitted_by: submittedBy,
      user_id: payload.userId ?? null,
      source: payload.source ?? null,
      meta: payload.meta ?? {},
    });

    if (impressions || views || clicks || ticketClicks) {
      const { data: existing, error: fetchErr } = await supabaseAdmin
        .from("analytics_events_daily")
        .select("id, impressions, views, clicks, ticket_clicks")
        .eq("day", day)
        .eq("event_id", eventId)
        .maybeSingle();

      if (fetchErr && fetchErr.code !== "PGRST116") {
        console.error("[track-event] fetch daily error:", fetchErr.message);
      } else if (!existing) {
        await supabaseAdmin.from("analytics_events_daily").insert({
          day,
          event_id: eventId,
          submitted_by: submittedBy,
          impressions,
          views,
          clicks,
          ticket_clicks: ticketClicks,
        });
      } else {
        await supabaseAdmin
          .from("analytics_events_daily")
          .update({
            impressions: (existing.impressions || 0) + impressions,
            views: (existing.views || 0) + views,
            clicks: (existing.clicks || 0) + clicks,
            ticket_clicks: (existing.ticket_clicks || 0) + ticketClicks,
          })
          .eq("id", existing.id);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[track-event] error", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
