// src/app/api/test-supabase/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // Simple health-check stub so builds never fail here.
  return NextResponse.json({ ok: true, message: "Supabase test disabled in build." });
}