// src/app/api/leads/handle/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { id, handled } = await req.json();
    if (!id || typeof handled !== "boolean") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("leads")
      .update({ handled })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}