"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, MapPin, Tag, ChevronRight } from "lucide-react";
import {
  DEAL_CATEGORY_LABELS,
  type DealCategory,
} from "@/lib/deals/types";
import DealsMap from "./DealsMap";
import SaveItemButton from "@/app/components/SaveItemButton";

// ── TYPES ─────────────────────────────────────────────────────────────────────

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
  created_at?: string | null;
};

type DealsResponse = { deals: Deal[] };

// ── CONSTANTS ─────────────────────────────────────────────────────────────────

const CATEGORY_ORDER: (DealCategory | "all")[] = [
  "all",
  "food-drink",
  "shopping",
  "activities",
  "beauty-wellness",
  "services",
  "other",
];

const SAVED_DEALS_KEY = "manxhive_saved_deals";

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activeCategory, setActiveCategory] = useState<DealCategory | "all">("all");
  const [activeArea, setActiveArea] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showBoostedOnly, setShowBoostedOnly] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [sortBy, setSortBy] = useState<"newest" | "expiring" | "boosted">("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/deals");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
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

  const availableAreas = useMemo(
    () =>
      Array.from(
        new Set(
          deals
            .map((d) => d.area ?? "")
            .map((a) => a.trim())
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b)),
    [deals]
  );

  const filteredDeals = useMemo(() => {
    const now = new Date();
    const needle = searchQuery.trim().toLowerCase();
    let next = deals;

    if (activeCategory !== "all") {
      next = next.filter((d) => d.category === activeCategory);
    }
    if (activeArea !== "all") {
      next = next.filter(
        (d) => (d.area ?? "").toLowerCase() === activeArea.toLowerCase()
      );
    }
    if (showBoostedOnly) next = next.filter((d) => d.boosted);
    if (showActiveOnly) {
      next = next.filter((d) => {
        const starts = d.starts_at ? new Date(d.starts_at) : null;
        const expires = d.expires_at ? new Date(d.expires_at) : null;
        return (!starts || starts <= now) && (!expires || expires >= now);
      });
    }
    if (needle.length > 0) {
      next = next.filter((d) =>
        [d.title, d.description ?? "", d.business_name ?? "", d.area ?? "", d.discount_label ?? ""].some(
          (f) => f.toLowerCase().includes(needle)
        )
      );
    }

    const sorted = [...next];
    if (sortBy === "expiring") {
      sorted.sort((a, b) => {
        const aExp = a.expires_at ? new Date(a.expires_at).getTime() : Infinity;
        const bExp = b.expires_at ? new Date(b.expires_at).getTime() : Infinity;
        return aExp - bExp;
      });
    } else if (sortBy === "boosted") {
      sorted.sort((a, b) => {
        if (a.boosted !== b.boosted) return a.boosted ? -1 : 1;
        return (b.created_at ? new Date(b.created_at).getTime() : 0) -
          (a.created_at ? new Date(a.created_at).getTime() : 0);
      });
    } else {
      sorted.sort(
        (a, b) =>
          (b.created_at ? new Date(b.created_at).getTime() : 0) -
          (a.created_at ? new Date(a.created_at).getTime() : 0)
      );
    }
    return sorted;
  }, [deals, activeCategory, activeArea, showBoostedOnly, showActiveOnly, searchQuery, sortBy]);

  // ── RENDER ──────────────────────────────────────────────────────────────────

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:py-12">

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-700 transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-700">Deals</span>
        </nav>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Island-wide offers
            </p>
            <h1 className="font-playfair text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
              Local Deals<span className="text-[#E8002D]">.</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
              Curated offers from Isle of Man businesses. Time-bound, no nonsense. Support local and save.
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            <form
              className="flex w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 shadow-sm sm:w-72"
              onSubmit={(e) => e.preventDefault()}
            >
              <Search className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search deals…"
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </form>
            <Link
              href="/deals/create"
              className="inline-flex items-center rounded-full bg-[#E8002D] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#c00026] transition-colors"
            >
              Submit a deal →
            </Link>
          </div>
        </div>
      </div>

      {/* ── CATEGORY PILLS (horizontal) ───────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORY_ORDER.map((cat) => {
          const isAll = cat === "all";
          const label = isAll ? "All deals" : DEAL_CATEGORY_LABELS[cat as DealCategory];
          const active = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(isAll ? "all" : (cat as DealCategory))}
              className={`rounded-full px-3 py-2.5 text-xs font-medium transition sm:py-1.5 ${
                active
                  ? "bg-[#E8002D] text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-[#E8002D]/40 hover:text-[#E8002D]"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ── MOBILE FILTER ROW (hidden on desktop) ─────────────────────────── */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] md:hidden">
        <button
          type="button"
          onClick={() => setShowActiveOnly((p) => !p)}
          className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition ${showActiveOnly ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700"}`}
        >
          Active
        </button>
        <button
          type="button"
          onClick={() => setShowBoostedOnly((p) => !p)}
          className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition ${showBoostedOnly ? "bg-[#E8002D] text-white" : "border border-slate-200 bg-white text-slate-700"}`}
        >
          Boosted
        </button>
        {(["newest", "expiring", "boosted"] as const).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setSortBy(opt)}
            className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition ${sortBy === opt ? "bg-slate-800 text-white" : "border border-slate-200 bg-white text-slate-700"}`}
          >
            {opt === "newest" ? "Newest" : opt === "expiring" ? "Expiring soon" : "Boosted first"}
          </button>
        ))}
      </div>

      {/* ── MAIN GRID ─────────────────────────────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">

        {/* Sidebar filters (hidden on mobile) */}
        <aside className="hidden space-y-4 md:sticky md:top-24 md:block md:h-fit">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#E8002D]" />
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                Refine
              </span>
            </div>

            {/* Area */}
            {availableAreas.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                  Area
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveArea("all")}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                      activeArea === "all"
                        ? "bg-slate-900 text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    All
                  </button>
                  {availableAreas.map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => setActiveArea(area)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                        activeArea.toLowerCase() === area.toLowerCase()
                          ? "bg-slate-900 text-white"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Toggles */}
            <div className="mb-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowBoostedOnly((p) => !p)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium text-left transition ${
                  showBoostedOnly
                    ? "bg-[#E8002D] text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Boosted only
              </button>
              <button
                type="button"
                onClick={() => setShowActiveOnly((p) => !p)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium text-left transition ${
                  showActiveOnly
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Active only
              </button>
            </div>

            {/* Sort */}
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                Sort by
              </p>
              <div className="flex flex-col gap-1.5">
                {[
                  { value: "newest", label: "Newest first" },
                  { value: "expiring", label: "Expiring soon" },
                  { value: "boosted", label: "Boosted first" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSortBy(opt.value as typeof sortBy)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium text-left transition ${
                      sortBy === opt.value
                        ? "bg-slate-900 text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Deals list */}
        <section className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              {filteredDeals.length} {filteredDeals.length === 1 ? "deal" : "deals"}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {activeArea === "all" ? "Island-wide" : activeArea}
            </span>
          </div>

          {/* Loading */}
          {loading && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {error}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filteredDeals.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
              <Tag className="mx-auto mb-3 h-7 w-7 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No deals found</p>
              <p className="mt-1 text-xs text-slate-400">
                Try adjusting the category or area filter.
              </p>
            </div>
          )}

          {/* Deal tiles — compact horizontal */}
          {!loading && !error && filteredDeals.length > 0 && (
            <ul className="space-y-3">
              {filteredDeals.map((deal) => {
                const label =
                  deal.category && DEAL_CATEGORY_LABELS[deal.category]
                    ? DEAL_CATEGORY_LABELS[deal.category]
                    : deal.category || "Deal";

                return (
                  <li key={deal.id}>
                    <div
                      className={`group flex items-stretch overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:border-[#E8002D]/30 hover:shadow-md ${
                        deal.boosted
                          ? "border-[#E8002D]/30"
                          : "border-slate-200"
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="relative h-auto w-24 flex-shrink-0 overflow-hidden bg-slate-100 sm:w-32">
                        {deal.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={deal.image_url}
                            alt={deal.title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Tag className="h-6 w-6 text-slate-300" />
                          </div>
                        )}
                        {deal.boosted && (
                          <span className="absolute left-1.5 top-1.5 rounded-full bg-[#E8002D] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white">
                            Boosted
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                              {label}
                            </span>
                            {deal.discount_label && (
                              <span className="rounded-full bg-[#E8002D]/8 px-2 py-0.5 text-[10px] font-semibold text-[#E8002D]">
                                {deal.discount_label}
                              </span>
                            )}
                          </div>
                          <h3 className="line-clamp-1 text-sm font-semibold text-slate-900 group-hover:text-[#E8002D] transition-colors">
                            {deal.title}
                          </h3>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                            {deal.business_name && <span>{deal.business_name}</span>}
                            {deal.area && (
                              <span className="flex items-center gap-0.5">
                                <MapPin className="h-3 w-3" />
                                {deal.area}
                              </span>
                            )}
                            {deal.expires_at && (
                              <span>
                                Until{" "}
                                {new Date(deal.expires_at).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </span>
                            )}
                          </div>
                          {deal.description && (
                            <p className="mt-1 line-clamp-1 text-[11px] text-slate-400">
                              {deal.description}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-shrink-0 flex-col items-center gap-2">
                          <SaveItemButton
                            storageKey={SAVED_DEALS_KEY}
                            compact
                            item={{
                              id: String(deal.id),
                              title: deal.title,
                              href: `/deals/${deal.id}`,
                              image: deal.image_url ?? null,
                              meta: deal.discount_label ?? null,
                              savedAt: new Date().toISOString(),
                            }}
                          />
                          <Link
                            href={`/deals/${deal.id}`}
                            className="rounded-full bg-[#E8002D] px-3 py-2.5 text-[11px] font-semibold text-white hover:bg-[#c00026] transition-colors whitespace-nowrap sm:py-1.5"
                          >
                            View →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Map */}
          {!loading && !error && filteredDeals.length > 0 && (
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="font-playfair text-lg font-bold text-slate-900">
                    Deals on the map
                  </h2>
                  <p className="text-xs text-slate-500">
                    {filteredDeals.length} location{filteredDeals.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <MapPin className="h-5 w-5 text-[#E8002D]" />
              </div>
              <DealsMap
                deals={filteredDeals.map((d) => ({
                  id: d.id,
                  title: d.title,
                  businessName: d.business_name,
                  area: d.area,
                  discountLabel: d.discount_label,
                  url: `/deals/${d.id}`,
                }))}
                heightClass="h-[240px] md:h-[320px]"
                title="Local offers across the island"
              />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
