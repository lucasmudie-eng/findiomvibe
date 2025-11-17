import { NextResponse } from "next/server";
import Stripe from "stripe";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
const priceCredits15 = process.env.STRIPE_PRICE_CREDITS15!;
const stripeSecret = process.env.STRIPE_SECRET_KEY!;
const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supaAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST() {
  const supabase = createClient(supaUrl, supaAnon, {
    global: { headers: { Authorization: `Bearer ${cookies().get("sb-access-token")?.value ?? ""}` } },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceCredits15, quantity: 1 }],
    success_url: `${siteUrl}/account?checkout=success`,
    cancel_url: `${siteUrl}/account?checkout=cancel`,
    metadata: { user_id: user.id, credit_pack: "15" },
  });

  return NextResponse.json({ url: session.url });
}