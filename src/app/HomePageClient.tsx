"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { CalendarDays, Tag, Sparkles, Trophy, Users } from "lucide-react";

type EventPreview = { id: string; name: string; meta: string };
type ListingPreview = {
  id: string;
  title: string;
  meta: string;
  price?: string | null;
  imageUrl?: string | null;
};
type DealPreview = {
  id: string;
  title: string;
  meta: string;
  endsAt?: string | null;
};
type SportsPreview = { id: string; title: string; meta: string };
type CommunityPreview = { id: string; title: string; meta: string };

type FeaturedBusiness = {
  id: string;
  name: string;
  slug: string | null;
  area: string | null;
  category: string | null;
  logoUrl: string | null;
  headline: string | null;
  tagline: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
};

// ---- FALLBACK MOCK DATA (non-marketplace only) ----

const FALLBACK_EVENTS: EventPreview[] = [
  {
    id: "mock-1",
    name: "Port Erin Fireworks Night",
    meta: "Fri 7:30pm • Port Erin",
  },
  {
    id: "mock-2",
    name: "Douglas Xmas Light Switch On",
    meta: "Sat 6pm • Douglas",
  },
];

// NOTE: no fallback listings – boosted section is *real data only*.

const FALLBACK_DEALS: DealPreview[] = [
  {
    id: "mock-1",
    title: "New Website",
    meta: "ManxHive • FREE WEBSITE TODAY • Douglas",
  },
];

const FALLBACK_SPORTS: SportsPreview[] = [
  {
    id: "mock-1",
    title: "St Mary’s 2 – 1 Peel",
    meta: "IOM Premier League • Full time",
  },
  {
    id: "mock-2",
    title: "Vikings A 31 – 24 Bacchas A",
    meta: "Hockey • Full time",
  },
];

const FALLBACK_COMMUNITY: CommunityPreview[] = [
  {
    id: "mock-1",
    title: "Local maker spotlight: Laxey knitwear",
    meta: "Community stories",
  },
  {
    id: "mock-2",
    title: "Volunteer drives that actually need help",
    meta: "Community, causes & clubs",
  },
];

export default function HomePageClient() {
  const supabase = supabaseBrowser();

  const [events, setEvents] = useState<EventPreview[]>(FALLBACK_EVENTS);
  const [listings, setListings] = useState<ListingPreview[]>([]);
  const [deals, setDeals] = useState<DealPreview[]>(FALLBACK_DEALS);
  const [sports, setSports] = useState<SportsPreview[]>(FALLBACK_SPORTS);
  const [community, setCommunity] =
    useState<CommunityPreview[]>(FALLBACK_COMMUNITY);

  // Multiple featured businesses + rotation index
  const [featuredBusinesses, setFeaturedBusinesses] = useState<
    FeaturedBusiness[]
  >([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  const [_loadError, setLoadError] = useState<string | null>(null);

  // ---- LOAD HOMEPAGE PREVIEW DATA ----
  useEffect(() => {
    setLoadError(null);
    if (!supabase) return;

    (async () => {
      try {
        // 1) Events (id, title, venue, starts_at)
        {
          const nowIso = new Date().toISOString();
          const { data, error } = await supabase
            .from("events")
            .select("id, title, venue, starts_at")
            .eq("approved", true)
            .gte("starts_at", nowIso)
            .order("starts_at", { ascending: true })
            .limit(10);

          if (!error && data && data.length) {
            const mapped: EventPreview[] = data.map((e: any) => {
              const startsAt = e.starts_at ? new Date(e.starts_at) : null;
              const when = startsAt
                ? startsAt.toLocaleString("en-GB", {
                    weekday: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : null;

              return {
                id: String(e.id),
                name: e.title ?? "Untitled event",
                meta: [when, e.venue].filter(Boolean).join(" • ") || "",
              };
            });
            setEvents(mapped);
          }
        }

        // 2) Boosted marketplace listings (for the "Boosted marketplace" section)
        {
          const { data, error } = await supabase
            .from("marketplace_listings")
            .select(
              "id, title, category, area, date_listed, price_pence, images, boosted"
            )
            .eq("approved", true)
            .eq("boosted", true)
            .order("date_listed", { ascending: false })
            .limit(3);

          if (!error && data && data.length) {
            const mapped: ListingPreview[] = data.map((l: any) => {
              const price =
                typeof l.price_pence === "number"
                  ? `£${(l.price_pence / 100).toFixed(0)}`
                  : null;

              let imageUrl: string | null = null;
              if (Array.isArray(l.images)) {
                imageUrl = l.images[0] ?? null;
              } else if (typeof l.images === "string") {
                imageUrl = l.images;
              }

              return {
                id: String(l.id),
                title: l.title ?? "Untitled listing",
                meta: [l.area, l.category].filter(Boolean).join(" • ") || "",
                price,
                imageUrl,
              };
            });

            setListings(mapped);
          } else {
            // No boosted listings right now
            setListings([]);
          }
        }

        // 3) Deals (with valid_until for “ending soon”)
        {
          const { data, error } = await supabase
            .from("deals")
            .select("id, title, business_name, area, valid_until")
            .eq("approved", true)
            .order("created_at", { ascending: false })
            .limit(20);

          if (!error && data && data.length) {
            setDeals(
              data.map((d: any) => ({
                id: String(d.id),
                title: d.title ?? "Untitled deal",
                meta:
                  [d.business_name, d.area]
                    .filter(Boolean)
                    .join(" • ") || "",
                endsAt: d.valid_until ?? null,
              }))
            );
          }
        }

        // 4) Sports (simple recent results feed)
        {
          const { data, error } = await supabase
            .from("sports_results")
            .select("id, title, meta, created_at")
            .order("created_at", { ascending: false })
            .limit(5);

          if (!error && data && data.length) {
            setSports(
              data.map((r: any) => ({
                id: String(r.id),
                title: r.title ?? "Result",
                meta: r.meta ?? "",
              }))
            );
          }
        }

        // 5) Community
        {
          const { data, error } = await supabase
            .from("community_articles")
            .select("id, title, summary, published_at")
            .order("published_at", { ascending: false })
            .limit(5);

          if (!error && data && data.length) {
            setCommunity(
              data.map((c: any) => ({
                id: String(c.id),
                title: c.title ?? "Community story",
                meta: c.summary
                  ? String(c.summary).slice(0, 80) + "…"
                  : "",
              }))
            );
          }
        }

        // 6) Featured businesses – allow multiple & rotate
        {
          const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

          const { data, error } = await supabase
            .from("businesses")
            .select(
              "id, slug, name, area, category, logo_url, featured_headline, featured_tagline, featured_cta_label, featured_cta_url, featured_until, featured_on_home"
            )
            .eq("featured_on_home", true)
            .or(`featured_until.is.null,featured_until.gte.${today}`)
            .order("featured_until", { ascending: true, nullsFirst: true })
            .limit(10);

          console.log("[home] featured query result", { data, error });

          if (!error && data && data.length) {
            const mapped: FeaturedBusiness[] = data.map((b: any) => ({
              id: String(b.id),
              name: b.name ?? "Featured business",
              slug: b.slug ?? null,
              area: b.area ?? null,
              category: b.category ?? null,
              logoUrl: b.logo_url ?? null,
              headline: b.featured_headline ?? null,
              tagline: b.featured_tagline ?? null,
              ctaLabel: b.featured_cta_label ?? null,
              ctaUrl: b.featured_cta_url ?? null,
            }));
            setFeaturedBusinesses(mapped);
            setFeaturedIndex(0);
          } else {
            setFeaturedBusinesses([]);
            setFeaturedIndex(0);
          }

          setFeaturedLoading(false);
        }
      } catch (err) {
        console.error("[home] load previews error", err);
        setLoadError("Could not load live previews.");
        setFeaturedLoading(false);
        setListings([]);
      }
    })();

    // run once on mount – we don't want to keep resetting featuredIndex
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- ROTATE FEATURED BUSINESSES ----
  useEffect(() => {
    if (featuredBusinesses.length <= 1) return;

    const intervalId = window.setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % featuredBusinesses.length);
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [featuredBusinesses.length]);

  // ---- DERIVED DATA ----
  const primaryEvent = events[0] ?? FALLBACK_EVENTS[0];
  const primarySport = sports[0] ?? FALLBACK_SPORTS[0];
  const primaryDeal = deals[0] ?? FALLBACK_DEALS[0];

  // For hero card: up to 2 events & 2 deals
  const featuredEvents = (events.length ? events : FALLBACK_EVENTS).slice(
    0,
    2
  );
  const featuredDeals = (deals.length ? deals : FALLBACK_DEALS).slice(0, 2);

  const featuredBusiness =
    featuredBusinesses.length > 0 ? featuredBusinesses[featuredIndex] : null;

  const featuredHref =
    featuredBusiness &&
    (featuredBusiness.ctaUrl ||
      (featuredBusiness.slug
        ? `/businesses/${featuredBusiness.slug}`
        : "/businesses"));

  // For bottom cards: ending soon deals + community highlights
  const endingSoonDeals = deals
    .filter((d) => d.endsAt)
    .sort((a, b) => {
      const aTime = a.endsAt ? new Date(a.endsAt).getTime() : Infinity;
      const bTime = b.endsAt ? new Date(b.endsAt).getTime() : Infinity;
      return aTime - bTime;
    })
    .slice(0, 3);

  const highlightedCommunity = community.slice(0, 3);

  const tickerItems = [
    `Event: ${primaryEvent.name}`,
    `Sports: ${primarySport.title}`,
    `Deal: ${primaryDeal.title}`,
  ];

  console.log("[home] featuredBusiness state", {
    featuredBusinesses,
    featuredIndex,
    current: featuredBusiness,
  });

  // ---- RENDER ----
  return (
    <div className="relative bg-slate-50">
      {/* Soft hero wash – now fades cleanly into bg-slate-50 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] -z-10 bg-[radial-gradient(circle_at_top,_rgba(217,4,41,0.14)_0%,_rgba(249,250,251,1)_65%,_rgba(249,250,251,1)_100%)]"
      />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        {/* HERO */}
        <section className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl space-y-6">
            <div className="flex flex-wrap gap-3 text-xs font-medium text-[#D90429]">
              <span>Events</span>
              <span className="text-slate-300">•</span>
              <span>Marketplace</span>
              <span className="text-slate-300">•</span>
              <span>Deals</span>
              <span className="text-slate-300">•</span>
              <span>Sports</span>
              <span className="text-slate-300">•</span>
              <span>Community</span>
            </div>

            <h1 className="text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Your connection to Isle of Man life.
            </h1>

            <p className="max-w-2xl text-base text-slate-700">
              See what&apos;s on, browse local listings, grab genuine offers,
              and discover island businesses in one simple hub — built for
              residents, clubs, organisers and independents.
            </p>

            <div className="flex flex-wrap gap-3 pt-1 text-sm">
              <Link
                href="/whats-on"
                className="inline-flex items-center rounded-full bg-[#D90429] px-6 py-3 font-semibold text-white shadow-sm transition-transform transition-colors hover:-translate-y-0.5 hover:bg-[#b80321]"
              >
                Browse What&apos;s On
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex items-center rounded-full bg-slate-900 px-6 py-3 font-semibold text-white shadow-sm transition-transform transition-colors hover:-translate-y-0.5 hover:bg-slate-800"
              >
                View Marketplace
              </Link>
              <Link
                href="/deals"
                className="inline-flex items-center rounded-full bg-rose-50 px-6 py-3 font-semibold text-[#D90429] shadow-sm transition-transform transition-colors hover:-translate-y-0.5 hover:bg-rose-100"
              >
                See Local Deals
              </Link>
            </div>

            {/* Popular on ManxHive strip */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Popular on ManxHive
              </span>
              <Link
                href="/whats-on#family-days-out"
                className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-900 hover:bg-slate-100"
              >
                Family days out
              </Link>
              <Link
                href="/marketplace?type=car"
                className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-900 hover:bg-slate-100"
              >
                Motors &amp; marketplace
              </Link>
            </div>
          </div>

          {/* Featured this week card: 2 events + 2 deals */}
          <div className="relative w-full max-w-md">
            <div className="rounded-3xl bg-gradient-to-br from-white/60 via-slate-100 to-slate-200 p-[1px] shadow-[0_18px_60px_rgba(15,23,42,0.20)]">
              <div className="rounded-[1.4rem] border border-white/70 bg-white/80 px-6 py-5 backdrop-blur-md">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#D90429]">
                  Featured this week
                </p>

                {/* Events */}
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Events
                  </p>
                  <ul className="mt-1 space-y-1">
                    {featuredEvents.map((e) => {
                      const href = e.id.startsWith("mock-")
                        ? "/whats-on"
                        : `/whats-on/${e.id}`;
                      return (
                        <li key={e.id}>
                          <Link
                            href={href}
                            className="block text-sm font-semibold text-slate-900 hover:text-[#D90429]"
                          >
                            {e.name}
                          </Link>
                          {e.meta && (
                            <p className="text-xs text-slate-500">{e.meta}</p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Deals */}
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Deals
                  </p>
                  <ul className="mt-1 space-y-1">
                    {featuredDeals.map((d) => {
                      const href = d.id.startsWith("mock-")
                        ? "/deals"
                        : `/deals/${d.id}`;
                      return (
                        <li key={d.id}>
                          <Link
                            href={href}
                            className="block text-sm font-semibold text-slate-900 hover:text-[#D90429]"
                          >
                            {d.title}
                          </Link>
                          {d.meta && (
                            <p className="text-xs text-slate-500">{d.meta}</p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <p className="mt-4 text-[11px] text-slate-500">
                  These placements also appear in their main sections below.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Live ticker */}
        <section className="mt-10">
          <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-slate-100 bg-white/90 px-4 py-3 text-xs shadow-sm backdrop-blur-sm sm:px-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
              </span>
              <span>Live on the island right now</span>
            </div>

            <div className="hidden h-4 w-px bg-slate-200 sm:block" />

            {/* Ticker strip */}
            <div className="relative flex-1 overflow-hidden">
              <div className="flex gap-6 whitespace-nowrap text-xs text-slate-600 animate-ticker">
                {tickerItems.map((t, idx) => (
                  <span key={idx} className="flex items-center gap-1">
                    {idx > 0 && (
                      <span className="hidden text-slate-300 sm:inline">•</span>
                    )}
                    <span>{t}</span>
                  </span>
                ))}
                {/* Duplicate content for seamless loop */}
                {tickerItems.map((t, idx) => (
                  <span
                    key={`dup-${idx}`}
                    aria-hidden="true"
                    className="flex items-center gap-1"
                  >
                    <span className="hidden text-slate-300 sm:inline">•</span>
                    <span>{t}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Featured business (under live ticker) */}
        <section className="mt-8">
          <div className="flex flex-col gap-3 rounded-3xl border border-slate-100 bg-white px-6 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            {featuredLoading ? (
              // Skeleton while featured business loads
              <div className="flex w-full items-center justify-between gap-4 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="hidden h-12 w-12 flex-shrink-0 rounded-2xl bg-slate-100 sm:block" />
                  <div className="space-y-2">
                    <div className="h-3 w-24 rounded bg-slate-100" />
                    <div className="h-4 w-48 rounded bg-slate-100" />
                    <div className="h-3 w-40 rounded bg-slate-100" />
                    <div className="h-3 w-56 rounded bg-slate-100" />
                  </div>
                </div>
                <div className="h-8 w-28 rounded-full bg-slate-100" />
              </div>
            ) : featuredBusiness ? (
              <>
                <div className="flex items-start gap-3">
                  <div className="hidden h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-xl sm:flex">
                    {featuredBusiness.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={featuredBusiness.logoUrl}
                        alt={featuredBusiness.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>📍</span>
                    )}
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#D90429]">
                      Featured business
                    </p>
                    <h2 className="mt-1 text-base font-semibold text-slate-900">
                      {featuredBusiness.name}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {[featuredBusiness.area, featuredBusiness.category]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                    {featuredBusiness.headline && (
                      <p className="mt-1 text-xs text-slate-700">
                        {featuredBusiness.headline}
                      </p>
                    )}
                    {featuredBusiness.tagline && (
                      <p className="mt-1 text-xs text-slate-500">
                        {featuredBusiness.tagline}
                      </p>
                    )}
                  </div>
                </div>
                {featuredHref && (
                  <Link
                    href={featuredHref}
                    className="inline-flex items-center rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                  >
                    {featuredBusiness.ctaLabel || "View business"} →
                  </Link>
                )}
              </>
            ) : (
              <>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#D90429]">
                    Featured business
                  </p>
                  <h2 className="mt-1 text-base font-semibold text-slate-900">
                    Put your business in front of the whole island.
                  </h2>
                  <p className="mt-1 text-xs text-slate-600">
                    Premium homepage slot for launches, campaigns or big
                    announcements.
                  </p>
                </div>
                <Link
                  href="/promote"
                  className="inline-flex items-center rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                >
                  Enquire about featured slot →
                </Link>
              </>
            )}
          </div>
        </section>

        {/* MAIN SECTIONS */}
        <section className="mt-12 space-y-10">
          {/* Row 1: Boosted marketplace + Deals */}
          <div className="grid gap-10 md:grid-cols-2">
            {/* Marketplace (boosted) */}
            <div className="border-b border-slate-100 pb-4 md:border-none md:pb-0">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-[#D90429]" />
                    <h2 className="text-lg font-semibold text-slate-900">
                      Boosted marketplace listings
                    </h2>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    Featured items with extra visibility across the island.
                  </p>
                </div>
                <Link
                  href="/marketplace"
                  className="text-xs font-medium text-[#D90429] hover:underline"
                >
                  View more listings →
                </Link>
              </div>

              {listings.length === 0 ? (
                <p className="mt-3 text-xs text-slate-500">
                  No boosted listings right now. Your promoted items will appear
                  here when they&apos;re live.
                </p>
              ) : (
                <ul className="mt-3 space-y-3 text-sm">
                  {listings.slice(0, 3).map((l) => {
                    const href = `/marketplace/item/${l.id}`;
                    return (
                      <li key={l.id}>
                        <Link
                          href={href}
                          className="group flex items-center gap-3 rounded-xl px-2 py-1 transition hover:bg-slate-50"
                        >
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-[10px] text-slate-500">
                            {l.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={l.imageUrl}
                                alt={l.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              (l.title ?? "Item").slice(0, 4)
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 group-hover:text-[#D90429]">
                              {l.title}
                            </div>
                            <div className="text-xs text-slate-500">
                              {l.meta}
                            </div>
                            {l.price && (
                              <div className="text-xs font-semibold text-slate-900">
                                {l.price}
                              </div>
                            )}
                            <p className="mt-0.5 text-[11px] text-slate-500 group-hover:text-[#D90429]">
                              View listing →
                            </p>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Deals */}
            <div className="border-b border-slate-100 pb-4 md:border-none md:pb-0">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#D90429]" />
                    <h2 className="text-lg font-semibold text-slate-900">
                      Latest local deals
                    </h2>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    Genuine offers from island businesses.
                  </p>
                </div>
                <Link
                  href="/deals"
                  className="text-xs font-medium text-[#D90429] hover:underline"
                >
                  View all deals →
                </Link>
              </div>

              <ul className="mt-3 space-y-3 text-sm">
                {deals.slice(0, 3).map((d) => {
                  const href = d.id.startsWith("mock-")
                    ? "/deals"
                    : `/deals/${d.id}`;
                  return (
                    <li key={d.id}>
                      <Link
                        href={href}
                        className="group block rounded-xl px-2 py-1 transition hover:bg-slate-50"
                      >
                        <div className="font-medium text-slate-900 group-hover:text-[#D90429]">
                          {d.title}
                        </div>
                        <div className="text-xs text-slate-500">
                          {d.meta}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Row 2: What’s On + Sports */}
          <div className="grid gap-10 md:grid-cols-2">
            {/* What’s On */}
            <div className="border-b border-slate-100 pb-4 md:border-none md:pb-0">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-[#D90429]" />
                    <h2 className="text-lg font-semibold text-slate-900">
                      What&apos;s On this week
                    </h2>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    Gigs, markets, family days and island events coming up.
                  </p>
                </div>
                <Link
                  href="/whats-on"
                  className="text-xs font-medium text-[#D90429] hover:underline"
                >
                  View all events →
                </Link>
              </div>

              <ul className="mt-3 space-y-3 text-sm">
                {events.slice(0, 3).map((e) => {
                  const href = e.id.startsWith("mock-")
                    ? "/whats-on"
                    : `/whats-on/${e.id}`;
                  return (
                    <li key={e.id}>
                      <Link
                        href={href}
                        className="group block rounded-xl px-2 py-1 transition hover:bg-slate-50"
                      >
                        <div className="font-medium text-slate-900 group-hover:text-[#D90429]">
                          {e.name}
                        </div>
                        {e.meta && (
                          <div className="text-xs text-slate-500">
                            {e.meta}
                          </div>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Sports */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-[#D90429]" />
                    <h2 className="text-lg font-semibold text-slate-900">
                      Island sports results
                    </h2>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    Football, hockey &amp; more — latest island results.
                  </p>
                </div>
                <Link
                  href="/sports"
                  className="text-xs font-medium text-[#D90429] hover:underline"
                >
                  Go to sports hub →
                </Link>
              </div>

              <ul className="mt-3 space-y-3 text-sm">
                {sports.slice(0, 3).map((s) => (
                  <li key={s.id}>
                    <Link
                      href="/sports"
                      className="group block rounded-xl px-2 py-1 transition hover:bg-slate-50"
                    >
                      <div className="font-medium text-slate-900 group-hover:text-[#D90429]">
                        {s.title}
                      </div>
                      {s.meta && (
                        <div className="text-xs text-slate-500">
                          {s.meta}
                        </div>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Row 3: Community + providers promo */}
          <div className="grid gap-10 md:grid-cols-2">
            {/* Community stories */}
            <div className="border-b border-slate-100 pb-4 md:border-none md:pb-0">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#D90429]" />
                    <h2 className="text-lg font-semibold text-slate-900">
                      Community stories &amp; spotlights
                    </h2>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    Makers, clubs, volunteers and local wins.
                  </p>
                </div>
                <Link
                  href="/community-spotlight"
                  className="text-xs font-medium text-[#D90429] hover:underline"
                >
                  View all stories →
                </Link>
              </div>

              <ul className="mt-3 space-y-3 text-sm">
                {community.slice(0, 3).map((c) => (
                  <li key={c.id}>
                    <Link
                      href="/community-spotlight"
                      className="group block rounded-xl px-2 py-1 transition hover:bg-slate-50"
                    >
                      <div className="font-medium text-slate-900 group-hover:text-[#D90429]">
                        {c.title}
                      </div>
                      {c.meta && (
                        <div className="text-xs text-slate-500">
                          {c.meta}
                        </div>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Providers promo */}
            <div className="rounded-3xl bg-slate-900 px-6 py-6 text-white shadow-[0_16px_40px_rgba(15,23,42,0.5)]">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#FBBF77]">
                Need a trusted local service?
              </p>
              <h2 className="mt-2 text-xl font-semibold">
                Browse island providers for trades, home services, beauty,
                fitness and more.
              </h2>
              <p className="mt-2 text-sm text-slate-200">
                Find vetted local services and independents, or list your own
                business in a few minutes.
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs">
                <Link
                  href="/providers"
                  className="inline-flex items-center rounded-full bg-white px-4 py-2 font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Browse providers
                </Link>
                <Link
                  href="/list-business"
                  className="inline-flex items-center rounded-full bg-slate-800 px-4 py-2 font-semibold text-white transition hover:bg-slate-700"
                >
                  List your business
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM SECTION – Ending soon + Community highlights */}
        <section className="mt-16 space-y-8">
          {/* Heading row – “New” pill removed */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">
              What to catch next
            </h2>
            <p className="text-sm text-slate-600">
              Don&apos;t miss these limited-time deals and community stories.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Ending soon deals */}
            <div className="rounded-3xl border border-slate-100 bg-white/95 px-6 py-5 shadow-sm backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#D90429]">
                Ending soon – deals
              </p>

              {endingSoonDeals.length === 0 ? (
                <p className="mt-3 text-xs text-slate-500">
                  No time-limited deals right now. New offers will appear here
                  as they approach their end date.
                </p>
              ) : (
                <ul className="mt-3 space-y-3 text-sm">
                  {endingSoonDeals.map((d) => {
                    const href = d.id.startsWith("mock-")
                      ? "/deals"
                      : `/deals/${d.id}`;
                    const endsLabel = d.endsAt
                      ? new Date(d.endsAt).toLocaleDateString("en-GB", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })
                      : null;
                    return (
                      <li key={d.id}>
                        <Link
                          href={href}
                          className="group block rounded-xl px-2 py-1 transition hover:bg-slate-50"
                        >
                          <div className="font-medium text-slate-900 group-hover:text-[#D90429]">
                            {d.title}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span>{d.meta}</span>
                            {endsLabel && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="font-semibold text-slate-900">
                                  Ends {endsLabel}
                                </span>
                              </>
                            )}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Community highlights */}
            <div className="rounded-3xl border border-slate-100 bg-white/95 px-6 py-5 shadow-sm backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#D90429]">
                Community highlights
              </p>

              {highlightedCommunity.length === 0 ? (
                <p className="mt-3 text-xs text-slate-500">
                  No community stories selected yet. New spotlights will appear
                  here as they&apos;re added.
                </p>
              ) : (
                <ul className="mt-3 space-y-3 text-sm">
                  {highlightedCommunity.map((c) => (
                    <li key={c.id}>
                      <Link
                        href="/community-spotlight"
                        className="group block rounded-xl px-2 py-1 transition hover:bg-slate-50"
                      >
                        <div className="font-medium text-slate-900 group-hover:text-[#D90429]">
                          {c.title}
                        </div>
                        {c.meta && (
                          <div className="text-xs text-slate-500">
                            {c.meta}
                          </div>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Promo banner */}
          <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 px-6 py-8 text-white shadow-[0_20px_60px_rgba(15,23,42,0.65)] sm:px-8 lg:px-10">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#FBBF77]">
              Promote on ManxHive
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              Get your event, listing or deal boosted on the homepage.
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-200">
              Boosted placements appear in their main section and again in key
              homepage slots — ideal for launches, campaigns or big
              announcements.
            </p>
            <Link
              href="/promote"
              className="mt-5 inline-flex items-center rounded-full bg-white px-5 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Enquire about boosted slots →
            </Link>
          </div>
        </section>
      </main>

      {/* Local CSS for ticker animation */}
      <style jsx>{`
        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-ticker {
          animation: ticker 28s linear infinite;
        }
      `}</style>
    </div>
  );
}