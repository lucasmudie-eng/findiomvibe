// src/app/businesses/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Search, SlidersHorizontal, ChevronRight } from "lucide-react";
import {
  BUSINESS_CATEGORIES,
  type MainCategory,
} from "@/lib/businesses/categories";
import BusinessesMap from "./BusinessesMap";
import SaveItemButton from "@/app/components/SaveItemButton";

// ── TYPES ─────────────────────────────────────────────────────────────────────

type Biz = {
  id: string;
  slug: string | null;
  provider_id?: string | null;
  name: string;
  tagline: string | null;
  category: string | null;
  subcategory: string | null;
  area: string | null;
  logo_url: string | null;
  images?: string[] | null;
  hero_url?: string | null;
  website_url?: string | null;
  boosted?: boolean | null;
  approved?: boolean | null;
  impressions_30d?: number | null;
  clicks_30d?: number | null;
};

// ── HELPERS ───────────────────────────────────────────────────────────────────

const cx = (...p: Array<string | false | null | undefined>) => p.filter(Boolean).join(" ");

function formatCategory(raw?: string | null) {
  if (!raw) return "";
  return raw.replace(/-/g, " / ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function isCarsCategory(cat?: string | null) {
  if (!cat) return false;
  return /(car|motor|vehicle|auto)/i.test(cat);
}

const MAIN_TABS: (MainCategory | "cars" | "hottest" | "other")[] = [
  "hottest",
  "cars",
  ...BUSINESS_CATEGORIES.map((c) => c.key),
  "other",
];

const SAVED_BUSINESSES_KEY = "manxhive_saved_businesses";

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function BusinessesPage() {
  const [activeMain, setActiveMain] = useState<(typeof MAIN_TABS)[number]>("hottest");
  const [activeSub, setActiveSub] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeArea, setActiveArea] = useState<string>("all");
  const [showBoostedOnly, setShowBoostedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "boosted">("name");

  const [featuredList, setFeaturedList] = useState<Biz[]>([]);
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [items, setItems] = useState<Biz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const activeMainDef = useMemo(
    () =>
      activeMain !== "hottest" && activeMain !== "other" && activeMain !== "cars"
        ? BUSINESS_CATEGORIES.find((c) => c.key === activeMain)
        : null,
    [activeMain]
  );

  const fetchSeq = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const mySeq = ++fetchSeq.current;
    const controller = new AbortController();

    async function load() {
      setLoading(true);

      // Featured
      try {
        const fres = await fetch(`/api/businesses?boosted=1&limit=10&with_stats=1`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const fjson: { items?: Biz[] } = await fres.json();
        const boosted = fjson.items || [];
        let relevant = boosted;
        if (boosted.length) {
          if (activeMain === "cars") {
            const f = boosted.filter((b) => isCarsCategory(b.category));
            relevant = f.length ? f : boosted;
          } else if (activeMain !== "hottest" && activeMain !== "other") {
            const f = boosted.filter((b) => (b.category || "").toLowerCase() === String(activeMain));
            relevant = f.length ? f : boosted;
          }
        }
        if (!cancelled && mySeq === fetchSeq.current) {
          setFeaturedList(relevant);
          setFeaturedIdx(0);
        }
      } catch {
        if (!cancelled && mySeq === fetchSeq.current) setFeaturedList([]);
      }

      // Listings
      try {
        let url = "";
        if (activeMain === "hottest") {
          url = `/api/businesses?hottest=1&limit=120&with_stats=1`;
        } else if (activeMain === "other" || activeMain === "cars") {
          url = `/api/businesses?limit=200&with_stats=1`;
        } else {
          url = `/api/businesses?category=${encodeURIComponent(String(activeMain))}&limit=120&with_stats=1`;
        }

        const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
        const json: { items?: Biz[] } = await res.json();
        let rows: Biz[] = json.items || [];

        if (activeMain === "other") {
          const mainKeys = new Set<string>(BUSINESS_CATEGORIES.map((c) => c.key as string));
          rows = rows.filter((r) => !r.category || !mainKeys.has(r.category as string));
        }
        if (activeMain === "cars") {
          rows = rows.filter((r) => isCarsCategory(r.category));
        }
        if (activeSub) {
          rows = rows.filter((r) => (r.subcategory || "") === activeSub);
        }

        if (!cancelled && mySeq === fetchSeq.current) {
          setItems(rows);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled && mySeq === fetchSeq.current) {
          console.error("[businesses] API fetch error", err);
          setItems([]);
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [activeMain, activeSub]);

  const availableAreas = useMemo(
    () =>
      Array.from(
        new Set(items.map((b) => b.area ?? "").map((a) => a.trim()).filter(Boolean))
      ).sort((a, b) => a.localeCompare(b)),
    [items]
  );

  const filteredItems = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    let next = items;
    if (activeArea !== "all") {
      next = next.filter((b) => (b.area ?? "").toLowerCase() === activeArea.toLowerCase());
    }
    if (showBoostedOnly) next = next.filter((b) => !!b.boosted);
    if (needle.length > 0) {
      next = next.filter((b) =>
        [b.name, b.tagline ?? "", b.category ?? "", b.subcategory ?? "", b.area ?? ""].some(
          (f) => f.toLowerCase().includes(needle)
        )
      );
    }
    const sorted = [...next];
    if (sortBy === "boosted") {
      sorted.sort((a, b) => {
        if (!!a.boosted !== !!b.boosted) return a.boosted ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    } else {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    return sorted;
  }, [items, activeArea, showBoostedOnly, searchQuery, sortBy]);

  /* rotate featured businesses */
  useEffect(() => {
    if (featuredList.length <= 1) return;
    const id = setInterval(() => setFeaturedIdx((i) => (i + 1) % featuredList.length), 6000);
    return () => clearInterval(id);
  }, [featuredList.length]);

  const featured = featuredList[featuredIdx] ?? null;

  // ── RENDER ──────────────────────────────────────────────────────────────────

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-700 transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-700">Businesses</span>
        </nav>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Local services directory
            </p>
            <h1 className="font-playfair text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
              Local Businesses<span className="text-[#E8002D]">.</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
              Trusted providers, independents and services across the Isle of Man.
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
                placeholder="Search businesses…"
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </form>
            <div className="flex gap-2">
              <Link
                href="/list-business"
                className="inline-flex items-center rounded-full bg-[#E8002D] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#c00026] transition-colors sm:py-2"
              >
                List your business →
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors sm:py-2"
              >
                Featured slots
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── FEATURED BUSINESS ─────────────────────────────────────────────── */}
      {featured && (
        <div className="mb-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_4px_32px_rgba(0,0,0,0.07)]">
          <div className="grid lg:grid-cols-2">
            <div className="relative min-h-[220px] bg-slate-100 lg:min-h-[280px] overflow-hidden">
              {/* Crossfade between featured businesses */}
              {featuredList.map((biz, i) => {
                const imgSrc = biz.images?.[0] || biz.logo_url;
                return imgSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={biz.id}
                    src={imgSrc}
                    alt={biz.name}
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                      i === featuredIdx ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ) : null;
              })}
              {/* Letter fallback if no images */}
              {!featuredList.some((b) => b.images?.[0] || b.logo_url) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl font-bold text-slate-200">{featured.name[0]}</span>
                </div>
              )}
              {/* Dot indicators overlaid bottom-right */}
              {featuredList.length > 1 && (
                <div className="absolute bottom-3 right-3 flex gap-1.5">
                  {featuredList.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFeaturedIdx(i)}
                      aria-label={`Go to business ${i + 1}`}
                      className={`rounded-full transition-all duration-300 ${
                        i === featuredIdx
                          ? "w-5 h-1.5 bg-[#E8002D]"
                          : "w-1.5 h-1.5 bg-white/60 hover:bg-white"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center px-8 py-8 lg:px-10">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#E8002D]">
                Featured business
              </p>
              <h2 className="font-playfair text-2xl font-bold text-slate-900 sm:text-3xl">
                {featured.name}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {featured.tagline || "Trusted local provider."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {featured.category && (
                  <span className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600">
                    {formatCategory(featured.category)}
                  </span>
                )}
                {featured.area && (
                  <span className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600">
                    {featured.area}
                  </span>
                )}
                {featured.provider_id && (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    Verified
                  </span>
                )}
              </div>
              <div className="mt-5 flex gap-3">
                <Link
                  href={`/businesses/${featured.slug || featured.id}`}
                  className="inline-flex items-center rounded-full bg-[#E8002D] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#c00026] transition-colors"
                >
                  View profile →
                </Link>
                {featured.website_url && (
                  <a
                    href={/^https?:\/\//i.test(featured.website_url) ? featured.website_url : `https://${featured.website_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CATEGORY TABS ─────────────────────────────────────────────────── */}
      <div className="mb-4 flex flex-wrap gap-2">
        {MAIN_TABS.map((key) => {
          const label =
            key === "hottest" ? "Hottest"
            : key === "other" ? "Other"
            : key === "cars" ? "Cars & Motor"
            : BUSINESS_CATEGORIES.find((c) => c.key === key)?.label ?? key;

          return (
            <button
              key={key}
              onClick={() => { setActiveMain(key); setActiveSub(""); }}
              className={cx(
                "rounded-full border px-4 py-2.5 text-sm font-medium transition sm:py-2",
                activeMain === key
                  ? "border-[#E8002D] bg-[#E8002D]/5 text-[#E8002D]"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Subcategory tabs */}
      {activeMainDef && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveSub("")}
            className={cx(
              "rounded-full px-3 py-2.5 text-xs font-medium transition sm:py-1.5",
              activeSub === ""
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            )}
          >
            All {activeMainDef.label}
          </button>
          {activeMainDef.subcategories.map((s) => (
            <button
              key={s}
              onClick={() => setActiveSub(s)}
              className={cx(
                "rounded-full px-3 py-2.5 text-xs font-medium transition sm:py-1.5",
                activeSub === s
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── REFINE BAR ────────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <SlidersHorizontal className="h-3.5 w-3.5 flex-shrink-0 text-[#E8002D]" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
          Refine
        </span>

        {/* Area */}
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setActiveArea("all")}
            className={cx(
              "rounded-full px-2.5 py-2 text-xs font-medium transition sm:py-1",
              activeArea === "all"
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            )}
          >
            All areas
          </button>
          {availableAreas.slice(0, 8).map((area) => (
            <button
              key={area}
              type="button"
              onClick={() => setActiveArea(area)}
              className={cx(
                "rounded-full px-2.5 py-2 text-xs font-medium transition sm:py-1",
                activeArea.toLowerCase() === area.toLowerCase()
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              {area}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowBoostedOnly((p) => !p)}
            className={cx(
              "rounded-full px-3 py-2.5 text-xs font-medium transition sm:py-1.5",
              showBoostedOnly
                ? "bg-[#E8002D] text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            )}
          >
            Boosted only
          </button>
          <button
            type="button"
            onClick={() => setSortBy((p) => (p === "name" ? "boosted" : "name"))}
            className={cx(
              "rounded-full px-3 py-2.5 text-xs font-medium transition sm:py-1.5",
              sortBy === "boosted"
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            )}
          >
            {sortBy === "boosted" ? "Boosted first" : "A–Z"}
          </button>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <MapPin className="h-3 w-3" />
            {filteredItems.length} shown
          </span>
        </div>
      </div>

      {/* ── BUSINESS GRID ─────────────────────────────────────────────────── */}
      <section>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
            <p className="text-sm font-semibold text-slate-700">No businesses found</p>
            <p className="mt-1 text-xs text-slate-400">Try a different category or clear the filters.</p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/businesses/${b.slug || b.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-[#E8002D]/30 hover:shadow-md"
                >
                  {/* Image */}
                  <div className="relative h-40 overflow-hidden bg-slate-100">
                    {b.images?.[0] || b.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={(b.images && b.images[0]) || b.logo_url!}
                        alt={b.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                        <span className="text-3xl font-bold text-slate-300">{b.name[0]}</span>
                      </div>
                    )}
                    <div className="absolute left-2 top-2 flex gap-1">
                      {b.boosted && (
                        <span className="rounded-full bg-[#E8002D] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                          Boosted
                        </span>
                      )}
                      {b.provider_id && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-700">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="line-clamp-1 text-sm font-semibold text-slate-900 group-hover:text-[#E8002D] transition-colors">
                        {b.name}
                      </h3>
                      {b.area && (
                        <span className="flex-shrink-0 text-[10px] text-slate-400">{b.area}</span>
                      )}
                    </div>

                    {b.tagline && (
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">{b.tagline}</p>
                    )}

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {b.category && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                          {formatCategory(b.category)}
                        </span>
                      )}
                      {b.subcategory && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                          {b.subcategory}
                        </span>
                      )}
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      <span className="text-xs font-semibold text-[#E8002D]">View profile →</span>
                      <SaveItemButton
                        storageKey={SAVED_BUSINESSES_KEY}
                        compact
                        item={{
                          id: String(b.id),
                          title: b.name,
                          href: `/businesses/${b.slug || b.id}`,
                          image: (b.images && b.images[0]) || b.logo_url || null,
                          meta: b.area || b.category || null,
                          savedAt: new Date().toISOString(),
                        }}
                      />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── MAP ─────────────────────────────────────────────────────────────── */}
      {!loading && filteredItems.length > 0 && (
        <section className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-playfair text-lg font-bold text-slate-900">
                Businesses on the map
              </h2>
              <p className="text-xs text-slate-500">
                {filteredItems.length} location{filteredItems.length !== 1 ? "s" : ""}
              </p>
            </div>
            <MapPin className="h-5 w-5 text-[#E8002D]" />
          </div>
          <BusinessesMap
            businesses={filteredItems.map((b) => ({
              id: b.id,
              name: b.name,
              area: b.area,
              category: b.category,
              url: `/businesses/${b.slug || b.id}`,
            }))}
            heightClass="h-[260px] md:h-[360px]"
            title="Local providers across the island"
          />
        </section>
      )}
    </main>
  );
}
