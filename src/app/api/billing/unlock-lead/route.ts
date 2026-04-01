// All leads are free — no credits or tier gating.
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth/user";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const authUserId = await getAuthenticatedUserId();
  if (!authUserId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { userId: requestedUserId, leadType, refId } = await req.json();
  if (requestedUserId && requestedUserId !== authUserId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!leadType || !refId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, charged: 0, free: true });
}
