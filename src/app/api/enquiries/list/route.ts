import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET() {
  const supabase = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${cookies().get("sb-access-token")?.value ?? ""}` } } });

  // Who am I?
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Get seller plan
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();

  const plan = (profile?.plan as string) || "standard";
  const isPro = plan === "pro";

  // Load enquiries for this seller (join title of listing)
  const { data: enquiries, error } = await supabase
    .from("marketplace_enquiries")
    .select("id, listing_id, seller_user_id, buyer_name, buyer_email, buyer_phone, message, created_at, unlocked")
    .eq("seller_user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[enquiries/list]", error);
    return NextResponse.json({ error: "Failed to load enquiries" }, { status: 500 });
  }

  // Load listing titles in one go
  const listingIds = Array.from(new Set((enquiries ?? []).map(e => e.listing_id).filter(Boolean)));
  let titles: Record<string, string> = {};
  if (listingIds.length) {
    const { data: listings } = await supabase
      .from("marketplace_listings")
      .select("id, title")
      .in("id", listingIds);

    if (listings) {
      titles = listings.reduce((acc: any, r: any) => {
        acc[r.id] = r.title;
        return acc;
      }, {});
    }
  }

  // Mask contact if not unlocked and not Pro
  const rows = (enquiries ?? []).map((e: any) => {
    const unlocked = isPro || !!e.unlocked;
    return {
      id: e.id,
      listing_id: e.listing_id,
      listing_title: titles[e.listing_id] || "Listing",
      message: e.message,
      buyer_name: unlocked ? e.buyer_name : null,
      buyer_email: unlocked ? e.buyer_email : null,
      buyer_phone: unlocked ? e.buyer_phone : null,
      unlocked,
      created_at: e.created_at,
    };
  });

  return NextResponse.json({ plan, enquiries: rows });
}