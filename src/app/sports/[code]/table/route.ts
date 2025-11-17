// src/app/api/sports/[code]/table/route.ts
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { code: string } }) {
  // TODO: replace with real fetch + transform
  const demo = {
    football: [
      { pos: 1, team: "Peel", p: 10, w: 8, d: 1, l: 1, gf: 24, ga: 9, gd: 15, pts: 25 },
      { pos: 2, team: "Laxey", p: 10, w: 7, d: 2, l: 1, gf: 22, ga: 10, gd: 12, pts: 23 },
      { pos: 3, team: "St Mary’s", p: 10, w: 6, d: 2, l: 2, gf: 19, ga: 12, gd: 7, pts: 20 },
    ],
  } as Record<string, any[]>;

  return NextResponse.json({ rows: demo[params.code] ?? [] }, { status: 200 });
}