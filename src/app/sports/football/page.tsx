// src/app/sports/football/page.tsx
import Link from "next/link";
import { headers } from "next/headers";
import { Trophy, Calendar, MapPin, Clock, Users, RefreshCw } from "lucide-react";
import type { LeagueBundle, Result, Fixture } from "@/lib/football/types";
import RedButton from "@/components/RedButton";

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
    return new Date(iso).toLocaleString(undefined, {
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

  // Use real teamId for URLs, pretty name for display
  const tableRows =
    bundle.table?.length
      ? bundle.table.map((e) => ({
          id: e.teamId,                 // <- URL param
          name: titleCase(e.teamId),    // <- Display
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

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/sports" className="hover:underline">
          Sports
        </Link>{" "}
        / <span className="text-gray-800">Football</span>
      </nav>

      {/* Header / league selector */}
      <section className="mb-6 rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
              <Trophy className="h-5 w-5 text-[#D90429]" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Football</h1>
              <p className="text-sm text-gray-600">
                Live scores, fixtures, and league tables across the Isle of Man.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label htmlFor="league" className="text-sm text-gray-600">
              League
            </label>
            <select
              id="league"
              defaultValue={leagueKey}
              className="rounded-lg border bg-white px-3 py-1.5 text-sm text-gray-900"
            >
              {LEAGUES.map((l) => (
                <option key={l.key} value={l.key}>
                  {l.label}
                </option>
              ))}
            </select>
            <Link
              href={`/sports/football?league=${leagueKey}&refresh=1`}
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </Link>
          </div>
        </div>

        {/* League pills */}
        <div className="mt-3 flex flex-wrap gap-2">
          {LEAGUES.map((l) => (
            <Link
              key={l.key}
              href={leagueHref(l.key)}
              className={
                "rounded-full border px-3 py-1.5 text-sm " +
                (l.key === leagueKey
                  ? "border-[#D90429] text-[#D90429]"
                  : "text-gray-700 hover:bg-gray-50")
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
                <div className="py-3 text-sm text-gray-500">No results yet.</div>
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
                  <div className="sm:col-span-2">
                    <RedButton
                      href={`/sports/football/${leagueSlug}`}
                      label="League page"
                    />
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
                  No upcoming fixtures.
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
                  <div className="sm:col-span-2">
                    <RedButton
                      href={`/sports/football/${leagueSlug}`}
                      label="Details"
                    />
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
              </tbody>
            </table>
          </div>
        </aside>
      </div>
    </main>
  );
}