// src/app/wallet/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { WalletPanel } from "@/components/WalletPanel";
import { ArrowLeft, ArrowUpRight, Sparkles, Zap, Coins } from "lucide-react";

export default function WalletPage() {
  const supabase = supabaseBrowser();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setLoggedIn(!!data.user);
      setUserId(data.user?.id ?? null);
      if (!data.user) window.location.href = "/login?next=/wallet";
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loggedIn === null) return null;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-slate-400">
            Boosts
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold text-slate-900">
            Boost your listings
            <Sparkles className="h-5 w-5 text-amber-400" />
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Pay once to push a listing, deal, or business profile higher across
            ManxHive. No subscriptions — buy exactly what you need.
          </p>
        </div>
        <Link
          href="/provider-dashboard"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to provider dashboard
        </Link>
      </header>

      <div className="space-y-6">
        {/* Live wallet balance */}
        <WalletPanel userId={userId} />

        {/* Boost options */}
        <section className="overflow-hidden rounded-3xl border border-slate-900/10 bg-slate-950 text-slate-50 shadow-md">
          <div className="px-6 pb-6 pt-5 sm:px-8 sm:pt-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-200">
                <Zap className="h-3 w-3" />
                Paid boosts
              </span>
            </div>
            <h2 className="text-lg font-semibold">Choose a boost type</h2>
            <p className="mt-1 max-w-xl text-[13px] text-slate-200/80">
              All boosts are one-time PayPal payments. Select the number of days
              that suits you.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <BoostTile
                title="Listing boost"
                subtitle="From 1 day"
                description="Push a marketplace listing higher in its category and search results."
              />
              <BoostTile
                title="Deal boost"
                subtitle="From 1 day"
                description="Highlight a deal at the top of the deals page for more visibility."
              />
              <BoostTile
                title="Business spotlight"
                subtitle="From 3 days"
                description="Boost your business profile across ManxHive discovery pages."
              />
            </div>
          </div>
          <div className="border-t border-white/10 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 px-6 py-3 text-center text-[11px] text-slate-200 sm:px-8">
            Boosts are activated immediately on payment.{" "}
            <Link
              href="/provider-dashboard"
              className="font-semibold text-amber-300 hover:text-amber-200"
            >
              Go to your dashboard to boost a listing
            </Link>
            .
          </div>
        </section>

        {/* Tips */}
        <section className="grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border bg-slate-900 text-slate-50 p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-amber-300" />
              <h3 className="text-xs font-semibold uppercase tracking-wide text-white/80">
                Make boosts count
              </h3>
            </div>
            <ul className="mt-3 space-y-1.5 text-[11px] text-slate-200/90">
              <li>• Use great photos and a clear, direct title.</li>
              <li>• Time boosts for evenings and weekends when traffic peaks.</li>
              <li>• Keep pricing and availability up to date to convert views.</li>
              <li>• Refresh older listings before boosting for best results.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              How it works
            </p>
            <ol className="mt-3 space-y-2 text-[11px] text-slate-600">
              <li>1. Go to your provider dashboard and pick what to boost.</li>
              <li>2. Select how many days, then pay securely via PayPal.</li>
              <li>3. Your boost goes live straight away — no waiting.</li>
            </ol>
            <div className="mt-4">
              <Link
                href="/provider-dashboard"
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#D90429] hover:underline"
              >
                Open provider dashboard
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

type BoostTileProps = {
  title: string;
  subtitle: string;
  description: string;
};

function BoostTile({ title, subtitle, description }: BoostTileProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3 text-[11px] text-slate-200">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] font-semibold text-white">{title}</p>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-slate-300">
          {subtitle}
        </span>
      </div>
      <p className="mt-1 text-[11px] text-slate-300/80">{description}</p>
    </div>
  );
}