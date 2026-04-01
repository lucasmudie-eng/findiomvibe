// src/app/sports/football/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "IOM Football – Results, Tables & Fixtures",
  description: "Live results, league tables and upcoming fixtures for all four Isle of Man football leagues — Premier, Division Two, Combination One and Combination Two.",
  alternates: { canonical: "https://manxhive.com/sports/football" },
  openGraph: {
    title: "IOM Football – Results, Tables & Fixtures",
    description: "Follow all four IOM football leagues on ManxHive.",
    url: "https://manxhive.com/sports/football",
  },
};
import { headers } from "next/headers";
import { Trophy, Calendar, MapPin, ChevronRight, ArrowRight } from "lucide-react";
import type { LeagueBundle, Result, Fixture } from "@/lib/football/types";
import { formatTeamName } from "@/lib/football/utils";
import VenueMap from "@/app/sports/components/VenueMap";

// ---------- helpers ----------
function absolute(path: string) {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}${path}`;
}

type LeagueKey = "prem" | "div2" | "comb1" | "comb2";

const LEAGUES: { key: LeagueKey; label: string; short: string }[] = [
  { key: "prem",  label: "Canada Life Premier League",   short: "Premier League" },
  { key: "div2",  label: "DPS Ltd Division Two",         short: "Division Two" },
  { key: "comb1", label: "Canada Life Combination One",  short: "Combination One" },
  { key: "comb2", label: "DPS Ltd Combination Two",      short: "Combination Two" },
];

function leagueKeyToSlug(key: LeagueKey): string {
  switch (key) {
    case "prem":  return "iom-premier-league";
    case "div2":  return "iom-division-2";
    case "comb1": return "iom-combination-1";
    case "comb2": return "iom-combination-2";
    default:      return "iom-premier-league";
  }
}

async function fetchLeague(leagueSlug: string): Promise<LeagueBundle> {
  const url = absolute(`/api/feed/football?league=${leagueSlug}`);
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to load league: ${leagueSlug}`);
  return res.json();
}

function formatWhen(iso: string | undefined) {
  if (!iso) return "TBD";
  try {
    return new Date(iso).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch { return "TBD"; }
}

// ---------- types ----------
type ScoreItem = {
  id: string; home: string; away: string;
  homeScore?: number; awayScore?: number;
  status: "FT" | "HT" | "LIVE" | "NS";
  when?: string; venue?: string;
};
type FixtureItem = { id: string; home: string; away: string; when: string; venue?: string; };

function toScoreItems(results: Result[]): ScoreItem[] {
  return [...results].reverse().slice(0, 4).map((r) => ({
    id: r.id, home: formatTeamName(r.homeId), away: formatTeamName(r.awayId),
    homeScore: r.homeGoals, awayScore: r.awayGoals, status: "FT" as const,
    when: formatWhen(r.date), venue: (r as any).venue,
  }));
}

function toFixtureItems(fixtures: Fixture[]): FixtureItem[] {
  return fixtures.slice(0, 4).map((f) => ({
    id: f.id, home: formatTeamName(f.homeId), away: formatTeamName(f.awayId),
    when: formatWhen(f.date), venue: f.venue,
  }));
}

// ---------- page ----------
export default async function FootballPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const requested = (Array.isArray(searchParams?.league) ? searchParams?.league[0] : searchParams?.league) as LeagueKey | undefined;
  const leagueKey: LeagueKey = requested && ["prem", "div2", "comb1", "comb2"].includes(requested) ? (requested as LeagueKey) : "prem";
  const league = LEAGUES.find((l) => l.key === leagueKey) ?? LEAGUES[0];
  const leagueSlug = leagueKeyToSlug(leagueKey);
  const bundle = await fetchLeague(leagueSlug);

  const tableRows = (bundle.table ?? []).map((e, i) => ({
    id: e.teamId, name: formatTeamName(e.teamId),
    pos: e.pos ?? i + 1, p: e.played, w: e.won, d: e.drawn, l: e.lost,
    gf: e.gf, ga: e.ga, gd: e.gd, pts: e.points,
  }));

  const SCORES: ScoreItem[] = toScoreItems(bundle.resultsRecent ?? []);
  const FIXTURES: FixtureItem[] = toFixtureItems(bundle.fixturesUpcoming ?? []);
  const headlineScore = SCORES[0];

  return (
    <main>
      {/* ── DARK HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-950">
        {/* subtle diagonal stripe texture */}
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
            <span className="text-slate-300">Football</span>
          </nav>

          <div className="flex flex-wrap items-start justify-between gap-8">
            {/* Left: heading + actions */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E8002D]">
                Isle of Man Football · Live beta
              </p>
              <h1 className="mt-3 font-playfair text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
                Results, tables
                <br />
                <em className="text-[#E8002D]">&amp; fixtures.</em>
              </h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
                Follow all four IOM leagues — updated whenever the latest FA data lands.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/sports/football/${leagueSlug}`}
                  className="inline-flex items-center gap-2 rounded-full bg-[#E8002D] px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#c00026]"
                >
                  <Trophy className="h-4 w-4" />
                  {league.short} hub
                </Link>
                <Link
                  href="/sports"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
                >
                  All sports
                </Link>
              </div>
            </div>

            {/* Right: latest score spotlight */}
            <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Latest full-time
              </p>
              {headlineScore ? (
                <div>
                  <div className="flex items-center gap-3">
                    <p className="flex-1 text-right text-sm font-semibold text-white leading-tight">{headlineScore.home}</p>
                    <div className="shrink-0 text-center">
                      <p className="text-2xl font-bold tabular-nums text-[#E8002D]">
                        {headlineScore.homeScore} – {headlineScore.awayScore}
                      </p>
                      <span className="mt-1 inline-block rounded-full bg-emerald-900/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                        FT
                      </span>
                    </div>
                    <p className="flex-1 text-left text-sm font-semibold text-white leading-tight">{headlineScore.away}</p>
                  </div>
                  <p className="mt-3 text-[11px] text-slate-400">{league.label}</p>
                  {headlineScore.when && (
                    <p className="mt-0.5 text-[11px] text-slate-500">{headlineScore.when}</p>
                  )}
                  <Link
                    href={`/sports/football/${leagueSlug}?tab=results`}
                    className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-[#E8002D] hover:underline"
                  >
                    All results &amp; table <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-slate-400">No scores yet for this league.</p>
              )}
            </div>
          </div>

          {/* League selector tabs */}
          <div className="mt-10 flex flex-wrap gap-2 border-t border-white/10 pt-6">
            {LEAGUES.map((l) => (
              <Link
                key={l.key}
                href={`/sports/football?league=${l.key}`}
                className={`rounded-full px-4 py-2.5 text-xs font-semibold transition sm:py-2 ${
                  l.key === leagueKey
                    ? "bg-[#E8002D] text-white shadow"
                    : "bg-white/8 text-slate-400 hover:bg-white/15 hover:text-white"
                }`}
              >
                {l.short}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTENT GRID ──────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Left col: scores + fixtures + map */}
          <div className="space-y-6 lg:col-span-2">

            {/* Latest scores */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Latest scores</h2>
                <Link href={`/sports/football/${leagueSlug}?tab=results`} className="inline-flex items-center gap-1 text-xs font-semibold text-[#E8002D] hover:underline">
                  All results <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {SCORES.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-8 text-center text-sm text-slate-400">
                    No results yet for this league.
                  </div>
                )}
                {SCORES.map((s) => (
                  <div key={s.id} className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
                    <div className="flex items-center gap-4">
                      <p className="min-w-0 flex-1 truncate text-right text-sm font-semibold">{s.home}</p>
                      <div className="shrink-0 text-center">
                        <p className="text-xl font-bold tabular-nums text-[#E8002D]">
                          {s.homeScore} – {s.awayScore}
                        </p>
                        <span className="mt-0.5 inline-block rounded-full bg-emerald-900/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                          FT
                        </span>
                      </div>
                      <p className="min-w-0 flex-1 truncate text-left text-sm font-semibold">{s.away}</p>
                    </div>
                    {(s.when || s.venue) && (
                      <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400">
                        {s.when && <span>{s.when}</span>}
                        {s.venue && (
                          <span className="inline-flex items-center gap-0.5">
                            <MapPin className="h-3 w-3" />{s.venue}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Upcoming fixtures */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Upcoming fixtures</h2>
                <Link href={`/sports/football/${leagueSlug}?tab=fixtures`} className="inline-flex items-center gap-1 text-xs font-semibold text-[#E8002D] hover:underline">
                  Full schedule <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {FIXTURES.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-8 text-center text-sm text-slate-400">
                    No upcoming fixtures for this league.
                  </div>
                )}
                {FIXTURES.map((f) => (
                  <div key={f.id} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                    <div className="shrink-0 text-center">
                      <Calendar className="mx-auto h-4 w-4 text-slate-400" />
                      <p className="mt-0.5 text-[10px] font-medium text-slate-500">{f.when}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <span className="truncate">{f.home}</span>
                        <span className="shrink-0 text-[11px] font-normal text-slate-400">vs</span>
                        <span className="truncate">{f.away}</span>
                      </div>
                      {f.venue && (
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                          <MapPin className="h-3 w-3" />{f.venue}
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/sports/football/${leagueSlug}?tab=fixtures`}
                      className="shrink-0 rounded-full bg-slate-100 px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-200 transition sm:py-1.5"
                    >
                      Details
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            {/* Fixture map */}
            {FIXTURES.some((f) => f.venue) && (
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-4">
                  <h2 className="text-base font-semibold text-slate-900">Fixture map</h2>
                  <p className="mt-0.5 text-xs text-slate-500">Hover a pin to preview upcoming fixtures by venue.</p>
                </div>
                <VenueMap
                  fixtures={FIXTURES.filter((f) => Boolean(f.venue)).map((f) => ({
                    id: f.id, venue: f.venue as string,
                    title: `${f.home} vs ${f.away}`, when: f.when,
                    url: `/sports/football/${leagueSlug}?tab=fixtures`,
                  }))}
                  heightClass="h-[220px] md:h-[280px]"
                />
              </section>
            )}
          </div>

          {/* Right col: League table */}
          <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-900">League table</h2>
              <p className="mt-0.5 text-[11px] text-slate-400">{league.label}</p>
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
                    return (
                      <tr key={row.id} className="group border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
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
                            href={`/sports/football/${leagueSlug}/${row.id}`}
                            className="font-medium text-slate-900 hover:text-[#E8002D] hover:underline transition-colors"
                          >
                            {row.name}
                          </Link>
                        </td>
                        <td className="px-1 py-2 text-center text-slate-600">{row.p}</td>
                        <td className="px-1 py-2 text-center text-slate-600">{row.w}</td>
                        <td className="px-1 py-2 text-center text-slate-600">{row.d}</td>
                        <td className="px-1 py-2 text-center text-slate-600">{row.l}</td>
                        <td className="px-1 py-2 text-center text-slate-600">{row.gd != null ? (row.gd > 0 ? `+${row.gd}` : row.gd) : "—"}</td>
                        <td className="py-2 pl-1 pr-3 text-right font-bold text-slate-900">{row.pts}</td>
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
                <Link
                  href={`/sports/football/${leagueSlug}`}
                  className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-[#E8002D] hover:underline"
                >
                  Full league page <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
