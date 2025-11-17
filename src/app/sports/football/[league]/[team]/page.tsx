// src/app/sports/football/[league]/[team]/page.tsx
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { TeamSnapshot } from "@/lib/football/types";
import { leagueDisplayName, formatTeamName } from "@/lib/football/utils";

// Build absolute URL (works locally + prod)
function absolute(path: string) {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}${path}`;
}

async function fetchTeam(league: string, teamId: string): Promise<TeamSnapshot> {
  const url = absolute(`/api/feed/football?league=${league}&team=${teamId}`);
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) {
    notFound();
  }
  return res.json();
}

export default async function TeamPage({
  params,
}: {
  params: { league: string; team: string };
}) {
  const { league, team } = params;

  // team param must be the internal id, e.g. "st-georges", "peel"
  const data = await fetchTeam(league, team);

  if (!data?.team) {
    notFound();
  }

  const leagueName = leagueDisplayName(league);
  const teamName = data.team.name || formatTeamName(team);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* Breadcrumb + back */}
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-gray-500">
          <Link href="/sports" className="hover:underline">
            Sports
          </Link>{" "}
          /{" "}
          <Link href="/sports/football" className="hover:underline">
            Football
          </Link>{" "}
          /{" "}
          <Link href={`/sports/football/${league}`} className="hover:underline">
            {leagueName}
          </Link>{" "}
          / <span className="text-gray-900">{teamName}</span>
        </div>
        <Link
          href={`/sports/football/${league}`}
          className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-[#D90429]"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to league
        </Link>
      </div>

      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {teamName}
          </h1>
          <p className="text-sm text-gray-600">{leagueName}</p>
          {typeof data.position === "number" && (
            <p className="mt-1 text-xs text-gray-500">
              Current position: <span className="font-semibold">{data.position}</span>
            </p>
          )}
        </div>
        <div className="text-xs text-gray-500">
          Updated:{" "}
          {data.updatedAt
            ? new Date(data.updatedAt).toLocaleString()
            : "Recently"}
        </div>
      </header>

      {/* Grid: last 3, next 3, mini table */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Last 3 Results */}
        <section className="md:col-span-1 rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-gray-900">
            Last 3 results
          </h2>
          {data.last3.length === 0 && (
            <p className="text-xs text-gray-500">No recent results.</p>
          )}
          <ul className="space-y-2">
            {data.last3.map((r) => {
              const isHome = r.homeId === data.team.id;
              const opponentId = isHome ? r.awayId : r.homeId;
              const opponentName = formatTeamName(opponentId);
              const score = `${r.homeGoals} - ${r.awayGoals}`;
              const outcome =
                r.homeGoals === r.awayGoals
                  ? "D"
                  : (isHome && r.homeGoals > r.awayGoals) ||
                    (!isHome && r.awayGoals > r.homeGoals)
                  ? "W"
                  : "L";

              return (
                <li
                  key={r.id}
                  className="flex items-center justify-between rounded-xl border px-3 py-2 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-medium text-gray-900">
                      vs {opponentName}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {new Date(r.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {score}
                    </div>
                    <div
                      className={
                        "mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold " +
                        (outcome === "W"
                          ? "bg-green-50 text-green-700"
                          : outcome === "L"
                          ? "bg-red-50 text-red-600"
                          : "bg-gray-50 text-gray-600")
                      }
                    >
                      {outcome}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Next 3 Fixtures */}
        <section className="md:col-span-1 rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-gray-900">
            Next 3 fixtures
          </h2>
          {data.next3.length === 0 && (
            <p className="text-xs text-gray-500">No upcoming fixtures.</p>
          )}
          <ul className="space-y-2">
            {data.next3.map((f) => {
              const isHome = f.homeId === data.team.id;
              const opponentId = isHome ? f.awayId : f.homeId;
              const opponentName = formatTeamName(opponentId);
              return (
                <li
                  key={f.id}
                  className="flex items-center justify-between rounded-xl border px-3 py-2 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-medium text-gray-900">
                      {isHome ? "Home vs" : "Away vs"} {opponentName}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {new Date(f.date).toLocaleString()}
                    </div>
                  </div>
                  {f.venue && (
                    <div className="ml-2 text-[9px] text-gray-500 text-right">
                      {f.venue}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* Mini Table */}
        <section className="md:col-span-1 rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-gray-900">
            League table
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-[10px]">
              <thead>
                <tr className="text-gray-500">
                  <th className="py-1 pr-1 text-left">Pos</th>
                  <th className="py-1 pr-1 text-left">Team</th>
                  <th className="px-1">P</th>
                  <th className="px-1">GD</th>
                  <th className="px-1 text-right">Pts</th>
                </tr>
              </thead>
              <tbody>
                {data.table.map((e) => (
                  <tr
                    key={e.teamId}
                    className={
                      "border-t last:border-b-0 " +
                      (e.teamId === data.team.id
                        ? "bg-red-50/60"
                        : "")
                    }
                  >
                    <td className="py-1 pr-1">{e.pos}</td>
                    <td className="py-1 pr-1">
                      <Link
                        href={`/sports/football/${league}/${e.teamId}`}
                        className={
                          "hover:underline " +
                          (e.teamId === data.team.id
                            ? "font-semibold text-[#D90429]"
                            : "text-gray-800")
                        }
                      >
                        {formatTeamName(e.teamId)}
                      </Link>
                    </td>
                    <td className="px-1 text-center">{e.played}</td>
                    <td className="px-1 text-center">{e.gd}</td>
                    <td className="px-1 text-right font-semibold">
                      {e.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}