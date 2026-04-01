// src/app/api/billing/wallet/summary/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  supabaseAdmin,
  ensureWallet,
  maybeResetMonthly,
} from "@/lib/billing/wallet";
import { getAuthenticatedUserId } from "@/lib/auth/user";

export const runtime = "nodejs";

type Tier = "free" | "plus" | "pro";

type ProfileRow = {
  id: string;
  plan: string | null; // legacy: "standard" | "premium" | "pro"
};

type WalletRow = {
  user_id: string;
  credits: number | null;
  tier: Tier | null;
  tier_expires_at: string | null;
  free_boosts_reset_at?: string | null;
  free_boosts_marketplace_left: number | null;
  free_boosts_business_left: number | null;
};

// Map legacy profile.plan -> canonical tier, used ONLY as a fallback
function mapProfileToTier(profile: ProfileRow | null): Tier {
  if (!profile) return "free";

  const plan = (profile.plan || "").toLowerCase();
  if (plan === "premium") return "plus"; // your PLUS
  if (plan === "pro") return "pro";
  return "free";
}

export async function POST(req: NextRequest) {
  try {
    const authUserId = await getAuthenticatedUserId();
    if (!authUserId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Handle empty / invalid JSON body safely
    let body: any = null;
    try {
      body = await req.json();
    } catch {
      body = null;
    }

    const requestedUserId = (body?.userId as string | undefined) || undefined;
    if (requestedUserId && requestedUserId !== authUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = authUserId;

    const sb = supabaseAdmin();

    // 1) Ensure wallet exists & do monthly reset
    let wallet = (await ensureWallet(userId)) as WalletRow;
    wallet = (await maybeResetMonthly(wallet)) as WalletRow;

    // 2) Get profile for legacy fallback only
    const { data: profile, error: profileErr } = await sb
      .from("profiles")
      .select("id, plan")
      .eq("id", userId)
      .maybeSingle<ProfileRow>();

    if (profileErr) {
      console.warn("[wallet/summary] profile fetch error:", profileErr.message);
    }

    const profileTier: Tier = mapProfileToTier(profile ?? null);

    // 3) Decide effective tier:
    //    - Prefer wallet.tier (set by PayPal/webhook)
    //    - Fallback to profileTier
    let effectiveTier: Tier =
      (wallet.tier as Tier | null) || profileTier || "free";

    // Optional one-way backfill:
    // If wallet.tier is null BUT profileTier is non-free, write it once
    if (!wallet.tier && effectiveTier !== "free") {
      const { error: upErr } = await sb
        .from("user_wallets")
        .update({ tier: effectiveTier })
        .eq("user_id", userId);

      if (upErr) {
        console.warn("[wallet/summary] wallet backfill error:", upErr.message);
      } else {
        wallet = { ...wallet, tier: effectiveTier };
      }
    }

    const tierLabel =
      effectiveTier === "pro"
        ? "Pro plan wallet"
        : effectiveTier === "plus"
        ? "Plus plan wallet"
        : "Free plan wallet";

    // 4) Return shape expected by /wallet/page.tsx
    return NextResponse.json({
      ok: true,
      tierLabel,
      wallet: {
        user_id: wallet.user_id,
        credits: wallet.credits ?? 0,
        tier: effectiveTier,
        tier_expires_at: wallet.tier_expires_at,
        monthly_resets_at: wallet.free_boosts_reset_at ?? null,
        free_boosts_marketplace_left:
          wallet.free_boosts_marketplace_left ?? 0,
        free_boosts_business_left: wallet.free_boosts_business_left ?? 0,
      },
    });
  } catch (e: any) {
    console.error("[wallet/summary] error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to load wallet." },
      { status: 500 }
    );
  }
}
