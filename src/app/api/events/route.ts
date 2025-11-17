// src/app/api/events/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(req: Request) {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[api/events] missing Supabase env vars");
    return NextResponse.json({ events: [] }, { status: 200 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let query = supabase
    .from("events")
    .select(
      `
      id,
      title,
      category,
      venue,
      location,
      starts_at,
      ends_at,
      summary,
      description,
      image_url,
      ticket_url,
      featured,
      approved
    `
    )
    .eq("approved", true)
    .order("starts_at", { ascending: true });

  if (from) {
    query = query.gte("starts_at", from);
  }
  if (to) {
    query = query.lte("starts_at", to);
  }
  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[api/events] error:", error);
    return NextResponse.json({ events: [] }, { status: 200 });
  }

  const events =
    data?.map((e: any) => {
      const loc = e.location || e.venue || "";
      const cat = (e.category || "other") as string;

      return {
        id: String(e.id),
        title: e.title ?? "Untitled event",
        category: cat,
        location: loc,
        starts_at: e.starts_at,
        ends_at: e.ends_at,
        summary:
          e.summary ??
          (e.description
            ? String(e.description).slice(0, 160) + "…"
            : ""),
        image_url: e.image_url ?? null,
        featured: !!e.featured,
        // ticket_url is only used on detail page for now, but we expose it anyway
        ticket_url: e.ticket_url ?? null,
      };
    }) ?? [];

  return NextResponse.json({ events }, { status: 200 });
}