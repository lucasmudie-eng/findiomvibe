// src/app/api/billing/webhook/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  // Billing system disabled for now — prevents Stripe from running at build time.
  return NextResponse.json(
    { error: "Billing webhook not configured." },
    { status: 501 }
  );
}