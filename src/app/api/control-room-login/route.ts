// src/app/api/control-room-login/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const rawAdminPass = process.env.ADMIN_BASIC_PASS ?? "";
const ADMIN_PASS = rawAdminPass.trim();

if (!ADMIN_PASS) {
  throw new Error(
    "ADMIN_BASIC_PASS env var is not set for /api/control-room-login."
  );
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const password = String(formData.get("password") ?? "").trim();

  // Wrong password → back to login with error flag
  if (password !== ADMIN_PASS) {
    const url = new URL("/control-room?error=1", req.url);
    return NextResponse.redirect(url);
  }

  const now = new Date();
  const expires = new Date(now.getTime() + 4 * 60 * 60 * 1000); // +4 hours

  const res = NextResponse.redirect(new URL("/control-room", req.url));

  // Auth cookie (used for gate)
  res.cookies.set("mh_cr_auth", "yes", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/control-room",
    maxAge: 60 * 60 * 4,
    sameSite: "lax",
  });

  // Last login time (for display only)
  res.cookies.set("mh_cr_login_at", now.toISOString(), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    path: "/control-room",
    maxAge: 60 * 60 * 4,
    sameSite: "lax",
  });

  // Session expiry time (for display only)
  res.cookies.set("mh_cr_expires_at", expires.toISOString(), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    path: "/control-room",
    maxAge: 60 * 60 * 4,
    sameSite: "lax",
  });

  return res;
}