import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUserId } from "@/lib/auth/user";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_KEY!;

const TIERS: Record<string, { pricePence: number }> = {
  plus: { pricePence: 2000 },
  pro: { pricePence: 4500 },
};

export async function POST(req: NextRequest) {
  try {
    const authUserId = await getAuthenticatedUserId();
    if (!authUserId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const body = await req.json();
    const { userId: requestedUserId, tier, months, paypalOrderId, pricePaidPence } = body;
    if (requestedUserId && requestedUserId !== authUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const userId = authUserId;

    if (!tier || !paypalOrderId) {
      return NextResponse.json(
        { error: "Missing tier / paypalOrderId" },
        { status: 400 }
      );
    }

    if (!TIERS[tier]) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    // Idempotency
    const { data: existing } = await supabase
      .from("billing_transactions")
      .select("id")
      .eq("paypal_order_id", paypalOrderId)
      .maybeSingle();

    if (existing?.id) {
      return NextResponse.json({ ok: true, skipped: "already_fulfilled" });
    }

    const m = Number(months ?? 1);
    const now = new Date();
    const expires = new Date(now);
    expires.setMonth(expires.getMonth() + m);

    // Update profile tier
    const { error: uErr } = await supabase
      .from("profiles")
      .update({
        tier, // free | plus | pro
        tier_started_at: now.toISOString(),
        tier_expires_at: expires.toISOString(),
      })
      .eq("id", userId);

    if (uErr) throw uErr;

    // Log transaction
    const { error: tErr } = await supabase.from("billing_transactions").insert({
      user_id: userId,
      kind: "tier",
      tier,
      months: m,
      paypal_order_id: paypalOrderId,
      price_paid_pence: pricePaidPence ?? TIERS[tier].pricePence,
      created_at: now.toISOString(),
    });

    if (tErr) throw tErr;

    return NextResponse.json({ ok: true, tier, expiresAt: expires });
  } catch (e: any) {
    console.error("[tier/fulfill] error", e);
    return NextResponse.json(
      { error: e?.message ?? "Tier fulfil failed" },
      { status: 500 }
    );
  }
}
