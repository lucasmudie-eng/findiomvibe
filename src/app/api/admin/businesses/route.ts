import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const ADMIN_EMAILS =
  (process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, id, value, email } = body as {
      action: "approve" | "boost" | "delete";
      id: string;
      value?: boolean;
      email?: string | null;
    };

    // Basic guard: UI already hides for non-admins, but enforce again here
    if (!email || !ADMIN_EMAILS.includes(email.toLowerCase())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const admin = supabaseAdmin();

    if (action === "approve") {
      const { error } = await admin
        .from("businesses")
        .update({ approved: !!value })
        .eq("id", id);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (action === "boost") {
      const { error } = await admin
        .from("businesses")
        .update({ boosted: !!value })
        .eq("id", id);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (action === "delete") {
      const { error } = await admin.from("businesses").delete().eq("id", id);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Bad action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}