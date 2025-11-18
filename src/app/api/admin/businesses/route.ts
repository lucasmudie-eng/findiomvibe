// src/app/api/admin/businesses/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET() {
  if (!supabaseAdmin) {
    console.warn("[api/admin/businesses] Supabase admin not configured.");
    return NextResponse.json(
      { error: "Admin API not configured.", items: [] },
      { status: 501 }
    );
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("businesses")
      .select(
        `
          id,
          name,
          slug,
          area,
          category,
          approved,
          boosted,
          created_at,
          updated_at
        `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[api/admin/businesses] query error", error);
      return NextResponse.json(
        { error: "Query error", items: [] },
        { status: 500 }
      );
    }

    return NextResponse.json({ items: data ?? [] });
  } catch (e) {
    console.error("[api/admin/businesses] fatal", e);
    return NextResponse.json(
      { error: "Unexpected error", items: [] },
      { status: 500 }
    );
  }
}