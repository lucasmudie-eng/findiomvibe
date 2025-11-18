// src/app/api/control-room-login/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const ADMIN_BASIC_PASS = process.env.ADMIN_BASIC_PASS;

/**
 * Simple admin “control room” login.
 * Expects JSON body: { password: string }
 * On success, sets a short-lived admin cookie.
 */
export async function POST(req: NextRequest) {
  if (!ADMIN_BASIC_PASS) {
    console.warn(
      "[api/control-room-login] ADMIN_BASIC_PASS env var is not set – admin login not configured."
    );
    return NextResponse.json(
      { error: "Admin login not configured." },
      { status: 500 }
    );
  }

  let password: string | undefined;
  try {
    const body = await req.json();
    password = body?.password;
  } catch {
    // no/invalid JSON
  }

  if (!password || password !== ADMIN_BASIC_PASS) {
    return NextResponse.json(
      { error: "Invalid password." },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true });

  // Basic admin flag cookie – adjust name/maxAge as you like
  res.cookies.set("mh-admin", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 6, // 6 hours
  });

  return res;
}

// (Optional) guard GET so calling it doesn’t do anything special
export async function GET() {
  return NextResponse.json(
    { ok: false, error: "Use POST with password." },
    { status: 405 }
  );
}