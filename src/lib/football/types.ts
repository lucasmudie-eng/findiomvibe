export type LeagueId =
  | "iom-premier-league"
  | "iom-division-2"
  | "iom-combination-1"
  | "iom-combination-2";

export type TeamId =
  | "st-georges"
  | "peel"
  | "rushen"
  | "douglas-royal"
  | "laxey"
  | "ramsey"
  | "st-georges-combi"
  | "peel-combi"
  | "rushen-combi";

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
  date: string; // ISO
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
  pos?: number;
}

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