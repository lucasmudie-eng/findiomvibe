import { NextResponse } from "next/server";
import { getSportSnapshot } from "@/lib/sports/source";

export async function GET(
  req: Request,
  { params }: { params: { code: string } }
) {
  try {
    const snapshot = await getSportSnapshot(params.code);
    const teamMap = new Map(
      snapshot.teams.map((t) => [t.id, t.shortName || t.name])
    );

    const rows = snapshot.table.map((row) => ({
      pos: row.pos,
      team: teamMap.get(row.teamId) ?? row.teamId,
      p: row.played,
      w: row.won,
      d: row.drawn,
      l: row.lost,
      gf: row.gf,
      ga: row.ga,
      gd: row.gd,
      pts: row.points,
    }));

    return NextResponse.json({ rows, updatedAt: snapshot.updatedAt });
  } catch (err) {
    console.error("[sports table] error", err);
    return NextResponse.json({ rows: [] }, { status: 200 });
  }
}
