// src/app/api/billing/webhook/route.ts

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const config = {
  api: {
    bodyParser: false,
  },
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const stripeSecret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const PRICE_TO_PLAN: Record<string, { plan: string; max_boosts: number; max_listings: number }> =
  {
    // Replace these IDs with real Price IDs
    price_premium_placeholder: {
      plan: "premium",
      max_boosts: 5,
      max_listings: 100,
    },
    price_pro_placeholder: {
      plan: "pro",
      max_boosts: 20,
      max_listings: 999,
    },
  };

async function readRawBody(req: Request): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  const reader = req.body?.getReader();
  if (!reader) return Buffer.from("");
  // @ts-expect-error - using web streams
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export async function POST(req: Request) {
  if (!supabaseUrl || !serviceKey || !stripeSecret || !webhookSecret) {
    console.warn("[billing/webhook] Missing env; ignoring.");
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const rawBody = await readRawBody(req);
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    );
  }

  const stripe = new Stripe(stripeSecret, {
    apiVersion: "2024-06-20",
  });

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      webhookSecret
    );
  } catch (err: any) {
    console.error("[billing/webhook] signature error", err.message);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const price = subscription.items.data[0]?.price;
        const priceId = price?.id;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id;

        if (!priceId || !customerId) break;

        // Find profile by stripe_customer_id
        const { data: profiles, error: pErr } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .limit(1);

        if (pErr || !profiles?.length) {
          console.error(
            "[billing/webhook] profile not found for customer",
            customerId
          );
          break;
        }

        const profileId = profiles[0].id;
        const tier = PRICE_TO_PLAN[priceId];

        let plan = "standard";
        let max_boosts = 1;
        let max_listings = 10;

        if (
          subscription.status === "active" &&
          tier
        ) {
          plan = tier.plan;
          max_boosts = tier.max_boosts;
          max_listings = tier.max_listings;
        }

        const { error: upErr } = await supabase
          .from("profiles")
          .update({
            plan,
            max_boosts,
            max_listings,
            subscription_status: subscription.status,
            stripe_subscription_id: subscription.id,
          })
          .eq("id", profileId);

        if (upErr) {
          console.error(
            "[billing/webhook] update profile error",
            upErr
          );
        }

        break;
      }

      default:
        // ignore others for now
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("[billing/webhook] handler error", err);
    return NextResponse.json(
      { error: "Webhook error" },
      { status: 500 }
    );
  }
}