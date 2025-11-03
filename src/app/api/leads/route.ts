// src/app/api/leads/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type LeadBody = {
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  categorySlug?: string;     // optional: to know which category the lead came from
  providerId?: string | null; // preferred: uuid from public.providers.id
  listingId?: string | null;  // legacy fallback: provider slug if you don’t have id yet
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<LeadBody>;

    // Minimal validation
    if (!body?.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!body?.email && !body?.phone) {
      return NextResponse.json(
        { error: "Provide at least an email or a phone number" },
        { status: 400 }
      );
    }

    // If client only sent listingId (slug), resolve provider_id
    let provider_id: string | null = body.providerId ?? null;

    if (!provider_id && body?.listingId) {
      const { data: p, error: findErr } = await supabaseAdmin
        .from("providers")
        .select("id")
        .eq("slug", body.listingId)
        .maybeSingle();

      if (findErr) {
        console.error(findErr);
      }
      provider_id = p?.id ?? null;
    }

    const insertPayload = {
      name: body.name.trim(),
      email: body.email?.trim() ?? null,
      phone: body.phone?.trim() ?? null,
      message: body.message?.trim() ?? null,
      category_slug: body.categorySlug ?? null, // add this column if you like (optional)
      provider_id: provider_id,                 // new column we added
      listing_id: body.listingId ?? null        // keep legacy value for now if you’re using it
    };

    const { data, error } = await supabaseAdmin
      .from("leads")
      .insert(insertPayload)
      .select("*")
      .single();

    if (error) {
      console.error("Insert lead error:", error);
      return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, lead: data }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}