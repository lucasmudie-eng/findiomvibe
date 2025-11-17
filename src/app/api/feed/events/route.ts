// src/app/api/feed/events/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    items: [
      { id: 'e1', title: 'Port Erin Fireworks Night', when: 'Fri 7:30pm', href: '/events/port-erin-fireworks' },
      { id: 'e2', title: 'Douglas Xmas Light Switch On', when: 'Sat 6pm', href: '/events/douglas-lights' },
    ],
  });
}