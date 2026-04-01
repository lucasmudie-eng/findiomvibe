// src/hooks/useWalletSummary.ts
"use client";

import { useEffect, useState } from "react";

export type Tier = "free" | "plus" | "pro";

export type WalletSummary = {
  credits: number;
  free_boosts_marketplace_left: number;
  free_boosts_business_left: number;
  monthly_resets_at?: string | null;
  tier: Tier;
};

export function useWalletSummary(userId: string | null) {
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await fetch("/api/billing/wallet/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });

        const payload = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(payload.error || "Failed to load wallet");
        }

        if (!cancelled) {
          setWallet(payload.wallet ?? null);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("[useWalletSummary] error", err);
          setError(err?.message || "Failed to load wallet");
          setWallet(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, reloadNonce]);

  return {
    wallet,
    loading,
    error,
    reload: () => setReloadNonce((n) => n + 1),
  };
}
