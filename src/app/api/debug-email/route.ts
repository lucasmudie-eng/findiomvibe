// src/app/api/debug-email/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function GET(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const to = process.env.EMAIL_ADMIN || "manxhive@gmail.com";
  const from = process.env.EMAIL_FROM || "ManxHive <onboarding@resend.dev>";

  try {
    const result = await resend.emails.send({
      from,
      to,
      subject: "Test Email from ManxHive",
      html: `<div style="font-family:sans-serif">✅ Test email from <b>ManxHive</b> via Resend API.<br/>It works!</div>`,
    });

    return NextResponse.json({ ok: true, result }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}