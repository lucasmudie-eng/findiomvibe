import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic"; // ensure this runs server-side

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;
  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE env (URL or SERVICE_KEY).");
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  try {
    const { id, boosted } = await req.json();
    if (!id || typeof boosted !== "boolean") {
      return NextResponse.json(
        { error: "id and boosted (boolean) required" },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();
    const { error } = await supabase.from("businesses").update({ boosted }).eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}