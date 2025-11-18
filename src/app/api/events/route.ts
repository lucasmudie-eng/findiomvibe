// src/app/api/events/route.ts
import { NextResponse } from "next/server";

// This API route is deprecated.
// Events are now fetched client-side from Supabase directly.
// Keeping this as a stub prevents Vercel from trying to prerender dynamic code.
export async function GET() {
  return NextResponse.json(
    { error: "Events API is disabled. Use /whats-on instead." },
    { status: 501 }
  );
}