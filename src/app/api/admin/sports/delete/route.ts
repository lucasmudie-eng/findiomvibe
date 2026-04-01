import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin"; // adjust
import { requireAdminBasicAuth } from "@/lib/auth/admin";

export async function POST(req: Request) {
  try {
    const unauthorized = requireAdminBasicAuth(req);
    if (unauthorized) return unauthorized;

    if (!supabaseAdmin) {
      return NextResponse.json("Admin API not configured", { status: 501 });
    }

    const { id } = await req.json();
    if (!id) return NextResponse.json("Missing id", { status: 400 });

    const { error } = await supabaseAdmin.from("sports").delete().eq("id", id);
    if (error) return NextResponse.json(error.message, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(e?.message ?? "Server error", { status: 500 });
  }
}
