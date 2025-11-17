// src/app/api/feed/football/match/route.ts
import { NextRequest } from "next/server";
import { ALL_LEAGUES, RAW_FIXTURES, RAW_RESULTS } from "@/lib/football/source";
import type { LeagueId } from "@/lib/football/types";

export const revalidate = 60;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const league = searchParams.get("league") as LeagueId | null;
  const id = searchParams.get("id");

  if (!league || !ALL_LEAGUES.includes(league)) {
    return Response.json({ error: "Missing or invalid 'league'." }, { status: 400 });
  }
  if (!id) {
    return Response.json({ error: "Missing 'id'." }, { status: 400 });
  }

  // Look up across both results and fixtures
  const result = RAW_RESULTS.find(r => r.league === league && r.id === id);
  if (result) {
    return Response.json({
      type: "RESULT",
      ...result,
    });
  }

  const fixture = RAW_FIXTURES.find(f => f.league === league && f.id === id);
  if (fixture) {
    return Response.json({
      type: "FIXTURE",
      ...fixture,
    });
  }

  return Response.json({ error: `Match id '${id}' not found in league '${league}'.` }, { status: 404 });
}