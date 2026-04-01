import { NextResponse } from "next/server";
import { getSportSnapshot, formatScore, formatWhen, resolveSportName } from "@/lib/sports/source";

export async function GET(
  req: Request,
  { params }: { params: { code: string } }
) {
  try {
    const snapshot = await getSportSnapshot(params.code);
    const teamMap = new Map(
      snapshot.teams.map((t) => [t.id, t.shortName || t.name])
    );

    const items = snapshot.results.map((r) => {
      const name = resolveSportName(snapshot.sportCode);
      return {
        id: r.id,
        home: teamMap.get(r.homeTeamId) ?? r.homeTeamId,
        away: teamMap.get(r.awayTeamId) ?? r.awayTeamId,
        score: formatScore(r.homeGoals, r.awayGoals),
        when: formatWhen(r.playedAt),
        meta: name,
      };
    });

    return NextResponse.json({ items, updatedAt: snapshot.updatedAt });
  } catch (err) {
    console.error("[sports scores] error", err);
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
