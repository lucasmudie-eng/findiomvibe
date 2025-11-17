import { NextResponse } from "next/server";
import Stripe from "stripe";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
const pricePremium = process.env.STRIPE_PRICE_PREMIUM!;
const pricePro = process.env.STRIPE_PRICE_PRO!;
const stripeSecret = process.env.STRIPE_SECRET_KEY!;
const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supaAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: Request) {
  const { plan } = await req.json();
  if (!["premium", "pro"].includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const supabase = createClient(supaUrl, supaAnon, {
    global: { headers: { Authorization: `Bearer ${cookies().get("sb-access-token")?.value ?? ""}` } },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });
  const price = plan === "premium" ? pricePremium : pricePro;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    success_url: `${siteUrl}/account?sub=success`,
    cancel_url: `${siteUrl}/account?sub=cancel`,
    metadata: { user_id: user.id, plan },
  });

  return NextResponse.json({ url: session.url });
}