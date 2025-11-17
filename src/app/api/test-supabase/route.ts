// src/app/api/test-supabase/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = supabaseServer();

    // Test query: list first 3 rows from the "profiles" table
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .limit(3);

    if (error) {
      console.error("Supabase test error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, rows: data });
  } catch (err: any) {
    console.error("Supabase connection failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}