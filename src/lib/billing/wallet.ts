// src/lib/billing/wallet.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_KEY!;

export function supabaseAdmin() {
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}

/**
 * FINAL TIER MODEL
 * free  : 2 free reveals / month, basic analytics, no boosts
 * plus  : 10 free reveals / month, 1 marketplace boost (24h) / month
 * pro   : 40 free reveals / month, 2 marketplace boosts (48h) / month, 1 business boost (48h) / month
 *
 * Paid reveals cost 1 credit for everyone.
 * The £ cost difference (Plus £1.20 vs Pro £1) is handled by checkout pricing,
 * not by changing credit burn rate.
 */
const TIER_LIMITS = {
  free: {
    freeReveals: 2,
    freeBoostMkt: 0,
    freeBoostBiz: 0,
  },
  plus: {
    freeReveals: 10,
    freeBoostMkt: 1,
    freeBoostBiz: 0,
  },
  pro: {
    freeReveals: 40,
    freeBoostMkt: 2,
    freeBoostBiz: 1,
  },
} as const;

export function tierLimits(tier: string) {
  return (TIER_LIMITS as any)[tier] ?? TIER_LIMITS.free;
}

export async function ensureWallet(userId: string) {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("user_wallets")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (data) return data;

  const { data: inserted, error: insErr } = await sb
    .from("user_wallets")
    .insert({ user_id: userId, tier: "free" })
    .select("*")
    .single();

  if (insErr) throw insErr;
  return inserted;
}

export function startOfNextMonthDate() {
  const d = new Date();
  const next = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
  return next.toISOString().slice(0, 10); // YYYY-MM-DD
}

/**
 * Monthly reset:
 * - pooled free reveals counter
 * - free boosts counters
 */
export async function maybeResetMonthly(wallet: any) {
  const sb = supabaseAdmin();
  const today = new Date().toISOString().slice(0, 10);

  const needsReset =
    !wallet.free_reveals_reset_at ||
    wallet.free_reveals_reset_at <= today ||
    !wallet.free_boosts_reset_at ||
    wallet.free_boosts_reset_at <= today;

  if (!needsReset) return wallet;

  const limits = tierLimits(wallet.tier);
  const nextReset = startOfNextMonthDate();

  const updates = {
    free_reveals_used_this_month: 0,
    free_boosts_marketplace_left: limits.freeBoostMkt,
    free_boosts_business_left: limits.freeBoostBiz,
    free_reveals_reset_at: nextReset,
    free_boosts_reset_at: nextReset,
  };

  const { data, error } = await sb
    .from("user_wallets")
    .update(updates)
    .eq("user_id", wallet.user_id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

/**
 * Atomic credit update + ledger entry
 */
export async function applyCreditDelta(params: {
  userId: string;
  amount: number; // +/- credits
  type: string;
  source?: string;
  refType?: string;
  refId?: string;
  pricePaidPence?: number | null;
  meta?: any;
}) {
  const sb = supabaseAdmin();

  // Try atomic DB-side mutation first (wallet row lock + ledger insert in one function).
  const { data: atomicBalance, error: atomicErr } = await sb.rpc(
    "wallet_apply_credit_delta",
    {
      p_user_id: params.userId,
      p_amount: params.amount,
      p_type: params.type,
      p_source: params.source ?? "system",
      p_ref_type: params.refType ?? null,
      p_ref_id: params.refId ?? null,
      p_price_paid_pence: params.pricePaidPence ?? null,
      p_meta: params.meta ?? {},
    }
  );

  if (!atomicErr && typeof atomicBalance === "number") {
    return atomicBalance;
  }

  // Fallback for environments where migration/RPC is not installed yet.
  let wallet = await ensureWallet(params.userId);
  wallet = await maybeResetMonthly(wallet);

  const newBalance = (wallet.credits || 0) + params.amount;
  if (newBalance < 0) throw new Error("Insufficient credits");

  const { error: wErr } = await sb
    .from("user_wallets")
    .update({ credits: newBalance })
    .eq("user_id", params.userId);

  if (wErr) throw wErr;

  const { error: tErr } = await sb.from("wallet_transactions").insert({
    user_id: params.userId,
    type: params.type,
    amount: params.amount,
    balance_after: newBalance,
    source: params.source ?? "system",
    ref_type: params.refType ?? null,
    ref_id: params.refId ?? null,
    price_paid_pence: params.pricePaidPence ?? null,
    meta: params.meta ?? {},
  });

  if (tErr) throw tErr;

  return newBalance;
}
