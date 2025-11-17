// src/app/api/admin/update/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY env vars for /api/admin/update."
  );
}

const ALLOWED_TABLES = new Set([
  "events",
  "marketplace_listings",
  "businesses",
  "deals",
]);

export async function POST(req: Request) {
  const form = await req.formData();

  const table = form.get("table") as string | null;
  const id = form.get("id") as string | null;
  const field = form.get("field") as string | null;
  const rawValue = form.get("value") as string | null;

  if (!table || !ALLOWED_TABLES.has(table)) {
    return NextResponse.json(
      { error: "Invalid or missing table" },
      { status: 400 }
    );
  }
  if (!id || !field) {
    return NextResponse.json(
      { error: "Missing id or field" },
      { status: 400 }
    );
  }

  // Basic value coercion: "true"/"false" → boolean, otherwise string
  let value: any = rawValue;
  if (rawValue === "true") value = true;
  else if (rawValue === "false") value = false;

  const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
    auth: { persistSession: false },
  });

  const { error } = await supabase
    .from(table)
    .update({ [field]: value })
    .eq("id", id);

  if (error) {
    console.error("[api/admin/update] error", { table, id, field, error });
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  // Redirect back to control room so you see the updated state
  const url = new URL("/control-room", req.url);
  return NextResponse.redirect(url);
}