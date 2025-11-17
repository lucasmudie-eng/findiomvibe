"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DEAL_CATEGORY_LABELS,
  type DealCategory,
} from "@/lib/deals/types";

type Deal = {
  id: string;
  business_name: string | null;
  title: string;
  category: DealCategory | null;
  area: string | null;
  discount_label: string | null;
  description: string | null;
  image_url: string | null;
  boosted: boolean;
  starts_at: string | null;
  expires_at: string | null;
};

type DealsResponse = {
  deals: Deal[];
};

const CATEGORY_ORDER: (DealCategory | "all")[] = [
  "all",
  "food-drink",
  "shopping",
  "activities",
  "beauty-wellness",
  "services",
  "other",
];

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activeCategory, setActiveCategory] =
    useState<DealCategory | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/deals");
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const json: DealsResponse = await res.json();
        setDeals(json.deals || []);
      } catch (err) {
        console.error("[deals] load error", err);
        setError("Could not load deals right now.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredDeals =
    activeCategory === "all"
      ? deals
      : deals.filter((d) => d.category === activeCategory);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="mb-1 text-xs text-gray-500">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        / <span className="text-gray-800">Deals</span>
      </nav>

      {/* Header */}
      <section className="flex flex-col gap-3 rounded-2xl border bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF6F6] px-2 py-1 text-[10px] font-medium text-[#D90429]">
            Island-wide offers
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900">
            ManxHive Deals
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Curated offers from Isle of Man businesses. Clear, time-bound, no
            nonsense. Support local and save a bit while you&apos;re at it.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 text-xs md:items-end">
          <Link
            href="/deals/create"
            className="inline-flex items-center rounded-full bg-[#D90429] px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#b50322]"
          >
            Submit a deal
          </Link>
          <p className="text-[10px] text-gray-400">
            All deals are manually reviewed before going live.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px,minmax(0,1fr)]">
        {/* Left: Filter */}
        <aside className="space-y-3">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold text-gray-900">
              Filter by category
            </h2>
            <div className="flex flex-col gap-1 text-xs">
              {CATEGORY_ORDER.map((cat) => {
                const isAll = cat === "all";
                const label = isAll
                  ? "All deals"
                  : DEAL_CATEGORY_LABELS[cat as DealCategory];
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      setActiveCategory(isAll ? "all" : (cat as DealCategory))
                    }
                    className={`w-full rounded-lg px-2 py-1.5 text-left transition ${
                      active
                        ? "bg-[#D90429] text-white"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right: Deals list */}
        <section className="space-y-3">
          {loading && (
            <div className="rounded-2xl border bg-white p-4 text-xs text-gray-600 shadow-sm">
              Loading deals…
            </div>
          )}

          {error && !loading && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 shadow-sm">
              {error}
            </div>
          )}

          {!loading && !error && filteredDeals.length === 0 && (
            <div className="rounded-2xl border bg-white p-4 text-xs text-gray-500 shadow-sm">
              No deals found for this view yet. Check back soon or try another
              category.
            </div>
          )}

          {!loading && !error && filteredDeals.length > 0 && (
            <div className="grid gap-3 md:grid-cols-2">
              {filteredDeals.map((deal) => {
                const label =
                  deal.category && DEAL_CATEGORY_LABELS[deal.category]
                    ? DEAL_CATEGORY_LABELS[deal.category]
                    : deal.category || "Deal";

                return (
                  <div
                    key={deal.id}
                    className={`flex flex-col justify-between rounded-2xl border bg-white p-3 text-xs text-gray-800 shadow-sm ${
                      deal.boosted
                        ? "border-[#D90429]/60 ring-1 ring-[#D90429]/10"
                        : ""
                    }`}
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-[9px] text-gray-600">
                          {label}
                          {deal.boosted && (
                            <span className="ml-1 rounded-full bg-[#FFF6F6] px-1.5 py-0.5 text-[8px] font-semibold text-[#D90429]">
                              Boosted
                            </span>
                          )}
                        </span>
                        {deal.discount_label && (
                          <span className="text-[10px] font-semibold text-[#D90429]">
                            {deal.discount_label}
                          </span>
                        )}
                      </div>
                      <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">
                        {deal.title}
                      </h3>
                      {deal.business_name && (
                        <p className="text-[10px] text-gray-600">
                          {deal.business_name}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 text-[9px] text-gray-500">
                        {deal.area && <span>{deal.area}</span>}
                        {deal.starts_at && (
                          <span>
                            From{" "}
                            {new Date(
                              deal.starts_at
                            ).toLocaleDateString()}
                          </span>
                        )}
                        {deal.expires_at && (
                          <span>
                            Until{" "}
                            {new Date(
                              deal.expires_at
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {deal.description && (
                        <p className="mt-1 line-clamp-3 text-[10px] text-gray-600">
                          {deal.description}
                        </p>
                      )}
                    </div>

                    {/* Button goes via /deals/[id] for tracking + redirect */}
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <Link
                        href={`/deals/${deal.id}`}
                        target="_blank"
                        className="inline-flex items-center rounded-full bg-[#D90429] px-3 py-1 text-[10px] font-semibold text-white hover:bg-[#b50322]"
                      >
                        View / redeem deal
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}