// src/app/api/billing/webhook/route.ts
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs"; // required for Stripe (no Edge runtime)

// Initialise Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string | undefined;

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    console.error("[stripe-webhook] Missing STRIPE_WEBHOOK_SECRET");
    return new NextResponse("Webhook not configured", { status: 500 });
  }

  const body = await req.text(); // raw body – no bodyParser needed in app router
  const sig = headers().get("stripe-signature");

  if (!sig) {
    return new NextResponse("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error("[stripe-webhook] signature error", err);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // TODO: handle your events here
  switch (event.type) {
    case "checkout.session.completed":
      // const session = event.data.object as Stripe.Checkout.Session;
      // ... update your DB etc
      break;

    default:
      console.log(`[stripe-webhook] Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}