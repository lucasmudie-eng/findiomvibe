// src/lib/football/types.ts

// ---------- Core ID types ----------

/**
 * We keep LeagueId as a strict union because the set of leagues is small
 * and stable. This gives you nice autocomplete and prevents typos.
 */
export type LeagueId =
  | "iom-premier-league"
  | "iom-division-2"
  | "iom-combination-1"
  | "iom-combination-2";

/**
 * TeamId is a free string on purpose.
 *
 * Reason: team slugs / IDs can and will change (new teams, only-combi sides,
 * renames, mergers, etc.), and we may later plug into live data.
 *
 * Keeping this as `string` avoids constantly fighting TypeScript every time
 * a new team appears.
 */
export type TeamId = string;

// ---------- Core entities ----------

export interface Team {
  id: TeamId;
  name: string;
  short?: string;
  league: LeagueId;
  isCombination?: boolean;
  crestUrl?: string;
}

export interface Fixture {
  id: string;
  league: LeagueId;
  date: string; // ISO string
  homeId: TeamId;
  awayId: TeamId;
  venue?: string;
  status: "SCHEDULED" | "LIVE" | "FT";
}

export interface Result extends Omit<Fixture, "status"> {
  status: "FT";
  homeGoals: number;
  awayGoals: number;
}

// ---------- Table ----------

export interface TableEntry {
  teamId: TeamId;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  pos?: number; // position in table (1-based)
}

// ---------- Bundles ----------

export interface LeagueBundle {
  league: LeagueId;
  teams: Team[];
  fixturesUpcoming: Fixture[];
  resultsRecent: Result[];
  table: TableEntry[];
  updatedAt: string; // ISO
}

export interface TeamSnapshot {
  league: LeagueId;
  team: Team;
  last3: Result[];
  next3: Fixture[];
  position?: number;
  table: TableEntry[]; // convenience for the team page
  updatedAt: string;
}