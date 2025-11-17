// src/lib/football/mock.ts
import {
  Fixture,
  LeagueBundle,
  LeagueId,
  Result,
  TableEntry,
  Team,
  TeamId,
  TeamSnapshot,
} from "./types";

const now = new Date();
const iso = (d: Date) => d.toISOString();
const daysFromNow = (n: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() + n);
  return iso(d);
};

// ———————————————————————————————————————————————————————————
// TEAMS
// ———————————————————————————————————————————————————————————
export const TEAMS: Team[] = [
  // Canada Life Premier League
  { id: "st-georges", name: "St George's", league: "iom-premier-league" },
  { id: "peel", name: "Peel", league: "iom-premier-league" },
  { id: "rushen", name: "Rushen United", league: "iom-premier-league" },
  { id: "douglas-royal", name: "Douglas Royal", league: "iom-premier-league" },
  { id: "laxey", name: "Laxey", league: "iom-premier-league" },
  { id: "ramsey", name: "Ramsey", league: "iom-premier-league" },

  // DPS Ltd Division Two (8 clubs)
  { id: "castletown", name: "Castletown", league: "iom-division-2" },
  { id: "colby", name: "Colby", league: "iom-division-2" },
  { id: "rycob", name: "RYCOB", league: "iom-division-2" },
  { id: "marown", name: "Marown", league: "iom-division-2" },
  { id: "pulrose-united", name: "Pulrose United", league: "iom-division-2" },
  { id: "malew", name: "Malew", league: "iom-division-2" },
  { id: "governors-athletic", name: "Governors Athletic", league: "iom-division-2" },
  { id: "douglas-and-district", name: "Douglas & District", league: "iom-division-2" },

  // Canada Life Combination One (examples)
  { id: "st-georges-combi", name: "St George's Combi", league: "iom-combination-1", isCombination: true },
  { id: "peel-combi", name: "Peel Combi", league: "iom-combination-1", isCombination: true },
  { id: "rushen-combi", name: "Rushen Combi", league: "iom-combination-1", isCombination: true },

  // DPS Ltd Combination Two (mirror of Div 2 clubs as combi sides)
  { id: "castletown-combi", name: "Castletown Combi", league: "iom-combination-2", isCombination: true },
  { id: "colby-combi", name: "Colby Combi", league: "iom-combination-2", isCombination: true },
  { id: "rycob-combi", name: "RYCOB Combi", league: "iom-combination-2", isCombination: true },
  { id: "marown-combi", name: "Marown Combi", league: "iom-combination-2", isCombination: true },
  { id: "pulrose-united-combi", name: "Pulrose United Combi", league: "iom-combination-2", isCombination: true },
  { id: "malew-combi", name: "Malew Combi", league: "iom-combination-2", isCombination: true },
  { id: "governors-athletic-combi", name: "Governors Athletic Combi", league: "iom-combination-2", isCombination: true },
  { id: "douglas-and-district-combi", name: "Douglas & District Combi", league: "iom-combination-2", isCombination: true },
];

export const ALL_LEAGUES: LeagueId[] = [
  "iom-premier-league",
  "iom-division-2",
  "iom-combination-1",
  "iom-combination-2",
];

export const DEFAULT_LEAGUE: LeagueId = "iom-premier-league";

// Small helper to generate ids
let autoId = 1;
const id = () => `fx-${autoId++}`;

// ———————————————————————————————————————————————————————————
// RECENT RESULTS (oldest → newest)
// ———————————————————————————————————————————————————————————
export const RESULTS_RECENT: Result[] = [
  // Premier
  { id: id(), league: "iom-premier-league", date: daysFromNow(-10), homeId: "peel", awayId: "st-georges", status: "FT", homeGoals: 1, awayGoals: 2 },
  { id: id(), league: "iom-premier-league", date: daysFromNow(-7), homeId: "rushen", awayId: "peel", status: "FT", homeGoals: 0, awayGoals: 0 },
  { id: id(), league: "iom-premier-league", date: daysFromNow(-5), homeId: "douglas-royal", awayId: "st-georges", status: "FT", homeGoals: 2, awayGoals: 3 },
  { id: id(), league: "iom-premier-league", date: daysFromNow(-3), homeId: "laxey", awayId: "ramsey", status: "FT", homeGoals: 1, awayGoals: 0 },

  // Division Two
  { id: id(), league: "iom-division-2", date: daysFromNow(-9), homeId: "castletown", awayId: "colby", status: "FT", homeGoals: 3, awayGoals: 1 },
  { id: id(), league: "iom-division-2", date: daysFromNow(-6), homeId: "rycob", awayId: "marown", status: "FT", homeGoals: 1, awayGoals: 2 },
  { id: id(), league: "iom-division-2", date: daysFromNow(-4), homeId: "pulrose-united", awayId: "malew", status: "FT", homeGoals: 2, awayGoals: 2 },

  // Combination One (sample)
  { id: id(), league: "iom-combination-1", date: daysFromNow(-8), homeId: "peel-combi", awayId: "st-georges-combi", status: "FT", homeGoals: 1, awayGoals: 1 },
  { id: id(), league: "iom-combination-1", date: daysFromNow(-4), homeId: "rushen-combi", awayId: "peel-combi", status: "FT", homeGoals: 2, awayGoals: 1 },

  // Combination Two (new)
  { id: id(), league: "iom-combination-2", date: daysFromNow(-9), homeId: "castletown-combi", awayId: "colby-combi", status: "FT", homeGoals: 2, awayGoals: 0 },
  { id: id(), league: "iom-combination-2", date: daysFromNow(-5), homeId: "rycob-combi", awayId: "marown-combi", status: "FT", homeGoals: 1, awayGoals: 3 },
];

// ———————————————————————————————————————————————————————————
// UPCOMING FIXTURES
// ———————————————————————————————————————————————————————————
export const FIXTURES_UPCOMING: Fixture[] = [
  // Premier
  { id: id(), league: "iom-premier-league", date: daysFromNow(2), homeId: "st-georges", awayId: "rushen", status: "SCHEDULED", venue: "Glencrutchery Road" },
  { id: id(), league: "iom-premier-league", date: daysFromNow(5), homeId: "peel", awayId: "douglas-royal", status: "SCHEDULED", venue: "Peel" },
  { id: id(), league: "iom-premier-league", date: daysFromNow(7), homeId: "ramsey", awayId: "laxey", status: "SCHEDULED", venue: "Ballacloan" },

  // Division Two
  { id: id(), league: "iom-division-2", date: daysFromNow(3), homeId: "castletown", awayId: "rycob", status: "SCHEDULED", venue: "Castletown" },
  { id: id(), league: "iom-division-2", date: daysFromNow(6), homeId: "colby", awayId: "marown", status: "SCHEDULED", venue: "Colby" },
  { id: id(), league: "iom-division-2", date: daysFromNow(9), homeId: "pulrose-united", awayId: "douglas-and-district", status: "SCHEDULED", venue: "Pulrose" },

  // Combination One
  { id: id(), league: "iom-combination-1", date: daysFromNow(3), homeId: "st-georges-combi", awayId: "peel-combi", status: "SCHEDULED" },
  { id: id(), league: "iom-combination-1", date: daysFromNow(6), homeId: "peel-combi", awayId: "rushen-combi", status: "SCHEDULED" },

  // Combination Two (new)
  { id: id(), league: "iom-combination-2", date: daysFromNow(2), homeId: "castletown-combi", awayId: "rycob-combi", status: "SCHEDULED" },
  { id: id(), league: "iom-combination-2", date: daysFromNow(5), homeId: "colby-combi", awayId: "marown-combi", status: "SCHEDULED" },
  { id: id(), league: "iom-combination-2", date: daysFromNow(8), homeId: "pulrose-united-combi", awayId: "douglas-and-district-combi", status: "SCHEDULED" },
];

// ———————————————————————————————————————————————————————————
// TABLE CALCULATION
// ———————————————————————————————————————————————————————————
function computeTable(league: LeagueId, teams: Team[], results: Result[]): TableEntry[] {
  const leagueTeams = teams.filter(t => t.league === league);
  const base: Record<TeamId, TableEntry> = Object.fromEntries(
    leagueTeams.map(t => [
      t.id,
      { teamId: t.id, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 },
    ])
  );

  for (const r of results.filter(r => r.league === league)) {
    const home = base[r.homeId];
    const away = base[r.awayId];
    if (!home || !away) continue;

    home.played += 1;
    away.played += 1;
    home.gf += r.homeGoals; home.ga += r.awayGoals;
    away.gf += r.awayGoals; away.ga += r.homeGoals;

    if (r.homeGoals > r.awayGoals) {
      home.won += 1; away.lost += 1; home.points += 3;
    } else if (r.homeGoals < r.awayGoals) {
      away.won += 1; home.lost += 1; away.points += 3;
    } else {
      home.drawn += 1; away.drawn += 1; home.points += 1; away.points += 1;
    }
  }

  const table = Object.values(base).map(e => ({ ...e, gd: e.gf - e.ga }));
  table.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.teamId.localeCompare(b.teamId);
  });
  table.forEach((e, i) => (e.pos = i + 1));
  return table;
}

// ———————————————————————————————————————————————————————————
function fixturesForTeam(league: LeagueId, team: TeamId) {
  return FIXTURES_UPCOMING
    .filter(f => f.league === league && (f.homeId === team || f.awayId === team))
    .sort((a, b) => a.date.localeCompare(b.date));
}
function resultsForTeam(league: LeagueId, team: TeamId) {
  return RESULTS_RECENT
    .filter(r => r.league === league && (r.homeId === team || r.awayId === team))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Backfill: ensure up to N upcoming fixtures
function backfillUpcoming(team: TeamId, league: LeagueId, have: Fixture[], want = 3): Fixture[] {
  const out = [...have];
  if (out.length >= want) return out.slice(0, want);

  const leagueTeams = TEAMS.filter(t => t.league === league && t.id !== team).map(t => t.id);

  const already = new Set<string>();
  [...FIXTURES_UPCOMING, ...RESULTS_RECENT]
    .filter(m => m.league === league)
    .forEach((m: any) => {
      already.add(`${m.homeId}|${m.awayId}`);
      already.add(`${m.awayId}|${m.homeId}`);
    });

  let offset = 7;
  for (const opp of leagueTeams) {
    if (out.length >= want) break;
    const key = `${team}|${opp}`;
    if (already.has(key)) continue;

    out.push({
      id: id(),
      league,
      date: daysFromNow(offset),
      homeId: team,
      awayId: opp,
      status: "SCHEDULED",
      venue: "TBD",
    });
    offset += 7;
  }
  return out.slice(0, want);
}

// Backfill: ensure up to N recent results (older FT results)
function backfillRecent(team: TeamId, league: LeagueId, have: Result[], want = 3): Result[] {
  const out = [...have]; // oldest→newest
  if (out.length >= want) return out.slice(-want);

  const leagueTeams = TEAMS.filter(t => t.league === league && t.id !== team).map(t => t.id);

  const already = new Set<string>();
  [...RESULTS_RECENT, ...FIXTURES_UPCOMING]
    .filter(m => m.league === league)
    .forEach((m: any) => {
      already.add(`${m.homeId}|${m.awayId}`);
      already.add(`${m.awayId}|${m.homeId}`);
    });

  let offset = -14;
  for (const opp of leagueTeams) {
    if (out.length >= want) break;
    const key = `${team}|${opp}`;
    if (already.has(key)) continue;

    out.unshift({
      id: id(),
      league,
      date: daysFromNow(offset),
      homeId: team,
      awayId: opp,
      status: "FT",
      homeGoals: 0,
      awayGoals: 0,
    });
    offset -= 7;
  }
  return out.slice(-want);
}

// ———————————————————————————————————————————————————————————
// PUBLIC API
// ———————————————————————————————————————————————————————————
export function getLeagueBundle(league: LeagueId): LeagueBundle {
  const teams = TEAMS.filter(t => t.league === league);
  const resultsRecent = RESULTS_RECENT
    .filter(r => r.league === league)
    .sort((a, b) => a.date.localeCompare(b.date)); // oldest→newest
  const fixturesUpcoming = FIXTURES_UPCOMING
    .filter(f => f.league === league)
    .sort((a, b) => a.date.localeCompare(b.date));

  const table = computeTable(league, TEAMS, RESULTS_RECENT);

  return {
    league,
    teams,
    resultsRecent,
    fixturesUpcoming,
    table,
    updatedAt: iso(now),
  };
}

export function getTeamSnapshot(league: LeagueId, teamId: TeamId): TeamSnapshot | null {
  const bundle = getLeagueBundle(league);
  const team = TEAMS.find(t => t.id === teamId && t.league === league);
  if (!team) return null;

  const last3 = backfillRecent(teamId, league, resultsForTeam(league, teamId), 3);
  const next3 = backfillUpcoming(teamId, league, fixturesForTeam(league, teamId), 3);

  const entry = bundle.table.find(e => e.teamId === teamId);
  const position = entry?.pos;

  return {
    league,
    team,
    last3,
    next3,
    position,
    table: bundle.table,
    updatedAt: bundle.updatedAt,
  };
}