// src/app/api/track/deal/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    let body: any = null;
    try {
      body = await req.json();
    } catch {
      // ignore bad JSON
    }

    // Always succeed — we simply don’t track server-side right now
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/track/deal] error", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}