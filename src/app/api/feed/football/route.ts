import { NextResponse } from "next/server";
import type { LeagueId, LeagueBundle, TeamId } from "@/lib/football/types";
// ⚠️ If your mock exports live under a different path (e.g. "@/lib/football/data"),
// change the import below accordingly.
import { getLeagueBundle, getTeamSnapshot, ALL_LEAGUES, DEFAULT_LEAGUE } from "@/lib/football/mock";

// --- Map league -> live URL from env
const LIVE_ENABLED = process.env.FOOTBALL_LIVE_ENABLED === "true";

const LIVE_URLS: Record<string, string | undefined> = {
  "iom-premier-league": process.env.IOMFA_URL_PREM,
  "iom-division-2": process.env.IOMFA_URL_DIV2,
  "iom-combination-1": process.env.IOMFA_URL_COMB1,
  "iom-combination-2": process.env.IOMFA_URL_COMB2,
};

// --- Adapter: convert your live JSON into our LeagueBundle shape
// Tailor this to your provider once you know their exact JSON
async function fetchLiveLeague(league: LeagueId): Promise<LeagueBundle> {
  const url = LIVE_URLS[league];
  if (!url) throw new Error("No live URL configured for league");

  const res = await fetch(url, {
    // live cache behaviour: tweak if provider rate-limits
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Live fetch failed: ${res.status}`);

  const raw = await res.json();

  // --- EXAMPLE ADAPTER (replace these selectors to match your JSON/RSS parse) ---
  // Assumes:
  //  raw.results: [{ id, date, homeId, awayId, homeGoals, awayGoals }, ...]
  //  raw.fixtures: [{ id, date, homeId, awayId, venue }, ...]
  //  raw.teams: [{ id, name }, ...] (optional)
  //  raw.table: [{ teamId, played, won, drawn, lost, gf, ga, gd, points }, ...]
  const resultsRecent = Array.isArray(raw.results) ? raw.results : [];
  const fixturesUpcoming = Array.isArray(raw.fixtures) ? raw.fixtures : [];
  const teams = Array.isArray(raw.teams) ? raw.teams : [];
  const table = Array.isArray(raw.table) ? raw.table : [];

  return {
    league,
    teams,
    resultsRecent,
    fixturesUpcoming,
    table,
    updatedAt: new Date().toISOString(),
  };
}

// --- Helpers ---
function assertLeague(q: string | null): LeagueId {
  const l = (q ?? DEFAULT_LEAGUE) as LeagueId;
  if (!ALL_LEAGUES.includes(l)) throw new Error("Invalid league");
  return l;
}

// --- Handlers ---
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const league = assertLeague(searchParams.get("league"));

    // Team snapshot?
    const team = searchParams.get("team") as TeamId | null;
    if (team) {
      // Always use mock snapshot unless you implement a live team adapter too
      const snap = getTeamSnapshot(league, team);
      if (!snap) return NextResponse.json({ error: "Team not found" }, { status: 404 });
      return NextResponse.json(snap);
    }

    // League bundle — try live first (if enabled)
    if (LIVE_ENABLED) {
      try {
        const live = await fetchLiveLeague(league);
        return NextResponse.json(live);
      } catch (e) {
        // fall through to mock
        console.warn("[/api/feed/football] live failed, falling back to mock:", (e as Error)?.message);
      }
    }

    // Mock bundle
    const mock = getLeagueBundle(league);
    return NextResponse.json(mock);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}