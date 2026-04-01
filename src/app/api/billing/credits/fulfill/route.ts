import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUserId } from "@/lib/auth/user";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !serviceKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY");
}

const CREDIT_PACKS: Record<string, { credits: number; pricePence: number }> = {
  "5": { credits: 5, pricePence: 699 },
  "15": { credits: 15, pricePence: 1799 },
  "40": { credits: 40, pricePence: 3999 },
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
    const { userId: requestedUserId, packSize, paypalOrderId, pricePaidPence } = body;
    if (requestedUserId && requestedUserId !== authUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const userId = authUserId;

    if (!packSize || !paypalOrderId) {
      return NextResponse.json(
        { error: "Missing packSize / paypalOrderId" },
        { status: 400 }
      );
    }

    const pack = CREDIT_PACKS[String(packSize)];
    if (!pack) {
      return NextResponse.json({ error: "Invalid packSize" }, { status: 400 });
    }

    // 1) Idempotency check — don’t double-credit if webhook fires twice
    // CHANGE TABLE NAME if yours differs
    const { data: existing } = await supabase
      .from("billing_transactions")
      .select("id")
      .eq("paypal_order_id", paypalOrderId)
      .maybeSingle();

    if (existing?.id) {
      return NextResponse.json({ ok: true, skipped: "already_fulfilled" });
    }

    // 2) Add credits to user profile
    // CHANGE COLUMN NAME if yours differs
    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("credits_balance")
      .eq("id", userId)
      .maybeSingle();

    if (pErr) throw pErr;

    const currentBalance = Number(profile?.credits_balance ?? 0);
    const newBalance = currentBalance + pack.credits;

    const { error: uErr } = await supabase
      .from("profiles")
      .update({ credits_balance: newBalance })
      .eq("id", userId);

    if (uErr) throw uErr;

    // 3) Log transaction
    const { error: tErr } = await supabase.from("billing_transactions").insert({
      user_id: userId,
      kind: "credits_pack",
      pack_size: pack.credits,
      paypal_order_id: paypalOrderId,
      price_paid_pence: pricePaidPence ?? pack.pricePence,
      created_at: new Date().toISOString(),
    });

    if (tErr) throw tErr;

    return NextResponse.json({ ok: true, creditsAdded: pack.credits });
  } catch (e: any) {
    console.error("[credits/fulfill] error", e);
    return NextResponse.json(
      { error: e?.message ?? "Credits fulfil failed" },
      { status: 500 }
    );
  }
}
