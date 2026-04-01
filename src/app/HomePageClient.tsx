"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { HOME_HERO_SLIDES } from "@/lib/images";
import {
  CalendarDays,
  Tag,
  Trophy,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Sun,
  Cloud,
  CloudSun,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Droplets,
} from "lucide-react";

// ── TYPES ────────────────────────────────────────────────────────────────────

type EventPreview = {
  id: string;
  name: string;
  meta: string;
  startsAt?: string | null;
  imageUrl?: string | null;
};

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
  businessName?: string | null;
  endsAt?: string | null;
  imageUrl?: string | null;
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
  imageUrl: string | null;
  headline: string | null;
  tagline: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
};

type BoostedBusiness = {
  id: string;
  name: string;
  slug: string | null;
  area: string | null;
  category: string | null;
  logoUrl: string | null;
  imageUrl: string | null;
  headline: string | null;
  tagline: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
};

type HeritagePreview = {
  id: string;
  name: string;
  slug: string;
  area: string | null;
  tagline: string | null;
  description: string | null;
  imageUrl: string | null;
};

type WalkPreview = {
  id: string;
  name: string;
  slug: string;
  area: string | null;
  summary: string | null;
  description: string | null;
  distanceKm: number | null;
  durationMinutes: number | null;
  difficulty: string | null;
  imageUrl: string | null;
};

// ── WEATHER ───────────────────────────────────────────────────────────────────

const WEATHER_LOCATIONS = [
  { name: "Douglas",   area: "Capital",    lat: 54.1526, lon: -4.4860 },
  { name: "Ramsey",    area: "North",      lat: 54.3229, lon: -4.3840 },
  { name: "Peel",      area: "West Coast", lat: 54.2235, lon: -4.6960 },
  { name: "Port Erin", area: "South",      lat: 54.0858, lon: -4.7502 },
] as const;

type WeatherReading = {
  temp: number;
  feelsLike: number;
  code: number;
  windSpeed: number;
  windDir: number;
  humidity: number;
};

type LocationWeather = {
  name: string;
  area: string;
  reading: WeatherReading | null;
};

function wmoLabel(code: number): string {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code <= 48) return "Foggy";
  if (code <= 55) return "Drizzle";
  if (code <= 65) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Showers";
  if (code <= 86) return "Snow showers";
  return "Thunderstorm";
}

function windDirLabel(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

function WmoIcon({ code, className }: { code: number; className?: string }) {
  if (code === 0) return <Sun className={className} />;
  if (code <= 2) return <CloudSun className={className} />;
  if (code === 3) return <Cloud className={className} />;
  if (code <= 48) return <Cloud className={className} />;
  if (code <= 55) return <CloudDrizzle className={className} />;
  if (code <= 65) return <CloudRain className={className} />;
  if (code <= 77) return <CloudSnow className={className} />;
  if (code <= 82) return <CloudRain className={className} />;
  if (code <= 86) return <CloudSnow className={className} />;
  return <CloudLightning className={className} />;
}

// ── FALLBACK MOCK DATA ────────────────────────────────────────────────────────

const FALLBACK_EVENTS: EventPreview[] = [
  {
    id: "mock-1",
    name: "Port Erin Fireworks Night",
    meta: "Fri 7:30pm • Port Erin",
    startsAt: new Date().toISOString(),
  },
  {
    id: "mock-2",
    name: "Douglas Xmas Light Switch On",
    meta: "Sat 6pm • Douglas",
    startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
];

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
    title: "St Mary's 2 – 1 Peel",
    meta: "IOM Premier League • Full time",
  },
  {
    id: "mock-2",
    title: "Vikings A 31 – 24 Bacchas A",
    meta: "Hockey • Full time",
  },
];

// ── HOMEPAGE HERO SLIDES — edit src/lib/images.ts to update ──────────────────

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

// ── HELPERS ───────────────────────────────────────────────────────────────────

function getWeekendRange() {
  const now = new Date();
  const day = now.getDay();
  const daysToFriday = (5 - day + 7) % 7;
  const start = new Date(now);
  start.setDate(now.getDate() + daysToFriday);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 3);
  return { start, end };
}

function isWithinWeekend(startsAt?: string | null) {
  if (!startsAt) return false;
  const date = new Date(startsAt);
  if (Number.isNaN(date.getTime())) return false;
  const { start, end } = getWeekendRange();
  return date >= start && date < end;
}

function clampText(text: string | null | undefined, max = 140) {
  const t = (text ?? "").trim();
  if (!t) return "";
  if (t.length <= max) return t;
  return t.slice(0, max).trim() + "…";
}

// ── COUNT-UP HOOK ─────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1800, active = false): number {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf: number;
    const t0 = performance.now();
    function tick(now: number) {
      const progress = Math.min((now - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(ease * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);
  return val;
}

// ── SCORE TICKER ──────────────────────────────────────────────────────────────

function ScoreTicker({ items }: { items: SportsPreview[] }) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (items.length <= 1) return;
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % items.length);
        setVisible(true);
      }, 300);
    }, 3800);
    return () => clearInterval(id);
  }, [items.length]);

  if (!items.length) return null;
  const item = items[idx];

  return (
    <div className="mt-8 flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2.5 shadow-sm w-fit max-w-full overflow-hidden">
      <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[#E8002D] animate-pulse-dot" />
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 flex-shrink-0">
        LIVE
      </span>
      <span
        className="text-xs font-semibold text-slate-800 truncate transition-all duration-300"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-5px)",
        }}
      >
        {item.title}
        {item.meta && (
          <span className="ml-1.5 font-normal text-slate-500">· {item.meta}</span>
        )}
      </span>
      <Link
        href="/sports"
        className="flex-shrink-0 text-[10px] font-semibold text-[#E8002D] hover:underline ml-1"
      >
        More →
      </Link>
    </div>
  );
}

// ── HERO TAB PANEL ────────────────────────────────────────────────────────────

type HeroTab = "events" | "deals" | "scores";

function HeroTabPanel({
  events,
  deals,
  scores,
}: {
  events: EventPreview[];
  deals: DealPreview[];
  scores: SportsPreview[];
}) {
  const [tab, setTab] = useState<HeroTab>("events");

  const tabs: { id: HeroTab; label: string }[] = [
    { id: "events", label: "Events" },
    { id: "deals", label: "Deals" },
    { id: "scores", label: "Scores" },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.07)] overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-slate-100">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              tab === t.id
                ? "text-[#E8002D] border-b-2 border-[#E8002D] -mb-px"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="divide-y divide-slate-50 min-h-[280px]">
        {tab === "events" &&
          (events.length ? events : FALLBACK_EVENTS).slice(0, 5).map((e) => {
            const href = e.id.startsWith("mock-") ? "/whats-on" : `/whats-on/${e.id}`;
            return (
              <Link
                key={e.id}
                href={href}
                className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors group"
              >
                <CalendarDays className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E8002D]" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 group-hover:text-[#E8002D] transition-colors line-clamp-1">
                    {e.name}
                  </p>
                  {e.meta && (
                    <p className="text-[11px] text-slate-500 mt-0.5">{e.meta}</p>
                  )}
                </div>
              </Link>
            );
          })}

        {tab === "deals" &&
          (deals.length ? deals : FALLBACK_DEALS).slice(0, 5).map((d) => {
            const href = d.id.startsWith("mock-") ? "/deals" : `/deals/${d.id}`;
            return (
              <Link
                key={d.id}
                href={href}
                className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors group"
              >
                <Tag className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E8002D]" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 group-hover:text-[#E8002D] transition-colors line-clamp-1">
                    {d.title}
                  </p>
                  {d.meta && (
                    <p className="text-[11px] text-slate-500 mt-0.5">{d.meta}</p>
                  )}
                </div>
              </Link>
            );
          })}

        {tab === "scores" &&
          (scores.length ? scores : FALLBACK_SPORTS).slice(0, 5).map((s) => (
            <Link
              key={s.id}
              href="/sports"
              className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors group"
            >
              <Trophy className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E8002D]" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 group-hover:text-[#E8002D] transition-colors">
                  {s.title}
                </p>
                {s.meta && (
                  <p className="text-[11px] text-slate-500 mt-0.5">{s.meta}</p>
                )}
              </div>
            </Link>
          ))}
      </div>

      {/* Footer CTA */}
      <div className="border-t border-slate-100 px-5 py-3 bg-slate-50/60">
        <Link
          href={tab === "events" ? "/whats-on" : tab === "deals" ? "/deals" : "/sports"}
          className="text-xs font-semibold text-[#E8002D] hover:underline"
        >
          View all {tab === "scores" ? "results" : tab} →
        </Link>
      </div>
    </div>
  );
}

// ── STAT PILL ─────────────────────────────────────────────────────────────────

function StatPill({
  value,
  suffix = "",
  label,
  delay = 0,
  active,
}: {
  value: number;
  suffix?: string;
  label: string;
  delay?: number;
  active: boolean;
}) {
  const count = useCountUp(value, 1600, active);
  return (
    <div
      className="flex flex-col"
      style={{
        opacity: active ? 1 : 0,
        transform: active ? "translateY(0)" : "translateY(10px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      <span className="font-playfair text-3xl sm:text-4xl font-bold text-slate-900">
        {count.toLocaleString()}
        {suffix}
      </span>
      <span className="mt-1 text-xs font-medium text-slate-500 uppercase tracking-[0.12em]">
        {label}
      </span>
    </div>
  );
}

// ── SECTION HEADER ────────────────────────────────────────────────────────────

function SectionHeader({
  eyebrow,
  title,
  href,
  cta,
}: {
  eyebrow: string;
  title: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-1.5">
          {eyebrow}
        </p>
        <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-slate-900">
          {title}
        </h2>
      </div>
      <Link
        href={href}
        className="text-sm font-semibold text-[#E8002D] hover:underline pb-0.5"
      >
        {cta} →
      </Link>
    </div>
  );
}

// ── EXPLORE PANEL ─────────────────────────────────────────────────────────────

function ExplorePanel({
  title,
  eyebrow,
  item,
  href,
  ctaLabel,
  metaLine,
  summary,
  activeIndex,
  onPrev,
  onNext,
  total,
}: {
  title: string;
  eyebrow: string;
  item: { name: string; imageUrl?: string | null } | null;
  href: string;
  ctaLabel: string;
  metaLine?: string;
  summary?: string | null;
  activeIndex: number;
  onPrev: () => void;
  onNext: () => void;
  total: number;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
      {/* Image */}
      <div className="relative h-56 bg-slate-100">
        {item?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <MapPin className="h-8 w-8 text-slate-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {/* Overlay label */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70 mb-1">
            {eyebrow}
          </p>
          <h3 className="font-playfair text-xl font-bold text-white leading-snug line-clamp-2">
            {item?.name ?? title}
          </h3>
          {metaLine && (
            <p className="mt-1 text-[11px] text-white/70">{metaLine}</p>
          )}
        </div>

        {/* Nav arrows */}
        {total > 1 && (
          <div className="absolute right-3 top-3 flex gap-1.5">
            <button
              onClick={onPrev}
              aria-label="Previous"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-slate-900 shadow-sm backdrop-blur-sm hover:bg-white transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={onNext}
              aria-label="Next"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-slate-900 shadow-sm backdrop-blur-sm hover:bg-white transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-4">
        {summary && (
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
            {clampText(summary, 120)}
          </p>
        )}

        {/* Dots */}
        {total > 1 && (
          <div className="mt-3 flex gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-all ${
                  i === activeIndex ? "bg-[#E8002D] w-4" : "bg-slate-300"
                }`}
              />
            ))}
          </div>
        )}

        <Link
          href={href}
          className="mt-3 inline-flex text-sm font-semibold text-[#E8002D] hover:underline"
        >
          {ctaLabel} →
        </Link>
      </div>
    </div>
  );
}

// ── WEATHER SECTION ───────────────────────────────────────────────────────────

function WeatherCard({ loc }: { loc: LocationWeather }) {
  if (!loc.reading) return null;
  const { temp, feelsLike, code, windSpeed, windDir, humidity } = loc.reading;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
      {/* Location */}
      <div className="mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
          {loc.area}
        </p>
        <p className="text-lg font-bold text-white">{loc.name}</p>
      </div>

      {/* Temp + icon */}
      <div className="mb-2 flex items-end justify-between">
        <span className="font-playfair text-6xl font-bold leading-none text-white">
          {temp}°
        </span>
        <WmoIcon code={code} className="h-12 w-12 text-white/60" />
      </div>

      {/* Condition */}
      <p className="mb-1 text-sm font-medium text-white/80">{wmoLabel(code)}</p>
      <p className="mb-4 text-xs text-white/40">Feels like {feelsLike}°C</p>

      {/* Pills */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white/70">
          <Wind className="h-3 w-3" />
          {windDirLabel(windDir)} {windSpeed} mph
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white/70">
          <Droplets className="h-3 w-3" />
          {humidity}%
        </span>
      </div>
    </div>
  );
}

function WeatherSection() {
  const [locations, setLocations] = useState<LocationWeather[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const results = await Promise.all(
          WEATHER_LOCATIONS.map(async (loc) => {
            const url =
              `https://api.open-meteo.com/v1/forecast` +
              `?latitude=${loc.lat}&longitude=${loc.lon}` +
              `&current=temperature_2m,apparent_temperature,weathercode,windspeed_10m,winddirection_10m,relativehumidity_2m` +
              `&wind_speed_unit=mph&timezone=Europe%2FLondon`;
            const res = await fetch(url);
            const json = await res.json();
            const c = json.current;
            return {
              name: loc.name,
              area: loc.area,
              reading: {
                temp: Math.round(c.temperature_2m),
                feelsLike: Math.round(c.apparent_temperature),
                code: c.weathercode,
                windSpeed: Math.round(c.windspeed_10m),
                windDir: c.winddirection_10m,
                humidity: c.relativehumidity_2m,
              },
            } satisfies LocationWeather;
          })
        );
        if (!cancelled) {
          setLocations(results);
          setUpdatedAt(new Date());
        }
      } catch {
        // weather is non-critical — silently degrade
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return (
    <section className="bg-gradient-to-br from-[#0a1628] via-[#0d1f3e] to-[#0a1628] py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#E8002D]">
              Live · Isle of Man
            </p>
            <h2 className="font-playfair text-3xl font-bold text-white sm:text-4xl">
              Today&apos;s Weather<span className="text-[#E8002D]">.</span>
            </h2>
          </div>
          {updatedAt && (
            <p className="pb-1 text-xs text-white/30">
              Updated{" "}
              {updatedAt.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>

        {/* Cards */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-52 animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : locations.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {locations.map((loc) => (
              <WeatherCard key={loc.name} loc={loc} />
            ))}
          </div>
        ) : null}

        <p className="mt-5 text-center text-[10px] text-white/20">
          Weather data from Open-Meteo · Not for safety-critical use
        </p>
      </div>
    </section>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function HomePageClient() {
  const supabase = supabaseBrowser();

  const [events, setEvents] = useState<EventPreview[]>(FALLBACK_EVENTS);
  const [listings, setListings] = useState<ListingPreview[]>([]);
  const [deals, setDeals] = useState<DealPreview[]>(FALLBACK_DEALS);
  const [sports, setSports] = useState<SportsPreview[]>(FALLBACK_SPORTS);
  const [community, setCommunity] =
    useState<CommunityPreview[]>(FALLBACK_COMMUNITY);

  const [featuredBusinesses, setFeaturedBusinesses] = useState<
    FeaturedBusiness[]
  >([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  const [boostedBusinesses, setBoostedBusinesses] = useState<
    BoostedBusiness[]
  >([]);
  const [boostedIndex, setBoostedIndex] = useState(0);

  const [_loadError, setLoadError] = useState<string | null>(null);

  const [featuredHeritage, setFeaturedHeritage] = useState<HeritagePreview[]>(
    []
  );
  const [featuredWalks, setFeaturedWalks] = useState<WalkPreview[]>([]);
  const [heritageIndex, setHeritageIndex] = useState(0);
  const [walkIndex, setWalkIndex] = useState(0);

  const [impressionsSent, setImpressionsSent] = useState({
    boostedListings: false,
    featuredBusiness: false,
  });

  // Hero carousel
  const [homeHeroIdx, setHomeHeroIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setHomeHeroIdx((i) => (i + 1) % HOME_HERO_SLIDES.length), 5500);
    return () => clearInterval(id);
  }, []);

  // Scroll-triggered stats
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  async function trackImpressions(
    items: { slot: string; contentType: string; contentId: string }[]
  ) {
    if (!supabase || !items.length) return;
    try {
      const { error } = await supabase
        .from("content_impressions")
        .insert(
          items.map((it) => ({
            slot: it.slot,
            content_type: it.contentType,
            content_id: it.contentId,
          }))
        );
      if (error && process.env.NODE_ENV !== "production") {
        console.warn("[impressions] insert error", error.message);
      }
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[impressions] unexpected error", err);
      }
    }
  }

  // ── LOAD DATA ───────────────────────────────────────────────────────────────

  useEffect(() => {
    setLoadError(null);
    if (!supabase) return;

    (async () => {
      try {
        // 1) Events
        {
          const nowIso = new Date().toISOString();
          const { data, error } = await supabase
            .from("events")
            .select("id, title, venue, starts_at, image_url")
            .eq("approved", true)
            .gte("starts_at", nowIso)
            .order("starts_at", { ascending: true })
            .limit(12);

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
                startsAt: e.starts_at ?? null,
                imageUrl: e.image_url ?? null,
              };
            });
            setEvents(mapped);
          }
        }

        // 2) Boosted marketplace listings
        {
          const { data, error } = await supabase
            .from("marketplace_listings")
            .select(
              "id, title, category, area, date_listed, price_pence, images, boosted"
            )
            .eq("approved", true)
            .eq("boosted", true)
            .order("date_listed", { ascending: false })
            .limit(12);

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
            setListings([]);
          }
        }

        // 3) Deals
        {
          const { data, error } = await supabase
            .from("deals")
            .select(
              "id, title, business_name, area, valid_until, image_url, boosted"
            )
            .eq("approved", true)
            .order("created_at", { ascending: false })
            .limit(12);

          if (!error && data && data.length) {
            setDeals(
              data.map((d: any) => ({
                id: String(d.id),
                title: d.title ?? "Untitled deal",
                businessName: d.business_name ?? null,
                meta:
                  [d.business_name, d.area].filter(Boolean).join(" • ") || "",
                endsAt: d.valid_until ?? null,
                imageUrl: d.image_url ?? null,
              }))
            );
          }
        }

        // 4) Sports
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
                meta: c.summary ? String(c.summary).slice(0, 80) + "…" : "",
              }))
            );
          }
        }

        // 6) Featured businesses
        {
          const today = new Date().toISOString().slice(0, 10);
          const { data, error } = await supabase
            .from("businesses")
            .select(
              "id, slug, name, area, category, logo_url, images, featured_headline, featured_tagline, featured_cta_label, featured_cta_url, featured_until, featured_on_home"
            )
            .eq("featured_on_home", true)
            .or(`featured_until.is.null,featured_until.gte.${today}`)
            .order("featured_until", { ascending: true, nullsFirst: true })
            .limit(10);

          if (!error && data && data.length) {
            const mapped: FeaturedBusiness[] = data.map((b: any) => ({
              id: String(b.id),
              name: b.name ?? "Featured business",
              slug: b.slug ?? null,
              area: b.area ?? null,
              category: b.category ?? null,
              logoUrl: b.logo_url ?? null,
              imageUrl:
                Array.isArray(b.images) && b.images.length
                  ? b.images[0]
                  : b.logo_url ?? null,
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

        // 6b) Boosted businesses
        {
          const { data, error } = await supabase
            .from("businesses")
            .select(
              "id, slug, name, area, category, logo_url, images, tagline, featured_headline, featured_tagline, featured_cta_label, featured_cta_url, boosted_until"
            );

          if (!error && data && data.length) {
            const now = new Date();
            const valid = (data as any[]).filter(
              (b) => b.boosted_until && new Date(b.boosted_until) > now
            );
            const mapped: BoostedBusiness[] = valid.map((b: any) => ({
              id: String(b.id),
              name: b.name ?? "Business",
              slug: b.slug ?? null,
              area: b.area ?? null,
              category: b.category ?? null,
              logoUrl: b.logo_url ?? null,
              imageUrl:
                Array.isArray(b.images) && b.images.length
                  ? b.images[0]
                  : b.logo_url ?? null,
              headline: b.featured_headline ?? null,
              tagline: b.featured_tagline ?? b.tagline ?? null,
              ctaLabel: b.featured_cta_label ?? null,
              ctaUrl: b.featured_cta_url ?? null,
            }));
            setBoostedBusinesses(mapped);
            setBoostedIndex(0);
          } else {
            setBoostedBusinesses([]);
            setBoostedIndex(0);
          }
        }

        // 7) Featured heritage sites
        {
          const { data: feat, error: featErr } = await supabase
            .from("heritage_sites")
            .select(
              "id, slug, name, short_tagline, description, area, hero_image_url, featured_on_home, updated_at, created_at, status"
            )
            .eq("status", "published")
            .eq("featured_on_home", true)
            .order("updated_at", { ascending: false })
            .limit(5);

          let items: any[] = !featErr && feat ? feat : [];

          if (items.length < 5) {
            const { data: topup, error: topErr } = await supabase
              .from("heritage_sites")
              .select(
                "id, slug, name, short_tagline, description, area, hero_image_url, featured_on_home, updated_at, created_at, status"
              )
              .eq("status", "published")
              .neq("featured_on_home", true)
              .order("updated_at", { ascending: false })
              .limit(5 - items.length);
            if (!topErr && topup?.length) items = [...items, ...topup];
          }

          const mapped: HeritagePreview[] = items.map((h: any) => ({
            id: String(h.id),
            slug: h.slug,
            name: h.name ?? "Heritage site",
            area: h.area ?? null,
            tagline: h.short_tagline ?? null,
            description: h.description ?? null,
            imageUrl: h.hero_image_url ?? null,
          }));
          setFeaturedHeritage(mapped);
          setHeritageIndex(0);
        }

        // 8) Featured walks
        {
          const { data: feat, error: featErr } = await supabase
            .from("walks")
            .select(
              "id, slug, name, summary, description, area, distance_km, duration_minutes, difficulty, hero_image_url, featured_on_home, updated_at, created_at, status"
            )
            .eq("status", "published")
            .eq("featured_on_home", true)
            .order("updated_at", { ascending: false })
            .limit(5);

          let items: any[] = !featErr && feat ? feat : [];

          if (items.length < 5) {
            const { data: topup, error: topErr } = await supabase
              .from("walks")
              .select(
                "id, slug, name, summary, description, area, distance_km, duration_minutes, difficulty, hero_image_url, featured_on_home, updated_at, created_at, status"
              )
              .eq("status", "published")
              .neq("featured_on_home", true)
              .order("updated_at", { ascending: false })
              .limit(5 - items.length);
            if (!topErr && topup?.length) items = [...items, ...topup];
          }

          const mapped: WalkPreview[] = items.map((w: any) => ({
            id: String(w.id),
            slug: w.slug,
            name: w.name ?? "Walk",
            area: w.area ?? null,
            summary: w.summary ?? null,
            description: w.description ?? null,
            distanceKm:
              typeof w.distance_km === "number" ? w.distance_km : null,
            durationMinutes:
              typeof w.duration_minutes === "number"
                ? w.duration_minutes
                : null,
            difficulty: w.difficulty ?? null,
            imageUrl: w.hero_image_url ?? null,
          }));
          setFeaturedWalks(mapped);
          setWalkIndex(0);
        }
      } catch (err) {
        console.error("[home] load previews error", err);
        setLoadError("Could not load live previews.");
        setFeaturedLoading(false);
        setListings([]);
        setFeaturedHeritage([]);
        setFeaturedWalks([]);
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rotate boosted businesses
  useEffect(() => {
    if (boostedBusinesses.length <= 1) return;
    const id = window.setInterval(() => {
      setBoostedIndex((p) =>
        boostedBusinesses.length ? (p + 1) % boostedBusinesses.length : 0
      );
    }, 10000);
    return () => window.clearInterval(id);
  }, [boostedBusinesses.length]);

  // Rotate heritage
  useEffect(() => {
    if (featuredHeritage.length <= 1) return;
    const id = window.setInterval(() => {
      setHeritageIndex((p) => (p + 1) % featuredHeritage.length);
    }, 8000);
    return () => window.clearInterval(id);
  }, [featuredHeritage.length]);

  // Rotate walks
  useEffect(() => {
    if (featuredWalks.length <= 1) return;
    const id = window.setInterval(() => {
      setWalkIndex((p) => (p + 1) % featuredWalks.length);
    }, 8500);
    return () => window.clearInterval(id);
  }, [featuredWalks.length]);

  // ── DERIVED DATA ─────────────────────────────────────────────────────────────

  const eventsSource = events.length ? events : FALLBACK_EVENTS;
  const weekendEvents = eventsSource.filter((e) => isWithinWeekend(e.startsAt));
  const featuredEvents = (
    weekendEvents.length ? weekendEvents : eventsSource
  ).slice(0, 6);
  const featuredDeals = (deals.length ? deals : FALLBACK_DEALS).slice(0, 2);
  const featuredSports = (sports.length ? sports : FALLBACK_SPORTS).slice(0, 2);
  const featuredCommunity = (
    community.length ? community : FALLBACK_COMMUNITY
  ).slice(0, 2);

  const featuredBusiness =
    featuredBusinesses.length > 0 ? featuredBusinesses[featuredIndex] : null;
  const activeBoostedBusiness =
    boostedBusinesses.length > 0 ? boostedBusinesses[boostedIndex] : null;

  const heroEvent = featuredEvents[0];
  const heroDeal = featuredDeals[0];
  const heroSport = featuredSports[0];
  const heroCommunity = featuredCommunity[0];
  const heroListing = listings[0] ?? null;
  const heroHeritage = featuredHeritage[heritageIndex] ?? featuredHeritage[0] ?? null;
  const heroWalk = featuredWalks[walkIndex] ?? featuredWalks[0] ?? null;
  const heroBusiness = featuredBusiness ?? activeBoostedBusiness ?? null;

  const featuredHref =
    heroBusiness &&
    (heroBusiness.ctaUrl ||
      (heroBusiness.slug ? `/businesses/${heroBusiness.slug}` : "/businesses"));

  const businessDealOfWeek =
    heroBusiness && deals.length
      ? deals.find(
          (d) =>
            d.businessName &&
            d.businessName.toLowerCase().trim() ===
              heroBusiness.name.toLowerCase().trim()
        ) ?? null
      : null;

  const businessMeta = [
    heroBusiness?.area,
    heroBusiness?.category,
    businessDealOfWeek?.title ? "Offer live" : null,
  ].filter(Boolean) as string[];

  // ── IMPRESSION TRACKING ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!listings.length || impressionsSent.boostedListings) return;
    trackImpressions(
      listings.map((l) => ({
        slot: "homepage:boosted_marketplace",
        contentType: "marketplace_listing",
        contentId: l.id,
      }))
    );
    setImpressionsSent((prev) => ({ ...prev, boostedListings: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listings.length]);

  useEffect(() => {
    if (!featuredBusiness || impressionsSent.featuredBusiness) return;
    trackImpressions([
      {
        slot: "homepage:featured_business",
        contentType: "business",
        contentId: featuredBusiness.id,
      },
    ]);
    setImpressionsSent((prev) => ({ ...prev, featuredBusiness: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featuredBusiness?.id]);

  useEffect(() => {
    if (!activeBoostedBusiness) return;
    trackImpressions([
      {
        slot: "homepage:boosted_business_rotation",
        contentType: "business",
        contentId: activeBoostedBusiness.id,
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boostedIndex, activeBoostedBusiness?.id]);

  // Suppress unused warning during transition
  void featuredLoading;
  void heroSport;

  // ── RENDER ───────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white text-slate-900">

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pb-16 pt-12 sm:pt-16 lg:pt-20">
        {/* Rotating IoM landscape images — underlay */}
        {HOME_HERO_SLIDES.map((slide, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={slide.image}
            src={slide.image}
            alt=""
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 z-0 ${
              i === homeHeroIdx ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        {/* White gradient overlay — left-heavy so all text stays readable */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(105deg, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.90) 42%, rgba(255,255,255,0.60) 70%, rgba(255,255,255,0.15) 100%)",
          }}
        />
        {/* Bottom fade — keeps stats strip clean */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-36 z-10 bg-gradient-to-t from-white to-transparent"
        />
        {/* Slide indicator dots — top right, subtle */}
        <div className="absolute right-6 top-6 z-20 flex items-center gap-2.5 sm:right-10 lg:right-16">
          <p className="hidden sm:block text-[10px] font-medium text-slate-500 tracking-wide">
            {HOME_HERO_SLIDES[homeHeroIdx].name} · {HOME_HERO_SLIDES[homeHeroIdx].area}
          </p>
          <div className="flex gap-1.5">
            {HOME_HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setHomeHeroIdx(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === homeHeroIdx
                    ? "w-5 h-1.5 bg-[#E8002D]"
                    : "w-1.5 h-1.5 bg-slate-300 hover:bg-slate-500"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-16 lg:items-start">

            {/* Left: Headline + ticker + chips */}
            <div className="animate-fade-up">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400 mb-5">
                Isle of Man&apos;s Local Hub
              </p>

              <h1 className="font-playfair text-[clamp(2.8rem,6.5vw,5.2rem)] font-bold leading-[1.05] tracking-[-0.02em] text-slate-900">
                Everything island<br />
                life has to{" "}
                <em className="italic">offer</em>
                <span className="text-[#E8002D]">.</span>
              </h1>

              <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-slate-500 sm:text-lg">
                Events, deals, sports, businesses, walks and community —
                all in one place, built for island life.
              </p>

              {/* Score ticker */}
              <ScoreTicker items={sports.length ? sports : FALLBACK_SPORTS} />

              {/* Quick-jump chips */}
              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  { emoji: "📅", label: "Events this weekend", href: "/whats-on/weekend" },
                  { emoji: "🛍️", label: "Marketplace", href: "/marketplace" },
                  { emoji: "🥾", label: "Walks & Trails", href: "/heritage" },
                  { emoji: "🏆", label: "Sports results", href: "/sports" },
                  { emoji: "🏛️", label: "Heritage", href: "/heritage" },
                  { emoji: "👥", label: "Community", href: "/community-spotlight" },
                ].map((chip) => (
                  <Link
                    key={chip.href + chip.label}
                    href={chip.href}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-[#E8002D]/40 hover:text-[#E8002D]"
                  >
                    <span>{chip.emoji}</span>
                    {chip.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: Tab panel */}
            <div
              className="animate-fade-up"
              style={{ animationDelay: "120ms" }}
            >
              <HeroTabPanel
                events={featuredEvents}
                deals={deals.length ? deals.slice(0, 5) : FALLBACK_DEALS}
                scores={sports.length ? sports : FALLBACK_SPORTS}
              />
            </div>
          </div>

          {/* Stats strip */}
          <div
            ref={statsRef}
            className="mt-16 grid grid-cols-2 gap-8 border-t border-slate-100 pt-10 sm:grid-cols-4"
          >
            <StatPill value={120} suffix="+" label="Upcoming events" active={statsVisible} delay={0} />
            <StatPill value={340} suffix="+" label="Local businesses" active={statsVisible} delay={150} />
            <StatPill value={85}  suffix="+" label="Live deals" active={statsVisible} delay={300} />
            <StatPill value={40}  suffix="+" label="Walks & trails" active={statsVisible} delay={450} />
          </div>
        </div>
      </section>

      {/* ── WEATHER ──────────────────────────────────────────────────────────── */}
      <WeatherSection />

      {/* ── WHAT'S ON ────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Live feed" title="What's On" href="/whats-on" cta="All events" />

          {/* Featured event — large card */}
          {heroEvent && (
            <Link
              href={heroEvent.id.startsWith("mock-") ? "/whats-on" : `/whats-on/${heroEvent.id}`}
              className="group mt-8 flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_8px_40px_rgba(0,0,0,0.10)] sm:flex-row"
            >
              {/* Image */}
              <div className="relative h-52 w-full flex-shrink-0 bg-slate-100 sm:h-auto sm:w-56">
                {heroEvent.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={heroEvent.imageUrl}
                    alt={heroEvent.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                    <CalendarDays className="h-10 w-10 text-slate-300" />
                  </div>
                )}
                <span className="absolute left-3 top-3 rounded-full bg-[#E8002D] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Featured
                </span>
              </div>

              {/* Details */}
              <div className="flex flex-col justify-center px-6 py-6 sm:px-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-2">
                  Next up
                </p>
                <h3 className="font-playfair text-xl font-bold leading-snug text-slate-900 group-hover:text-[#E8002D] transition-colors sm:text-2xl">
                  {heroEvent.name}
                </h3>
                {heroEvent.meta && (
                  <p className="mt-2 text-sm text-slate-500">{heroEvent.meta}</p>
                )}
                <span className="mt-4 text-sm font-semibold text-[#E8002D]">
                  Book now →
                </span>
              </div>
            </Link>
          )}

          {/* Remaining events — compact rows */}
          {featuredEvents.length > 1 && (
            <ul className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              {featuredEvents.slice(1).map((e) => {
                const href = e.id.startsWith("mock-") ? "/whats-on" : `/whats-on/${e.id}`;
                return (
                  <li key={e.id}>
                    <Link
                      href={href}
                      className="group flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors"
                    >
                      <CalendarDays className="h-4 w-4 flex-shrink-0 text-[#E8002D]" />
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-semibold text-slate-900 group-hover:text-[#E8002D] transition-colors">
                          {e.name}
                        </span>
                        {e.meta && (
                          <span className="ml-3 text-xs text-slate-500">
                            {e.meta}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 group-hover:text-[#E8002D] transition-colors">
                        →
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-5 flex gap-3">
            <Link
              href="/whats-on/weekend"
              className="inline-flex items-center rounded-full bg-[#E8002D] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#c00026] transition-colors"
            >
              Weekend guide →
            </Link>
            <Link
              href="/whats-on"
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
            >
              All events
            </Link>
          </div>
        </div>
      </section>

      {/* ── DEALS ────────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-16 bg-slate-50/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Limited offers" title="Local Deals" href="/deals" cta="All deals" />

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(deals.length ? deals : FALLBACK_DEALS).slice(0, 6).map((deal) => {
              const href = deal.id.startsWith("mock-") ? "/deals" : `/deals/${deal.id}`;
              return (
                <Link
                  key={deal.id}
                  href={href}
                  className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm transition-all hover:border-[#E8002D]/30 hover:shadow-md"
                >
                  <Tag className="h-4 w-4 flex-shrink-0 text-[#E8002D]" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-semibold text-slate-900 group-hover:text-[#E8002D] transition-colors">
                      {deal.title}
                    </p>
                    {deal.meta && (
                      <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500">
                        {deal.meta}
                      </p>
                    )}
                  </div>
                  <span className="flex-shrink-0 text-[11px] font-semibold text-[#E8002D]">
                    View →
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURED BUSINESS SPOTLIGHT ──────────────────────────────────────── */}
      {heroBusiness && (
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_4px_40px_rgba(0,0,0,0.07)]">
              <div className="grid lg:grid-cols-2">
                {/* Image side */}
                <div className="relative min-h-[280px] bg-slate-100 lg:min-h-[380px]">
                  {heroBusiness.imageUrl || heroBusiness.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={heroBusiness.imageUrl ?? heroBusiness.logoUrl!}
                      alt={heroBusiness.name}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                      <span className="text-4xl font-bold text-slate-300">
                        {heroBusiness.name[0]}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/10" />
                </div>

                {/* Content side */}
                <div className="flex flex-col justify-center px-8 py-10 lg:px-12 lg:py-14">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#E8002D]">
                    Sponsored spotlight
                  </p>
                  <h2 className="font-playfair text-[clamp(1.7rem,3vw,2.6rem)] font-bold leading-tight text-slate-900">
                    {heroBusiness.headline ?? heroBusiness.name}
                  </h2>
                  {heroBusiness.tagline && (
                    <p className="mt-3 text-base leading-relaxed text-slate-500">
                      {heroBusiness.tagline}
                    </p>
                  )}
                  {businessMeta.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {businessMeta.map((m) => (
                        <span
                          key={m}
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  )}
                  <Link
                    href={featuredHref ?? "/businesses"}
                    className="mt-8 inline-flex w-fit items-center rounded-full bg-[#E8002D] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#c00026]"
                  >
                    {heroBusiness.ctaLabel ?? "View business"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── BROWSE BUSINESSES ────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-16 bg-slate-50/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Directory" title="Browse Businesses" href="/businesses" cta="All businesses" />

          {boostedBusinesses.length > 0 ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {boostedBusinesses.slice(0, 6).map((b) => {
                const href = b.slug ? `/businesses/${b.slug}` : "/businesses";
                return (
                  <Link
                    key={b.id}
                    href={href}
                    className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-[#E8002D]/30 hover:shadow-md"
                  >
                    {b.logoUrl || b.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={b.logoUrl ?? b.imageUrl!}
                        alt={b.name}
                        className="h-12 w-12 flex-shrink-0 rounded-lg object-cover bg-slate-100"
                      />
                    ) : (
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                        <span className="text-lg font-bold text-slate-400">
                          {b.name[0]}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-[#E8002D] transition-colors">
                        {b.name}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {[b.category, b.area].filter(Boolean).join(" • ")}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 flex flex-wrap gap-3">
              {["Restaurants", "Services", "Retail", "Health & Beauty", "Sports", "Trades"].map(
                (cat) => (
                  <Link
                    key={cat}
                    href={`/businesses?category=${encodeURIComponent(cat.toLowerCase())}`}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-[#E8002D]/30 hover:text-[#E8002D]"
                  >
                    {cat}
                  </Link>
                )
              )}
            </div>
          )}

          <div className="mt-6">
            <Link
              href="/businesses"
              className="inline-flex items-center text-sm font-semibold text-[#E8002D] hover:underline"
            >
              Browse all businesses →
            </Link>
          </div>
        </div>
      </section>

      {/* ── SPORTS ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Latest results" title="Sports" href="/sports" cta="Sports hub →" />

          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
            {/* Header bar */}
            <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/80 px-5 py-3">
              <span className="h-2 w-2 rounded-full bg-[#E8002D] animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Live Results
              </span>
            </div>

            <ul className="divide-y divide-slate-50">
              {(sports.length ? sports : FALLBACK_SPORTS).map((s) => (
                <li key={s.id}>
                  <Link
                    href="/sports"
                    className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
                  >
                    <Trophy className="h-4 w-4 flex-shrink-0 text-[#E8002D]" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-[#E8002D] transition-colors">
                        {s.title}
                      </p>
                      {s.meta && (
                        <p className="mt-0.5 text-xs text-slate-500">{s.meta}</p>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 group-hover:text-[#E8002D] transition-colors">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="border-t border-slate-100 px-5 py-3 bg-slate-50/60">
              <Link
                href="/sports"
                className="text-xs font-semibold text-[#E8002D] hover:underline"
              >
                View all sports & fixtures →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── EXPLORE THE ISLAND ───────────────────────────────────────────────── */}
      <section className="py-14 sm:py-20 bg-slate-50/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Get outside
            </p>
            <h2 className="font-playfair text-3xl font-bold text-slate-900 sm:text-4xl">
              Explore the Island
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <ExplorePanel
              title="Walks & Trails"
              eyebrow="Routes"
              item={heroWalk}
              href="/heritage"
              ctaLabel="Browse all walks"
              metaLine={
                heroWalk
                  ? [
                      heroWalk.area,
                      heroWalk.distanceKm ? `${heroWalk.distanceKm}km` : null,
                      heroWalk.difficulty,
                    ]
                      .filter(Boolean)
                      .join(" • ")
                  : undefined
              }
              summary={heroWalk?.summary ?? heroWalk?.description}
              activeIndex={walkIndex}
              onPrev={() =>
                setWalkIndex((i) =>
                  (i - 1 + featuredWalks.length) % Math.max(1, featuredWalks.length)
                )
              }
              onNext={() =>
                setWalkIndex((i) => (i + 1) % Math.max(1, featuredWalks.length))
              }
              total={featuredWalks.length}
            />

            <ExplorePanel
              title="Heritage"
              eyebrow="History & culture"
              item={heroHeritage}
              href="/heritage"
              ctaLabel="Discover heritage"
              metaLine={heroHeritage?.area ?? undefined}
              summary={heroHeritage?.tagline ?? heroHeritage?.description}
              activeIndex={heritageIndex}
              onPrev={() =>
                setHeritageIndex((i) =>
                  (i - 1 + featuredHeritage.length) % Math.max(1, featuredHeritage.length)
                )
              }
              onNext={() =>
                setHeritageIndex((i) => (i + 1) % Math.max(1, featuredHeritage.length))
              }
              total={featuredHeritage.length}
            />
          </div>
        </div>
      </section>

      {/* ── COMMUNITY ────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="People & places"
            title="Community Spotlight"
            href="/community-spotlight"
            cta="All stories"
          />

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {(community.length ? community : FALLBACK_COMMUNITY)
              .slice(0, 4)
              .map((c, i) => (
                <Link
                  key={c.id}
                  href="/community-spotlight"
                  className="group rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-[#E8002D]/25 hover:shadow-md"
                >
                  {i === 0 && (
                    <span className="mb-3 inline-block rounded-full bg-[#E8002D]/8 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#E8002D]">
                      Latest
                    </span>
                  )}
                  <h3 className="text-sm font-semibold leading-snug text-slate-900 group-hover:text-[#E8002D] transition-colors">
                    {c.title}
                  </h3>
                  {c.meta && (
                    <p className="mt-2 line-clamp-2 text-xs text-slate-500">
                      {c.meta}
                    </p>
                  )}
                  <span className="mt-3 inline-block text-[11px] font-semibold text-[#E8002D]">
                    Read story →
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* ── MARKETPLACE ──────────────────────────────────────────────────────── */}
      {listings.length > 0 && (
        <section className="py-14 sm:py-16 bg-slate-50/70">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="Promoted listings"
              title="Marketplace"
              href="/marketplace"
              cta="Browse all"
            />

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {listings.slice(0, 8).map((l) => (
                <Link
                  key={l.id}
                  href={`/marketplace/item/${l.id}`}
                  className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-[#E8002D]/30 hover:shadow-md"
                >
                  <div className="relative h-40 bg-slate-100">
                    {l.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={l.imageUrl}
                        alt={l.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                        No image
                      </div>
                    )}
                    {l.price && (
                      <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-bold text-slate-900 shadow-sm backdrop-blur-sm">
                        {l.price}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-[#E8002D] transition-colors">
                      {l.title}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">{l.meta}</p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-6">
              <Link
                href="/marketplace"
                className="inline-flex items-center text-sm font-semibold text-[#E8002D] hover:underline"
              >
                Browse all listings →
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
