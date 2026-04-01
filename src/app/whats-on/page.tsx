// src/app/whats-on/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "What's On – Isle of Man Events & Fixtures",
  description: "Upcoming events, gigs, family days, sports fixtures and community moments across the Isle of Man. Filter by date, category and area.",
  alternates: { canonical: "https://manxhive.com/whats-on" },
  openGraph: {
    title: "What's On – Isle of Man Events & Fixtures",
    description: "Find events and things to do across the Isle of Man.",
    url: "https://manxhive.com/whats-on",
  },
};
import {
  Calendar,
  MapPin,
  Filter,
  Search,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { supabaseServer } from "@/lib/supabase/server";
import WhatsOnMap from "./WhatsOnMap";
import EventsListTracker from "./EventsListTracker";
import SaveItemButton from "@/app/components/SaveItemButton";
import WhatsOnDatePicker from "./WhatsOnDatePicker";

// ── TYPES ─────────────────────────────────────────────────────────────────────

type EventCategory =
  | "family"
  | "sports"
  | "sport"
  | "nightlife"
  | "music"
  | "community"
  | "culture"
  | "other";

type EventItem = {
  id: string;
  title: string;
  category: EventCategory;
  location: string;
  venue?: string | null;
  area?: string | null;
  starts_at: string;
  ends_at?: string | null;
  summary: string;
  image_url?: string | null;
  featured?: boolean;
  submitted_by?: string | null;
};

// ── CONSTANTS ─────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<EventCategory, string> = {
  family: "Family & Kids",
  sports: "Sports",
  sport: "Sports",
  nightlife: "Nightlife & Music",
  music: "Nightlife & Music",
  community: "Community & Culture",
  culture: "Community & Culture",
  other: "Other",
};

const SAVED_EVENTS_KEY = "manxhive_saved_events";

const FILTER_CATEGORIES: EventCategory[] = [
  "family",
  "sports",
  "nightlife",
  "community",
  "other",
];

const CATEGORY_ALIASES: Record<EventCategory, EventCategory[]> = {
  family: ["family"],
  sports: ["sports", "sport"],
  sport: ["sports", "sport"],
  nightlife: ["nightlife", "music"],
  music: ["nightlife", "music"],
  community: ["community", "culture"],
  culture: ["community", "culture"],
  other: ["other"],
};

const DATE_FILTER_LABELS: Record<string, string> = {
  all: "All dates",
  today: "Today",
  weekend: "This weekend",
  next7: "Next 7 days",
  next30: "Next 30 days",
};

// ── DATE HELPERS ──────────────────────────────────────────────────────────────

function buildRangeForPreset(filter: string | undefined) {
  const now = new Date();
  const start = new Date(now);
  let end: Date | null = null;

  switch (filter) {
    case "today": {
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(end.getDate() + 1);
      break;
    }
    case "weekend": {
      const day = now.getDay();
      const daysToFriday = (5 - day + 7) % 7;
      start.setDate(now.getDate() + daysToFriday);
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(end.getDate() + 3);
      break;
    }
    case "next7": {
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(end.getDate() + 7);
      break;
    }
    case "next30": {
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(end.getDate() + 30);
      break;
    }
    default:
      return { from: null as string | null, to: null as string | null };
  }

  return {
    from: start.toISOString(),
    to: end ? end.toISOString() : null,
  };
}

function buildRangeForSpecificDay(onDate: string) {
  const [y, m, d] = onDate.split("-").map((n) => Number(n));
  if (!y || !m || !d || m < 1 || m > 12 || d < 1 || d > 31) {
    return { from: null as string | null, to: null as string | null };
  }
  const start = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { from: start.toISOString(), to: end.toISOString() };
}

// ── DATA FETCH ────────────────────────────────────────────────────────────────

async function fetchEvents(params: {
  category?: string | null;
  dateFilter?: string | null;
  onDate?: string | null;
}): Promise<EventItem[]> {
  const supabase = supabaseServer();
  if (!supabase) return [];

  let from: string | null = null;
  let to: string | null = null;

  if (params.onDate) {
    const range = buildRangeForSpecificDay(params.onDate);
    from = range.from;
    to = range.to;
  } else if (params.dateFilter && params.dateFilter !== "all") {
    const range = buildRangeForPreset(params.dateFilter);
    from = range.from;
    to = range.to;
  }

  if (!from) from = new Date().toISOString();

  let query = supabase
    .from("events")
    .select(
      "id,title,category,location,venue,area,starts_at,ends_at,summary,image_url,featured,approved,submitted_by"
    )
    .eq("approved", true)
    .gte("starts_at", from)
    .order("starts_at", { ascending: true });

  if (to) query = query.lt("starts_at", to);

  const { data, error } = await query;
  if (error) {
    console.error("[whats-on] failed to load events:", error.message);
    return [];
  }

  return (data ?? []) as EventItem[];
}

// ── FORMAT HELPERS ────────────────────────────────────────────────────────────

function formatDateRange(starts_at: string, ends_at?: string | null) {
  const start = new Date(starts_at);
  if (Number.isNaN(start.getTime())) return "";

  if (!ends_at) {
    return start.toLocaleString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const end = new Date(ends_at);
  if (Number.isNaN(end.getTime())) {
    return start.toLocaleString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  if (sameDay) {
    const dayPart = start.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    const startTime = start.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const endTime = end.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${dayPart}, ${startTime}–${endTime}`;
  }

  const startStr = start.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const endStr = end.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  return `${startStr} – ${endStr}`;
}

// ── MINI CALENDAR ─────────────────────────────────────────────────────────────

function buildEventsByDay(events: EventItem[]): Set<string> {
  const days = new Set<string>();
  for (const ev of events) {
    const d = new Date(ev.starts_at);
    if (!Number.isNaN(d.getTime())) days.add(d.toISOString().slice(0, 10));
  }
  return days;
}

function renderMiniCalendar(opts: {
  activeDay: string | null;
  activeDateFilter: string;
  makeHref: (params: { on?: string | null; date?: string; category?: string }) => string;
  eventsByDay: Set<string>;
}) {
  const { activeDay, activeDateFilter, makeHref, eventsByDay } = opts;

  let base = activeDay ? new Date(activeDay) : new Date();
  if (Number.isNaN(base.getTime())) base = new Date();

  const year = base.getFullYear();
  const month = base.getMonth();
  const monthStart = new Date(year, month, 1);
  const startWeekday = (monthStart.getDay() + 6) % 7;

  const cells: { label: number; dateStr: string; inMonth: boolean }[] = [];
  const firstDate = new Date(monthStart);
  firstDate.setDate(monthStart.getDate() - startWeekday);

  for (let i = 0; i < 42; i++) {
    const d = new Date(firstDate);
    d.setDate(firstDate.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    cells.push({
      label: d.getDate(),
      dateStr: iso,
      inMonth: d.getFullYear() === year && d.getMonth() === month,
    });
  }

  const monthLabel = monthStart.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-[#E8002D]" />
          <span className="text-xs font-semibold text-slate-800">Calendar</span>
        </div>
        <span className="text-[10px] text-slate-400">{monthLabel}</span>
      </div>

      {/* Weekday labels */}
      <div className="mb-1 grid grid-cols-7 gap-0.5 text-center">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} className="py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-400">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((cell, idx) => {
          const hasEvents = eventsByDay.has(cell.dateStr);
          const isActive = activeDay === cell.dateStr;
          const muted = !cell.inMonth;

          return (
            <Link
              key={`${cell.dateStr}-${idx}`}
              href={makeHref({ on: cell.dateStr, date: "all" })}
              className={`relative flex h-7 w-full items-center justify-center rounded-lg text-[10px] font-medium transition ${
                isActive
                  ? "bg-[#E8002D] text-white"
                  : hasEvents
                  ? "bg-[#E8002D]/8 text-slate-800 hover:bg-[#E8002D]/15"
                  : "text-slate-600 hover:bg-slate-100"
              } ${muted && !isActive ? "opacity-30" : ""}`}
            >
              {cell.label}
              {hasEvents && !isActive && (
                <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#E8002D]" />
              )}
            </Link>
          );
        })}
      </div>

      {activeDay && (
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-500">
          <span>
            {new Date(activeDay).toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </span>
          <Link
            href={makeHref({ on: null, date: activeDateFilter || "all" })}
            className="font-semibold text-[#E8002D] hover:underline"
          >
            Clear
          </Link>
        </div>
      )}
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default async function WhatsOnPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const categoryParam = Array.isArray(searchParams?.category)
    ? searchParams?.category[0]
    : searchParams?.category;

  const dateParam = Array.isArray(searchParams?.date)
    ? searchParams?.date[0]
    : searchParams?.date;

  const areaParam = Array.isArray(searchParams?.area)
    ? searchParams?.area[0]
    : searchParams?.area;

  const onParam = Array.isArray(searchParams?.on)
    ? searchParams?.on[0]
    : searchParams?.on;

  const searchParamRaw = Array.isArray(searchParams?.q)
    ? searchParams?.q[0]
    : searchParams?.q;
  const searchQuery = (searchParamRaw ?? "").trim();
  const hasSearch = searchQuery.length > 0;
  const searchQueryLower = searchQuery.toLowerCase();

  const activeCategory =
    categoryParam && categoryParam !== "all"
      ? (categoryParam as EventCategory)
      : undefined;

  const activeArea =
    areaParam && areaParam !== "all" ? areaParam.trim() : null;

  const activeDateFilter =
    onParam && onParam.length === 10
      ? "all"
      : dateParam && DATE_FILTER_LABELS[dateParam]
      ? dateParam
      : "all";

  const activeDay =
    onParam && /^\d{4}-\d{2}-\d{2}$/.test(onParam) ? onParam : null;

  const events = await fetchEvents({
    category: activeCategory,
    dateFilter: activeDateFilter,
    onDate: activeDay,
  });

  const categoryFilteredEvents = activeCategory
    ? events.filter((ev) =>
        CATEGORY_ALIASES[activeCategory]?.includes(ev.category)
      )
    : events;

  const areaFilteredEvents = activeArea
    ? categoryFilteredEvents.filter((ev) => {
        const haystack = [ev.area ?? "", ev.location ?? "", ev.venue ?? ""]
          .join(" ")
          .toLowerCase();
        return haystack.includes(activeArea.toLowerCase());
      })
    : categoryFilteredEvents;

  const matchesSearch = (ev: EventItem) => {
    if (!hasSearch) return true;
    const fields = [
      ev.title ?? "",
      ev.summary ?? "",
      ev.location ?? "",
      ev.venue ?? "",
      ev.area ?? "",
    ];
    return fields.some((f) => f.toLowerCase().includes(searchQueryLower));
  };

  const filteredEvents = areaFilteredEvents.filter(matchesSearch);
  const featured = filteredEvents.filter((e) => e.featured);
  const regular = filteredEvents.filter((e) => !e.featured);

  const eventsByDay = buildEventsByDay(areaFilteredEvents);

  const makeHref = ({
    category,
    date,
    on,
    area,
  }: {
    category?: string;
    date?: string;
    on?: string | null;
    area?: string | null;
  }) => {
    const params = new URLSearchParams();
    const cat = category ?? activeCategory ?? "all";
    const dateKey = date ?? activeDateFilter ?? "all";
    const areaKey =
      typeof area === "string" ? area : area === null ? null : activeArea;
    const onKey =
      typeof on === "string" ? on : on === null ? null : activeDay;

    if (cat && cat !== "all") params.set("category", cat);
    if (dateKey && dateKey !== "all") params.set("date", dateKey);
    if (onKey) params.set("on", onKey);
    if (areaKey) params.set("area", areaKey);

    const qs = params.toString();
    return qs ? `/whats-on?${qs}` : "/whats-on";
  };

  let headingLabel =
    activeDay && filteredEvents.length
      ? `Events on ${new Date(activeDay).toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
        })}`
      : "Upcoming events";
  if (hasSearch) headingLabel = "Search results";

  const clearSearchHref = makeHref({
    category: activeCategory ?? "all",
    date: activeDay ? "all" : activeDateFilter,
    on: activeDay,
    area: activeArea,
  });

  const availableAreas = Array.from(
    new Set(
      categoryFilteredEvents
        .map((ev) => ev.area ?? ev.location ?? "")
        .map((a) => a.trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

  // ── RENDER ────────────────────────────────────────────────────────────────

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:py-12">

      {/* ── PAGE HEADER ─────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-700 transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-700">What&apos;s On</span>
        </nav>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Isle of Man events &amp; fixtures
            </p>
            <h1 className="font-playfair text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
              What&apos;s On<span className="text-[#E8002D]">.</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
              Upcoming events, gigs, family days, fixtures and community moments across the island.
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Listing something?{" "}
              <Link href="/whats-on/submit" className="font-semibold text-[#E8002D] hover:underline">
                Submit your event →
              </Link>
            </p>
          </div>

          {/* Search */}
          <form
            action="/whats-on"
            method="GET"
            className="flex w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 shadow-sm sm:w-80 sm:py-2.5"
          >
            {activeCategory && (
              <input type="hidden" name="category" value={activeCategory} />
            )}
            {activeDay && <input type="hidden" name="on" value={activeDay} />}
            {!activeDay && activeDateFilter && activeDateFilter !== "all" && (
              <input type="hidden" name="date" value={activeDateFilter} />
            )}
            {activeArea && <input type="hidden" name="area" value={activeArea} />}

            <Search className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
            <input
              name="q"
              defaultValue={searchQuery}
              placeholder="Search events…"
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            {hasSearch && (
              <Link
                href={clearSearchHref}
                className="flex-shrink-0 text-[11px] font-semibold text-[#E8002D] hover:underline"
              >
                Clear
              </Link>
            )}
          </form>
        </div>
      </div>

      {/* ── FILTERS + CALENDAR ──────────────────────────────────────────────── */}
      <div className="mb-8 grid gap-4 md:grid-cols-[1fr_220px]">


        {/* Filter panel */}
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-700">
            <Filter className="h-3.5 w-3.5 text-[#E8002D]" />
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
              Filter
            </span>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            <Link
              href={makeHref({ category: "all", on: activeDay })}
              className={`rounded-full px-3 py-2.5 text-xs font-medium transition sm:py-1.5 ${
                !activeCategory
                  ? "bg-[#E8002D] text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-[#E8002D]/40 hover:text-[#E8002D]"
              }`}
            >
              All types
            </Link>
            {FILTER_CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={makeHref({ category: cat, on: activeDay })}
                id={cat === "family" ? "family-days-out" : undefined}
                className={`rounded-full px-3 py-2.5 text-xs font-medium transition sm:py-1.5 ${
                  activeCategory === cat
                    ? "bg-[#E8002D] text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-[#E8002D]/40 hover:text-[#E8002D]"
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </Link>
            ))}
          </div>

          {/* Location */}
          {availableAreas.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                Area
              </span>
              <Link
                href={makeHref({ area: null, on: activeDay })}
                className={`rounded-full px-3 py-2 text-xs font-medium transition sm:py-1 ${
                  !activeArea
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                All
              </Link>
              {availableAreas.map((area) => (
                <Link
                  key={area}
                  href={makeHref({ area, on: activeDay })}
                  className={`rounded-full px-3 py-2 text-xs font-medium transition sm:py-1 ${
                    activeArea === area
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {area}
                </Link>
              ))}
            </div>
          )}

          {/* Date presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
              Date
            </span>
            {Object.entries(DATE_FILTER_LABELS).map(([key, label]) => (
              <Link
                key={key}
                href={makeHref({ date: key, on: null })}
                className={`rounded-full px-3 py-2 text-xs font-medium transition sm:py-1 ${
                  !activeDay && activeDateFilter === key
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Specific day picker — mobile only (desktop uses the calendar sidebar) */}
          <div className="md:hidden">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
              Specific date
            </p>
            <WhatsOnDatePicker
              activeDay={activeDay}
              activeCategory={activeCategory}
              activeArea={activeArea}
            />
          </div>
        </div>

        {/* Mini calendar — hidden on mobile to reduce vertical scroll */}
        <div className="hidden md:block">
          {renderMiniCalendar({
            activeDay,
            activeDateFilter,
            makeHref,
            eventsByDay,
          })}
        </div>
      </div>

      {/* ── FEATURED EVENTS ─────────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#E8002D]" />
            <h2 className="font-playfair text-lg font-bold text-slate-900">
              Featured picks
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((ev) => {
              const href = ev.id.startsWith("mock-")
                ? "/whats-on"
                : `/whats-on/${ev.id}`;
              return (
                <Link
                  key={ev.id}
                  href={href}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-[#E8002D]/30 hover:shadow-md"
                >
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    {ev.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ev.image_url}
                        alt={ev.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                        <Calendar className="h-8 w-8 text-slate-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <span className="absolute left-3 top-3 rounded-full bg-[#E8002D] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      {CATEGORY_LABELS[ev.category] || "Event"}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-[#E8002D] transition-colors">
                      {ev.title}
                    </h3>
                    <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
                      {ev.summary}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="space-y-0.5">
                        <p className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Calendar className="h-3 w-3 text-[#E8002D]" />
                          {formatDateRange(ev.starts_at, ev.ends_at)}
                        </p>
                        <p className="flex items-center gap-1 text-[11px] text-slate-500">
                          <MapPin className="h-3 w-3 text-[#E8002D]" />
                          {ev.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <SaveItemButton
                          storageKey={SAVED_EVENTS_KEY}
                          compact
                          item={{
                            id: String(ev.id),
                            title: ev.title,
                            href,
                            image: ev.image_url ?? null,
                            meta: ev.location ?? null,
                            savedAt: new Date().toISOString(),
                          }}
                        />
                        <span className="text-[11px] font-semibold text-[#E8002D]">
                          Details →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── ALL EVENTS ──────────────────────────────────────────────────────── */}
      <section className="mb-8">
        <div className="mb-5 flex items-baseline justify-between gap-3">
          <h2 className="font-playfair text-xl font-bold text-slate-900">
            {headingLabel}
            {hasSearch && (
              <span className="ml-2 font-dm-sans text-sm font-normal text-slate-500">
                for &ldquo;{searchQuery}&rdquo;
              </span>
            )}
          </h2>
          <span className="text-xs text-slate-400">
            {filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"}
          </span>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
            <Calendar className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">No events found</p>
            <p className="mt-1 text-xs text-slate-400">
              {hasSearch
                ? "Try a different search term or clear your filters."
                : "Try adjusting the filters above."}
            </p>
            <Link
              href="/whats-on"
              className="mt-4 inline-flex items-center rounded-full bg-[#E8002D] px-4 py-2 text-xs font-semibold text-white hover:bg-[#c00026] transition-colors"
            >
              Clear all filters
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {regular.map((ev) => {
              const href = ev.id.startsWith("mock-")
                ? "/whats-on"
                : `/whats-on/${ev.id}`;
              return (
                <li key={ev.id}>
                  <Link
                    href={href}
                    className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition-all hover:border-[#E8002D]/30 hover:shadow-md sm:gap-4 sm:py-3.5"
                  >
                    {/* Date pill */}
                    <div className="hidden flex-shrink-0 flex-col items-center rounded-xl border border-slate-100 bg-slate-50 px-2.5 py-2 text-center sm:flex">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-[#E8002D]">
                        {new Date(ev.starts_at).toLocaleDateString("en-GB", { month: "short" })}
                      </span>
                      <span className="font-playfair text-xl font-bold leading-none text-slate-900">
                        {new Date(ev.starts_at).getDate()}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 group-hover:text-[#E8002D] transition-colors">
                          {ev.title}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                          {CATEGORY_LABELS[ev.category] || "Event"}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 flex-shrink-0 text-[#E8002D]" />
                          {formatDateRange(ev.starts_at, ev.ends_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 flex-shrink-0 text-[#E8002D]" />
                          {ev.location}
                        </span>
                      </div>
                      {ev.summary && (
                        <p className="mt-1 line-clamp-1 text-xs text-slate-400">
                          {ev.summary}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-shrink-0 items-center gap-2">
                      <SaveItemButton
                        storageKey={SAVED_EVENTS_KEY}
                        compact
                        item={{
                          id: String(ev.id),
                          title: ev.title,
                          href,
                          image: ev.image_url ?? null,
                          meta: ev.location ?? null,
                          savedAt: new Date().toISOString(),
                        }}
                      />
                      <span className="hidden text-xs font-semibold text-[#E8002D] sm:inline">
                        View →
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <EventsListTracker
          events={regular.map((ev) => ({
            id: String(ev.id),
            submittedBy: ev.submitted_by ?? null,
          }))}
        />
      </section>

      {/* ── MAP ─────────────────────────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-playfair text-lg font-bold text-slate-900">
              Explore on the map
            </h2>
            <p className="text-xs text-slate-500">
              {filteredEvents.length} pinned location{filteredEvents.length !== 1 ? "s" : ""}
            </p>
          </div>
          <MapPin className="h-5 w-5 text-[#E8002D]" />
        </div>
        <WhatsOnMap
          events={filteredEvents.map((ev) => ({
            id: ev.id,
            title: ev.title,
            location: ev.location,
            summary: ev.summary,
            startsAt: ev.starts_at,
            url: ev.id.startsWith("mock-") ? "/whats-on" : `/whats-on/${ev.id}`,
          }))}
          heightClass="h-[260px] md:h-[360px]"
          title="Events across the island"
        />
      </section>

    </main>
  );
}
