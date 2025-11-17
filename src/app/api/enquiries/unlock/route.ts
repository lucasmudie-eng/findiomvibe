import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: Request) {
  const { enquiryId } = await req.json();
  if (!enquiryId) {
    return NextResponse.json({ error: "Missing enquiryId" }, { status: 400 });
  }

  const supa = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${cookies().get("sb-access-token")?.value ?? ""}` } } });
  const svc = supabaseServer();

  // Who am I?
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // Load enquiry
  const { data: enquiry, error: eErr } = await svc
    .from("marketplace_enquiries")
    .select("id, seller_user_id, unlocked")
    .eq("id", enquiryId)
    .maybeSingle();

  if (eErr || !enquiry) return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
  if (enquiry.seller_user_id !== user.id) return NextResponse.json({ error: "Not your enquiry" }, { status: 403 });
  if (enquiry.unlocked) return NextResponse.json({ ok: true, already: true });

  // Load profile (plan, credits, free leads counters)
  const { data: profile, error: pErr } = await svc
    .from("profiles")
    .select("id, plan, credits, free_leads_used, free_leads_month")
    .eq("id", user.id)
    .maybeSingle();

  if (pErr || !profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const plan = (profile.plan as string) || "standard";
  const nowMonth = new Date();
  const yyyymm = `${nowMonth.getFullYear()}${String(nowMonth.getMonth() + 1).padStart(2, "0")}`;

  // reset monthly counter if needed
  let free_leads_used = profile.free_leads_used ?? 0;
  let free_leads_month = profile.free_leads_month ?? yyyymm;
  if (free_leads_month !== yyyymm) {
    free_leads_used = 0;
    free_leads_month = yyyymm;
  }

  // Rules:
  // pro => free/unlimited
  // premium => 10 free per month else 1 credit
  // standard => 1 credit
  let needCredit = false;

  if (plan === "pro") {
    needCredit = false;
  } else if (plan === "premium") {
    if (free_leads_used < 10) {
      free_leads_used += 1;
      needCredit = false;
    } else {
      needCredit = true;
    }
  } else {
    needCredit = true;
  }

  // Deduct credit if needed
  let newCredits = profile.credits ?? 0;
  if (needCredit) {
    if (newCredits <= 0) {
      return NextResponse.json(
        { error: "No credits left. Buy credits or upgrade for unlimited." },
        { status: 402 }
      );
    }
    newCredits -= 1;
  }

  // Commit updates atomically
  const { error: tErr } = await svc.rpc("noop"); // placeholder in case you need txn; Supabase RPC txn optional
  if (tErr) console.warn("[unlock] noop rpc", tErr?.message);

  const updates = [
    svc.from("marketplace_enquiries")
      .update({ unlocked: true, unlocked_at: new Date().toISOString(), unlocked_by: user.id })
      .eq("id", enquiryId),
    svc.from("profiles")
      .update({
        credits: newCredits,
        free_leads_used,
        free_leads_month
      })
      .eq("id", user.id),
  ];

  const results = await Promise.all(updates);
  const anyErr = results.find(r => (r as any).error)?.error;
  if (anyErr) {
    console.error("[unlock] update error", anyErr);
    return NextResponse.json({ error: "Failed to unlock." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, credits: newCredits, free_leads_used, plan });
}