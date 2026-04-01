// src/app/api/billing/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { paypalBase, getAccessToken } from "@/lib/paypal/server";
import {
  supabaseAdmin,
  ensureWallet,
  tierLimits,
  startOfNextMonthDate,
} from "@/lib/billing/wallet";

export const runtime = "nodejs";

const WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || "";

type Tier = "free" | "plus" | "pro";

function tierFromPlan(planId: string | null): Tier {
  if (!planId) return "free";
  if (planId === process.env.PAYPAL_PLAN_PLUS) return "plus";
  if (planId === process.env.PAYPAL_PLAN_PRO) return "pro";
  return "free";
}

async function verifyWebhook(req: NextRequest, rawBody: string) {
  if (!WEBHOOK_ID) {
    console.error("[paypal webhook] PAYPAL_WEBHOOK_ID missing, refusing webhook.");
    return false;
  }

  const transmission_id = req.headers.get("paypal-transmission-id");
  const transmission_time = req.headers.get("paypal-transmission-time");
  const cert_url = req.headers.get("paypal-cert-url");
  const auth_algo = req.headers.get("paypal-auth-algo");
  const transmission_sig = req.headers.get("paypal-transmission-sig");

  if (
    !transmission_id ||
    !transmission_time ||
    !cert_url ||
    !auth_algo ||
    !transmission_sig
  ) {
    console.warn("[paypal webhook] Missing signature headers.");
    return false;
  }

  const token = await getAccessToken();

  const res = await fetch(
    `${paypalBase()}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        auth_algo,
        cert_url,
        transmission_id,
        transmission_sig,
        transmission_time,
        webhook_id: WEBHOOK_ID,
        webhook_event: JSON.parse(rawBody),
      }),
      cache: "no-store",
    }
  );

  const json = await res.json();
  return json?.verification_status === "SUCCESS";
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  try {
    const ok = await verifyWebhook(req, rawBody);
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid PayPal webhook signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody);
    const type: string = event.event_type;

    // Only care about subscription lifecycle events
    if (!type?.startsWith("BILLING.SUBSCRIPTION.")) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const sub = event.resource;
    const userId = sub?.custom_id || sub?.custom || null;
    const planId = sub?.plan_id || null;
    const subscriptionId = sub?.id || null;
    const status = sub?.status || null;
    const nextBillingTime: string | null =
      sub?.billing_info?.next_billing_time || null;

    if (!userId || !subscriptionId) {
      console.warn("[paypal webhook] Missing userId or subscriptionId", event);
      return NextResponse.json({ ok: true, ignored: true });
    }

    const sb = supabaseAdmin();
    const newTier = tierFromPlan(planId) as Tier;

    // Make sure wallet exists, keep current credits for ledger entry
    const wallet = await ensureWallet(userId);
    const credits = wallet.credits ?? 0;

    // Expiry date derived from PayPal's next billing time (if supplied)
    const tierExpiresAt =
      nextBillingTime != null ? new Date(nextBillingTime).toISOString() : null;

    // SUBSCRIPTION ACTIVATED/UPDATED → set paid tier and reset counters
    if (
      type === "BILLING.SUBSCRIPTION.ACTIVATED" ||
      type === "BILLING.SUBSCRIPTION.UPDATED"
    ) {
      const limits = tierLimits(newTier);
      const nextReset = startOfNextMonthDate();

      const { error: walletErr } = await sb
        .from("user_wallets")
        .update({
          tier: newTier,
          tier_expires_at: tierExpiresAt,
          free_reveals_used_this_month: 0,
          free_boosts_marketplace_left: limits.freeBoostMkt,
          free_boosts_business_left: limits.freeBoostBiz,
          free_reveals_reset_at: nextReset,
          free_boosts_reset_at: nextReset,
        })
        .eq("user_id", userId);

      if (walletErr) {
        console.error("[paypal webhook] wallet update error:", walletErr.message);
      }

      // Keep profiles in sync for any UI that still reads from profiles
      const { error: profileErr } = await sb
        .from("profiles")
        .update({
          tier: newTier,
          tier_started_at: new Date().toISOString(),
          tier_expires_at: tierExpiresAt,
        })
        .eq("id", userId);

      if (profileErr) {
        console.error("[paypal webhook] profile update error:", profileErr.message);
      }

      await sb.from("wallet_transactions").insert({
        user_id: userId,
        type: "tier_change",
        amount: 0,
        balance_after: credits,
        source: "paypal",
        ref_type: "subscription",
        ref_id: subscriptionId,
        meta: { event: type, tier: newTier, planId, status },
      });
    }

    // SUBSCRIPTION CANCEL/SUSPEND/EXPIRE → downgrade to free
    if (
      type === "BILLING.SUBSCRIPTION.CANCELLED" ||
      type === "BILLING.SUBSCRIPTION.SUSPENDED" ||
      type === "BILLING.SUBSCRIPTION.EXPIRED"
    ) {
      const limits = tierLimits("free");
      const nextReset = startOfNextMonthDate();

      const { error: walletErr } = await sb
        .from("user_wallets")
        .update({
          tier: "free",
          tier_expires_at: null,
          free_reveals_used_this_month: 0,
          free_boosts_marketplace_left: limits.freeBoostMkt,
          free_boosts_business_left: limits.freeBoostBiz,
          free_reveals_reset_at: nextReset,
          free_boosts_reset_at: nextReset,
        })
        .eq("user_id", userId);

      if (walletErr) {
        console.error("[paypal webhook] wallet downgrade error:", walletErr.message);
      }

      const { error: profileErr } = await sb
        .from("profiles")
        .update({
          tier: "free",
          tier_started_at: null,
          tier_expires_at: null,
        })
        .eq("id", userId);

      if (profileErr) {
        console.error("[paypal webhook] profile downgrade error:", profileErr.message);
      }

      await sb.from("wallet_transactions").insert({
        user_id: userId,
        type: "tier_change",
        amount: 0,
        balance_after: credits,
        source: "paypal",
        ref_type: "subscription",
        ref_id: subscriptionId,
        meta: { event: type, tier: "free", status },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[billing/webhook] error", err, rawBody);
    return NextResponse.json(
      { error: err?.message || "Webhook failed" },
      { status: 500 }
    );
  }
}
