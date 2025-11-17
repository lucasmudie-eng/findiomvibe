// src/app/api/track/deal/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: Request) {
  try {
    const { dealId } = await req.json();

    if (!dealId) {
      return NextResponse.json(
        { ok: false, error: "Missing dealId" },
        { status: 400 }
      );
    }

    // If env vars not configured, just skip tracking (do NOT break UX)
    if (!supabaseUrl || !serviceKey) {
      console.warn(
        "[api/track/deal] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY, skipping tracking."
      );
      return NextResponse.json({ ok: true, skipped: true });
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const { error } = await supabase.from("deal_clicks").insert({
      deal_id: dealId,
      clicked_at: new Date().toISOString(),
    });

    if (error) {
      console.error("[api/track/deal] insert error", error);
      // Still don’t block the user flow; just report failure
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/track/deal] unexpected error", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}