// src/app/api/credits/topup/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  // Credits system disabled in this environment.
  return NextResponse.json(
    { error: "Credits top-up not configured." },
    { status: 501 }
  );
}