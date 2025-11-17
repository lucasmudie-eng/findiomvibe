// src/app/whats-on/[id]/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Calendar, MapPin, Ticket, Sparkles } from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type Event = {
  id: string;
  title: string;
  summary: string | null;
  description: string | null;
  venue: string | null;
  category: string | null;
  starts_at: string | null;
  ends_at: string | null;
  image_url: string | null;
  ticket_url: string | null;
  featured: boolean | null;
  approved: boolean | null;
};

function formatDateRange(starts_at: string | null, ends_at: string | null) {
  if (!starts_at) return "";

  const start = new Date(starts_at);
  if (Number.isNaN(start.getTime())) return "";

  if (!ends_at) {
    return start.toLocaleString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
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
      year: "numeric",
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
      year: "numeric",
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
    year: "numeric",
  });
  const endStr = end.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${startStr} – ${endStr}`;
}

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  if (!supabaseUrl || !supabaseAnonKey) {
    notFound();
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase
    .from("events")
    .select(
      `
      id,
      title,
      summary,
      description,
      venue,
      category,
      starts_at,
      ends_at,
      image_url,
      ticket_url,
      featured,
      approved
    `
    )
    .eq("id", params.id)
    .maybeSingle();

  if (error) {
    console.error("[whats-on/[id]] load error:", error);
  }

  if (!data || data.approved === false) {
    notFound();
  }

  const event = data as Event;

  const dateLabel = formatDateRange(event.starts_at, event.ends_at);

  const hasTickets = !!event.ticket_url;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        /{" "}
        <Link href="/whats-on" className="hover:underline">
          What&apos;s On
        </Link>{" "}
        / <span className="text-gray-800 truncate">{event.title}</span>
      </nav>

      {/* Header card */}
      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        {event.image_url && (
          <div className="h-44 w-full overflow-hidden bg-gray-100 sm:h-56">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.image_url}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="space-y-3 p-5">
          <div className="flex flex-wrap items-center gap-2 text-[10px]">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF6F6] px-2 py-0.5 font-semibold uppercase tracking-wide text-[#D90429]">
              <Calendar className="h-3 w-3" />
              {event.category || "Event"}
            </span>
            {event.featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 font-semibold uppercase tracking-wide text-amber-700">
                <Sparkles className="h-3 w-3" />
                Featured
              </span>
            )}
          </div>

          <h1 className="text-2xl font-semibold text-gray-900">
            {event.title}
          </h1>

          <div className="flex flex-wrap gap-3 text-xs text-gray-600">
            {dateLabel && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {dateLabel}
              </span>
            )}
            {event.venue && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {event.venue}
              </span>
            )}
          </div>

          {event.summary && (
            <p className="mt-1 text-sm text-gray-700">{event.summary}</p>
          )}

          {hasTickets && (
            <div className="pt-2">
              <a
                href={event.ticket_url!}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#D90429] px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#b80321]"
              >
                <Ticket className="h-4 w-4" />
                Buy tickets
              </a>
              <p className="mt-1 text-[10px] text-gray-400">
                Tickets handled by the organiser’s own system. ManxHive is not
                the ticket seller.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Description */}
      {(event.description || !hasTickets) && (
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-gray-900">
            About this event
          </h2>
          {event.description ? (
            <div className="prose prose-sm max-w-none text-gray-800">
              <p>{event.description}</p>
            </div>
          ) : (
            <p className="text-xs text-gray-500">
              More details coming soon. Check with the organiser if you need
              specifics.
            </p>
          )}
        </section>
      )}

      {/* Back */}
      <div>
        <Link
          href="/whats-on"
          className="text-xs font-medium text-[#D90429] hover:underline"
        >
          ← Back to What&apos;s On
        </Link>
      </div>
    </main>
  );
}