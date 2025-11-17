// src/app/api/leads/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "manxhive@gmail.com";
const FROM_EMAIL  = process.env.EMAIL_FROM   ?? "enquiries@manxhive.com"; // your Resend sender

function validEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const providerSlug  = String(body?.providerSlug || "").trim();
    const providerName  = String(body?.providerName || "").trim();
    const name          = String(body?.name || "").trim();
    const email         = String(body?.email || "").trim();
    const message       = String(body?.message || "").trim();

    if (!providerSlug || !providerName || !name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!validEmail(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // 1) Store the lead
    const { error: insertError } = await supabaseAdmin.from("leads").insert({
      provider_slug: providerSlug,
      provider_name: providerName,
      name,
      email,
      message,
      handled: false,
    });
    if (insertError) {
      console.error(insertError);
      return NextResponse.json({ error: "Database insert failed" }, { status: 500 });
    }

    // 2) Get provider email (if present)
    const { data: provider, error: fetchError } = await supabaseAdmin
      .from("providers")
      .select("email")
      .eq("slug", providerSlug)
      .maybeSingle<{ email: string | null }>();

    if (fetchError) console.error(fetchError);

    const providerEmail = (provider?.email && validEmail(provider.email))
      ? provider.email
      : null;

    // 3) Compose recipients (always CC admin)
    const toRecipients = providerEmail ? [providerEmail, ADMIN_EMAIL] : [ADMIN_EMAIL];

    // 4) Send the email via Resend
    await resend.emails.send({
      from: `ManxHive Enquiries <${FROM_EMAIL}>`,
      to: toRecipients,
      replyTo: email, // provider can reply directly to the customer
      subject: `New enquiry for ${providerName}`,
      text: [
        `New enquiry from ${name}`,
        ``,
        `Service: ${providerName}`,
        `Email: ${email}`,
        ``,
        `Message:`,
        message,
      ].join("\n"),
      html: `
        <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.5; color:#111;">
          <h2 style="margin:0 0 12px;">New enquiry from ${escapeHtml(name)}</h2>
          <p style="margin:0 0 8px;"><strong>Service:</strong> ${escapeHtml(providerName)}</p>
          <p style="margin:0 0 16px;"><strong>Email:</strong> <a href="mailto:${escapeAttr(email)}">${escapeHtml(email)}</a></p>
          <p style="margin:0 0 6px;"><strong>Message:</strong></p>
          <p style="white-space:pre-wrap; margin:0;">${escapeHtml(message)}</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

// tiny helpers to avoid HTML injection
function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[c]!));
}
function escapeAttr(s: string) {
  return s.replace(/"/g, "&quot;");
}