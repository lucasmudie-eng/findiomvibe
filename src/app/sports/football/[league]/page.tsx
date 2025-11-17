// src/app/sports/football/[league]/page.tsx
import { headers } from "next/headers";
import Link from "next/link";
import LeagueSwitcher from "@/components/LeagueSwitcher";
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
  if (!res.ok) {
    throw new Error(`Failed to load league: ${league}`);
  }
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
  const tab =
    (Array.isArray(searchParams?.tab)
      ? searchParams?.tab[0]
      : searchParams?.tab) || "results";

  const bundle = await fetchLeagueBundle(league);
  const label = LEAGUE_LABELS[league] ?? leagueDisplayName(league);

  const latestResults = [...(bundle.resultsRecent ?? [])]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const upcoming = (bundle.fixturesUpcoming ?? []).slice(0, 5);

  const tableRows = (bundle.table ?? []).map((e) => ({
    teamId: e.teamId,
    name: formatTeamName(e.teamId),
    ...e,
  }));

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <Link href="/sports" className="hover:underline">
          Sports
        </Link>{" "}
        /{" "}
        <Link href="/sports/football" className="hover:underline">
          Football
        </Link>{" "}
        / <span className="text-gray-800">{label}</span>
      </nav>

      {/* Hero header */}
      <section className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-[#D90429] via-[#e43c3c] to-[#f0634a] p-6 text-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{label}</h1>
            <p className="text-sm text-white/80">
              Latest results, upcoming fixtures, and live league table.
            </p>
          </div>
          <LeagueSwitcher
            current={league}
            leagues={LEAGUE_LABELS}
            className="bg-white/10"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Results + Fixtures */}
        <div className="space-y-6 lg:col-span-2">
          {/* Latest Results */}
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Latest results
              </h2>
              <Link
                href={`/sports/football/${league}?tab=results`}
                className="text-sm text-[#D90429] hover:underline"
              >
                View all results
              </Link>
            </div>
            {latestResults.length === 0 ? (
              <p className="py-2 text-sm text-gray-500">No results yet.</p>
            ) : (
              <ul className="divide-y">
                {latestResults.map((r) => {
                  const line = formatScoreLine(
                    r.homeId,
                    r.awayId,
                    r.homeGoals,
                    r.awayGoals
                  );
                  return (
                    <li
                      key={r.id}
                      className="flex items-center justify-between gap-3 py-3 text-sm"
                    >
                      <div className="flex flex-col">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {line.left}
                          </span>
                          <span className="text-gray-500">{line.score}</span>
                          <span className="font-medium text-gray-900">
                            {line.right}
                          </span>
                        </div>
                        <span className="mt-0.5 text-xs text-gray-500">
                          {new Date(r.date).toLocaleString(undefined, {
                            weekday: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        FT
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Upcoming Fixtures */}
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Upcoming fixtures
              </h2>
              <Link
                href={`/sports/football/${league}?tab=fixtures`}
                className="text-sm text-[#D90429] hover:underline"
              >
                View full schedule
              </Link>
            </div>
            {upcoming.length === 0 ? (
              <p className="py-2 text-sm text-gray-500">
                No upcoming fixtures.
              </p>
            ) : (
              <ul className="divide-y">
                {upcoming.map((f) => {
                  const line = formatScoreLine(f.homeId, f.awayId);
                  return (
                    <li
                      key={f.id}
                      className="flex items-center justify-between gap-3 py-3 text-sm"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {line.left}
                          </span>
                          <span className="text-gray-500">vs</span>
                          <span className="font-medium text-gray-900">
                            {line.right}
                          </span>
                        </div>
                        <div className="mt-0.5 text-xs text-gray-500">
                          {new Date(f.date).toLocaleString(undefined, {
                            weekday: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {f.venue ? ` • ${f.venue}` : ""}
                        </div>
                      </div>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        Scheduled
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        {/* Right: League Table */}
        <aside className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              League table
            </h2>
            <span className="rounded-full bg-gray-50 px-2 py-0.5 text-[10px] text-gray-600">
              {label}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-gray-500">
                  <th className="py-1 pr-2">Pos</th>
                  <th className="py-1 pr-2">Team</th>
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
                  <tr key={row.teamId}>
                    <td className="py-1 pr-2">{row.pos}</td>
                    <td className="py-1 pr-2">
                      <Link
                        href={`/sports/football/${league}/${row.teamId}`}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        {row.name}
                      </Link>
                    </td>
                    <td className="px-2">{row.played}</td>
                    <td className="px-2">{row.won}</td>
                    <td className="px-2">{row.drawn}</td>
                    <td className="px-2">{row.lost}</td>
                    <td className="px-2">{row.gf}</td>
                    <td className="px-2">{row.ga}</td>
                    <td className="px-2">{row.gd}</td>
                    <td className="px-2 text-right font-semibold">
                      {row.points}
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