// src/app/api/control-room-logout/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL("/control-room", req.url));

  // Clear all control-room cookies by expiring them
  const baseCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/control-room",
    maxAge: 0,
    sameSite: "lax" as const,
  };

  res.cookies.set("mh_cr_auth", "", baseCookieOptions);
  // These two were set as non-httpOnly, but clearing with httpOnly is fine
  res.cookies.set("mh_cr_login_at", "", baseCookieOptions);
  res.cookies.set("mh_cr_expires_at", "", baseCookieOptions);

  return res;
}