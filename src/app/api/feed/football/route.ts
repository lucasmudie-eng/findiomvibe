// src/app/api/feed/football/route.ts
import { NextResponse } from "next/server";
import type { LeagueId, LeagueBundle, TeamId, Team, Result, Fixture, TableEntry, TeamSnapshot } from "@/lib/football/types";
import { getLeagueBundle, ALL_LEAGUES, DEFAULT_LEAGUE } from "@/lib/football/mock";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// --- External live URL fallback (optional) ---
const LIVE_ENABLED = process.env.FOOTBALL_LIVE_ENABLED === "true";
const LIVE_URLS: Record<string, string | undefined> = {
  "iom-premier-league": process.env.IOMFA_URL_PREM,
  "iom-division-2": process.env.IOMFA_URL_DIV2,
  "iom-combination-1": process.env.IOMFA_URL_COMB1,
  "iom-combination-2": process.env.IOMFA_URL_COMB2,
};

// --- Shared helper: fetch league row + team slug map ---
async function fetchLeagueContext(league: LeagueId) {
  const { data: leagueRow, error: leagueErr } = await supabaseAdmin
    .from("sports_leagues")
    .select("id, name")
    .eq("sport_code", "football")
    .eq("slug", league)
    .eq("status", "active")
    .maybeSingle();

  if (leagueErr || !leagueRow) return null;

  const { data: dbTeams } = await supabaseAdmin
    .from("sports_teams")
    .select("id, slug, name, short_name")
    .eq("league_id", leagueRow.id);

  if (!dbTeams?.length) return null;

  const slugById = new Map<number, string>(dbTeams.map((t: any) => [t.id, t.slug ?? String(t.id)]));

  return { leagueRow, dbTeams, slugById };
}

// --- Fetch league bundle from Supabase ---
async function fetchFromSupabase(league: LeagueId): Promise<LeagueBundle | null> {
  try {
    const ctx = await fetchLeagueContext(league);
    if (!ctx) return null;
    const { leagueRow, dbTeams, slugById } = ctx;
    const leagueId = leagueRow.id;

    const [resultsRes, fixturesRes, tableRes] = await Promise.all([
      supabaseAdmin.from("sports_match_results")
        .select("id, home_team_id, away_team_id, home_goals, away_goals, played_at, venue")
        .eq("league_id", leagueId)
        .order("played_at", { ascending: false })
        .limit(20),
      supabaseAdmin.from("sports_match_fixtures")
        .select("id, home_team_id, away_team_id, starts_at, venue, status")
        .eq("league_id", leagueId)
        .gte("starts_at", new Date().toISOString())
        .order("starts_at")
        .limit(20),
      supabaseAdmin.from("sports_league_tables")
        .select("team_id, played, won, drawn, lost, gf, ga, gd, points, pos")
        .eq("league_id", leagueId)
        .order("pos"),
    ]);

    const teams: Team[] = dbTeams.map((t: any) => ({
      id: t.slug ?? String(t.id),
      name: t.name,
      short: t.short_name ?? undefined,
      league,
    }));

    const resultsRecent: Result[] = (resultsRes.data ?? []).map((r: any) => ({
      id: String(r.id),
      league,
      date: r.played_at ?? new Date().toISOString(),
      homeId: slugById.get(r.home_team_id) ?? String(r.home_team_id),
      awayId: slugById.get(r.away_team_id) ?? String(r.away_team_id),
      status: "FT" as const,
      homeGoals: Number(r.home_goals ?? 0),
      awayGoals: Number(r.away_goals ?? 0),
      venue: r.venue ?? undefined,
    }));

    const fixturesUpcoming: Fixture[] = (fixturesRes.data ?? []).map((f: any) => ({
      id: String(f.id),
      league,
      date: f.starts_at ?? new Date().toISOString(),
      homeId: slugById.get(f.home_team_id) ?? String(f.home_team_id),
      awayId: slugById.get(f.away_team_id) ?? String(f.away_team_id),
      status: "SCHEDULED" as const,
      venue: f.venue ?? undefined,
    }));

    const table: TableEntry[] = (tableRes.data ?? []).map((row: any) => ({
      teamId: slugById.get(row.team_id) ?? String(row.team_id),
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

    return { league, teams, resultsRecent, fixturesUpcoming, table, updatedAt: new Date().toISOString() };
  } catch (e) {
    console.warn("[/api/feed/football] supabase error:", e);
    return null;
  }
}

// --- Fetch team snapshot from Supabase ---
async function fetchTeamSnapshot(league: LeagueId, teamSlug: TeamId): Promise<TeamSnapshot | null> {
  try {
    const ctx = await fetchLeagueContext(league);
    if (!ctx) return null;
    const { leagueRow, dbTeams, slugById } = ctx;
    const leagueId = leagueRow.id;

    const teamRow = dbTeams.find((t: any) => (t.slug ?? String(t.id)) === teamSlug);
    if (!teamRow) return null;
    const teamId = teamRow.id;

    const now = new Date().toISOString();

    const [last5Res, next3Res, tableRes] = await Promise.all([
      supabaseAdmin.from("sports_match_results")
        .select("id, home_team_id, away_team_id, home_goals, away_goals, played_at, venue")
        .eq("league_id", leagueId)
        .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
        .order("played_at", { ascending: false })
        .limit(5),
      supabaseAdmin.from("sports_match_fixtures")
        .select("id, home_team_id, away_team_id, starts_at, venue, status")
        .eq("league_id", leagueId)
        .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
        .gte("starts_at", now)
        .order("starts_at")
        .limit(3),
      supabaseAdmin.from("sports_league_tables")
        .select("team_id, played, won, drawn, lost, gf, ga, gd, points, pos")
        .eq("league_id", leagueId)
        .order("pos"),
    ]);

    const team: Team = {
      id: teamRow.slug ?? String(teamRow.id),
      name: teamRow.name,
      short: teamRow.short_name ?? undefined,
      league,
    };

    const last3: Result[] = (last5Res.data ?? []).slice(0, 3).map((r: any) => ({
      id: String(r.id),
      league,
      date: r.played_at ?? now,
      homeId: slugById.get(r.home_team_id) ?? String(r.home_team_id),
      awayId: slugById.get(r.away_team_id) ?? String(r.away_team_id),
      status: "FT" as const,
      homeGoals: Number(r.home_goals ?? 0),
      awayGoals: Number(r.away_goals ?? 0),
      venue: r.venue ?? undefined,
    }));

    // Use last 5 for form display but return as last3 field
    const last5: Result[] = (last5Res.data ?? []).map((r: any) => ({
      id: String(r.id),
      league,
      date: r.played_at ?? now,
      homeId: slugById.get(r.home_team_id) ?? String(r.home_team_id),
      awayId: slugById.get(r.away_team_id) ?? String(r.away_team_id),
      status: "FT" as const,
      homeGoals: Number(r.home_goals ?? 0),
      awayGoals: Number(r.away_goals ?? 0),
      venue: r.venue ?? undefined,
    }));

    const next3: Fixture[] = (next3Res.data ?? []).map((f: any) => ({
      id: String(f.id),
      league,
      date: f.starts_at ?? now,
      homeId: slugById.get(f.home_team_id) ?? String(f.home_team_id),
      awayId: slugById.get(f.away_team_id) ?? String(f.away_team_id),
      status: "SCHEDULED" as const,
      venue: f.venue ?? undefined,
    }));

    const table: TableEntry[] = (tableRes.data ?? []).map((row: any) => ({
      teamId: slugById.get(row.team_id) ?? String(row.team_id),
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

    const tableEntry = table.find((e) => e.teamId === team.id);

    return {
      league,
      team,
      last3: last5, // return up to 5 for form display
      next3,
      position: tableEntry?.pos,
      table,
      updatedAt: new Date().toISOString(),
    };
  } catch (e) {
    console.warn("[/api/feed/football] team snapshot error:", e);
    return null;
  }
}

// --- External live URL adapter ---
async function fetchLiveLeague(league: LeagueId): Promise<LeagueBundle> {
  const url = LIVE_URLS[league];
  if (!url) throw new Error("No live URL configured for league");
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Live fetch failed: ${res.status}`);
  const raw = await res.json();
  return {
    league,
    teams: Array.isArray(raw.teams) ? raw.teams : [],
    resultsRecent: Array.isArray(raw.results) ? raw.results : [],
    fixturesUpcoming: Array.isArray(raw.fixtures) ? raw.fixtures : [],
    table: Array.isArray(raw.table) ? raw.table : [],
    updatedAt: new Date().toISOString(),
  };
}

function assertLeague(q: string | null): LeagueId {
  const l = (q ?? DEFAULT_LEAGUE) as LeagueId;
  if (!ALL_LEAGUES.includes(l)) throw new Error("Invalid league");
  return l;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const league = assertLeague(searchParams.get("league"));

    // Team snapshot — from Supabase
    const team = searchParams.get("team") as TeamId | null;
    if (team) {
      const snap = await fetchTeamSnapshot(league, team);
      if (!snap) return NextResponse.json({ error: "Team not found" }, { status: 404 });
      return NextResponse.json(snap);
    }

    // 1. Try Supabase first
    const supabaseBundle = await fetchFromSupabase(league);
    if (supabaseBundle) {
      return NextResponse.json(supabaseBundle);
    }

    // 2. Try external live URL (if configured)
    if (LIVE_ENABLED) {
      try {
        const live = await fetchLiveLeague(league);
        return NextResponse.json(live);
      } catch (e) {
        console.warn("[/api/feed/football] live failed, falling back to mock:", (e as Error)?.message);
      }
    }

    // 3. Fall back to mock
    return NextResponse.json(getLeagueBundle(league));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
