import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const ADMIN_BASIC_PASS = process.env.ADMIN_BASIC_PASS?.trim();

export async function POST(req: NextRequest) {
  if (!ADMIN_BASIC_PASS) {
    console.warn("[api/control-room-login] ADMIN_BASIC_PASS is not set");
    return NextResponse.json({ error: "Admin login not configured." }, { status: 500 });
  }

  let password = "";

  // 1) Try formData first (your current form uses this)
  try {
    const fd = await req.formData();
    const p = fd.get("password");
    if (typeof p === "string") password = p.trim();
  } catch {}

  // 2) Fallback to JSON (in case you later switch to fetch)
  if (!password) {
    try {
      const body = await req.json();
      if (typeof body?.password === "string") password = body.password.trim();
    } catch {}
  }

  if (!password || password !== ADMIN_BASIC_PASS) {
    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  const res = NextResponse.redirect(new URL("/control-room", req.url));

  // IMPORTANT: cookie name + localhost secure flag fixed below
  res.cookies.set("mh_cr_auth", "yes", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 6,
  });

  res.cookies.set("mh_cr_login_at", new Date().toISOString(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 6,
  });

  res.cookies.set(
    "mh_cr_expires_at",
    new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 6,
    }
  );

  return res;
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "Use POST with password." }, { status: 405 });
}