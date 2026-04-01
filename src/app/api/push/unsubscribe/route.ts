import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = supabaseServer();
  if (!supabase) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  try {
    const body = await req.json();
    const endpoint = body?.endpoint;

    if (!endpoint) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const { error } = await supabase
      .from("push_subscriptions")
      .delete()
      .eq("endpoint", endpoint);

    if (error) {
      console.error("[push/unsubscribe] error", error);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[push/unsubscribe] fatal", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
