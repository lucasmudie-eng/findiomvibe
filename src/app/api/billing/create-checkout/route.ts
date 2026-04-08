// src/app/api/billing/create-checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { paypalFetch } from "@/lib/paypal/server";
import { getAuthenticatedUserId } from "@/lib/auth/user";

export const runtime = "nodejs";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://manxhive.com";

export async function POST(req: NextRequest) {
  try {
    const PLAN_PLUS = process.env.PAYPAL_PLAN_PLUS;
    const PLAN_PRO = process.env.PAYPAL_PLAN_PRO;
    if (!PLAN_PLUS || !PLAN_PRO) {
      return NextResponse.json({ error: "Billing not configured" }, { status: 503 });
    }

    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { tier } = body as { tier: "plus" | "pro" };

    if (!tier) {
      return NextResponse.json(
        { error: "Missing tier" },
        { status: 400 }
      );
    }

    const plan_id = tier === "plus" ? PLAN_PLUS : PLAN_PRO;

    // Create subscription
    const sub = await paypalFetch<any>("/v1/billing/subscriptions", {
      method: "POST",
      body: JSON.stringify({
        plan_id,
        custom_id: userId, // IMPORTANT: used by webhook to map back to user
        application_context: {
          brand_name: "ManxHive",
          user_action: "SUBSCRIBE_NOW",
          return_url: `${SITE_URL}/account/upgrade?status=success`,
          cancel_url: `${SITE_URL}/account/upgrade?status=cancelled`,
        },
      }),
    });

    const approveLink =
      sub?.links?.find((l: any) => l.rel === "approve")?.href || null;

    if (!approveLink) {
      return NextResponse.json(
        { error: "No approval link returned by PayPal", sub },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      subscriptionId: sub.id,
      approveUrl: approveLink,
    });
  } catch (err: any) {
    console.error("[billing/create-checkout] error", err);
    return NextResponse.json(
      { error: err?.message || "Checkout failed" },
      { status: 500 }
    );
  }
}
