export type SportCode =
  | "football"
  | "rugby"
  | "cricket"
  | "netball"
  | "basketball"
  | "hockey"
  | "motorsport";

export type SportLeague = {
  id: string;
  name: string;
  slug: string;
  sportCode: SportCode;
};

export type SportTeam = {
  id: string;
  name: string;
  shortName?: string | null;
  leagueId: string;
};

export type SportResult = {
  id: string;
  leagueId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeGoals: number | null;
  awayGoals: number | null;
  playedAt: string | null;
  venue?: string | null;
};

export type SportTableRow = {
  leagueId: string;
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  pos: number;
};

export type SportSnapshot = {
  sportCode: SportCode;
  leagues: SportLeague[];
  teams: SportTeam[];
  results: SportResult[];
  table: SportTableRow[];
  updatedAt: string;
  isMock: boolean;
};
