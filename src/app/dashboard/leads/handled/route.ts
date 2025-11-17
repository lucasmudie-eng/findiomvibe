// src/app/api/leads/handled/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  const { id, handled } = await req.json().catch(() => ({}));
  if (!id || typeof handled !== 'boolean') {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  const { error } = await supabaseAdmin.from('leads').update({ handled }).eq('id', id);
  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  return NextResponse.json({ ok: true });
}