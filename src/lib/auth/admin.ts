import { NextResponse } from "next/server";

function parseBasicAuthHeader(header: string | null): { user: string; pass: string } | null {
  if (!header || !header.startsWith("Basic ")) return null;

  try {
    const base64 = header.slice("Basic ".length).trim();
    const decoded = Buffer.from(base64, "base64").toString("utf8");
    const splitAt = decoded.indexOf(":");
    if (splitAt < 0) return null;

    return {
      user: decoded.slice(0, splitAt),
      pass: decoded.slice(splitAt + 1),
    };
  } catch {
    return null;
  }
}

export function requireAdminBasicAuth(req: Request): NextResponse | null {
  const username = process.env.ADMIN_BASIC_USER;
  const password = process.env.ADMIN_BASIC_PASS;

  if (!username || !password) {
    return NextResponse.json(
      { error: "Admin credentials not configured." },
      { status: 500 }
    );
  }

  const parsed = parseBasicAuthHeader(req.headers.get("authorization"));
  if (!parsed || parsed.user !== username || parsed.pass !== password) {
    return NextResponse.json(
      { error: "Authentication required" },
      {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Control Room"' },
      }
    );
  }

  return null;
}
