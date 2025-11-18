// src/app/api/marketplace/enquiry/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("enquiry error", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}