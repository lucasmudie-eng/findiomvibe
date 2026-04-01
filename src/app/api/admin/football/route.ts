// src/app/api/admin/football/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Auth is enforced by middleware (HTTP Basic Auth) for all /api/admin/* routes.

// ── Recalculate table for a league from all results ──────────────────────────

async function recalcLeague(leagueId: number) {
  // Fetch all teams for this league
  const { data: teams } = await supabaseAdmin
    .from("sports_teams")
    .select("id")
    .eq("league_id", leagueId);

  if (!teams || teams.length === 0) return;

  // Fetch all results for this league
  const { data: results } = await supabaseAdmin
    .from("sports_match_results")
    .select("home_team_id, away_team_id, home_goals, away_goals")
    .eq("league_id", leagueId);

  // Build stats map
  type Stats = { played: number; won: number; drawn: number; lost: number; gf: number; ga: number; points: number };
  const stats: Record<number, Stats> = {};
  for (const t of teams) {
    stats[t.id] = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 };
  }

  for (const r of results ?? []) {
    const h = stats[r.home_team_id];
    const a = stats[r.away_team_id];
    if (!h || !a) continue;
    h.played++; a.played++;
    h.gf += r.home_goals; h.ga += r.away_goals;
    a.gf += r.away_goals; a.ga += r.home_goals;
    if (r.home_goals > r.away_goals) { h.won++; a.lost++; h.points += 3; }
    else if (r.home_goals < r.away_goals) { a.won++; h.lost++; a.points += 3; }
    else { h.drawn++; a.drawn++; h.points++; a.points++; }
  }

  // Sort and assign positions
  const sorted = Object.entries(stats)
    .map(([teamId, s]) => ({ teamId: Number(teamId), ...s, gd: s.gf - s.ga }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return a.teamId - b.teamId;
    });

  // Upsert into sports_league_tables
  const upsertRows = sorted.map((s, i) => ({
    league_id: leagueId,
    team_id: s.teamId,
    played: s.played,
    won: s.won,
    drawn: s.drawn,
    lost: s.lost,
    gf: s.gf,
    ga: s.ga,
    gd: s.gd,
    points: s.points,
    pos: i + 1,
    updated_at: new Date().toISOString(),
  }));

  await supabaseAdmin
    .from("sports_league_tables")
    .upsert(upsertRows, { onConflict: "league_id,team_id" });
}

// ── GET: return all data ──────────────────────────────────────────────────────

export async function GET() {
  const [leagues, teams, results, fixtures, table] = await Promise.all([
    supabaseAdmin.from("sports_leagues").select("id, slug, name, season, status").eq("sport_code", "football").order("id"),
    supabaseAdmin.from("sports_teams").select("id, league_id, slug, name, short_name").order("name"),
    supabaseAdmin.from("sports_match_results").select("id, league_id, home_team_id, away_team_id, home_goals, away_goals, played_at, venue").order("played_at", { ascending: false }).limit(200),
    supabaseAdmin.from("sports_match_fixtures").select("id, league_id, home_team_id, away_team_id, starts_at, venue, status").gte("starts_at", new Date().toISOString()).order("starts_at").limit(100),
    supabaseAdmin.from("sports_league_tables").select("id, league_id, team_id, pos, played, won, drawn, lost, gf, ga, gd, points").order("pos"),
  ]);

  return NextResponse.json({
    leagues: leagues.data ?? [],
    teams: teams.data ?? [],
    results: results.data ?? [],
    fixtures: fixtures.data ?? [],
    table: table.data ?? [],
  });
}

// ── POST: actions ─────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const body = await req.json();
  const { action } = body;

  switch (action) {

    case "add_league": {
      const { name, slug, season } = body;
      if (!name || !slug) return NextResponse.json({ error: "name and slug required" }, { status: 400 });
      const { error } = await supabaseAdmin.from("sports_leagues").insert({
        sport_code: "football",
        name,
        slug,
        season: season || null,
        status: "active",
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ message: `League "${name}" added` });
    }

    case "delete_league": {
      const { id } = body;
      const { error } = await supabaseAdmin.from("sports_leagues").delete().eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ message: "League deleted" });
    }

    case "add_team": {
      const { league_id, name, slug } = body;
      if (!league_id || !name || !slug) return NextResponse.json({ error: "league_id, name, slug required" }, { status: 400 });
      const { error } = await supabaseAdmin.from("sports_teams").insert({ league_id, name, slug });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      // Ensure team appears in league table with 0s
      const { data: team } = await supabaseAdmin.from("sports_teams").select("id").eq("league_id", league_id).eq("slug", slug).maybeSingle();
      if (team) {
        await supabaseAdmin.from("sports_league_tables").upsert({
          league_id,
          team_id: team.id,
          played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0, pos: 0,
          updated_at: new Date().toISOString(),
        }, { onConflict: "league_id,team_id" });
        await recalcLeague(league_id);
      }
      return NextResponse.json({ message: `Team "${name}" added` });
    }

    case "delete_team": {
      const { id } = body;
      const { data: team } = await supabaseAdmin.from("sports_teams").select("league_id").eq("id", id).maybeSingle();
      const { error } = await supabaseAdmin.from("sports_teams").delete().eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      if (team) await recalcLeague(team.league_id);
      return NextResponse.json({ message: "Team deleted" });
    }

    case "add_result": {
      const { league_id, home_team_id, away_team_id, home_goals, away_goals, played_at, venue } = body;
      if (!league_id || !home_team_id || !away_team_id || home_goals == null || away_goals == null || !played_at) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }
      const { error } = await supabaseAdmin.from("sports_match_results").insert({
        league_id, home_team_id, away_team_id,
        home_goals: Number(home_goals), away_goals: Number(away_goals),
        played_at: new Date(played_at).toISOString(),
        venue: venue || null,
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      await recalcLeague(league_id);
      return NextResponse.json({ message: "Result added and table recalculated" });
    }

    case "delete_result": {
      const { id } = body;
      const { data: r } = await supabaseAdmin.from("sports_match_results").select("league_id").eq("id", id).maybeSingle();
      const { error } = await supabaseAdmin.from("sports_match_results").delete().eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      if (r) await recalcLeague(r.league_id);
      return NextResponse.json({ message: "Result deleted and table recalculated" });
    }

    case "add_fixture": {
      const { league_id, home_team_id, away_team_id, starts_at, venue } = body;
      if (!league_id || !home_team_id || !away_team_id || !starts_at) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }
      const { error } = await supabaseAdmin.from("sports_match_fixtures").insert({
        league_id, home_team_id, away_team_id,
        starts_at: new Date(starts_at).toISOString(),
        venue: venue || null,
        status: "scheduled",
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ message: "Fixture added" });
    }

    case "delete_fixture": {
      const { id } = body;
      const { error } = await supabaseAdmin.from("sports_match_fixtures").delete().eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ message: "Fixture deleted" });
    }

    case "recalculate_table": {
      const { data: leagues } = await supabaseAdmin.from("sports_leagues").select("id").eq("sport_code", "football");
      for (const l of leagues ?? []) {
        await recalcLeague(l.id);
      }
      return NextResponse.json({ message: "All tables recalculated" });
    }

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }
}
