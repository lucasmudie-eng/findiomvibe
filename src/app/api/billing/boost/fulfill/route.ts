// Boosts are paid one-time payments only — no free tier allowances.
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, ensureWallet } from "@/lib/billing/wallet";
import { getAuthenticatedUserId } from "@/lib/auth/user";

export const runtime = "nodejs";

/**
 * boostType: "marketplace" | "business" | "deal"
 * days: number of days to boost
 * paypalOrderId: required — all boosts are paid one-time payments
 * pricePaidPence: optional metadata
 */
export async function POST(req: NextRequest) {
  const authUserId = await getAuthenticatedUserId();
  if (!authUserId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const {
    userId: requestedUserId,
    boostType,
    refId,
    days,
    paypalOrderId,
    pricePaidPence,
  } = await req.json();

  if (requestedUserId && requestedUserId !== authUserId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const userId = authUserId;

  if (!boostType || !refId || days == null || !paypalOrderId) {
    return NextResponse.json(
      { error: "Missing required fields: boostType, refId, days, paypalOrderId" },
      { status: 400 }
    );
  }

  const daysNum = Number(days);
  if (!Number.isFinite(daysNum) || daysNum <= 0) {
    return NextResponse.json({ error: "Invalid days" }, { status: 400 });
  }

  const sb = supabaseAdmin();

  // Idempotency: don't apply the same paid boost twice.
  const { data: existing } = await sb
    .from("wallet_transactions")
    .select("id")
    .eq("user_id", userId)
    .eq("source", "paypal")
    .eq("ref_id", refId)
    .contains("meta", { paypalOrderId })
    .maybeSingle();

  if (existing?.id) {
    return NextResponse.json({ ok: true, skipped: "already_fulfilled" });
  }

  const boostedUntil = new Date(Date.now() + daysNum * 24 * 60 * 60 * 1000);

  if (boostType === "marketplace") {
    await sb
      .from("marketplace_listings")
      .update({ boosted: true, boosted_until: boostedUntil.toISOString() })
      .eq("id", refId);
  } else if (boostType === "business") {
    await sb
      .from("businesses")
      .update({ boosted: true, boosted_until: boostedUntil.toISOString() })
      .eq("id", refId);
  } else if (boostType === "deal") {
    await sb
      .from("deals")
      .update({ boosted: true, boosted_until: boostedUntil.toISOString() })
      .eq("id", refId);
  } else {
    return NextResponse.json({ error: "Invalid boostType" }, { status: 400 });
  }

  // Audit trail
  const wallet = await ensureWallet(userId);
  await sb.from("wallet_transactions").insert({
    user_id: userId,
    type: "boost_purchase",
    amount: 0,
    balance_after: wallet.credits ?? 0,
    source: "paypal",
    ref_type: `boost_${boostType}`,
    ref_id: refId,
    price_paid_pence: pricePaidPence ?? null,
    meta: { paypalOrderId, days: daysNum },
  });

  return NextResponse.json({ ok: true });
}
