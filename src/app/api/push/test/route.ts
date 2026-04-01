import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import webpush from "web-push";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const contactEmail =
  process.env.ADMIN_NOTIFICATION_EMAIL ||
  process.env.EMAIL_FROM ||
  "hello@manxhive.com";

export async function POST(req: Request) {
  const supabase = supabaseServer();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "Supabase not configured." }, { status: 500 });
  }

  if (!publicKey || !privateKey) {
    return NextResponse.json({ ok: false, error: "Missing VAPID keys." }, { status: 500 });
  }

  try {
    const body = await req.json();
    const payload = {
      title: body?.title || "ManxHive update",
      body: body?.body || "New updates are available.",
      url: body?.url || "/",
    };

    let subscription = body?.subscription;

    if (!subscription?.endpoint) {
      const { data, error } = await supabase
        .from("push_subscriptions")
        .select("endpoint, p256dh, auth")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        return NextResponse.json(
          { ok: false, error: "No subscriptions found." },
          { status: 404 }
        );
      }

      subscription = {
        endpoint: data.endpoint,
        keys: {
          p256dh: data.p256dh,
          auth: data.auth,
        },
      };
    }

    webpush.setVapidDetails(
      `mailto:${contactEmail}`,
      publicKey,
      privateKey
    );

    await webpush.sendNotification(subscription, JSON.stringify(payload));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[push/test] error", err);
    return NextResponse.json({ ok: false, error: "Push failed." }, { status: 500 });
  }
}
