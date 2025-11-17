// src/app/whats-on/page.tsx

import Link from "next/link";
import { headers } from "next/headers";
import {
  Calendar,
  MapPin,
  Sparkles,
  Filter,
  ChevronRight,
} from "lucide-react";

type EventCategory = "family" | "sports" | "nightlife" | "community" | "other";

type EventItem = {
  id: string;
  title: string;
  category: EventCategory;
  location: string;
  starts_at: string;
  ends_at?: string | null;
  summary: string;
  image_url?: string | null;
  featured?: boolean;
};

const CATEGORY_LABELS: Record<EventCategory, string> = {
  family: "Family & Kids",
  sports: "Sports",
  nightlife: "Nightlife & Music",
  community: "Community & Culture",
  other: "Other",
};

const DATE_FILTER_LABELS: Record<string, string> = {
  all: "All dates",
  today: "Today",
  weekend: "This weekend",
  next7: "Next 7 days",
  next30: "Next 30 days",
};

function absolute(path: string) {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}${path}`;
}

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
      const day = now.getDay(); // 0 = Sun
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
  // Expecting YYYY-MM-DD
  const [y, m, d] = onDate.split("-").map((n) => Number(n));
  if (
    !y ||
    !m ||
    !d ||
    m < 1 ||
    m > 12 ||
    d < 1 ||
    d > 31 // simple guard; actual JS Date will clamp if invalid
  ) {
    return { from: null as string | null, to: null as string | null };
  }

  const start = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return {
    from: start.toISOString(),
    to: end.toISOString(),
  };
}

async function fetchEvents(params: {
  category?: string | null;
  dateFilter?: string | null;
  onDate?: string | null;
}): Promise<EventItem[]> {
  const search = new URLSearchParams();

  if (params.category && params.category !== "all") {
    search.set("category", params.category);
  }

  // Specific day filter has priority if provided
  if (params.onDate) {
    const { from, to } = buildRangeForSpecificDay(params.onDate);
    if (from) search.set("from", from);
    if (to) search.set("to", to);
  } else if (params.dateFilter && params.dateFilter !== "all") {
    const { from, to } = buildRangeForPreset(params.dateFilter);
    if (from) search.set("from", from);
    if (to) search.set("to", to);
  }

  // Default: only upcoming
  if (!search.has("from")) {
    const now = new Date();
    search.set("from", now.toISOString());
  }

  const url = absolute(`/api/events?${search.toString()}`);

  try {
    const res = await fetch(url, { next: { revalidate: 30 } });
    if (!res.ok) {
      console.error("[whats-on] failed to load events:", res.status);
      return [];
    }
    const data = await res.json();
    return data.events ?? [];
  } catch (err) {
    console.error("[whats-on] error fetching events:", err);
    return [];
  }
}

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

// ---------- Mini calendar renderer (server-safe, no hooks) ----------

function buildEventsByDay(events: EventItem[]): Set<string> {
  const days = new Set<string>();
  for (const ev of events) {
    const d = new Date(ev.starts_at);
    if (!Number.isNaN(d.getTime())) {
      const iso = d.toISOString().slice(0, 10); // YYYY-MM-DD
      days.add(iso);
    }
  }
  return days;
}

function renderMiniCalendar(opts: {
  activeDay: string | null;
  activeDateFilter: string;
  makeHref: (params: {
    on?: string | null;
    date?: string;
    category?: string;
  }) => string;
  eventsByDay: Set<string>;
}) {
  const { activeDay, activeDateFilter, makeHref, eventsByDay } = opts;

  // Choose which month to show
  let base = activeDay ? new Date(activeDay) : new Date();

  if (Number.isNaN(base.getTime())) {
    base = new Date();
  }

  const year = base.getFullYear();
  const month = base.getMonth(); // 0-11

  const monthStart = new Date(year, month, 1);
  const startWeekday = (monthStart.getDay() + 6) % 7; // Mon=0

  // Build up to 6 weeks (42 cells)
  const cells: {
    label: number;
    dateStr: string;
    inMonth: boolean;
  }[] = [];

  // First cell date = monthStart - startWeekday days
  const firstDate = new Date(monthStart);
  firstDate.setDate(monthStart.getDate() - startWeekday);

  for (let i = 0; i < 42; i++) {
    const d = new Date(firstDate);
    d.setDate(firstDate.getDate() + i);

    const cellYear = d.getFullYear();
    const cellMonth = d.getMonth();
    const label = d.getDate();
    const inMonth = cellYear === year && cellMonth === month;

    const iso = d.toISOString().slice(0, 10);

    cells.push({ label, dateStr: iso, inMonth });
  }

  const monthLabel = monthStart.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const weekdays = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div className="rounded-2xl border bg-white p-3 text-[9px] shadow-sm">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-gray-800">
          <Calendar className="h-3.5 w-3.5 text-[#D90429]" />
          <span className="font-semibold">Quick calendar</span>
        </div>
        <span className="text-[8px] text-gray-500">
          {monthLabel} • click a date to filter
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[8px] text-gray-500">
        {weekdays.map((d) => (
          <div key={d} className="py-0.5 font-medium">
            {d}
          </div>
        ))}
        {cells.map((cell, idx) => {
          const hasEvents = eventsByDay.has(cell.dateStr);
          const isActive = activeDay === cell.dateStr;
          const muted = !cell.inMonth;

          return (
            <Link
              key={`${cell.dateStr}-${idx}`}
              href={makeHref({
                on: cell.dateStr,
                date: "all",
              })}
              className={`flex flex-col items-center justify-center rounded-md border px-0.5 py-0.5 transition ${
                isActive
                  ? "border-[#D90429] bg-[#D90429] text-white"
                  : hasEvents
                  ? "border-[#D90429]/30 bg-[#FFF6F6]"
                  : "border-transparent bg-gray-50"
              } ${
                muted && !isActive ? "opacity-40" : ""
              } hover:border-[#D90429]/60`}
            >
              <span className="leading-none">{cell.label}</span>
              {hasEvents && !isActive && (
                <span className="mt-0.5 h-1 w-1 rounded-full bg-[#D90429]" />
              )}
              {isActive && (
                <span className="mt-0.5 h-1 w-1 rounded-full bg-white" />
              )}
            </Link>
          );
        })}
      </div>
      {activeDay && (
        <div className="mt-1 flex items-center justify-between gap-2 text-[8px] text-gray-500">
          <span>
            Showing events on{" "}
            {new Date(activeDay).toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </span>
          <Link
            href={makeHref({ on: null, date: activeDateFilter || "all" })}
            className="text-[#D90429] hover:underline"
          >
            Clear date
          </Link>
        </div>
      )}
    </div>
  );
}

// ---------- Page ----------

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

  const onParam = Array.isArray(searchParams?.on)
    ? searchParams?.on[0]
    : searchParams?.on;

  const activeCategory =
    categoryParam && categoryParam !== "all"
      ? (categoryParam as EventCategory)
      : undefined;

  const activeDateFilter =
    onParam && onParam.length === 10
      ? "all" // specific day overrides preset label
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

  const featured = events.filter((e) => e.featured);
  const regular = events.filter((e) => !e.featured);

  const eventsByDay = buildEventsByDay(events);

  // build href helper that keeps/overrides filters
  const makeHref = ({
    category,
    date,
    on,
  }: {
    category?: string;
    date?: string;
    on?: string | null;
  }) => {
    const params = new URLSearchParams();

    const cat = category ?? activeCategory ?? "all";
    const dateKey = date ?? activeDateFilter ?? "all";
    const onKey =
      typeof on === "string"
        ? on
        : on === null
        ? null
        : activeDay;

    if (cat && cat !== "all") params.set("category", cat);
    if (dateKey && dateKey !== "all") params.set("date", dateKey);
    if (onKey) params.set("on", onKey);

    const qs = params.toString();
    return qs ? `/whats-on?${qs}` : "/whats-on";
  };

  const headingLabelBase = "Upcoming events";
  const headingLabel =
    activeDay && events.length
      ? `${headingLabelBase} on ${new Date(activeDay).toLocaleDateString(
          "en-GB",
          { weekday: "short", day: "numeric", month: "short" }
        )}`
      : headingLabelBase;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="mb-1 text-xs text-gray-500">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        / <span className="text-gray-800">What&apos;s On</span>
      </nav>

      {/* Page header */}
      <header className="flex flex-col gap-3 rounded-2xl border bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF6F6] px-2 py-1 text-[10px] font-medium text-[#D90429]">
            <Calendar className="h-3 w-3" />
            Isle of Man events &amp; fixtures
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900">
            What&apos;s On
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            A clean view of upcoming events, fixtures, family days, gigs and
            community moments across the island.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 text-xs md:items-end">
          <p className="text-gray-500">
            Listing something?{" "}
            <Link
              href="/whats-on/submit"
              className="font-semibold text-[#D90429] hover:underline"
            >
              Send us your event
            </Link>
          </p>
          <p className="text-[10px] text-gray-400">
            For launch this is curated by the ManxHive team. Self-serve tools
            coming soon.
          </p>
        </div>
      </header>

      {/* Filters + Mini calendar */}
      <section className="grid gap-3 md:grid-cols-[minmax(0,2fr),minmax(220px,1fr)]">
        {/* Filters */}
        <div className="flex flex-col gap-3 rounded-2xl border bg-white p-4 text-xs shadow-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <Filter className="h-3.5 w-3.5 text-[#D90429]" />
            <span className="font-semibold">Filter events</span>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-1.5">
            <Link
              href={makeHref({ category: "all", on: activeDay })}
              className={`rounded-full px-3 py-1 ${
                !activeCategory
                  ? "bg-[#D90429] text-white"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              All types
            </Link>
            {(Object.keys(CATEGORY_LABELS) as EventCategory[]).map((cat) => (
              <Link
                key={cat}
                href={makeHref({ category: cat, on: activeDay })}
                id={cat === "family" ? "family-days-out" : undefined}
                className={`rounded-full px-3 py-1 ${
                  activeCategory === cat
                    ? "bg-[#D90429] text-white"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </Link>
            ))}
          </div>

          {/* Date presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wide text-gray-400">
              Date
            </span>
            {Object.entries(DATE_FILTER_LABELS).map(([key, label]) => (
              <Link
                key={key}
                href={makeHref({
                  date: key,
                  on: null, // presets clear specific day
                })}
                className={`rounded-full px-2.5 py-1 text-[10px] ${
                  activeDay
                    ? "bg-gray-50 text-gray-500 hover:bg-gray-100"
                    : activeDateFilter === key
                    ? "bg-slate-900 text-white"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Mini calendar */}
        {renderMiniCalendar({
          activeDay,
          activeDateFilter,
          makeHref,
          eventsByDay,
        })}
      </section>

      {/* Featured strip */}
      {featured.length > 0 && (
        <section className="rounded-2xl border bg-[#FFF6F6] p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#D90429]">
              <Sparkles className="h-3.5 w-3.5" />
              Featured picks
            </div>
            <span className="text-[9px] text-gray-500">
              Curated highlights from the next few weeks.
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {featured.map((ev) => {
              const href = ev.id.startsWith("mock-")
                ? "/whats-on"
                : `/whats-on/${ev.id}`;
              return (
                <Link
                  key={ev.id}
                  href={href}
                  className="flex flex-col overflow-hidden rounded-2xl border bg-white text-xs transition hover:border-[#D90429] hover:shadow-sm"
                >
                  <div className="relative h-24 w-full overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        ev.image_url ||
                        "https://placehold.co/600x300?text=Event"
                      }
                      alt={ev.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-3">
                    <div className="flex items-center justify-between gap-2 text-[9px] text-gray-500">
                      <span className="rounded-full bg-[#FFF6F6] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-[#D90429]">
                        {CATEGORY_LABELS[ev.category] || "Event"}
                      </span>
                      <span>{formatDateRange(ev.starts_at, ev.ends_at)}</span>
                    </div>
                    <h3 className="line-clamp-2 text-xs font-semibold text-gray-900">
                      {ev.title}
                    </h3>
                    <p className="line-clamp-2 text-[10px] text-gray-600">
                      {ev.summary}
                    </p>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-1 text-[9px] text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {ev.location}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[#D90429]">
                        View details
                        <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* All events */}
      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-gray-900">
            {headingLabel}
          </h2>
          <p className="text-[9px] text-gray-500">
            Showing the most recent upcoming first.
          </p>
        </div>

        {events.length === 0 ? (
          <p className="text-xs text-gray-500">
            Nothing in this view yet. Try adjusting your filters or check back
            soon.
          </p>
        ) : (
          <ul className="space-y-2 text-xs">
            {regular.map((ev) => {
              const href = ev.id.startsWith("mock-")
                ? "/whats-on"
                : `/whats-on/${ev.id}`;
              return (
                <li key={ev.id}>
                  <Link
                    href={href}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-3 py-2 transition hover:border-[#D90429] hover:shadow-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {ev.title}
                        </span>
                        <span className="rounded-full bg-gray-50 px-2 py-0.5 text-[8px] text-gray-600">
                          {CATEGORY_LABELS[ev.category] || "Event"}
                        </span>
                      </div>
                      <div className="mt-0.5 flex flex-wrap gap-3 text-[9px] text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDateRange(ev.starts_at, ev.ends_at)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {ev.location}
                        </span>
                        <span className="line-clamp-1 text-[9px] text-gray-500">
                          {ev.summary}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-[#D90429]">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-1 font-medium">
                        View details
                        <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}