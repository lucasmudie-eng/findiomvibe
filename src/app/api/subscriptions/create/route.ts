// src/app/api/subscriptions/create/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  // Subscription checkout not active yet – prevents Stripe/Supabase
  // from initialising during build.
  return NextResponse.json(
    { error: "Subscription checkout not configured." },
    { status: 501 }
  );
}