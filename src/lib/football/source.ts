// src/lib/football/source.ts
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

// ───────────────── TEAMS (mock) ─────────────────

export const TEAMS: Team[] = [
  // Premier League
  { id: "st-georges", name: "St Georges", league: "iom-premier-league" },
  { id: "peel", name: "Peel", league: "iom-premier-league" },
  { id: "rushen", name: "Rushen United", league: "iom-premier-league" },
  { id: "douglas-royal", name: "Douglas Royal", league: "iom-premier-league" },
  { id: "laxey", name: "Laxey", league: "iom-premier-league" },
  { id: "ramsey", name: "Ramsey", league: "iom-premier-league" },

  // Division 2 (example set)
  { id: "castletown", name: "Castletown", league: "iom-division-2" },
  { id: "colby", name: "Colby", league: "iom-division-2" },
  { id: "rycob", name: "RYCOB", league: "iom-division-2" },
  { id: "marown", name: "Marown", league: "iom-division-2" },
  {
    id: "pulrose-united",
    name: "Pulrose United",
    league: "iom-division-2",
  },
  {
    id: "douglas-and-district",
    name: "Douglas & District",
    league: "iom-division-2",
  },

  // Combination 1
  {
    id: "st-georges-combi",
    name: "St Georges Combi",
    league: "iom-combination-1",
    isCombination: true,
  },
  {
    id: "peel-combi",
    name: "Peel Combi",
    league: "iom-combination-1",
    isCombination: true,
  },
  {
    id: "rushen-combi",
    name: "Rushen Combi",
    league: "iom-combination-1",
    isCombination: true,
  },

  // Combination 2 (example set)
  {
    id: "castletown-combi",
    name: "Castletown Combi",
    league: "iom-combination-2",
    isCombination: true,
  },
  {
    id: "colby-combi",
    name: "Colby Combi",
    league: "iom-combination-2",
    isCombination: true,
  },
  {
    id: "rycob-combi",
    name: "RYCOB Combi",
    league: "iom-combination-2",
    isCombination: true,
  },
  {
    id: "marown-combi",
    name: "Marown Combi",
    league: "iom-combination-2",
    isCombination: true,
  },
];

// All mock leagues currently supported
const L: LeagueId[] = [
  "iom-premier-league",
  "iom-division-2",
  "iom-combination-1",
  "iom-combination-2",
];

// id helper for fixtures/results
let autoId = 1;
const id = () => `fx-${autoId++}`;

// ───────────────── RECENT RESULTS (mock) ─────────────────

export const RESULTS_RECENT: Result[] = [
  // Premier
  {
    id: id(),
    league: "iom-premier-league",
    date: daysFromNow(-10),
    homeId: "peel",
    awayId: "st-georges",
    status: "FT",
    homeGoals: 1,
    awayGoals: 2,
  },
  {
    id: id(),
    league: "iom-premier-league",
    date: daysFromNow(-7),
    homeId: "rushen",
    awayId: "peel",
    status: "FT",
    homeGoals: 0,
    awayGoals: 0,
  },
  {
    id: id(),
    league: "iom-premier-league",
    date: daysFromNow(-5),
    homeId: "douglas-royal",
    awayId: "st-georges",
    status: "FT",
    homeGoals: 2,
    awayGoals: 3,
  },
  {
    id: id(),
    league: "iom-premier-league",
    date: daysFromNow(-3),
    homeId: "laxey",
    awayId: "ramsey",
    status: "FT",
    homeGoals: 1,
    awayGoals: 0,
  },

  // Combination 1 sample
  {
    id: id(),
    league: "iom-combination-1",
    date: daysFromNow(-8),
    homeId: "peel-combi",
    awayId: "st-georges-combi",
    status: "FT",
    homeGoals: 1,
    awayGoals: 1,
  },
  {
    id: id(),
    league: "iom-combination-1",
    date: daysFromNow(-4),
    homeId: "rushen-combi",
    awayId: "peel-combi",
    status: "FT",
    homeGoals: 2,
    awayGoals: 1,
  },

  // Combination 2 sample
  {
    id: id(),
    league: "iom-combination-2",
    date: daysFromNow(-6),
    homeId: "castletown-combi",
    awayId: "rycob-combi",
    status: "FT",
    homeGoals: 2,
    awayGoals: 0,
  },
];

// ───────────────── UPCOMING FIXTURES (mock) ─────────────────

export const FIXTURES_UPCOMING: Fixture[] = [
  // Premier
  {
    id: id(),
    league: "iom-premier-league",
    date: daysFromNow(2),
    homeId: "st-georges",
    awayId: "rushen",
    status: "SCHEDULED",
    venue: "Glencrutchery Road",
  },
  {
    id: id(),
    league: "iom-premier-league",
    date: daysFromNow(5),
    homeId: "peel",
    awayId: "douglas-royal",
    status: "SCHEDULED",
    venue: "Peel",
  },
  {
    id: id(),
    league: "iom-premier-league",
    date: daysFromNow(7),
    homeId: "ramsey",
    awayId: "laxey",
    status: "SCHEDULED",
    venue: "Ballacloan",
  },

  // Combination 1
  {
    id: id(),
    league: "iom-combination-1",
    date: daysFromNow(3),
    homeId: "st-georges-combi",
    awayId: "peel-combi",
    status: "SCHEDULED",
  },
  {
    id: id(),
    league: "iom-combination-1",
    date: daysFromNow(6),
    homeId: "peel-combi",
    awayId: "rushen-combi",
    status: "SCHEDULED",
  },

  // Combination 2
  {
    id: id(),
    league: "iom-combination-2",
    date: daysFromNow(4),
    homeId: "castletown-combi",
    awayId: "marown-combi",
    status: "SCHEDULED",
  },
];

// ───────────────── TABLE CALCULATION ─────────────────

function computeTable(
  league: LeagueId,
  teams: Team[],
  results: Result[]
): TableEntry[] {
  const leagueTeams = teams.filter((t) => t.league === league);
  const base: Record<TeamId, TableEntry> = Object.fromEntries(
    leagueTeams.map((t) => [
      t.id,
      {
        teamId: t.id,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        points: 0,
      },
    ])
  );

  for (const r of results.filter((r) => r.league === league)) {
    const home = base[r.homeId];
    const away = base[r.awayId];
    if (!home || !away) continue;

    home.played += 1;
    away.played += 1;
    home.gf += r.homeGoals;
    home.ga += r.awayGoals;
    away.gf += r.awayGoals;
    away.ga += r.homeGoals;

    if (r.homeGoals > r.awayGoals) {
      home.won += 1;
      away.lost += 1;
      home.points += 3;
    } else if (r.homeGoals < r.awayGoals) {
      away.won += 1;
      home.lost += 1;
      away.points += 3;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
    }
  }

  const table = Object.values(base).map((e) => ({
    ...e,
    gd: e.gf - e.ga,
  }));

  table.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.teamId.localeCompare(b.teamId);
  });

  table.forEach((e, i) => {
    e.pos = i + 1;
  });

  return table;
}

// ───────────────── PUBLIC HELPERS ─────────────────

export function getLeagueBundle(league: LeagueId): LeagueBundle {
  const teams = TEAMS.filter((t) => t.league === league);

  const resultsRecent = RESULTS_RECENT.filter((r) => r.league === league).sort(
    (a, b) => a.date.localeCompare(b.date)
  );

  const fixturesUpcoming = FIXTURES_UPCOMING.filter(
    (f) => f.league === league
  ).sort((a, b) => a.date.localeCompare(b.date));

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

export function getTeamSnapshot(
  league: LeagueId,
  teamId: TeamId
): TeamSnapshot | null {
  const bundle = getLeagueBundle(league);
  const team = TEAMS.find((t) => t.id === teamId && t.league === league);
  if (!team) return null;

  const last3 = bundle.resultsRecent
    .filter((r) => r.homeId === teamId || r.awayId === teamId)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  const next3 = bundle.fixturesUpcoming
    .filter((f) => f.homeId === teamId || f.awayId === teamId)
    .slice(0, 3);

  const entry = bundle.table.find((e) => e.teamId === teamId);
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

// ───────────────── DEFAULTS / EXPORTS ─────────────────

export const DEFAULT_LEAGUE: LeagueId = "iom-premier-league";
export const ALL_LEAGUES: LeagueId[] = L;