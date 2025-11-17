// src/app/search/page.tsx
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
  CalendarDays,
  Tag,
  Store,
  Sparkles,
  Search as SearchIcon,
} from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseAnon
    ? createClient(supabaseUrl, supabaseAnon)
    : null;

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  type?: string;
};

type SearchType = "all" | "events" | "marketplace" | "deals" | "businesses";

type EventRow = {
  id: string | number;
  title: string;
  location: string | null;
  starts_at: string | null;
};

type ListingRow = {
  id: string | number;
  title: string;
  area: string | null;
  category: string | null;
  price_pence: number | null;
  imageUrl?: string | null;
};

type DealRow = {
  id: string | number;
  title: string;
  business_name: string | null;
  area: string | null;
};

type BusinessRow = {
  id: string | number;
  name: string;
  area: string | null;
  category: string | null;
};

// ---- helpers ----

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Highlight matching query in text
function highlight(text: string | null | undefined, query: string) {
  if (!text) return null;
  if (!query.trim()) return text;

  const pattern = new RegExp(`(${escapeRegExp(query)})`, "ig");
  const parts = text.split(pattern);

  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <mark
        key={index}
        className="rounded bg-yellow-100 px-[1px] py-[1px] text-inherit"
      >
        {part}
      </mark>
    ) : (
      <span key={index}>{part}</span>
    )
  );
}

// Tiny emoji helper for businesses
function businessEmoji(category?: string | null) {
  if (!category) return "📍";
  const c = category.toLowerCase();
  if (c.includes("food") || c.includes("restaurant") || c.includes("cafe"))
    return "🍽️";
  if (c.includes("trade") || c.includes("builder") || c.includes("plumb"))
    return "🛠️";
  if (c.includes("beauty") || c.includes("hair") || c.includes("spa"))
    return "💅";
  if (c.includes("fitness") || c.includes("gym")) return "🏃";
  if (c.includes("tech") || c.includes("web") || c.includes("it")) return "💻";
  return "📍";
}

async function runSearch(query: string) {
  if (!supabase || !query.trim()) {
    return {
      events: [] as EventRow[],
      listings: [] as ListingRow[],
      deals: [] as DealRow[],
      businesses: [] as BusinessRow[],
    };
  }

  const q = `%${query.trim()}%`;

  const [eventsRes, listingsRes, dealsRes, businessesRes] = await Promise.all([
    supabase
      .from("events")
      .select("id, title, location, starts_at")
      .eq("approved", true)
      .ilike("title", q)
      .limit(15),

    supabase
      .from("marketplace_listings")
      .select("id, title, area, category, price_pence, images")
      .eq("approved", true)
      .or(`title.ilike.${q},area.ilike.${q},category.ilike.${q}`)
      .limit(15),

    supabase
      .from("deals")
      .select("id, title, business_name, area")
      .eq("approved", true)
      .or(`title.ilike.${q},business_name.ilike.${q},area.ilike.${q}`)
      .limit(15),

    supabase
      .from("businesses")
      .select("id, name, area, category")
      .eq("approved", true)
      .or(`name.ilike.${q},category.ilike.${q},area.ilike.${q}`)
      .limit(15),
  ]);

  const rawListings = (listingsRes.data ?? []) as any[];
  const listings: ListingRow[] = rawListings.map((l) => {
    let imageUrl: string | null = null;
    if (Array.isArray(l.images)) {
      imageUrl = l.images[0] ?? null;
    } else if (typeof l.images === "string") {
      imageUrl = l.images;
    }

    return {
      id: l.id,
      title: l.title,
      area: l.area,
      category: l.category,
      price_pence: l.price_pence,
      imageUrl,
    };
  });

  return {
    events: ((eventsRes.data ?? []) as EventRow[]) ?? [],
    listings,
    deals: ((dealsRes.data ?? []) as DealRow[]) ?? [],
    businesses: ((businessesRes.data ?? []) as BusinessRow[]) ?? [],
  };
}

function normaliseType(raw?: string): SearchType {
  switch (raw) {
    case "events":
    case "marketplace":
    case "deals":
    case "businesses":
      return raw;
    default:
      return "all";
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const query = (searchParams.q ?? "").trim();
  const type = normaliseType(searchParams.type);
  const hasQuery = !!query;

  const results = hasQuery ? await runSearch(query) : null;

  // counts, respecting filter
  let totalCount = 0;
  if (results) {
    switch (type) {
      case "events":
        totalCount = results.events.length;
        break;
      case "marketplace":
        totalCount = results.listings.length;
        break;
      case "deals":
        totalCount = results.deals.length;
        break;
      case "businesses":
        totalCount = results.businesses.length;
        break;
      case "all":
      default:
        totalCount =
          results.events.length +
          results.listings.length +
          results.deals.length +
          results.businesses.length;
    }
  }

  const makeFilterHref = (t: SearchType) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (t !== "all") params.set("type", t);
    return `/search?${params.toString() || ""}`;
  };

  const showEvents = type === "all" || type === "events";
  const showMarketplace = type === "all" || type === "marketplace";
  const showDeals = type === "all" || type === "deals";
  const showBusinesses = type === "all" || type === "businesses";

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <section className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
            <SearchIcon className="h-5 w-5 text-[#D90429]" />
            <span>Search ManxHive</span>
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Search events, marketplace listings, deals and island businesses in
            one place.
          </p>
          {hasQuery && (
            <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">
              Showing results for{" "}
              <span className="font-semibold text-slate-900">
                &quot;{query}&quot;
              </span>{" "}
              · {totalCount} result{totalCount === 1 ? "" : "s"}
              {type !== "all" && (
                <>
                  {" "}
                  ·{" "}
                  <span className="capitalize font-semibold text-slate-900">
                    {type}
                  </span>{" "}
                  only
                </>
              )}
            </p>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 text-xs">
          <Link
            href={makeFilterHref("all")}
            className={`rounded-full px-3 py-1 font-medium ${
              type === "all"
                ? "bg-rose-50 text-[#D90429]"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            All
          </Link>
          <Link
            href={makeFilterHref("events")}
            className={`rounded-full px-3 py-1 font-medium ${
              type === "events"
                ? "bg-rose-50 text-[#D90429]"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            Events
          </Link>
          <Link
            href={makeFilterHref("marketplace")}
            className={`rounded-full px-3 py-1 font-medium ${
              type === "marketplace"
                ? "bg-rose-50 text-[#D90429]"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            Marketplace
          </Link>
          <Link
            href={makeFilterHref("deals")}
            className={`rounded-full px-3 py-1 font-medium ${
              type === "deals"
                ? "bg-rose-50 text-[#D90429]"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            Deals
          </Link>
          <Link
            href={makeFilterHref("businesses")}
            className={`rounded-full px-3 py-1 font-medium ${
              type === "businesses"
                ? "bg-rose-50 text-[#D90429]"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            Businesses
          </Link>
        </div>
      </section>

      {!hasQuery && (
        <section className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-sm text-slate-600">
          <p>
            Start typing in the search bar in the header to find anything on
            the island – events, listings, deals or local providers.
          </p>
          <p className="mt-2">
            Try things like{" "}
            <span className="font-semibold">
              &quot;Douglas fireworks&quot;, &quot;Peel bike&quot;,
              &quot;website design&quot; or &quot;pizza&quot;.
            </span>
          </p>
        </section>
      )}

      {hasQuery && (
        <>
          {totalCount === 0 && (
            <section className="mt-8 space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white px-6 py-8 text-center">
                <p className="text-sm font-semibold text-slate-900">
                  No results found for &quot;{query}&quot; in{" "}
                  <span className="font-semibold">{type}</span>.
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  If something&apos;s missing, it might just not be listed on
                  ManxHive yet.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs">
                  <Link
                    href="/list-business"
                    className="rounded-full bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800"
                  >
                    List a business
                  </Link>
                  <Link
                    href="/marketplace/create"
                    className="rounded-full bg-slate-50 px-4 py-2 font-semibold text-slate-800 hover:bg-slate-100"
                  >
                    Post a marketplace listing
                  </Link>
                  <Link
                    href="/whats-on/create"
                    className="rounded-full bg-rose-50 px-4 py-2 font-semibold text-[#D90429] hover:bg-rose-100"
                  >
                    Add an event
                  </Link>
                </div>
              </div>
            </section>
          )}

          {totalCount > 0 && (
            <section className="mt-6 grid gap-8 lg:grid-cols-2">
              {/* LEFT COLUMN: events + marketplace */}
              <div className="space-y-6">
                {/* Events */}
                {showEvents && (
                  <div className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-[#D90429]" />
                        <h2 className="text-sm font-semibold text-slate-900">
                          Events
                        </h2>
                      </div>
                      <Link
                        href="/whats-on"
                        className="text-xs font-medium text-[#D90429] hover:underline"
                      >
                        View What&apos;s On →
                      </Link>
                    </div>
                    {results!.events.length === 0 ? (
                      <p className="text-xs text-slate-500">
                        No events matched your search.
                      </p>
                    ) : (
                      <ul className="space-y-1.5 text-sm">
                        {results!.events.map((e) => (
                          <li key={e.id}>
                            <Link
                              href={`/whats-on/${e.id}`}
                              className="group block rounded-xl px-2 py-1 transition hover:bg-slate-50"
                            >
                              <div className="font-medium text-slate-900 group-hover:text-[#D90429]">
                                {highlight(e.title, query)}
                              </div>
                              <div className="text-xs text-slate-500">
                                {e.location}
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Marketplace */}
                {showMarketplace && (
                  <div className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-[#D90429]" />
                        <h2 className="text-sm font-semibold text-slate-900">
                          Marketplace listings
                        </h2>
                      </div>
                      <Link
                        href="/marketplace"
                        className="text-xs font-medium text-[#D90429] hover:underline"
                      >
                        View marketplace →
                      </Link>
                    </div>
                    {results!.listings.length === 0 ? (
                      <p className="text-xs text-slate-500">
                        No marketplace listings matched your search.
                      </p>
                    ) : (
                      <ul className="space-y-1.5 text-sm">
                        {results!.listings.map((l) => (
                          <li key={l.id}>
                            <Link
                              href={`/marketplace/item/${l.id}`}
                              className="group flex items-center gap-3 rounded-xl px-2 py-1 transition hover:bg-slate-50"
                            >
                              <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                                {l.imageUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={l.imageUrl}
                                    alt={l.title}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-500">
                                    {l.category?.slice(0, 3) ?? "Item"}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-slate-900 group-hover:text-[#D90429]">
                                  {highlight(l.title, query)}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {[l.area, l.category]
                                    .filter(Boolean)
                                    .join(" • ")}
                                </div>
                                {typeof l.price_pence === "number" && (
                                  <div className="text-xs font-semibold text-slate-900">
                                    £{(l.price_pence / 100).toFixed(0)}
                                  </div>
                                )}
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: deals + businesses */}
              <div className="space-y-6">
                {/* Deals */}
                {showDeals && (
                  <div className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-[#D90429]" />
                        <h2 className="text-sm font-semibold text-slate-900">
                          Local deals
                        </h2>
                      </div>
                      <Link
                        href="/deals"
                        className="text-xs font-medium text-[#D90429] hover:underline"
                      >
                        View all deals →
                      </Link>
                    </div>
                    {results!.deals.length === 0 ? (
                      <p className="text-xs text-slate-500">
                        No deals matched your search.
                      </p>
                    ) : (
                      <ul className="space-y-1.5 text-sm">
                        {results!.deals.map((d) => (
                          <li key={d.id}>
                            <Link
                              href={`/deals/${d.id}`}
                              className="group block rounded-xl px-2 py-1 transition hover:bg-slate-50"
                            >
                              <div className="font-medium text-slate-900 group-hover:text-[#D90429]">
                                {highlight(d.title, query)}
                              </div>
                              <div className="text-xs text-slate-500">
                                {[d.business_name, d.area]
                                  .filter(Boolean)
                                  .join(" • ")}
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Businesses */}
                {showBusinesses && (
                  <div className="pb-1">
                    <div className="mb-2 flex items-center gap-2">
                      <Store className="h-4 w-4 text-[#D90429]" />
                      <h2 className="text-sm font-semibold text-slate-900">
                        Island businesses
                      </h2>
                    </div>
                    {results!.businesses.length === 0 ? (
                      <p className="text-xs text-slate-500">
                        No businesses matched your search.
                      </p>
                    ) : (
                      <ul className="space-y-1.5 text-sm">
                        {results!.businesses.map((b) => (
                          <li key={b.id}>
                            <Link
                              href={`/businesses/${b.id}`}
                              className="group flex items-center gap-3 rounded-xl px-2 py-1 transition hover:bg-slate-50"
                            >
                              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs">
                                {businessEmoji(b.category)}
                              </div>
                              <div>
                                <div className="font-medium text-slate-900 group-hover:text-[#D90429]">
                                  {highlight(b.name, query)}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {[b.area, b.category]
                                    .filter(Boolean)
                                    .join(" • ")}
                                </div>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}