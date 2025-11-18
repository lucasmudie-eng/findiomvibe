// src/app/api/events/submit/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // not edge

// Disabled API – events are submitted directly via client-side Supabase now.
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Event submission API is disabled in this environment. Use the What's On form instead.",
    },
    { status: 501 }
  );
}