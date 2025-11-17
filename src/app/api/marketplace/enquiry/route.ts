import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

function validEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: Request) {
  try {
    const { listingId, name, replyTo, message } = await req.json();

    if (!listingId || !name || !replyTo || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    if (!validEmail(replyTo)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (String(message).length < 5) {
      return NextResponse.json({ error: "Message too short" }, { status: 400 });
    }

    const supabase = supabaseServer();

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
    const { error: insErr } = await supabase.from("marketplace_enquiries").insert({
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

    // TODO: trigger email/notification

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("enquiry error", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}