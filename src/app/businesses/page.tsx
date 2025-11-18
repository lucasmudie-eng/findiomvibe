// src/app/businesses/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BUSINESS_CATEGORIES,
  type MainCategory,
} from "@/lib/businesses/categories";

/* ---------- Types (align with your API shape) ---------- */
type Biz = {
  id: string;
  slug: string | null;
  name: string;
  tagline: string | null;
  category: string | null;     // e.g. "food-drink"
  subcategory: string | null;  // e.g. "Bakery"
  area: string | null;
  logo_url: string | null;
  images?: string[] | null;
  hero_url?: string | null;
  website_url?: string | null;
  boosted?: boolean | null;
  approved?: boolean | null;
};

const cx = (...p: Array<string | false | null | undefined>) =>
  p.filter(Boolean).join(" ");

function formatCategory(raw?: string | null, style: "slash" | "amp" = "slash") {
  if (!raw) return "";
  const joiner = style === "amp" ? " & " : " / ";
  return raw.replace(/-/g, joiner).replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Cars tab logic */
function isCarsCategory(cat?: string | null) {
  if (!cat) return false;
  return /(car|motor|vehicle|auto)/i.test(cat);
}

/** Add virtual tabs */
const MAIN_TABS: (MainCategory | "cars" | "hottest" | "other")[] = [
  "hottest",
  "cars",
  ...BUSINESS_CATEGORIES.map((c) => c.key),
  "other",
];

export default function BusinessesPage() {
  const [activeMain, setActiveMain] =
    useState<(typeof MAIN_TABS)[number]>("hottest");
  const [activeSub, setActiveSub] = useState<string>("");

  const [featured, setFeatured] = useState<Biz | null>(null);
  const [items, setItems] = useState<Biz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const activeMainDef = useMemo(
    () =>
      activeMain !== "hottest" &&
      activeMain !== "other" &&
      activeMain !== "cars"
        ? BUSINESS_CATEGORIES.find((c) => c.key === activeMain)
        : null,
    [activeMain]
  );

  // race-guard
  const fetchSeq = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const mySeq = ++fetchSeq.current;
    const controller = new AbortController();

    async function load() {
      setLoading(true);

      /* ---------- FEATURED ---------- */
      try {
        const fres = await fetch(`/api/businesses?boosted=1&limit=10`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const fjson: { items?: Biz[] } = await fres.json();
        const boosted = fjson.items || [];

        let chosen: Biz | null = null;

        if (boosted.length) {
          if (activeMain === "cars") {
            chosen = boosted.find((b) => isCarsCategory(b.category)) || boosted[0];
          } else if (activeMain !== "hottest" && activeMain !== "other") {
            chosen =
              boosted.find(
                (b) => (b.category || "").toLowerCase() === String(activeMain)
              ) || boosted[0];
          } else {
            chosen = boosted[0];
          }
        }

        if (!cancelled && mySeq === fetchSeq.current) {
          setFeatured(chosen ?? null);
        }
      } catch {
        if (!cancelled && mySeq === fetchSeq.current) setFeatured(null);
      }

      /* ---------- LISTINGS ---------- */
      try {
        let url = "";

        if (activeMain === "hottest") {
          url = `/api/businesses?hottest=1&limit=120`;
        } else if (activeMain === "other" || activeMain === "cars") {
          url = `/api/businesses?limit=200`; // fetch all
        } else {
          url = `/api/businesses?category=${encodeURIComponent(
            String(activeMain)
          )}&limit=120`;
        }

        const res = await fetch(url, {
          signal: controller.signal,
          cache: "no-store",
        });
        const json: { items?: Biz[] } = await res.json();
        let rows: Biz[] = json.items || [];

        /* ---------- OTHER FILTER ---------- */
        if (activeMain === "other") {
          const mainKeys = new Set<string>(
            BUSINESS_CATEGORIES.map((c) => c.key as string)
          );

          rows = rows.filter(
            (r) => !r.category || !mainKeys.has(r.category as string)
          );
        }

        /* ---------- CARS FILTER ---------- */
        if (activeMain === "cars") {
          rows = rows.filter((r) => isCarsCategory(r.category));
        }

        /* ---------- SUBCATEGORY FILTER ---------- */
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

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-slate-900">Local businesses</h1>
      <p className="mt-2 text-slate-600">
        Discover trusted providers across the Isle of Man. Boosted slots appear first.
      </p>

      {/* Featured hero */}
      <section className="mt-6">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 text-white">
          <div className="grid gap-6 md:grid-cols-[1.25fr,1fr]">
            <div className="flex flex-col justify-center">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-[#FBBF77]">
                Featured business
              </div>
              <h2 className="mt-1 text-2xl font-semibold">
                {featured ? featured.name : "Your business here"}
              </h2>
              <p className="mt-2 text-sm text-slate-200">
                {featured
                  ? featured.tagline || "Trusted local provider."
                  : "Prime, image-led placement shown above the category list."}
              </p>
              <div className="mt-3 text-xs text-slate-300">
                {featured?.category && (
                  <span>
                    {formatCategory(featured.category, "slash")}
                    {featured.subcategory ? ` • ${featured.subcategory}` : ""}
                    {featured.area ? ` • ${featured.area}` : ""}
                  </span>
                )}
              </div>

              <div className="mt-4 flex gap-3">
                {featured ? (
                  <>
                    <Link
                      href={`/businesses/${featured.slug || featured.id}`}
                      className="inline-flex items-center rounded-full bg-white px-5 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-100"
                    >
                      View profile →
                    </Link>

                    {featured.website_url && (
                      <a
                        href={
                          /^https?:\/\//i.test(featured.website_url)
                            ? featured.website_url
                            : `https://${featured.website_url}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-full px-5 py-2 text-xs font-semibold text-white ring-1 ring-white/30 transition hover:ring-white/70"
                      >
                        Visit website
                      </a>
                    )}
                  </>
                ) : (
                  <Link
                    href="/contact"
                    className="inline-flex items-center rounded-full bg-white px-5 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-100"
                  >
                    Enquire about featured slots →
                  </Link>
                )}
              </div>
            </div>

            <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-slate-800 md:h-48">
              {featured?.images?.[0] || featured?.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={(featured.images && featured.images[0]) || featured.logo_url!}
                  alt={featured.name}
                  className="h-full w-full object-cover opacity-90"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-slate-300">
                  Your image here
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* MAIN TABS */}
      <section className="mt-6 flex flex-wrap gap-3">
        {MAIN_TABS.map((key) => {
          const label =
            key === "hottest"
              ? "Hottest"
              : key === "other"
              ? "Other"
              : key === "cars"
              ? "Cars & Motor Trade"
              : BUSINESS_CATEGORIES.find((c) => c.key === key)?.label ?? key;

          return (
            <button
              key={key}
              onClick={() => {
                setActiveMain(key);
                setActiveSub("");
              }}
              className={cx(
                "rounded-full border px-4 py-2 text-sm transition",
                activeMain === key
                  ? "border-[#D90429] bg-rose-50 text-[#D90429]"
                  : "border-slate-200 text-slate-700 hover:border-slate-300"
              )}
            >
              {label}
            </button>
          );
        })}
      </section>

      {/* SUBCATEGORIES */}
      {activeMainDef && (
        <section className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveSub("")}
            className={cx(
              "rounded-full px-3 py-1.5 text-xs transition",
              activeSub === ""
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-slate-300"
            )}
          >
            All {activeMainDef.label}
          </button>
          {activeMainDef.subcategories.map((s) => (
            <button
              key={s}
              onClick={() => setActiveSub(s)}
              className={cx(
                "rounded-full px-3 py-1.5 text-xs transition",
                activeSub === s
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-slate-300"
              )}
            >
              {s}
            </button>
          ))}
        </section>
      )}

      {/* GRID */}
      <section className="mt-8">
        {loading ? (
          <div className="text-sm text-slate-500">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-slate-500">No businesses here yet.</div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((b) => (
              <li
                key={b.id}
                className="group rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md"
              >
                <Link href={`/businesses/${b.slug || b.id}`} className="block">
                  <div className="relative mb-3 h-40 w-full overflow-hidden rounded-xl bg-slate-100">
                    {b.images?.[0] || b.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={(b.images && b.images[0]) || b.logo_url!}
                        alt={b.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                        No image
                      </div>
                    )}

                    {b.boosted && (
                      <span className="absolute left-2 top-2 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-[#D90429]">
                        Boosted
                      </span>
                    )}
                  </div>

                  <div className="mb-1 flex items-baseline justify-between gap-2">
                    <h3 className="line-clamp-1 font-semibold text-slate-900 group-hover:text-[#D90429]">
                      {b.name}
                    </h3>
                    {b.area && (
                      <span className="text-[10px] text-slate-500">{b.area}</span>
                    )}
                  </div>

                  {b.tagline && (
                    <p className="line-clamp-2 text-sm text-slate-600">
                      {b.tagline}
                    </p>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    {b.category && <span>{formatCategory(b.category)}</span>}
                    {b.subcategory && <span>• {b.subcategory}</span>}
                  </div>

                  <div className="mt-3">
                    <span className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-[11px] font-semibold text-[#D90429]">
                      View profile →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}