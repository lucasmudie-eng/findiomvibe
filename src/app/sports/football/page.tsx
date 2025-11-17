// src/app/sports/football/page.tsx
import Link from "next/link";
import { headers } from "next/headers";
import {
  Trophy,
  Calendar,
  MapPin,
  Clock,
  Users,
  RefreshCw,
} from "lucide-react";
import type { LeagueBundle, Result, Fixture } from "@/lib/football/types";

// ---------- helpers ----------
function absolute(path: string) {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}${path}`;
}

type LeagueKey = "prem" | "div2" | "comb1" | "comb2";

const LEAGUES: { key: LeagueKey; label: string }[] = [
  { key: "prem", label: "Canada Life Premier League" },
  { key: "div2", label: "DPS Ltd Division Two" },
  { key: "comb1", label: "Canada Life Combination One" },
  { key: "comb2", label: "DPS Ltd Combination Two" },
];

function leagueKeyToSlug(key: LeagueKey): string {
  switch (key) {
    case "prem":
      return "iom-premier-league";
    case "div2":
      return "iom-division-2";
    case "comb1":
      return "iom-combination-1";
    case "comb2":
      return "iom-combination-2";
    default:
      return "iom-premier-league";
  }
}

function titleCase(id: string): string {
  return id
    .split(/[-\s]/)
    .map((p) => (p ? p.charAt(0).toUpperCase() + p.slice(1) : ""))
    .join(" ");
}

async function fetchLeague(leagueSlug: string): Promise<LeagueBundle> {
  const url = absolute(`/api/feed/football?league=${leagueSlug}`);
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) {
    throw new Error(`Failed to load league: ${leagueSlug}`);
  }
  return res.json();
}

function formatWhen(iso: string | undefined) {
  if (!iso) return "TBD";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "TBD";
  }
}

// ---------- types ----------
type ScoreItem = {
  id: string;
  home: string;
  away: string;
  homeScore?: number;
  awayScore?: number;
  status: "FT" | "HT" | "LIVE" | "NS";
  when?: string;
  venue?: string;
};

type FixtureItem = {
  id: string;
  home: string;
  away: string;
  when: string;
  venue?: string;
};

// ---------- map API -> UI ----------
function toScoreItems(results: Result[]): ScoreItem[] {
  return [...results]
    .reverse()
    .slice(0, 3)
    .map((r) => ({
      id: r.id,
      home: titleCase(r.homeId),
      away: titleCase(r.awayId),
      homeScore: r.homeGoals,
      awayScore: r.awayGoals,
      status: "FT" as const,
      when: formatWhen(r.date),
      venue: (r as any).venue,
    }));
}

function toFixtureItems(fixtures: Fixture[]): FixtureItem[] {
  return fixtures.slice(0, 3).map((f) => ({
    id: f.id,
    home: titleCase(f.homeId),
    away: titleCase(f.awayId),
    when: formatWhen(f.date),
    venue: f.venue,
  }));
}

// ---------- page ----------
export default async function FootballPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const requested = (Array.isArray(searchParams?.league)
    ? searchParams?.league[0]
    : searchParams?.league) as LeagueKey | undefined;

  const leagueKey: LeagueKey =
    requested && ["prem", "div2", "comb1", "comb2"].includes(requested)
      ? (requested as LeagueKey)
      : "prem";

  const leagueLabel =
    LEAGUES.find((l) => l.key === leagueKey)?.label ?? LEAGUES[0].label;

  const leagueSlug = leagueKeyToSlug(leagueKey);
  const bundle = await fetchLeague(leagueSlug);

  const tableRows =
    bundle.table?.length
      ? bundle.table.map((e) => ({
          id: e.teamId,
          name: titleCase(e.teamId),
          p: e.played,
          w: e.won,
          d: e.drawn,
          l: e.lost,
          gf: e.gf,
          ga: e.ga,
          gd: e.gd,
          pts: e.points,
        }))
      : [];

  const SCORES: ScoreItem[] = toScoreItems(bundle.resultsRecent ?? []);
  const FIXTURES: FixtureItem[] = toFixtureItems(bundle.fixturesUpcoming ?? []);

  const leagueHref = (key: LeagueKey) => `/sports/football?league=${key}`;
  const headlineScore = SCORES[0];

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <Link href="/sports" className="hover:underline">
          Sports
        </Link>{" "}
        / <span className="text-gray-800">Football</span>
      </nav>

      {/* HERO */}
      <section className="rounded-3xl bg-gradient-to-r from-[#D90429] via-[#f97316] to-[#facc15] px-6 py-7 text-white shadow-lg sm:px-8 sm:py-9">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-black/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              <span>Manx Football Hub</span>
              <span className="text-white/70">• Live beta</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
                Manx football results, tables &amp; fixtures.
              </h1>
              <p className="text-sm text-red-50/90 sm:text-base">
                Follow Isle of Man league football across all divisions, with
                live results and updated tables. Start with{" "}
                <span className="font-semibold">{leagueLabel}</span>, or switch
                league below.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-1 text-sm">
              <Link
                href={`/sports/football/${leagueSlug}`}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-semibold text-[#D90429] shadow-sm transition hover:bg-red-50"
              >
                <Trophy className="h-4 w-4" />
                Open {leagueLabel} hub
              </Link>
              <Link
                href="/sports"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/15"
              >
                Back to sports hub
              </Link>
            </div>
          </div>

          {/* Latest full-time card */}
          <div className="w-full max-w-md rounded-2xl bg-white/95 p-5 text-sm text-gray-900 shadow-md">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-[#D90429]" />
                <h2 className="text-sm font-semibold text-gray-900">
                  Latest full-time
                </h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                Updated live
              </span>
            </div>

            {headlineScore ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {headlineScore.home}{" "}
                      <span className="font-bold">
                        {headlineScore.homeScore} – {headlineScore.awayScore}
                      </span>{" "}
                      {headlineScore.away}
                    </p>
                    <p className="text-xs text-gray-600">
                      {leagueLabel} • Full time
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                  {headlineScore.when && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {headlineScore.when}
                    </span>
                  )}
                  {headlineScore.venue && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                      {headlineScore.venue}
                    </span>
                  )}
                </div>
                <Link
                  href={`/sports/football/${leagueSlug}?tab=results`}
                  className="inline-flex text-xs font-medium text-[#D90429] hover:underline"
                >
                  View full results &amp; tables →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-900">
                  No full-time scores yet.
                </p>
                <p className="text-xs text-gray-600">
                  As soon as results are added, the latest match will appear
                  here.
                </p>
                <Link
                  href={`/sports/football/${leagueSlug}?tab=fixtures`}
                  className="inline-flex text-xs font-medium text-[#D90429] hover:underline"
                >
                  Check upcoming fixtures →
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* League selector strip */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              League focus
            </p>
            <p className="text-sm font-semibold text-gray-900">{leagueLabel}</p>
            <p className="text-xs text-gray-600">
              Switch between divisions — the page will reload with that
              league&apos;s table and matches.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/sports/football/${leagueSlug}`}
              className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              Open league page
            </Link>
            <Link
              href={`/sports/football?league=${leagueKey}&refresh=1`}
              className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-50"
              title="Refresh data"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Link>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {LEAGUES.map((l) => (
            <Link
              key={l.key}
              href={leagueHref(l.key)}
              className={
                "rounded-full border px-3 py-1.5 text-xs sm:text-sm " +
                (l.key === leagueKey
                  ? "border-[#D90429] bg-[#D90429]/5 text-[#D90429]"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50")
              }
            >
              {l.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Layout: scores + fixtures + table */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: scores + fixtures */}
        <div className="space-y-6 lg:col-span-2">
          {/* Latest scores */}
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Latest scores
              </h2>
              <Link
                href={`/sports/football/${leagueSlug}?tab=results`}
                className="text-sm text-[#D90429] hover:underline"
              >
                View all results
              </Link>
            </div>
            <div className="divide-y">
              {SCORES.length === 0 && (
                <div className="py-3 text-sm text-gray-500">
                  No results yet for this league.
                </div>
              )}
              {SCORES.map((s) => (
                <div
                  key={s.id}
                  className="grid grid-cols-1 gap-3 py-3 sm:grid-cols-12 sm:items-center"
                >
                  <div className="sm:col-span-7">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {s.home}
                      </span>
                      <span className="text-gray-400">vs</span>
                      <span className="font-medium text-gray-900">
                        {s.away}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      <span className="font-medium">
                        {s.homeScore} - {s.awayScore}
                      </span>
                      <span className="ml-2 inline-flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3.5 w-3.5" />
                        {s.status}
                      </span>
                    </div>
                  </div>
                  <div className="sm:col-span-3 text-sm text-gray-600">
                    {s.venue && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {s.venue}
                      </span>
                    )}
                  </div>
                  <div className="sm:col-span-2 flex justify-end">
                    <Link
                      href={`/sports/football/${leagueSlug}`}
                      className="inline-flex items-center justify-center rounded-full bg-[#D90429] px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#b80321] whitespace-nowrap"
                    >
                      League page
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Upcoming fixtures */}
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Upcoming fixtures
              </h2>
              <Link
                href={`/sports/football/${leagueSlug}?tab=fixtures`}
                className="text-sm text-[#D90429] hover:underline"
              >
                View full schedule
              </Link>
            </div>
            <ul className="divide-y">
              {FIXTURES.length === 0 && (
                <li className="py-3 text-sm text-gray-500">
                  No upcoming fixtures for this league.
                </li>
              )}
              {FIXTURES.map((f) => (
                <li
                  key={f.id}
                  className="grid grid-cols-1 gap-3 py-3 sm:grid-cols-12 sm:items-center"
                >
                  <div className="sm:col-span-7">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {f.home}
                      </span>
                      <span className="text-gray-400">vs</span>
                      <span className="font-medium text-gray-900">
                        {f.away}
                      </span>
                    </div>
                  </div>
                  <div className="sm:col-span-3 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {f.when}
                    </span>
                    {f.venue && (
                      <span className="ml-3 inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {f.venue}
                      </span>
                    )}
                  </div>
                  <div className="sm:col-span-2 flex justify-end">
                    <Link
                      href={`/sports/football/${leagueSlug}?tab=fixtures`}
                      className="inline-flex items-center justify-center rounded-full bg-[#D90429] px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#b80321] w-auto"
                    >
                      Details
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Right: League Table */}
        <aside className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              League table
            </h2>
            <div className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs text-gray-600">
              <Users className="h-3.5 w-3.5" />
              {leagueLabel}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-gray-500">
                  <th className="py-2 pr-2">Team</th>
                  <th className="px-2">P</th>
                  <th className="px-2">W</th>
                  <th className="px-2">D</th>
                  <th className="px-2">L</th>
                  <th className="px-2">GF</th>
                  <th className="px-2">GA</th>
                  <th className="px-2">GD</th>
                  <th className="pl-2 text-right">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {tableRows.map((row) => (
                  <tr key={row.id}>
                    <td className="py-2 pr-2 font-medium text-gray-900">
                      <Link
                        href={`/sports/football/${leagueSlug}/${row.id}`}
                        className="hover:underline"
                      >
                        {row.name}
                      </Link>
                    </td>
                    <td className="px-2 text-gray-700">{row.p}</td>
                    <td className="px-2 text-gray-700">{row.w}</td>
                    <td className="px-2 text-gray-700">{row.d}</td>
                    <td className="px-2 text-gray-700">{row.l}</td>
                    <td className="px-2 text-gray-700">{row.gf}</td>
                    <td className="px-2 text-gray-700">{row.ga}</td>
                    <td className="px-2 text-gray-700">{row.gd}</td>
                    <td className="pl-2 text-right font-semibold text-gray-900">
                      {row.pts}
                    </td>
                  </tr>
                ))}
                {tableRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="py-3 text-sm text-gray-500"
                    >
                      No table data available for this league yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </aside>
      </div>
    </main>
  );
}