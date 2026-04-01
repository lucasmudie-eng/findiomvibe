import { supabaseServer } from "@/lib/supabase/server";
import { getSportMock } from "./mock";
import type {
  SportCode,
  SportSnapshot,
  SportLeague,
  SportTeam,
  SportResult,
  SportTableRow,
} from "./types";

const VALID_SPORTS: SportCode[] = [
  "football",
  "rugby",
  "cricket",
  "netball",
  "basketball",
  "hockey",
  "motorsport",
];

function isValidSport(code: string): code is SportCode {
  return VALID_SPORTS.includes(code as SportCode);
}

function toSafeSport(code: string): SportCode {
  return isValidSport(code) ? (code as SportCode) : "football";
}

function isMissingTable(error: any) {
  if (!error) return false;
  const message = String(error.message ?? "");
  return error.code === "42P01" || message.includes("does not exist");
}

export async function getSportSnapshot(code: string): Promise<SportSnapshot> {
  const sportCode = toSafeSport(code);
  const supabase = supabaseServer();
  if (!supabase) {
    return getSportMock(sportCode);
  }

  try {
    const { data: leagues, error: leaguesError } = await supabase
      .from("sports_leagues")
      .select("id, name, slug, sport_code")
      .eq("sport_code", sportCode)
      .eq("status", "active");

    if (leaguesError) {
      if (isMissingTable(leaguesError)) return getSportMock(sportCode);
      console.warn("[sports] leagues query error", leaguesError);
      return getSportMock(sportCode);
    }

    if (!leagues || leagues.length === 0) {
      return getSportMock(sportCode);
    }

    const mappedLeagues: SportLeague[] = leagues.map((l: any) => ({
      id: String(l.id),
      name: l.name ?? "League",
      slug: l.slug ?? String(l.id),
      sportCode,
    }));

    const leagueIds = mappedLeagues.map((l) => l.id);

    const { data: teams, error: teamsError } = await supabase
      .from("sports_teams")
      .select("id, name, short_name, league_id")
      .in("league_id", leagueIds);

    if (teamsError) {
      if (isMissingTable(teamsError)) return getSportMock(sportCode);
      console.warn("[sports] teams query error", teamsError);
      return getSportMock(sportCode);
    }

    const mappedTeams: SportTeam[] = (teams ?? []).map((t: any) => ({
      id: String(t.id),
      name: t.name ?? "Team",
      shortName: t.short_name ?? null,
      leagueId: String(t.league_id),
    }));

    const teamMap = new Map<string, SportTeam>();
    mappedTeams.forEach((t) => teamMap.set(t.id, t));

    const { data: results, error: resultsError } = await supabase
      .from("sports_match_results")
      .select(
        "id, league_id, home_team_id, away_team_id, home_goals, away_goals, played_at, venue"
      )
      .in("league_id", leagueIds)
      .order("played_at", { ascending: false })
      .limit(12);

    if (resultsError) {
      if (isMissingTable(resultsError)) return getSportMock(sportCode);
      console.warn("[sports] results query error", resultsError);
      return getSportMock(sportCode);
    }

    const mappedResults: SportResult[] = (results ?? []).map((r: any) => ({
      id: String(r.id),
      leagueId: String(r.league_id),
      homeTeamId: String(r.home_team_id),
      awayTeamId: String(r.away_team_id),
      homeGoals:
        typeof r.home_goals === "number" ? r.home_goals : Number(r.home_goals),
      awayGoals:
        typeof r.away_goals === "number" ? r.away_goals : Number(r.away_goals),
      playedAt: r.played_at ?? null,
      venue: r.venue ?? null,
    }));

    const { data: tableRows, error: tableError } = await supabase
      .from("sports_league_tables")
      .select(
        "league_id, team_id, played, won, drawn, lost, gf, ga, gd, points, pos"
      )
      .in("league_id", leagueIds)
      .order("pos", { ascending: true });

    if (tableError) {
      if (isMissingTable(tableError)) return getSportMock(sportCode);
      console.warn("[sports] table query error", tableError);
      return getSportMock(sportCode);
    }

    const mappedTable: SportTableRow[] = (tableRows ?? []).map((row: any) => ({
      leagueId: String(row.league_id),
      teamId: String(row.team_id),
      played: Number(row.played ?? 0),
      won: Number(row.won ?? 0),
      drawn: Number(row.drawn ?? 0),
      lost: Number(row.lost ?? 0),
      gf: Number(row.gf ?? 0),
      ga: Number(row.ga ?? 0),
      gd: Number(row.gd ?? 0),
      points: Number(row.points ?? 0),
      pos: Number(row.pos ?? 0),
    }));

    return {
      sportCode,
      leagues: mappedLeagues,
      teams: mappedTeams,
      results: mappedResults,
      table: mappedTable,
      updatedAt: new Date().toISOString(),
      isMock: false,
    };
  } catch (err) {
    console.warn("[sports] unexpected error", err);
    return getSportMock(sportCode);
  }
}

export function resolveSportName(code: string) {
  const safe = toSafeSport(code);
  const names: Record<SportCode, string> = {
    football: "Football",
    rugby: "Rugby",
    cricket: "Cricket",
    netball: "Netball",
    basketball: "Basketball",
    hockey: "Hockey",
    motorsport: "Motorsport",
  };
  return names[safe] ?? "Sport";
}

export function formatScore(homeGoals: number | null, awayGoals: number | null) {
  if (typeof homeGoals !== "number" || typeof awayGoals !== "number") {
    return "—";
  }
  return `${homeGoals} - ${awayGoals}`;
}

export function formatWhen(date: string | null) {
  if (!date) return "TBD";
  try {
    return new Date(date).toLocaleString("en-GB", {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "TBD";
  }
}
