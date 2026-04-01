// src/app/api/marketplace/enquiry/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const runtime = "nodejs"; // ensure non-edge

function validEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY;

  if (!url || !service) {
    console.warn(
      "[api/marketplace/enquiry] Missing SUPABASE env – endpoint disabled."
    );
    return null;
  }

  return createClient(url, service, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { listingId, name, replyTo, message } = body;

    // Validation
    if (!listingId || !name || !replyTo || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    if (!validEmail(replyTo)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (String(message).length < 5) {
      return NextResponse.json({ error: "Message too short" }, { status: 400 });
    }

    // Try to get Supabase admin client
    const supabase = getServerClient();
    if (!supabase) {
      // Safe fallback so Vercel builds do NOT break
      return NextResponse.json(
        {
          error:
            "Enquiry API is not configured in this environment (missing Supabase env vars).",
        },
        { status: 501 }
      );
    }

    // Look up listing + seller
    const { data: listing, error: listingErr } = await supabase
      .from("marketplace_listings")
      .select("id, seller_user_id, approved")
      .eq("id", listingId)
      .maybeSingle();

    if (listingErr || !listing || !listing.approved) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Insert enquiry
    const { error: insErr } = await supabase
      .from("marketplace_enquiries")
      .insert({
        listing_id: listing.id,
        seller_user_id: listing.seller_user_id,
        buyer_name: name,
        buyer_email: replyTo,
        message,
        status: "open",
      });

    if (insErr) {
      console.error("enquiry insert error", insErr);
      return NextResponse.json(
        { error: "Could not send enquiry" },
        { status: 500 }
      );
    }

    // Email notification to seller (best-effort — never blocks the response)
    if (listing.seller_user_id && process.env.RESEND_API_KEY) {
      try {
        const { data: sellerUser } = await supabase.auth.admin.getUserById(listing.seller_user_id);
        const sellerEmail = sellerUser?.user?.email;
        if (sellerEmail) {
          const resend = new Resend(process.env.RESEND_API_KEY);
          const fromEmail = process.env.EMAIL_FROM || process.env.RESEND_FROM_EMAIL || "hello@manxhive.com";
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://manxhive.com";
          await resend.emails.send({
            from: fromEmail,
            to: sellerEmail,
            replyTo: replyTo,
            subject: `New enquiry from ${name}`,
            html: `
<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1e293b">
  <p style="font-size:13px;color:#94a3b8;margin:0 0 16px">ManxHive Marketplace</p>
  <h2 style="font-size:20px;font-weight:700;margin:0 0 8px">You have a new enquiry</h2>
  <p style="font-size:14px;color:#475569;margin:0 0 20px">
    <strong>${name}</strong> sent a message about your listing.
  </p>
  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;margin-bottom:20px">
    <p style="margin:0 0 8px;font-size:13px;color:#64748b"><strong>From:</strong> ${name} (${replyTo})</p>
    <p style="margin:0;font-size:14px;color:#1e293b;white-space:pre-wrap">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
  </div>
  <a href="${siteUrl}/account/enquiries" style="display:inline-block;background:#D90429;color:#fff;text-decoration:none;border-radius:8px;padding:10px 20px;font-size:14px;font-weight:600">View in your inbox →</a>
  <p style="font-size:12px;color:#94a3b8;margin-top:24px">
    You can reply directly to this email to respond to ${name}.
  </p>
</div>`,
          });
        }
      } catch (emailErr) {
        console.warn("[enquiry] Email notification failed:", emailErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("enquiry error", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}