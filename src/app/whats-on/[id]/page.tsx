// src/app/whats-on/[id]/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Calendar, MapPin, Ticket, Sparkles, ChevronRight } from "lucide-react";
import EventAnalyticsTracker from "../EventAnalyticsTracker";
import EventTicketButton from "../EventTicketButton";

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
  submitted_by?: string | null;
};

function formatDateRange(starts_at: string | null, ends_at: string | null) {
  if (!starts_at) return "";
  const start = new Date(starts_at);
  if (Number.isNaN(start.getTime())) return "";

  if (!ends_at) {
    return start.toLocaleString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const end = new Date(ends_at);
  if (Number.isNaN(end.getTime())) {
    return start.toLocaleString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
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
      weekday: "long",
      day: "numeric",
      month: "long",
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

  return `${start.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })} – ${end.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  if (!supabaseUrl || !supabaseAnonKey) return {};
  const supabase = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
  const { data } = await supabase
    .from("events")
    .select("title,summary,description,image_url,venue,starts_at")
    .eq("id", params.id)
    .maybeSingle();
  if (!data) return {};
  const title = data.title;
  const description = data.summary || data.description?.slice(0, 155) || `${title} — event on ManxHive, Isle of Man.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(data.image_url ? { images: [{ url: data.image_url }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  if (!supabaseUrl || !supabaseAnonKey) notFound();

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase
    .from("events")
    .select(
      "id,title,summary,description,venue,category,starts_at,ends_at,image_url,ticket_url,featured,approved,submitted_by"
    )
    .eq("id", params.id)
    .maybeSingle();

  if (error) console.error("[whats-on/[id]] load error:", error);
  if (!data || data.approved === false) notFound();

  const event = data as Event;
  const dateLabel = formatDateRange(event.starts_at, event.ends_at);
  const hasTickets = !!event.ticket_url;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:py-12">
      <EventAnalyticsTracker
        eventId={String(event.id)}
        submittedBy={event.submitted_by ?? null}
      />

      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-slate-400">
        <Link href="/" className="hover:text-slate-700 transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/whats-on" className="hover:text-slate-700 transition-colors">What&apos;s On</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="truncate text-slate-700">{event.title}</span>
      </nav>

      {/* Hero image */}
      {event.image_url && (
        <div className="mb-6 overflow-hidden rounded-2xl bg-slate-100 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.image_url}
            alt={event.title}
            className="h-56 w-full object-cover sm:h-72 md:h-80"
          />
        </div>
      )}

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">

        {/* Left: title + description */}
        <div className="order-2 space-y-6 lg:order-1">
          {/* Badges + title */}
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {event.category && (
                <span className="rounded-full bg-[#E8002D]/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#E8002D]">
                  {event.category}
                </span>
              )}
              {event.featured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                  <Sparkles className="h-3 w-3" />
                  Featured
                </span>
              )}
            </div>

            <h1 className="font-playfair text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              {event.title}
            </h1>

            {event.summary && (
              <p className="mt-3 text-base leading-relaxed text-slate-500">
                {event.summary}
              </p>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="font-playfair mb-3 text-lg font-bold text-slate-900">
                About this event
              </h2>
              <div className="prose prose-sm max-w-none text-slate-700">
                <p>{event.description}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: meta + CTA */}
        <div className="order-1 space-y-4 lg:order-2">
          {/* Details card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Event details
            </h2>

            <div className="space-y-3">
              {dateLabel && (
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E8002D]" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Date &amp; time
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-slate-800">
                      {dateLabel}
                    </p>
                  </div>
                </div>
              )}

              {event.venue && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E8002D]" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Venue
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-slate-800">
                      {event.venue}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Ticket CTA */}
            {hasTickets && (
              <div className="mt-5 border-t border-slate-100 pt-5">
                <EventTicketButton
                  href={event.ticket_url!}
                  eventId={String(event.id)}
                  submittedBy={event.submitted_by ?? null}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#E8002D] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c00026]"
                >
                  <Ticket className="h-4 w-4" />
                  Buy tickets
                </EventTicketButton>
                <p className="mt-2 text-center text-[10px] text-slate-400">
                  Tickets handled by the organiser. ManxHive is not the ticket seller.
                </p>
              </div>
            )}
          </div>

          {/* Back link */}
          <Link
            href="/whats-on"
            className="flex items-center gap-1 text-sm font-semibold text-[#E8002D] hover:underline"
          >
            ← Back to What&apos;s On
          </Link>
        </div>
      </div>
    </main>
  );
}
