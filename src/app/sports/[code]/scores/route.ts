// src/app/api/sports/[code]/scores/route.ts
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { code: string } }) {
  // TODO: replace with real fetch + transform
  const demo = {
    football: [
      { id: "f1", home: "St Mary’s", away: "Laxey", score: "2–1", when: "Sat 15:00" },
      { id: "f2", home: "Peel", away: "Douglas Royal", score: "1–1", when: "Sat 15:00" },
    ],
    rugby: [{ id: "r1", home: "Vagabonds", away: "Ramsey", score: "18–12", when: "Sat" }],
  } as Record<string, any[]>;

  return NextResponse.json({ items: demo[params.code] ?? [] }, { status: 200 });
}