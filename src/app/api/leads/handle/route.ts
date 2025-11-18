// src/app/api/leads/handle/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

export async function POST(req: Request) {
  // Guard against missing envs at runtime instead of crashing at build time
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn(
      "[api/leads/handle] Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY."
    );
    return NextResponse.json(
      {
        error:
          "Lead handling API is not configured on this environment.",
      },
      { status: 501 }
    );
  }

  try {
    const { id, handled } = await req.json();

    if (!id || typeof handled !== "boolean") {
      return NextResponse.json(
        { error: "Invalid body" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const { error } = await supabase
      .from("leads")
      .update({ handled })
      .eq("id", id);

    if (error) {
      console.error("[api/leads/handle] update error", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[api/leads/handle] unexpected error", e);
    return NextResponse.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}