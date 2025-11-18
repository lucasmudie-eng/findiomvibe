// src/app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  // Stripe webhook disabled. Prevents build-time Stripe initialisation.
  return NextResponse.json(
    { error: "Stripe webhook endpoint not configured." },
    { status: 501 }
  );
}