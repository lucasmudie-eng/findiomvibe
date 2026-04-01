import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = supabaseServer();
  if (!supabase) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  try {
    const body = await req.json();
    const subscription = body?.subscription;
    const preferences = body?.preferences ?? {};
    const userId = body?.userId ?? null;

    if (!subscription?.endpoint) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const keys = subscription?.keys || {};
    const payload = {
      endpoint: subscription.endpoint,
      p256dh: keys.p256dh ?? null,
      auth: keys.auth ?? null,
      preferences,
      user_id: userId,
    };

    const { error } = await supabase
      .from("push_subscriptions")
      .upsert(payload, { onConflict: "endpoint" });

    if (error) {
      console.error("[push/subscribe] error", error);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[push/subscribe] fatal", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
