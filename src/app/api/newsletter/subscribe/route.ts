import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { Resend } from "resend";

const resendKey = process.env.RESEND_API_KEY;
const resendFrom =
  process.env.EMAIL_FROM ||
  process.env.RESEND_FROM_EMAIL ||
  "hello@manxhive.com";

export async function POST(req: Request) {
  const supabase = supabaseServer();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "Supabase not configured." }, { status: 500 });
  }

  try {
    const body = await req.json();
    const email = String(body?.email || "").trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ ok: false, error: "Invalid email." }, { status: 400 });
    }

    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert(
        { email, source: "site", status: "active" },
        { onConflict: "email" }
      );

    if (error) {
      console.error("[newsletter] supabase error", error);
      return NextResponse.json({ ok: false, error: "Could not save." }, { status: 500 });
    }

    if (resendKey) {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: resendFrom,
        to: email,
        subject: "You’re on the ManxHive weekly digest",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Thanks for joining the ManxHive weekly digest</h2>
            <p>You’ll get a weekly roundup of events, deals, and community highlights.</p>
            <p>If this wasn’t you, just ignore this email.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[newsletter] fatal", err);
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
