// src/app/api/track/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    let payload: unknown = null;
    try {
      payload = await req.json();
    } catch {
      // non-JSON or empty body – fine, we just ignore it
    }

    console.log("[api/track] hit", payload);

    // No DB / external calls here – just acknowledge.
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/track] error", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET() {
  // simple health check
  return NextResponse.json({ ok: true });
}