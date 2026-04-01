// src/components/WalletPanel.tsx
"use client";

import { WalletSummary, useWalletSummary } from "@/hooks/useWalletSummary";
import { RefreshCw } from "lucide-react";

type WalletPanelProps = {
  userId: string | null;
  className?: string;
};

export function WalletPanel({ userId, className }: WalletPanelProps) {
  const { wallet, loading, error, reload } = useWalletSummary(userId);

  const labelForTier = (tier: WalletSummary["tier"]) => {
    if (tier === "plus") return "Plus";
    if (tier === "pro") return "Pro";
    return "Free";
  };

  return (
    <section
      className={`rounded-2xl border bg-white p-5 shadow-sm ${className ?? ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Boosts & credits
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Your current plan and monthly free boosts.
          </p>
        </div>
        <button
          type="button"
          onClick={reload}
          disabled={loading || !userId}
          className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-2.5 py-1 text-[11px] text-slate-500 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3 animate-pulse">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-100 bg-slate-50 p-3"
            >
              <div className="h-2 w-16 rounded-full bg-slate-200" />
              <div className="mt-3 h-4 w-20 rounded-full bg-slate-200" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Empty / no wallet (should be rare) */}
      {!loading && !error && !wallet && (
        <p className="mt-4 text-sm text-slate-600">
          No wallet information found yet. It will be created automatically once
          you start using boosts or credits.
        </p>
      )}

      {/* Normal state */}
      {!loading && !error && wallet && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
            <div className="text-[11px] font-medium text-slate-500">Plan</div>
            <div className="mt-1 text-base font-semibold text-slate-900">
              {labelForTier(wallet.tier)}
            </div>
            {wallet.monthly_resets_at && (
              <div className="mt-1 text-[11px] text-slate-500">
                Boosts reset{" "}
                {new Date(wallet.monthly_resets_at).toLocaleDateString("en-GB")}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
            <div className="text-[11px] font-medium text-slate-500">
              Credits
            </div>
            <div className="mt-1 text-base font-semibold text-slate-900">
              {wallet.credits}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Used for paid boosts and future add-ons.
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
            <div className="text-[11px] font-medium text-slate-500">
              Free boosts this month
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-2 text-sm">
              <div>
                <div className="text-[11px] text-slate-500">
                  Marketplace
                </div>
                <div className="text-base font-semibold text-slate-900">
                  {wallet.free_boosts_marketplace_left}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Business</div>
                <div className="text-base font-semibold text-slate-900">
                  {wallet.free_boosts_business_left}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
