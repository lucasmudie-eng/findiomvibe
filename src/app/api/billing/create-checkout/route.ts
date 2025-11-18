// src/app/api/billing/create-checkout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  // Billing not active yet — stub response so site builds/deploys cleanly.
  return NextResponse.json(
    { error: "Billing checkout not configured." },
    { status: 501 }
  );
}