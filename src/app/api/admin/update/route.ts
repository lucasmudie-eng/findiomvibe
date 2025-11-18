// src/app/api/admin/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // keep consistent with other code

function getAdminClient() {
  if (!supabaseUrl || !serviceKey) {
    console.warn(
      "[api/admin/update] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY – admin update not configured."
    );
    return null;
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}

// For now this is a *safe stub* – we can wire real logic later.
export async function POST(req: NextRequest) {
  const client = getAdminClient();
  if (!client) {
    return NextResponse.json(
      { error: "Admin update endpoint not configured (missing Supabase env)." },
      { status: 500 }
    );
  }

  let payload: unknown = null;
  try {
    payload = await req.json();
  } catch {
    // no body / invalid JSON – fine for now
  }

  console.log("[api/admin/update] called with payload:", payload);

  // TODO: implement whatever admin update logic you actually want here.
  return NextResponse.json({ ok: true });
}