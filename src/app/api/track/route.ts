// src/app/api/track/marketplace/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Expected table (example):
// create table if not exists marketplace_events (
//   id uuid primary key default gen_random_uuid(),
//   listing_id uuid not null,
//   event_type text not null,          -- e.g. 'view', 'click', 'enquiry'
//   path text,
//   referrer text,
//   user_agent text,
//   ip text,
//   created_at timestamptz default now()
// );

export async function POST(req: Request) {
  if (!supabaseUrl || !serviceKey) {
    console.error(
      "[api/track/marketplace] missing Supabase env vars"
    );
    return NextResponse.json(
      { ok: false, error: "Not configured" },
      { status: 500 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const {
    listingId,
    eventType,
    path,
    referrer,
    userAgent,
  } = body || {};

  if (!listingId || !eventType) {
    return NextResponse.json(
      { ok: false, error: "listingId and eventType are required" },
      { status: 400 }
    );
  }

  const ip =
    (req.headers as any).get?.("x-forwarded-for") ||
    (req.headers as any).get?.("x-real-ip") ||
    null;

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { error } = await supabase
    .from("marketplace_events")
    .insert({
      listing_id: listingId,
      event_type: eventType,
      path: path || null,
      referrer: referrer || null,
      user_agent:
        userAgent || (req.headers as any).get?.("user-agent") || null,
      ip,
    });

  if (error) {
    console.error(
      "[api/track/marketplace] insert error",
      error
    );
    return NextResponse.json(
      { ok: false, error: "Failed to record event" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}