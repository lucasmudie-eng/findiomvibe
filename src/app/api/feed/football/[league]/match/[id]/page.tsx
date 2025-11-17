// src/app/sports/football/[league]/match/[id]/page.tsx
import { headers } from "next/headers";
import Link from "next/link";
import TeamBadge from "@/components/TeamBadge";
import { StatusBadge, formatDateTime } from "@/lib/football/utils";
import type { LeagueId } from "@/lib/football/types";

function absolute(path: string) {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}${path}`;
}

async function fetchMatch(league: LeagueId, id: string) {
  const url = absolute(`/api/feed/football/match?league=${league}&id=${id}`);
  const res = await fetch(url, { next: { revalidate: 30 } });
  if (!res.ok) {
    throw new Error("Match not found");
  }
  return res.json() as Promise<
    | ({ type: "RESULT"; id: string; homeId: string; awayId: string; homeGoals: number; awayGoals: number; date: string; status: "FT"; venue?: string })
    | ({ type: "FIXTURE"; id: string; homeId: string; awayId: string; date: string; status: "SCHEDULED" | "LIVE"; venue?: string })
  >;
}

export default async function MatchCentrePage({ params }: { params: { league: string; id: string } }) {
  const league = params.league as LeagueId;
  const match = await fetchMatch(league, params.id);

  const when = formatDateTime(match.date);
  const status = match.status as "SCHEDULED" | "LIVE" | "FT";

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <nav className="text-sm text-zinc-500">
        <Link href="/sports" className="hover:underline">Sports</Link> /
        <Link href="/sports/football" className="hover:underline"> Football</Link> /
        <Link href={`/sports/football/${league}`} className="hover:underline"> League</Link> /
        <span className="text-zinc-800"> Match</span>
      </nav>

      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Match Centre</h1>
          <p className="text-sm text-zinc-600">{when}{match.venue ? ` • ${match.venue}` : ""}</p>
        </div>
        <StatusBadge status={status} />
      </header>

      {/* Scoreline / Fixture */}
      <section className="rounded-2xl border p-5">
        <div className="grid grid-cols-3 items-center gap-3">
          <div className="justify-self-start">
            <TeamBadge teamId={match.homeId} className="text-base" />
          </div>

          <div className="justify-self-center text-center">
            {match.type === "RESULT" ? (
              <div className="text-3xl font-semibold">
                {match.homeGoals} — {match.awayGoals}
              </div>
            ) : (
              <div className="text-sm text-zinc-600">Kick-off: {when}</div>
            )}
            <div className="text-xs text-zinc-500 mt-1">{status}</div>
          </div>

          <div className="justify-self-end">
            <TeamBadge teamId={match.awayId} className="text-right text-base" />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border p-5">
        <h2 className="text-lg font-semibold mb-3">More</h2>
        <ul className="list-disc pl-5 text-sm text-zinc-700 space-y-1">
          <li>
            <Link href={`/sports/football/${league}?tab=fixtures`} className="underline underline-offset-4">
              Back to fixtures
            </Link>
          </li>
          <li>
            <Link href={`/sports/football/${league}?tab=results`} className="underline underline-offset-4">
              Back to results
            </Link>
          </li>
        </ul>
      </section>
    </main>
  );
}