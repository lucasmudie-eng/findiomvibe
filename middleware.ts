// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// UUID v4 (supabase ids) quick check – for old marketplace links
const uuidish =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ---------------------------------------------------------
  // 1) BASIC AUTH FOR CONTROL ROOM
  // ---------------------------------------------------------
  if (pathname === "/control-room" || pathname.startsWith("/control-room/")) {
    const username = process.env.ADMIN_BASIC_USER;
    const password = process.env.ADMIN_BASIC_PASS;

    if (!username || !password) {
      console.error("[middleware] Missing ADMIN_BASIC_USER/PASS env vars");
      return new NextResponse("Admin credentials not configured.", {
        status: 500,
      });
    }

    const authHeader = req.headers.get("authorization");

    // No Authorization header → ask browser to prompt
    if (!authHeader || !authHeader.startsWith("Basic ")) {
      return new NextResponse("Authentication required", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Control Room"',
        },
      });
    }

    // Decode "Basic base64(user:pass)"
    let decoded = "";
    try {
      const base64 = authHeader.split(" ")[1] ?? "";
      decoded = Buffer.from(base64, "base64").toString("utf8");
    } catch (err) {
      console.error("[middleware] Failed decoding auth header:", err);
      return new NextResponse("Invalid authentication", { status: 401 });
    }

    const [user, pass] = decoded.split(":");

    if (user !== username || pass !== password) {
      return new NextResponse("Invalid credentials", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Control Room"',
        },
      });
    }

    // Auth OK → continue to control room page
    return NextResponse.next();
  }

  // ---------------------------------------------------------
  // 2) MARKETPLACE REDIRECTS (your existing behaviour)
  // ---------------------------------------------------------
  if (pathname.startsWith("/marketplace/")) {
    const parts = pathname.split("/").filter(Boolean); // ["marketplace", "<seg>"]

    if (parts.length === 2) {
      const seg = parts[1];

      // If it looks like an ID (old links), 301 → new canonical
      if (uuidish.test(seg)) {
        const url = req.nextUrl.clone();
        url.pathname = `/marketplace/item/${seg}`;
        return NextResponse.redirect(url, 301);
      }
    }
  }

  return NextResponse.next();
}

// Run middleware on marketplace + control-room
export const config = {
  matcher: [
    "/marketplace/:path*",
    "/control-room",
    "/control-room/:path*",
  ],
};