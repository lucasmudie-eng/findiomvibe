// src/app/api/providers/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const {
    name, slug, category_slug, location, summary, description,
    images = [], services = [], areas_served = [],
    email = null, phone = null,
    // For now, we don’t require auth, so owner_id is null.
    // When we add Supabase Auth, we’ll set owner_id = user.id here.
    owner_id = null,
  } = body || {};

  if (!name || !slug || !category_slug) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from('providers').insert([{
    name, slug, category_slug, location, summary, description,
    images, services, areas_served, email, phone, owner_id,
  }]);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}