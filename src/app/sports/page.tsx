// src/app/sports/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Calendar, Activity } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";

type SportsResult = {
  id: string;
  title: string;
  meta: string;
  created_at?: string | null;
};

const FALLBACK_RESULTS: SportsResult[] = [
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
  {
    id: "mock-3",
    title: "Douglas RUFC 19 – 18 Ramsey",
    meta: "Rugby • Full time",
  },
];

export default function SportsLandingPage() {
  const [results, setResults] = useState<SportsResult[]>(FALLBACK_RESULTS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load latest sports results from Supabase
  useEffect(() => {
    const supabase = supabaseBrowser();
    if (!supabase) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setError(null);
        setLoading(true);

        const { data, error } = await supabase
          .from("sports_results")
          .select("id, title, meta, created_at")
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) {
          console.error("[sports] load sports_results error", error);
          setError("Could not load latest results.");
          setLoading(false);
          return;
        }

        if (data && data.length) {
          const mapped: SportsResult[] = data.map((r: any) => ({
            id: String(r.id),
            title: r.title ?? "Result",
            meta: r.meta ?? "",
            created_at: r.created_at ?? null,
          }));
          setResults(mapped);
        }

        setLoading(false);
      } catch (err) {
        console.error("[sports] unexpected error", err);
        setError("Could not load latest results.");
        setLoading(false);
      }
    })();
  }, []);

  const primaryResult = results[0] ?? FALLBACK_RESULTS[0];
  const tickerResults = results.slice(0, 6);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-10">
      {/* Breadcrumb */}
      <nav className="mb-2 text-sm text-gray-500">
        <span>Sports</span>
      </nav>

      {/* HERO + primary highlight */}
      <section className="rounded-3xl bg-gradient-to-r from-[#D90429] via-[#f97316] to-[#facc15] p-8 text-white shadow-lg">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-white/90">
              <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
              <span>Island sports hub • Beta</span>
            </div>

            <h1 className="text-3xl font-semibold sm:text-4xl">
              Live sport across the Isle of Man
            </h1>
            <p className="text-sm md:text-base text-red-50/90">
              Results, tables and fixtures for local competitions — starting
              with Manx football, with more sports to follow.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/sports/football"
                className="inline-flex items-center gap-2 rounded-full bg-white/95 px-5 py-2.5 text-sm font-semibold text-[#D90429] shadow-sm transition hover:bg-white"
              >
                <Trophy className="h-4 w-4" />
                Explore Football hub
              </Link>
              <Link
                href="#latest-results"
                className="inline-flex items-center gap-2 rounded-full bg-transparent px-5 py-2.5 text-sm font-semibold text-white/90 ring-1 ring-white/40 transition hover:bg-white/10"
              >
                View latest results
              </Link>
            </div>
          </div>

          {/* Live highlight card */}
          <div className="w-full max-w-xs rounded-2xl bg-white/95 p-4 text-sm text-gray-900 shadow-md">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-[#D90429]" />
                <h2 className="font-semibold text-gray-900">
                  Latest full-time
                </h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                Updated live
              </span>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {primaryResult.title}
            </p>
            {primaryResult.meta && (
              <p className="mt-1 text-xs text-gray-600">{primaryResult.meta}</p>
            )}
            <Link
              href="/sports/football"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#D90429] hover:underline"
            >
              View full results &amp; tables
            </Link>
          </div>
        </div>

        {/* Results ticker */}
        <div className="mt-6 px-1 text-[11px]">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-white/90">
            <span className="h-1.5 w-1.5 rounded-full bg-lime-300" />
            <span>Results ticker</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {tickerResults.map((r) => (
              <div
                key={r.id}
                className="flex-shrink-0 rounded-full bg-white px-3 py-1 text-[11px] text-gray-900"
              >
                <span className="font-semibold">{r.title}</span>
                {r.meta && (
                  <span className="text-gray-500"> • {r.meta}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LATEST RESULTS + QUICK LINKS */}
      <section
        id="latest-results"
        className="grid gap-6 md:grid-cols-[minmax(0,2fr),minmax(0,1.3fr)]"
      >
        {/* Latest island results */}
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-[#D90429]" />
                <h2 className="text-base font-semibold text-gray-900">
                  Latest island results
                </h2>
              </div>
              <p className="mt-1 text-xs text-gray-600">
                Football first, with hockey, rugby and more to follow.
              </p>
            </div>
            <Link
              href="/sports/football"
              className="text-xs font-semibold text-[#D90429] hover:underline"
            >
              Go to football hub →
            </Link>
          </div>

          {loading ? (
            <ul className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <li
                  key={i}
                  className="animate-pulse rounded-xl bg-gray-50 px-3 py-3"
                >
                  <div className="h-3 w-40 rounded bg-gray-200" />
                  <div className="mt-2 h-3 w-56 rounded bg-gray-100" />
                </li>
              ))}
            </ul>
          ) : error ? (
            <p className="text-xs text-red-500">{error}</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {results.slice(0, 6).map((r) => (
                <li key={r.id}>
                  <Link
                    href="/sports/football"
                    className="group flex flex-col rounded-xl px-3 py-2 transition hover:bg-gray-50"
                  >
                    <span className="font-medium text-gray-900 group-hover:text-[#D90429]">
                      {r.title}
                    </span>
                    {r.meta && (
                      <span className="text-xs text-gray-600">
                        {r.meta}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick actions / CTAs */}
        <div className="space-y-4">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-[#D90429]" />
              <h3 className="text-sm font-semibold text-gray-900">
                Football hub
              </h3>
            </div>
            <p className="mt-1 text-xs text-gray-600">
              Canada Life Premier League, DPS Ltd Division Two and combination
              leagues — results, tables and fixtures.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <Link
                href="/sports/football"
                className="inline-flex items-center rounded-full bg-gray-900 px-3 py-1.5 font-semibold text-white hover:bg-black"
              >
                Open football hub
              </Link>
              <Link
                href="/sports/football#tables"
                className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1.5 font-semibold text-gray-900 hover:bg-gray-100"
              >
                View league tables
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#D90429]" />
              <h3 className="text-sm font-semibold text-gray-900">
                Submit your league
              </h3>
            </div>
            <p className="mt-1 text-xs text-gray-600">
              Run a league or club and want your scores, tables and fixtures
              live on ManxHive?
            </p>
            <Link
              href="/contact"
              className="mt-3 inline-flex text-xs font-semibold text-[#D90429] hover:underline"
            >
              Get in touch about integration →
            </Link>
          </div>
        </div>
      </section>

      {/* FUTURE SPORTS / CATEGORY CARDS */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-2 rounded-2xl border bg-white p-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[#D90429]" />
            <h3 className="text-sm font-semibold text-gray-900">Football</h3>
          </div>
          <p className="text-xs text-gray-600">
            Full Manx football coverage: Premier League, Division Two and both
            combination leagues.
          </p>
          <Link
            href="/sports/football"
            className="mt-auto inline-flex text-xs font-semibold text-[#D90429] hover:underline"
          >
            View football hub
          </Link>
        </div>

        <div className="flex flex-col gap-2 rounded-2xl border bg-white p-4 opacity-75">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-800">
              More sports coming soon
            </h3>
          </div>
          <p className="text-xs text-gray-600">
            Rugby, netball, hockey, motorsport &amp; more — added as leagues
            and clubs come onboard.
          </p>
        </div>

        <div className="flex flex-col gap-2 rounded-2xl border bg-white p-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#D90429]" />
            <h3 className="text-sm font-semibold text-gray-900">
              Feature your competition
            </h3>
          </div>
          <p className="text-xs text-gray-600">
            Want your sport to have its own hub with tables, fixtures and live
            scores?
          </p>
          <Link
            href="/contact"
            className="mt-auto inline-flex text-xs font-semibold text-[#D90429] hover:underline"
          >
            Talk to us about a new hub →
          </Link>
        </div>
      </section>
    </main>
  );
}