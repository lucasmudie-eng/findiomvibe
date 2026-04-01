import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

type EventItem = {
  id: string;
  title: string;
  category: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  summary: string | null;
  image_url: string | null;
};

function weekendRange() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const daysToFriday = (5 - day + 7) % 7;
  const start = new Date(now);
  start.setDate(now.getDate() + daysToFriday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 3);

  return { start, end };
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

  return `${start.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })} – ${end.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })}`;
}

export default async function WeekendPage() {
  const supabase = supabaseServer();
  const { start, end } = weekendRange();

  let events: EventItem[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("events")
      .select(
        "id, title, category, location, starts_at, ends_at, summary, image_url"
      )
      .eq("approved", true)
      .gte("starts_at", start.toISOString())
      .lt("starts_at", end.toISOString())
      .order("starts_at", { ascending: true })
      .limit(30);

    events = (data ?? []) as EventItem[];
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <nav className="mb-1 text-xs text-gray-500">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        / <span className="text-gray-800">This Weekend</span>
      </nav>

      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF5F5] px-3 py-1 text-[10px] font-medium text-[#D90429]">
          What’s on this weekend
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
          Your weekend plan, sorted
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          A focused list of events happening Friday through Sunday across the
          Isle of Man.
        </p>
      </header>

      {events.length === 0 ? (
        <div className="rounded-2xl border bg-white p-4 text-sm text-slate-600 shadow-sm">
          No weekend events are scheduled yet. Check back soon.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/whats-on/${event.id}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                {event.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                    Image coming soon
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="text-[10px] text-slate-500">
                  {formatDateRange(event.starts_at, event.ends_at)}
                </div>
                <h2 className="text-base font-semibold text-slate-900">
                  {event.title}
                </h2>
                {event.summary && (
                  <p className="line-clamp-2 text-[11px] text-slate-600">
                    {event.summary}
                  </p>
                )}
                {event.location && (
                  <p className="mt-auto text-[10px] text-slate-500">
                    {event.location}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
