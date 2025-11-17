// src/app/api/sponsored/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET(req: Request) {
  try {
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ slots: [] });
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

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