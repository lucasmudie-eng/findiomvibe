import type { SportCode, SportSnapshot } from "./types";

const now = () => new Date().toISOString();

const MOCKS: Record<SportCode, SportSnapshot> = {
  football: {
    sportCode: "football",
    leagues: [],
    teams: [],
    results: [],
    table: [],
    updatedAt: now(),
    isMock: true,
  },
  rugby: {
    sportCode: "rugby",
    leagues: [],
    teams: [],
    results: [],
    table: [],
    updatedAt: now(),
    isMock: true,
  },
  cricket: {
    sportCode: "cricket",
    leagues: [],
    teams: [],
    results: [],
    table: [],
    updatedAt: now(),
    isMock: true,
  },
  netball: {
    sportCode: "netball",
    leagues: [],
    teams: [],
    results: [],
    table: [],
    updatedAt: now(),
    isMock: true,
  },
  basketball: {
    sportCode: "basketball",
    leagues: [],
    teams: [],
    results: [],
    table: [],
    updatedAt: now(),
    isMock: true,
  },
  hockey: {
    sportCode: "hockey",
    leagues: [],
    teams: [],
    results: [],
    table: [],
    updatedAt: now(),
    isMock: true,
  },
  motorsport: {
    sportCode: "motorsport",
    leagues: [],
    teams: [],
    results: [],
    table: [],
    updatedAt: now(),
    isMock: true,
  },
};

export function getSportMock(code: SportCode): SportSnapshot {
  return MOCKS[code] ?? MOCKS.football;
}
