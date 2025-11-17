// src/app/sports/football/[league]/[team]/page.tsx
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { ArrowLeft, Trophy, Calendar, MapPin } from "lucide-react";
import type { TeamSnapshot } from "@/lib/football/types";
import { leagueDisplayName, formatTeamName } from "@/lib/football/utils";

// ---------- Team colour gradients ----------

const DEFAULT_GRADIENT = {
  from: "#D90429",
  to: "#f97316",
};

/**
 * Keys here are based on a normalised team *name*:
 *   "St Georges"  -> "stgeorges"
 *   "Michael United" -> "michaelunited"
 */
const TEAM_COLOURS: Record<string, { from: string; to: string }> = {
  corinthians: { from: "#111827", to: "#6B7280" }, // white & black
  laxey: { from: "#047857", to: "#6EE7B7" }, // green & white
  onchanfirst: { from: "#FACC15", to: "#1D4ED8" }, // yellow & blue
  onchan: { from: "#FACC15", to: "#1D4ED8" },

  rushenunited: { from: "#FACC15", to: "#111827" }, // yellow & black
  rushen: { from: "#FACC15", to: "#111827" },

  peel: { from: "#B91C1C", to: "#EF4444" }, // red & white
  stmarys: { from: "#047857", to: "#FACC15" }, // green & yellow
  stjohns: { from: "#1D4ED8", to: "#FACC15" }, // blue & yellow
  ayreunited: { from: "#EA580C", to: "#111827" }, // orange & black

  ramseyfirst: { from: "#1D4ED8", to: "#93C5FD" }, // blue & white
  ramsey: { from: "#1D4ED8", to: "#93C5FD" },

  unionmills: { from: "#7F1D1D", to: "#2563EB" }, // claret & blue
  braddan: { from: "#1D4ED8", to: "#60A5FA" }, // blue
  dhsob: { from: "#1D4ED8", to: "#60A5FA" }, // blue
  foxdale: { from: "#7F1D1D", to: "#1E3A8A" }, // maroon & navy
  castletown: { from: "#B91C1C", to: "#FCA5A5" }, // red & white
  colby: { from: "#111827", to: "#6B7280" }, // black & white
  rycob: { from: "#1D4ED8", to: "#111827" }, // blue & black
  marown: { from: "#7F1D1D", to: "#F97373" }, // maroon
  pulroseunited: { from: "#B91C1C", to: "#F97373" }, // red
  douglasroyal: { from: "#1D4ED8", to: "#DBEAFE" }, // white & blue
  malew: { from: "#B91C1C", to: "#111827" }, // red & black
  stgeorges: { from: "#FACC15", to: "#111827" }, // yellow & black
  governorsathletic: { from: "#B91C1C", to: "#F97373" }, // red
  douglasdistrict: { from: "#1D4ED8", to: "#B91C1C" }, // blue & red

  // Combination-only sides
  michaelunited: { from: "#111827", to: "#047857" }, // black & green
  douglasathleticfc: { from: "#EC4899", to: "#111827" }, // pink & black
};

function normaliseName(name: string) {
  return name.toLowerCase().replace(/[^a-z]/g, ""); // strip spaces, & etc.
}

function getTeamGradient(teamSlug: string, explicitName?: string) {
  // Prefer an explicit nice name if we have one, otherwise use the slug → formatted
  const pretty =
    explicitName || formatTeamName(teamSlug || "").trim() || teamSlug;
  const key = normaliseName(pretty);
  return TEAM_COLOURS[key] ?? DEFAULT_GRADIENT;
}

// ---------- helpers ----------

function absolute(path: string) {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}${path}`;
}

async function fetchTeam(
  league: string,
  teamId: string
): Promise<TeamSnapshot> {
  const url = absolute(`/api/feed/football?league=${league}&team=${teamId}`);
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) {
    notFound();
  }
  return res.json();
}

// ---------- page ----------

export default async function TeamPage({
  params,
}: {
  params: { league: string; team: string };
}) {
  const { league, team } = params;

  const data = await fetchTeam(league, team);
  if (!data?.team) {
    notFound();
  }

  const leagueName = leagueDisplayName(league);
  const teamName = data.team.name || formatTeamName(team);

  const teamRow = data.table.find((e) => e.teamId === data.team.id);
  const position =
    typeof data.position === "number" ? data.position : teamRow?.pos;

  const played = teamRow?.played ?? teamRow?.p;
  const points = teamRow?.points ?? teamRow?.pts;
  const gf = teamRow?.gf;
  const ga = teamRow?.ga;
  const gd = teamRow?.gd;

  const form = data.last3.slice(0, 5).map((r) => {
    const isHome = r.homeId === data.team.id;
    const ourGoals = isHome ? r.homeGoals : r.awayGoals;
    const theirGoals = isHome ? r.awayGoals : r.homeGoals;

    if (ourGoals > theirGoals) return "W";
    if (ourGoals < theirGoals) return "L";
    return "D";
  });

  const gradient = getTeamGradient(team, data.team.name);

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      {/* Breadcrumb + back */}
      <div className="flex flex-wrap items-center justify-between gap-3">
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

      {/* HERO */}
      <section
        className="rounded-3xl p-6 text-white shadow-lg"
        style={{
          background: `linear-gradient(to right, ${gradient.from}, ${gradient.to})`,
        }}
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide">
              <Trophy className="h-3.5 w-3.5" />
              <span>{leagueName}</span>
              {typeof position === "number" && (
                <>
                  <span className="opacity-60">•</span>
                  <span>Current position: {position}</span>
                </>
              )}
            </div>

            <h1 className="text-3xl font-semibold sm:text-4xl">
              {teamName}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-red-50/90">
              {played != null && (
                <span>
                  <span className="font-semibold">{played}</span> played
                </span>
              )}
              {points != null && (
                <>
                  <span className="opacity-60">•</span>
                  <span>
                    <span className="font-semibold">{points}</span> points
                  </span>
                </>
              )}
              {gf != null && ga != null && (
                <>
                  <span className="opacity-60">•</span>
                  <span>
                    {gf} scored, {ga} conceded
                  </span>
                </>
              )}
              {gd != null && (
                <>
                  <span className="opacity-60">•</span>
                  <span>GD {gd >= 0 ? `+${gd}` : gd}</span>
                </>
              )}
            </div>

            {form.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-red-50/90">Recent form:</span>
                <div className="flex gap-1">
                  {form.map((result, idx) => (
                    <span
                      key={`${result}-${idx}`}
                      className={
                        "inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold " +
                        (result === "W"
                          ? "bg-emerald-100 text-emerald-800"
                          : result === "L"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700")
                      }
                    >
                      {result}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-red-50/80">
              Full league data updates whenever the latest FA results and tables
              are imported.
            </p>
          </div>
        </div>

        <div className="mt-4 text-[11px] text-red-50/80">
          Updated:{" "}
          {data.updatedAt
            ? new Date(data.updatedAt).toLocaleString()
            : "Recently"}
        </div>
      </section>

      {/* Grid: last 3, next 3, mini table */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Last 3 Results */}
        <section className="rounded-2xl border bg-white p-4 shadow-sm md:col-span-1">
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
                      {isHome ? "Home vs" : "Away vs"} {opponentName}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(r.date).toLocaleDateString("en-GB", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
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
                          ? "bg-emerald-50 text-emerald-700"
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
        <section className="rounded-2xl border bg-white p-4 shadow-sm md:col-span-1">
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
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(f.date).toLocaleString("en-GB", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {f.venue && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {f.venue}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Mini Table */}
        <section className="rounded-2xl border bg-white p-4 shadow-sm md:col-span-1">
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
                      (e.teamId === data.team.id ? "bg-red-50/60" : "")
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