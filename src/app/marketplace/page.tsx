// src/app/marketplace/page.tsx
import Link from "next/link";
import { headers } from "next/headers";
import { Tag, MapPin, Sparkles, Search, ChevronRight, Plus, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import type { Listing, CategorySlug } from "@/lib/marketplace/types";
import { CATEGORY_LABELS } from "@/lib/marketplace/types";
import ListingCard from "@/app/components/ListingCard";
import SaveSearchButton from "@/app/marketplace/components/SaveSearchButton";

const HIDE_MOTORS_SLUGS = new Set([
  "motors-automotive",
  "automotive",
  "cars",
  "vehicles",
]);
const HIDE_MOTORS_LABELS = new Set(["Motors & Automotive", "Motors", "Cars"]);

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}): Promise<Metadata> {
  const categoryParam = Array.isArray(searchParams?.category)
    ? searchParams?.category[0]
    : searchParams?.category;
  const typeParam = Array.isArray(searchParams?.type)
    ? searchParams?.type[0]
    : searchParams?.type;
  const isMotorsView =
    (typeParam || "").toLowerCase() === "car" ||
    (categoryParam ? HIDE_MOTORS_SLUGS.has(categoryParam) : false);
  const baseTitle = "Marketplace | ManxHive";
  const baseDesc =
    "Local Isle of Man marketplace for tech, home, vehicles and more — clear listings, trusted locals.";
  if (isMotorsView) {
    return {
      title: "Motors & Automotive | ManxHive Marketplace",
      description:
        "Browse cars and other motors from across the Isle of Man. Dealer and private listings with clear details.",
    };
  }
  const categoryLabel =
    (categoryParam &&
      CATEGORY_LABELS[categoryParam as keyof typeof CATEGORY_LABELS]) ||
    null;
  if (!categoryLabel) return { title: baseTitle, description: baseDesc };
  return {
    title: `${categoryLabel} | ManxHive Marketplace`,
    description: `Browse ${categoryLabel.toLowerCase()} listed by locals on the Isle of Man. Trusted, island-first marketplace.`,
  };
}

function absolute(path: string) {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}${path}`;
}

function formatPrice(pence: number) {
  const pounds = pence / 100;
  return `£${pounds.toFixed(0)}`;
}

async function fetchListings(params?: {
  boostedOnly?: boolean;
  category?: string | null;
  type?: string | null;
  sellerType?: "all" | "dealer" | "private";
  sort?: string | null;
  q?: string | null;
  condition?: string | null;
  negotiable?: boolean;
  priceMin?: string | null;
  priceMax?: string | null;
  make?: string | null;
  model?: string | null;
  yearMin?: string | null;
  mileageMax?: string | null;
  offset?: number;
  limit?: number;
}): Promise<Listing[]> {
  const search = new URLSearchParams();
  if (params?.boostedOnly) search.set("boosted", "1");
  if (params?.category) search.set("category", params.category);
  if (params?.type) search.set("type", params.type);
  if (params?.sellerType && params.sellerType !== "all")
    search.set("sellerType", params.sellerType);
  if (params?.sort) search.set("sort", params.sort);
  if (params?.q) search.set("q", params.q);
  if (params?.condition) search.set("condition", params.condition);
  if (params?.negotiable) search.set("negotiable", "1");
  if (params?.priceMin) search.set("priceMin", params.priceMin);
  if (params?.priceMax) search.set("priceMax", params.priceMax);
  if (params?.make) search.set("make", params.make);
  if (params?.model) search.set("model", params.model);
  if (params?.yearMin) search.set("yearMin", params.yearMin);
  if (params?.mileageMax) search.set("mileageMax", params.mileageMax);
  search.set("limit", String(params?.limit ?? 20));
  search.set("offset", String(params?.offset ?? 0));
  const url = absolute(`/api/marketplace?${search.toString()}`);
  try {
    const res = await fetch(url, { next: { revalidate: 30 } });
    if (!res.ok) {
      console.error("[marketplace] failed to load listings:", res.status);
      return [];
    }
    const data = await res.json();
    return data.items ?? [];
  } catch (err) {
    console.error("[marketplace] error fetching listings:", err);
    return [];
  }
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const categoryParam = Array.isArray(searchParams?.category)
    ? searchParams?.category[0]
    : searchParams?.category;
  const boostedParam = Array.isArray(searchParams?.boosted)
    ? searchParams?.boosted[0]
    : searchParams?.boosted;
  const typeParam = Array.isArray(searchParams?.type)
    ? searchParams?.type[0]
    : searchParams?.type;
  const searchParamRaw = Array.isArray(searchParams?.q)
    ? searchParams?.q[0]
    : searchParams?.q;
  const searchQuery = (searchParamRaw ?? "").trim();
  const hasSearch = searchQuery.length > 0;
  const sortParam = Array.isArray(searchParams?.sort)
    ? searchParams?.sort[0]
    : searchParams?.sort;
  const sortCandidate = (sortParam ?? "newest").toLowerCase();
  const sortValue =
    sortCandidate === "price_asc" ||
    sortCandidate === "price_desc" ||
    sortCandidate === "oldest"
      ? sortCandidate
      : "newest";
  const priceMinParam = Array.isArray(searchParams?.priceMin)
    ? searchParams?.priceMin[0]
    : searchParams?.priceMin;
  const priceMaxParam = Array.isArray(searchParams?.priceMax)
    ? searchParams?.priceMax[0]
    : searchParams?.priceMax;
  const conditionParam = Array.isArray(searchParams?.condition)
    ? searchParams?.condition[0]
    : searchParams?.condition;
  const negotiableParam = Array.isArray(searchParams?.negotiable)
    ? searchParams?.negotiable[0]
    : searchParams?.negotiable;
  const makeParam = Array.isArray(searchParams?.make)
    ? searchParams?.make[0]
    : searchParams?.make;
  const modelParam = Array.isArray(searchParams?.model)
    ? searchParams?.model[0]
    : searchParams?.model;
  const yearMinParam = Array.isArray(searchParams?.yearMin)
    ? searchParams?.yearMin[0]
    : searchParams?.yearMin;
  const mileageMaxParam = Array.isArray(searchParams?.mileageMax)
    ? searchParams?.mileageMax[0]
    : searchParams?.mileageMax;
  const isMotorsView =
    (typeParam || "").toLowerCase() === "car" ||
    (categoryParam ? HIDE_MOTORS_SLUGS.has(categoryParam) : false);
  const sellerTypeParam = Array.isArray(searchParams?.sellerType)
    ? searchParams?.sellerType[0]
    : searchParams?.sellerType;
  const sellerType: "all" | "dealer" | "private" =
    sellerTypeParam === "dealer"
      ? "dealer"
      : sellerTypeParam === "private"
      ? "private"
      : "all";
  const boostedOnly = boostedParam === "1";
  const hasFilters = Boolean(
    conditionParam ||
      priceMinParam ||
      priceMaxParam ||
      negotiableParam === "1" ||
      makeParam ||
      modelParam ||
      yearMinParam ||
      mileageMaxParam
  );
  const showFilters = hasFilters || hasSearch;
  const pageParam = Array.isArray(searchParams?.page)
    ? searchParams?.page[0]
    : searchParams?.page;
  const page = Math.max(Number(pageParam ?? "1") || 1, 1);
  const limit = 20;
  const offset = (page - 1) * limit;
  const isKnownCategory =
    !!categoryParam &&
    Object.prototype.hasOwnProperty.call(CATEGORY_LABELS, categoryParam);
  const activeCategory = (!isMotorsView && isKnownCategory
    ? categoryParam
    : undefined) as CategorySlug | undefined;

  const [boostedListingsRaw, allListingsRaw] = await Promise.all([
    fetchListings({
      boostedOnly: true,
      category: activeCategory || null,
      type: isMotorsView ? "car" : null,
      sellerType: isMotorsView ? sellerType : "all",
      sort: sortValue,
      q: hasSearch ? searchQuery : null,
      condition: conditionParam ?? null,
      negotiable: negotiableParam === "1",
      priceMin: priceMinParam ?? null,
      priceMax: priceMaxParam ?? null,
      make: makeParam ?? null,
      model: modelParam ?? null,
      yearMin: yearMinParam ?? null,
      mileageMax: mileageMaxParam ?? null,
      limit: boostedOnly ? limit : 6,
      offset: boostedOnly ? offset : 0,
    }),
    fetchListings({
      boostedOnly: false,
      category: activeCategory || null,
      type: isMotorsView ? "car" : null,
      sellerType: isMotorsView ? sellerType : "all",
      sort: sortValue,
      q: hasSearch ? searchQuery : null,
      condition: conditionParam ?? null,
      negotiable: negotiableParam === "1",
      priceMin: priceMinParam ?? null,
      priceMax: priceMaxParam ?? null,
      make: makeParam ?? null,
      model: modelParam ?? null,
      yearMin: yearMinParam ?? null,
      mileageMax: mileageMaxParam ?? null,
      limit,
      offset,
    }),
  ]);

  const filterReal = (l: Listing) =>
    (l.pricePence ?? 0) > 0 && (l.title ?? "").trim().length > 0;
  const boostedListings = boostedListingsRaw.filter(filterReal);
  const allListings = allListingsRaw.filter(filterReal);
  const boostedFiltered = boostedListings;
  const allFiltered = allListings;
  const boostedIds = new Set(boostedFiltered.map((l) => l.id));
  const mainListings = boostedOnly
    ? boostedFiltered
    : allFiltered.filter((l) => !boostedIds.has(l.id));

  const categories = Object.entries(CATEGORY_LABELS).filter(
    ([slug, label]) =>
      !HIDE_MOTORS_SLUGS.has(slug) && !HIDE_MOTORS_LABELS.has(label)
  );

  let headingLabel = activeCategory
    ? CATEGORY_LABELS[activeCategory] || "Listings"
    : boostedOnly
    ? "Boosted listings"
    : isMotorsView
    ? "Motors & Automotive"
    : "Latest listings";
  if (hasSearch) headingLabel = "Search results";

  const baseParams = new URLSearchParams();
  if (isMotorsView) baseParams.set("type", "car");
  if (isMotorsView && sellerType !== "all") baseParams.set("sellerType", sellerType);
  if (activeCategory && !isMotorsView) baseParams.set("category", activeCategory);
  if (sortValue && sortValue !== "newest") baseParams.set("sort", sortValue);
  if (hasSearch) baseParams.set("q", searchQuery);
  if (conditionParam) baseParams.set("condition", conditionParam);
  if (negotiableParam === "1") baseParams.set("negotiable", "1");
  if (priceMinParam) baseParams.set("priceMin", priceMinParam);
  if (priceMaxParam) baseParams.set("priceMax", priceMaxParam);
  if (makeParam) baseParams.set("make", makeParam);
  if (modelParam) baseParams.set("model", modelParam);
  if (yearMinParam) baseParams.set("yearMin", yearMinParam);
  if (mileageMaxParam) baseParams.set("mileageMax", mileageMaxParam);

  const hrefWith = (extra: Record<string, string | undefined | null>) => {
    const p = new URLSearchParams(baseParams);
    Object.entries(extra).forEach(([k, v]) => {
      if (!v) return;
      p.set(k, v);
    });
    const qs = p.toString();
    return qs ? `/marketplace?${qs}` : `/marketplace`;
  };

  const boostedToggleHref = boostedOnly
    ? hrefWith({})
    : hrefWith({ boosted: "1" });

  const clearSearchHref = (() => {
    const p = new URLSearchParams(baseParams);
    if (boostedOnly) p.set("boosted", "1");
    const qs = p.toString();
    return qs ? `/marketplace?${qs}` : "/marketplace";
  })();

  const clearFiltersHref = (() => {
    const p = new URLSearchParams(baseParams);
    p.delete("condition");
    p.delete("priceMin");
    p.delete("priceMax");
    p.delete("negotiable");
    p.delete("make");
    p.delete("model");
    p.delete("yearMin");
    p.delete("mileageMax");
    if (boostedOnly) p.set("boosted", "1");
    const qs = p.toString();
    return qs ? `/marketplace?${qs}` : "/marketplace";
  })();

  const hrefWithout = (key: string) => {
    const p = new URLSearchParams(baseParams);
    if (boostedOnly) p.set("boosted", "1");
    p.delete(key);
    const qs = p.toString();
    return qs ? `/marketplace?${qs}` : "/marketplace";
  };

  const activeFilterChips = [
    conditionParam && { key: "condition", label: `Condition: ${conditionParam}` },
    priceMinParam && { key: "priceMin", label: `Min £${priceMinParam}` },
    priceMaxParam && { key: "priceMax", label: `Max £${priceMaxParam}` },
    negotiableParam === "1" && { key: "negotiable", label: "Negotiable only" },
    makeParam && { key: "make", label: `Make: ${makeParam}` },
    modelParam && { key: "model", label: `Model: ${modelParam}` },
    yearMinParam && { key: "yearMin", label: `Year ≥ ${yearMinParam}` },
    mileageMaxParam && { key: "mileageMax", label: `Mileage ≤ ${mileageMaxParam}` },
  ].filter(Boolean) as { key: string; label: string }[];

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "price_asc", label: "Price ↑" },
    { value: "price_desc", label: "Price ↓" },
  ];

  const sortHref = (value: string) => {
    const p = new URLSearchParams(baseParams);
    if (boostedOnly) p.set("boosted", "1");
    if (value === "newest") p.delete("sort");
    else p.set("sort", value);
    const qs = p.toString();
    return qs ? `/marketplace?${qs}` : "/marketplace";
  };

  const allListingsHref = (() => {
    const p = new URLSearchParams(baseParams);
    if (boostedOnly) p.set("boosted", "1");
    p.delete("category");
    p.delete("type");
    p.delete("sellerType");
    const qs = p.toString();
    return qs ? `/marketplace?${qs}` : "/marketplace";
  })();

  const categoryHref = (slug: string) => {
    const p = new URLSearchParams(baseParams);
    if (boostedOnly) p.set("boosted", "1");
    p.delete("type");
    p.delete("sellerType");
    p.set("category", slug);
    const qs = p.toString();
    return qs ? `/marketplace?${qs}` : "/marketplace";
  };

  const motorsHref = (() => {
    const p = new URLSearchParams(baseParams);
    if (boostedOnly) p.set("boosted", "1");
    p.delete("category");
    p.set("type", "car");
    const qs = p.toString();
    return qs ? `/marketplace?${qs}` : "/marketplace";
  })();

  const hasNextPage = mainListings.length === limit;
  const prevHref = boostedOnly
    ? hrefWith({ page: page > 1 ? String(page - 1) : null, boosted: "1" })
    : hrefWith({ page: page > 1 ? String(page - 1) : null });
  const nextHref = boostedOnly
    ? hrefWith({ page: hasNextPage ? String(page + 1) : null, boosted: "1" })
    : hrefWith({ page: hasNextPage ? String(page + 1) : null });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 space-y-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link href="/" className="hover:text-slate-700 transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-700">Marketplace</span>
      </nav>

      {/* ── HERO HEADER ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E8002D] mb-2">
            Isle of Man · Local marketplace
          </p>
          <h1 className="font-playfair text-4xl font-bold text-slate-900 sm:text-5xl">
            Find anything.<br />
            <em>Sell everything.</em>
          </h1>
          <p className="mt-4 max-w-lg text-base text-slate-500 leading-relaxed">
            Trusted local listings across the Isle of Man — vehicles, tech, home,
            and everything in between.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/marketplace/create"
            className="inline-flex items-center gap-2 rounded-full bg-[#E8002D] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c00026]"
          >
            <Plus className="h-4 w-4" />
            List an item
          </Link>
          <Link
            href="/account"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            My listings
          </Link>
        </div>
      </div>

      {/* ── SEARCH BAR ─────────────────────────────────────────────── */}
      <form action="/marketplace" method="GET" className="group relative">
        {isMotorsView && <input type="hidden" name="type" value="car" />}
        {isMotorsView && sellerType !== "all" && (
          <input type="hidden" name="sellerType" value={sellerType} />
        )}
        {boostedOnly && <input type="hidden" name="boosted" value="1" />}
        {sortValue !== "newest" && (
          <input type="hidden" name="sort" value={sortValue} />
        )}

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 shadow-sm focus-within:border-[#E8002D]/40 focus-within:shadow-md transition-all">
          <Search className="h-4 w-4 flex-shrink-0 text-slate-400" />
          <input
            name="q"
            defaultValue={searchQuery}
            placeholder="Search listings…"
            className="w-full border-none bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0"
          />
          {hasSearch && (
            <Link
              href={clearSearchHref}
              className="shrink-0 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 hover:bg-slate-50"
            >
              Clear
            </Link>
          )}
          <button
            type="submit"
            className="shrink-0 rounded-full bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-700 sm:py-1.5"
          >
            Search
          </button>
        </div>

        {/* Expandable advanced filters */}
        <div
          className={`mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xs transition-all duration-200 ${
            showFilters
              ? "max-h-[520px] opacity-100"
              : "max-h-0 opacity-0 pointer-events-none group-focus-within:max-h-[520px] group-focus-within:opacity-100 group-focus-within:pointer-events-auto"
          }`}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {!isMotorsView && (
              <label className="flex flex-col gap-1 text-[11px] text-slate-600">
                Category
                <select
                  name="category"
                  defaultValue={activeCategory ?? ""}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#E8002D]/30"
                >
                  <option value="">All categories</option>
                  <option value="automotive">Motors &amp; Automotive</option>
                  {categories.map(([slug, label]) => (
                    <option key={slug} value={slug}>{label}</option>
                  ))}
                </select>
              </label>
            )}
            <label className="flex flex-col gap-1 text-[11px] text-slate-600">
              Condition
              <select
                name="condition"
                defaultValue={conditionParam ?? ""}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#E8002D]/30"
              >
                <option value="">Any condition</option>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Lightly Used">Lightly Used</option>
                <option value="Used">Used</option>
                <option value="For Parts">For Parts</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-slate-600">
              Min price (£)
              <input
                name="priceMin"
                type="number"
                min="0"
                inputMode="numeric"
                defaultValue={priceMinParam ?? ""}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#E8002D]/30"
              />
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-slate-600">
              Max price (£)
              <input
                name="priceMax"
                type="number"
                min="0"
                inputMode="numeric"
                defaultValue={priceMaxParam ?? ""}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#E8002D]/30"
              />
            </label>
            {isMotorsView && (
              <>
                <label className="flex flex-col gap-1 text-[11px] text-slate-600">
                  Make
                  <input name="make" defaultValue={makeParam ?? ""} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#E8002D]/30" />
                </label>
                <label className="flex flex-col gap-1 text-[11px] text-slate-600">
                  Model
                  <input name="model" defaultValue={modelParam ?? ""} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#E8002D]/30" />
                </label>
                <label className="flex flex-col gap-1 text-[11px] text-slate-600">
                  Year from
                  <input name="yearMin" type="number" min="1950" inputMode="numeric" defaultValue={yearMinParam ?? ""} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#E8002D]/30" />
                </label>
                <label className="flex flex-col gap-1 text-[11px] text-slate-600">
                  Max mileage
                  <input name="mileageMax" type="number" min="0" inputMode="numeric" defaultValue={mileageMaxParam ?? ""} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#E8002D]/30" />
                </label>
              </>
            )}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-[11px] text-slate-600">
              <input
                type="checkbox"
                name="negotiable"
                value="1"
                defaultChecked={negotiableParam === "1"}
                className="h-3.5 w-3.5 rounded border-slate-300 text-[#E8002D]"
              />
              Negotiable only
            </label>
            <div className="flex items-center gap-2">
              {hasFilters && (
                <Link href={clearFiltersHref} className="rounded-full border border-slate-200 px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50">
                  Reset filters
                </Link>
              )}
              <button type="submit" className="rounded-full bg-slate-900 px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-700 transition">
                Apply filters
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* ── MOBILE CATEGORY PILLS (hidden on desktop) ───────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] md:hidden">
        <Link
          href={allListingsHref}
          className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition ${!activeCategory && !isMotorsView ? "bg-[#E8002D] text-white" : "border border-slate-200 bg-white text-slate-700"}`}
        >
          All
        </Link>
        {categories.map(([slug, label]) => (
          <Link
            key={slug}
            href={categoryHref(slug)}
            className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition ${activeCategory === slug && !isMotorsView ? "bg-[#E8002D] text-white" : "border border-slate-200 bg-white text-slate-700"}`}
          >
            {label}
          </Link>
        ))}
        <Link
          href={motorsHref}
          className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition ${isMotorsView ? "bg-[#E8002D] text-white" : "border border-slate-200 bg-white text-slate-700"}`}
        >
          Motors
        </Link>
      </div>

      {/* ── MAIN LAYOUT ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[220px_minmax(0,1fr)]">

        {/* ── SIDEBAR (hidden on mobile) ───────────────────────────── */}
        <aside className="hidden space-y-4 md:sticky md:top-24 md:block md:h-fit">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
              <Tag className="h-3.5 w-3.5 text-[#E8002D]" />
              Categories
            </h2>
            <div className="flex flex-col gap-0.5">
              <Link
                href={allListingsHref}
                className={`rounded-lg px-3 py-2 text-sm transition ${
                  !activeCategory && !isMotorsView
                    ? "bg-[#E8002D] font-semibold text-white"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                All listings
              </Link>
              {categories.map(([slug, label]) => {
                const active = activeCategory === slug && !isMotorsView;
                return (
                  <Link
                    key={slug}
                    href={categoryHref(slug)}
                    className={`rounded-lg px-3 py-2 text-sm transition ${
                      active
                        ? "bg-[#E8002D] font-semibold text-white"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
              <Link
                href={motorsHref}
                className={`rounded-lg px-3 py-2 text-sm transition ${
                  isMotorsView
                    ? "bg-[#E8002D] font-semibold text-white"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                Motors &amp; Automotive
              </Link>
            </div>
          </div>

          {/* Boost CTA */}
          <div className="rounded-2xl border border-[#E8002D]/20 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-[#E8002D]" />
              <h3 className="text-sm font-semibold text-slate-900">Boost your listing</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Feature your item at the top of the marketplace. Ideal for vehicles, tech, and premium items.
            </p>
            <Link
              href="/contact"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#E8002D] hover:underline"
            >
              Find out more <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </aside>

        {/* ── LISTINGS COLUMN ─────────────────────────────────────── */}
        <section className="min-w-0 space-y-5">

          {/* Motors seller filter */}
          {isMotorsView && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500">Seller:</span>
              {(["all", "dealer", "private"] as const).map((k) => {
                const active = sellerType === k;
                return (
                  <Link
                    key={k}
                    href={hrefWith({ type: "car", sellerType: k === "all" ? undefined : k, category: undefined })}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      active
                        ? "bg-slate-900 text-white"
                        : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {k === "all" ? "All" : k === "dealer" ? "Dealers" : "Private"}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Sort / filter bar */}
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400">Sort:</span>
                {sortOptions.map((opt) => {
                  const active = sortValue === opt.value;
                  return (
                    <Link
                      key={opt.value}
                      href={sortHref(opt.value)}
                      className={`rounded-full px-3 py-2 text-xs font-medium transition sm:py-1 ${
                        active
                          ? "bg-slate-900 text-white"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {opt.label}
                    </Link>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={boostedToggleHref}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium transition sm:py-1 ${
                    boostedOnly
                      ? "border-[#E8002D] bg-[#E8002D]/5 text-[#E8002D]"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Sparkles className="h-3 w-3" />
                  Boosted
                </Link>
                <SaveSearchButton />
              </div>
            </div>

            {activeFilterChips.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {activeFilterChips.map((chip) => (
                  <Link
                    key={chip.key}
                    href={hrefWithout(chip.key)}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 hover:border-[#E8002D]/30 transition"
                  >
                    {chip.label}
                    <span className="text-slate-400">×</span>
                  </Link>
                ))}
                <Link href={clearFiltersHref} className="text-xs text-[#E8002D] hover:underline self-center">
                  Clear all
                </Link>
              </div>
            )}
          </div>

          {/* ── Boosted / Featured listings ─────────────────────── */}
          {!boostedOnly && boostedFiltered.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-[#E8002D]" />
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#E8002D]">
                  Featured listings
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {boostedFiltered.map((item) => (
                  <Link
                    key={item.id}
                    href={`/marketplace/item/${item.id}`}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-[#E8002D]/30 hover:shadow-xl hover:-translate-y-1"
                  >
                    {/* Image */}
                    <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                      {item.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.07]"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-2">
                          <Tag className="h-6 w-6 text-slate-300" />
                          <span className="text-xs text-slate-300">No image</span>
                        </div>
                      )}
                      {/* Price overlay */}
                      <div className="absolute bottom-2 right-2 rounded-full bg-[#E8002D] px-3 py-1 text-sm font-bold text-white shadow-md">
                        {formatPrice(item.pricePence)}
                      </div>
                      {/* Boosted badge */}
                      <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-[#E8002D] shadow backdrop-blur-sm">
                        <Sparkles className="h-3 w-3" />
                        Featured
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="line-clamp-1 text-sm font-semibold text-slate-900 group-hover:text-[#E8002D] transition-colors">
                        {item.title}
                      </h3>
                      <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500">
                        <MapPin className="h-3 w-3" />
                        <span>{(item as any).area || "Island-wide"}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── Main Listings ───────────────────────────────────── */}
          <div>
            <div className="mb-4 flex items-baseline justify-between gap-2">
              <div>
                <h2 className="font-playfair text-xl font-bold text-slate-900">
                  {headingLabel}
                  {hasSearch && (
                    <span className="ml-2 text-base font-normal text-slate-400">
                      for &ldquo;{searchQuery}&rdquo;
                    </span>
                  )}
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  {mainListings.length} listing{mainListings.length !== 1 ? "s" : ""} shown
                </p>
              </div>
              {(activeCategory || boostedOnly || isMotorsView || sellerType !== "all" || hasSearch) && (
                <Link href="/marketplace" className="text-xs font-semibold text-[#E8002D] hover:underline">
                  Clear all filters
                </Link>
              )}
            </div>

            {mainListings.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <Tag className="mx-auto h-8 w-8 text-slate-300 mb-3" />
                <p className="text-sm font-semibold text-slate-700">No listings found</p>
                <p className="mt-1 text-xs text-slate-400">
                  Try another category or search term, or check back soon.
                </p>
                <Link href="/marketplace" className="mt-4 inline-flex text-xs font-semibold text-[#E8002D] hover:underline">
                  View all listings →
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {mainListings.map((item) => (
                  <li key={item.id}>
                    <ListingCard item={item as any} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-3.5 shadow-sm">
            <span className="text-xs text-slate-500">Page {page}</span>
            <div className="flex gap-2">
              <Link
                href={prevHref}
                aria-disabled={page <= 1}
                className={`inline-flex items-center justify-center rounded-full px-4 min-h-[44px] text-xs font-semibold transition ${
                  page <= 1
                    ? "pointer-events-none cursor-not-allowed border border-slate-100 text-slate-300"
                    : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                ← Prev
              </Link>
              <Link
                href={nextHref}
                aria-disabled={!hasNextPage}
                className={`inline-flex items-center justify-center rounded-full px-4 min-h-[44px] text-xs font-semibold transition ${
                  !hasNextPage
                    ? "pointer-events-none cursor-not-allowed border border-slate-100 text-slate-300"
                    : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Next →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
