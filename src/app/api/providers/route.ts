// src/app/api/providers/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  // Prevent build-time failure on Vercel
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error("[api/providers] Missing Supabase env vars – disabled");
    return NextResponse.json(
      { error: "Providers API not configured on this environment." },
      { status: 501 }
    );
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch (_) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    name,
    slug,
    category_slug,
    location,
    summary,
    description,
    images = [],
    services = [],
    areas_served = [],
    email = null,
    phone = null,
    owner_id = null,
  } = body || {};

  if (!name || !slug || !category_slug) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin.from("providers").insert([
    {
      name,
      slug,
      category_slug,
      location,
      summary,
      description,
      images,
      services,
      areas_served,
      email,
      phone,
      owner_id, // null for now
    },
  ]);

  if (error) {
    console.error("[api/providers] Insert failed:", error);
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}