import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseServer } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature") as string;
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, webhookSecret);
  } catch (err: any) {
    console.error("[stripe] signature error", err?.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle completed sessions
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    if (!userId) return NextResponse.json({ ok: true });

    const svc = supabaseServer();

    // Subscription => set plan
    if (session.mode === "subscription") {
      const plan = session.metadata?.plan ?? "premium";
      await svc
        .from("profiles")
        .update({ plan })
        .eq("id", userId);
    }

    // One-off credits => add credits
    if (session.mode === "payment") {
      const pack = Number(session.metadata?.credit_pack || "0");
      if (pack > 0) {
        // increment credits
        await svc.rpc("noop"); // optional
        await svc
          .from("profiles")
          .update({ credits: (await getCredits(svc, userId)) + pack })
          .eq("id", userId);
      }
    }
  }

  return NextResponse.json({ received: true });
}

async function getCredits(svc: ReturnType<typeof supabaseServer>, userId: string) {
  const { data } = await svc
    .from("profiles")
    .select("credits")
    .eq("id", userId)
    .maybeSingle();
  return data?.credits ?? 0;
}