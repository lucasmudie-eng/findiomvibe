// src/app/api/sponsored/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";        // ensure not edge
export const dynamic = "force-dynamic"; // stop Next trying to prerender this

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY;

  if (!url || !service) {
    console.warn("[api/sponsored] Missing Supabase env – returning empty slots.");
    return null;
  }

  return createClient(url, service, { auth: { persistSession: false } });
}

export async function GET(req: Request) {
  try {
    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json({ slots: [] });
    }

    const { searchParams } = new URL(req.url);
    const slot = searchParams.get("slot");

    let query = supabase
      .from("sponsored_slots")
      .select("id, slot, label, image_url, target_url")
      .eq("active", true);

    if (slot) {
      query = query.eq("slot", slot);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[api/sponsored] error", error);
      return NextResponse.json({ slots: [] });
    }

    return NextResponse.json({ slots: data || [] });
  } catch (err) {
    console.error("[api/sponsored] exception", err);
    return NextResponse.json({ slots: [] });
  }
}