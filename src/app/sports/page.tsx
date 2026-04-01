// src/app/sports/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Calendar, Activity, ChevronRight, ArrowRight } from "lucide-react";

type SportsResult = {
  id: string;
  title: string;
  meta: string;
};

const FALLBACK_RESULTS: SportsResult[] = [
  { id: "mock-1", title: "St Mary's 2 – 1 Peel", meta: "IOM Premier League • Full time" },
  { id: "mock-2", title: "Vikings A 31 – 24 Bacchas A", meta: "Hockey • Full time" },
  { id: "mock-3", title: "Douglas RUFC 19 – 18 Ramsey", meta: "Rugby • Full time" },
];

const COMING_SOON = [
  { code: "rugby", label: "Rugby", desc: "Isle of Man rugby union and league clubs." },
  { code: "cricket", label: "Cricket", desc: "Manx cricket leagues across the island." },
  { code: "netball", label: "Netball", desc: "Local netball clubs and fixtures." },
  { code: "hockey", label: "Hockey", desc: "Isle of Man hockey association." },
  { code: "motorsport", label: "Motorsport", desc: "TT, Manx GP and more." },
];

export default function SportsLandingPage() {
  const [results, setResults] = useState<SportsResult[]>(FALLBACK_RESULTS);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/sports/football/scores");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: { items?: Array<{ id: string; home: string; away: string; score: string; meta: string }> } = await res.json();

        if (json.items && json.items.length > 0) {
          setResults(json.items.map((r) => ({
            id: r.id,
            title: `${r.home} ${r.score} ${r.away}`,
            meta: `${r.meta} • Full time`,
          })));
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error("[sports] load error", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const primaryResult = results[0] ?? FALLBACK_RESULTS[0];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">

      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-1.5 text-xs text-slate-400">
        <Link href="/" className="hover:text-slate-700 transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-700">Sports</span>
      </nav>

      {/* Page header */}
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E8002D] mb-2">
          Island sports hub
        </p>
        <h1 className="font-playfair text-4xl font-bold text-slate-900 sm:text-5xl">
          Live sport across the<br />
          <em>Isle of Man.</em>
        </h1>
        <p className="mt-4 max-w-xl text-base text-slate-500 leading-relaxed">
          Results, tables and fixtures for local competitions — starting with Manx
          football, with more sports to follow.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/sports/football"
            className="inline-flex items-center gap-2 rounded-full bg-[#E8002D] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c00026]"
          >
            <Trophy className="h-4 w-4" />
            Explore football hub
          </Link>
          <Link
            href="#latest-results"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            View latest results
          </Link>
        </div>
      </div>

      {/* Latest results + sidebar */}
      <div
        id="latest-results"
        className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
      >
        {/* Results list */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-dot" />
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                  Live feed
                </span>
              </div>
              <h2 className="font-playfair text-xl font-bold text-slate-900">
                Latest island results
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Football first, with hockey, rugby and more to follow.
              </p>
            </div>
            <Link
              href="/sports/football"
              className="shrink-0 text-xs font-semibold text-[#E8002D] hover:underline"
            >
              Football hub →
            </Link>
          </div>

          {loading ? (
            <ul className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="animate-pulse rounded-xl bg-slate-100 px-4 py-3">
                  <div className="h-3 w-40 rounded bg-slate-200" />
                  <div className="mt-2 h-3 w-56 rounded bg-slate-100" />
                </li>
              ))}
            </ul>
          ) : results.length === 0 ? (
            <p className="text-sm text-slate-400">
              No recent results yet. Scores will appear here as leagues feed in.
            </p>
          ) : (
            <ul className="space-y-2">
              {results.slice(0, 6).map((r) => (
                <li key={r.id}>
                  <Link
                    href="/sports/football"
                    className="group flex flex-col rounded-xl border border-slate-100 px-4 py-3 transition hover:border-[#E8002D]/30 hover:shadow-sm"
                  >
                    <span className="text-sm font-semibold text-slate-900 group-hover:text-[#E8002D] transition-colors">
                      {r.title}
                    </span>
                    {r.meta && (
                      <span className="mt-0.5 text-xs text-slate-500">{r.meta}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Highlight card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                Latest full-time
              </h3>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                Updated live
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900">{primaryResult.title}</p>
            {primaryResult.meta && (
              <p className="mt-1 text-xs text-slate-500">{primaryResult.meta}</p>
            )}
            <Link
              href="/sports/football"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#E8002D] hover:underline"
            >
              Full results &amp; tables <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Football hub CTA */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-4 w-4 text-[#E8002D]" />
              <h3 className="text-sm font-semibold text-slate-900">Football hub</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Canada Life Premier League, DPS Ltd Division Two and combination
              leagues — results, tables and fixtures.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/sports/football"
                className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black"
              >
                Open football hub
              </Link>
              <Link
                href="/sports/football#tables"
                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                League tables
              </Link>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-[#E8002D]" />
              <h3 className="text-sm font-semibold text-slate-900">Submit your league</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Run a league or club and want scores, tables and fixtures live on ManxHive?
            </p>
            <Link
              href="/contact"
              className="mt-3 inline-flex text-xs font-semibold text-[#E8002D] hover:underline"
            >
              Get in touch about integration →
            </Link>
          </div>
        </div>
      </div>

      {/* More sports section */}
      <section className="mt-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E8002D] mb-1">
              More coming soon
            </p>
            <h2 className="font-playfair text-2xl font-bold text-slate-900">
              All island sports
            </h2>
          </div>
          <Link href="/list-league" className="text-xs font-semibold text-[#E8002D] hover:underline">
            Submit a league →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Football — live */}
          <div className="flex flex-col gap-3 rounded-2xl border border-[#E8002D]/20 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-[#E8002D]" />
              <h3 className="text-sm font-semibold text-slate-900">Football</h3>
              <span className="ml-auto rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                Live
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Full Manx football coverage: Premier League, Division Two and both
              combination leagues.
            </p>
            <Link
              href="/sports/football"
              className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-[#E8002D] hover:underline"
            >
              View football hub <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {COMING_SOON.map((sport) => (
            <div
              key={sport.code}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-900">{sport.label}</h3>
                <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                  Soon
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{sport.desc}</p>
              <Link
                href={`/sports/${sport.code}`}
                className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-[#E8002D] hover:underline"
              >
                View {sport.label} hub <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
