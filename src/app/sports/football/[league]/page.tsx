// src/app/sports/football/[league]/page.tsx

import { headers } from "next/headers";
import Link from "next/link";
import { ChevronRight, ArrowRight, MapPin, Calendar } from "lucide-react";
import LeagueSwitcher from "@/components/LeagueSwitcher";
import VenueFilter from "@/app/sports/components/VenueFilter";
import VenueMap from "@/app/sports/components/VenueMap";
import {
  leagueDisplayName,
  formatTeamName,
  formatScoreLine,
} from "@/lib/football/utils";
import type { LeagueBundle, LeagueId } from "@/lib/football/types";

// ---------- helpers ----------

function absolute(path: string) {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}${path}`;
}

async function fetchLeagueBundle(league: string): Promise<LeagueBundle> {
  const url = absolute(`/api/feed/football?league=${league}`);
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to load league: ${league}`);
  return res.json();
}

const LEAGUE_LABELS: Record<string, string> = {
  "iom-premier-league": "Canada Life Premier League",
  "iom-division-2": "DPS Ltd Division Two",
  "iom-combination-1": "Canada Life Combination One",
  "iom-combination-2": "DPS Ltd Combination Two",
};

// ---------- page ----------

export default async function LeaguePage({
  params,
  searchParams,
}: {
  params: { league: string };
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const league = params.league as LeagueId;

  const venueParam =
    (Array.isArray(searchParams?.venue)
      ? searchParams?.venue[0]
      : searchParams?.venue) || "";

  const bundle = await fetchLeagueBundle(league);
  const label = LEAGUE_LABELS[league] ?? leagueDisplayName(league);

  const latestResults = [...(bundle.resultsRecent ?? [])]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const upcomingAll = bundle.fixturesUpcoming ?? [];
  const venueOptions = Array.from(
    new Set(upcomingAll.map((f) => f.venue).filter(Boolean) as string[])
  ).sort((a, b) => a.localeCompare(b));
  const filteredUpcoming = venueParam
    ? upcomingAll.filter((f) => f.venue === venueParam)
    : upcomingAll;
  const upcoming = filteredUpcoming.slice(0, 5);

  const tableRows = (bundle.table ?? []).map((e, i) => ({
    teamId: e.teamId,
    name: formatTeamName(e.teamId),
    pos: e.pos ?? i + 1,
    ...e,
  }));

  const topResult = latestResults[0];

  return (
    <main>
      {/* ── DARK HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-950">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">

          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-1.5 text-[11px] text-slate-500">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/sports" className="hover:text-slate-300 transition-colors">Sports</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/sports/football" className="hover:text-slate-300 transition-colors">Football</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-300">{label}</span>
          </nav>

          <div className="flex flex-wrap items-start justify-between gap-8">
            {/* Left: title */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E8002D]">
                Isle of Man Football
              </p>
              <h1 className="mt-3 font-playfair text-4xl font-bold text-white sm:text-5xl">
                {label}<span className="text-[#E8002D]">.</span>
              </h1>
              <p className="mt-3 text-sm text-slate-400">
                Latest results, upcoming fixtures &amp; live league table.
              </p>
              <div className="mt-5">
                <LeagueSwitcher
                  current={league}
                  leagues={LEAGUE_LABELS}
                  className="rounded-xl border border-white/15 bg-white/8 px-4 py-2 text-sm text-slate-200 shadow-sm"
                />
              </div>
            </div>

            {/* Right: latest result spotlight */}
            {topResult && (() => {
              const line = formatScoreLine(topResult.homeId, topResult.awayId, topResult.homeGoals, topResult.awayGoals);
              return (
                <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                  <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Latest result
                  </p>
                  <div className="flex items-center gap-3">
                    <p className="flex-1 text-right text-sm font-semibold text-white leading-tight">{line.left}</p>
                    <div className="shrink-0 text-center">
                      <p className="text-2xl font-bold tabular-nums text-[#E8002D]">{line.score}</p>
                      <span className="mt-1 inline-block rounded-full bg-emerald-900/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">FT</span>
                    </div>
                    <p className="flex-1 text-left text-sm font-semibold text-white leading-tight">{line.right}</p>
                  </div>
                  <p className="mt-3 text-[11px] text-slate-500">
                    {new Date(topResult.date).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* ── CONTENT GRID ──────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Left column */}
          <div className="space-y-6 lg:col-span-2">

            {/* Latest results */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Latest results</h2>
              </div>

              {!latestResults.length ? (
                <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-8 text-center text-sm text-slate-400">
                  No results yet for this league.
                </div>
              ) : (
                <div className="space-y-2">
                  {latestResults.map((r) => {
                    const line = formatScoreLine(r.homeId, r.awayId, r.homeGoals, r.awayGoals);
                    return (
                      <div key={r.id} className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
                        <div className="flex items-center gap-4">
                          <p className="min-w-0 flex-1 truncate text-right text-sm font-semibold">{line.left}</p>
                          <div className="shrink-0 text-center">
                            <p className="text-xl font-bold tabular-nums text-[#E8002D]">{line.score}</p>
                            <span className="mt-0.5 inline-block rounded-full bg-emerald-900/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">FT</span>
                          </div>
                          <p className="min-w-0 flex-1 truncate text-left text-sm font-semibold">{line.right}</p>
                        </div>
                        <p className="mt-2 text-center text-[11px] text-slate-500">
                          {new Date(r.date).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Upcoming fixtures */}
            <section>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">Upcoming fixtures</h2>
                {venueOptions.length > 0 && (
                  <VenueFilter venues={venueOptions} value={venueParam} label="Filter by venue" />
                )}
              </div>

              {!upcoming.length ? (
                <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-8 text-center text-sm text-slate-400">
                  No upcoming fixtures in this view.
                </div>
              ) : (
                <div className="space-y-2">
                  {upcoming.map((f) => {
                    const line = formatScoreLine(f.homeId, f.awayId);
                    return (
                      <div key={f.id} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                        <div className="shrink-0 text-center">
                          <Calendar className="mx-auto h-4 w-4 text-slate-400" />
                          <p className="mt-0.5 text-[10px] font-medium text-slate-500 whitespace-nowrap">
                            {new Date(f.date).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                            <span className="truncate">{line.left}</span>
                            <span className="shrink-0 text-[11px] font-normal text-slate-400">vs</span>
                            <span className="truncate">{line.right}</span>
                          </div>
                          {f.venue && (
                            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                              <MapPin className="h-3 w-3" />{f.venue}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-medium text-slate-500">
                          Upcoming
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Fixture map */}
            {upcomingAll.some((f) => f.venue) && (
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold text-slate-900">Fixture map</h2>
                      <p className="mt-0.5 text-xs text-slate-500">Hover a pin to preview the next fixture at each venue.</p>
                    </div>
                    {venueParam && (
                      <span className="rounded-full bg-[#E8002D]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#E8002D]">
                        {venueParam}
                      </span>
                    )}
                  </div>
                </div>
                <VenueMap
                  fixtures={(filteredUpcoming.length ? filteredUpcoming : upcomingAll)
                    .filter((f) => Boolean(f.venue))
                    .map((f) => ({
                      id: f.id, venue: f.venue as string,
                      title: `${formatTeamName(f.homeId)} vs ${formatTeamName(f.awayId)}`,
                      when: new Date(f.date).toLocaleString("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit" }),
                      url: `/sports/football/${league}`,
                    }))}
                />
              </section>
            )}
          </div>

          {/* Right column — League table */}
          <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-900">League table</h2>
              <p className="mt-0.5 text-[11px] text-slate-400">{label}</p>
            </div>

            <div className="overflow-x-auto px-2 py-2">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="text-slate-400">
                    <th className="pb-2 pl-3 pr-1 text-left font-semibold">#</th>
                    <th className="pb-2 pr-2 text-left font-semibold">Team</th>
                    <th className="px-1 pb-2 text-center font-semibold">P</th>
                    <th className="px-1 pb-2 text-center font-semibold">W</th>
                    <th className="px-1 pb-2 text-center font-semibold">D</th>
                    <th className="px-1 pb-2 text-center font-semibold">L</th>
                    <th className="px-1 pb-2 text-center font-semibold">GD</th>
                    <th className="pl-1 pr-3 pb-2 text-right font-semibold">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row, idx) => {
                    const isTop = idx === 0;
                    const isPromotion = idx > 0 && idx < 3;
                    const isRelegation = idx >= tableRows.length - 3 && tableRows.length > 3;
                    const isCurrent = row.teamId === (tableRows.find((r) => r.teamId === row.teamId)?.teamId);
                    return (
                      <tr key={row.teamId} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-2 pl-3 pr-1">
                          <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                            isTop ? "bg-yellow-400 text-yellow-900" :
                            isPromotion ? "bg-emerald-100 text-emerald-700" :
                            isRelegation ? "bg-red-100 text-red-600" :
                            "text-slate-400"
                          }`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-2 pr-2">
                          <Link
                            href={`/sports/football/${league}/${row.teamId}`}
                            className="font-medium text-slate-900 hover:text-[#E8002D] hover:underline transition-colors"
                          >
                            {row.name}
                          </Link>
                        </td>
                        <td className="px-1 py-2 text-center text-slate-600">{row.played}</td>
                        <td className="px-1 py-2 text-center text-slate-600">{row.won}</td>
                        <td className="px-1 py-2 text-center text-slate-600">{row.drawn}</td>
                        <td className="px-1 py-2 text-center text-slate-600">{row.lost}</td>
                        <td className="px-1 py-2 text-center text-slate-600">
                          {row.gd != null ? (row.gd > 0 ? `+${row.gd}` : row.gd) : "—"}
                        </td>
                        <td className="py-2 pl-1 pr-3 text-right font-bold text-slate-900">{row.points}</td>
                      </tr>
                    );
                  })}
                  {tableRows.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-3 py-6 text-center text-sm text-slate-400">
                        No table data yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {tableRows.length > 0 && (
              <div className="border-t border-slate-100 px-5 py-3">
                <div className="flex flex-wrap gap-3 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-yellow-400 inline-block" />Leaders</span>
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-200 inline-block" />Top 3</span>
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-red-200 inline-block" />Bottom 3</span>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
