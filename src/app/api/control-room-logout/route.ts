// src/app/api/control-room-logout/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL("/control-room", req.url));

  const baseCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",          // <-- match login cookies
    maxAge: 0,
    sameSite: "lax" as const,
  };

  res.cookies.set("mh_cr_auth", "", baseCookieOptions);
  res.cookies.set("mh_cr_login_at", "", baseCookieOptions);
  res.cookies.set("mh_cr_expires_at", "", baseCookieOptions);

  // clear legacy cookie if it exists
  res.cookies.set("mh-admin", "", baseCookieOptions);

  return res;
}