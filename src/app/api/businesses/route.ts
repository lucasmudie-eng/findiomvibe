// src/app/api/businesses/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const supabase = supabaseServer();

  if (!supabase) {
    console.warn("[api/businesses] Supabase not configured — returning empty list.");
    return NextResponse.json({ items: [] });
  }

  try {
    const { data, error } = await supabase
      .from("businesses")
      .select(
        `
        id,
        name,
        slug,
        category,
        area,
        logo_url,
        approved,
        boosted
      `
      )
      .eq("approved", true)
      .order("boosted", { ascending: false })
      .order("name", { ascending: true });

    if (error) {
      console.error("[api/businesses] query error", error);
      return NextResponse.json({ items: [] });
    }

    return NextResponse.json({ items: data ?? [] });
  } catch (e) {
    console.error("[api/businesses] fatal", e);
    return NextResponse.json({ items: [] });
  }
}