// src/app/api/events/submit/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs"; // make sure this is not edge

export async function POST(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  // IMPORTANT:
  // Do NOT throw if these are missing – just return a 501 so Vercel can build.
  if (!supabaseUrl || !serviceKey) {
    console.error(
      "[api/events/submit] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY"
    );
    return NextResponse.json(
      { error: "Events submission API is not configured on this environment." },
      { status: 501 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch (err) {
    console.error("[api/events/submit] Invalid JSON body", err);
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  // You can tighten this up later – for now we accept what the UI sends.
  const {
    title,
    category,
    venue,
    area,
    starts_at,
    ends_at,
    summary,
    description,
    image_url,
    ticket_url,
    featured,
    approved,
    created_by,
  } = body;

  if (!title || !starts_at) {
    return NextResponse.json(
      { error: "Title and starts_at are required." },
      { status: 400 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase
    .from("events")
    .insert({
      title: String(title).trim(),
      category: category || "other",
      venue: venue?.trim() || null,
      area: area?.trim() || null,
      starts_at: new Date(starts_at).toISOString(),
      ends_at: ends_at ? new Date(ends_at).toISOString() : null,
      summary: summary?.trim() || null,
      description: description?.trim() || null,
      image_url: image_url?.trim() || null,
      ticket_url: ticket_url?.trim() || null,
      featured: !!featured,
      approved: !!approved,
      created_by: created_by || null,
    })
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("[api/events/submit] insert error", error);
    return NextResponse.json(
      { error: error?.message || "Failed to submit event." },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}