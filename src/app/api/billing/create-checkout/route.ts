// src/app/api/billing/create-checkout/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const stripeSecret = process.env.STRIPE_SECRET_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const PRICE_IDS: Record<string, string> = {
  // TODO: replace with real Stripe Price IDs
  premium: "price_premium_placeholder",
  pro: "price_pro_placeholder",
};

export async function POST(req: Request) {
  try {
    if (!supabaseUrl || !serviceKey || !stripeSecret) {
      console.warn("[billing/create-checkout] Missing env; not active.");
      return NextResponse.json(
        { error: "Billing not configured yet." },
        { status: 501 }
      );
    }

    const { plan } = await req.json();
    if (!plan || !["premium", "pro"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid or missing plan." },
        { status: 400 }
      );
    }

    const priceId = PRICE_IDS[plan];
    if (!priceId) {
      return NextResponse.json(
        { error: "Price not configured for plan." },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecret, {
      apiVersion: "2024-06-20",
    });

    const cookieStore = cookies();
    const accessToken =
      cookieStore.get("sb-access-token")?.value ||
      cookieStore.get("supabase-auth-token")?.value ||
      null;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser(accessToken);

    if (userErr || !user) {
      console.error("[billing/create-checkout] getUser error", userErr);
      return NextResponse.json(
        { error: "Could not verify user." },
        { status: 401 }
      );
    }

    // Get / ensure profile
    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("id, stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    if (pErr || !profile) {
      console.error("[billing/create-checkout] profile error", pErr);
      return NextResponse.json(
        { error: "Profile not found." },
        { status: 400 }
      );
    }

    let stripeCustomerId = profile.stripe_customer_id as string | null;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: {
          manxhive_user_id: user.id,
        },
      });

      stripeCustomerId = customer.id;

      const { error: upErr } = await supabase
        .from("profiles")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", user.id);

      if (upErr) {
        console.error(
          "[billing/create-checkout] failed to save stripe_customer_id",
          upErr
        );
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/account?upgrade=success`,
      cancel_url: `${siteUrl}/account?upgrade=cancelled`,
      metadata: {
        manxhive_user_id: user.id,
        plan,
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Could not create checkout session." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[billing/create-checkout] error", err);
    return NextResponse.json(
      { error: "Internal error." },
      { status: 500 }
    );
  }
}