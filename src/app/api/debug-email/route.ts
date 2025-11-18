// src/app/api/debug-email/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // explicit, but not strictly required

// Simple no-op endpoint so builds never fail if email isn't configured
export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      message: "debug-email endpoint is disabled in this environment.",
    },
    { status: 200 }
  );
}