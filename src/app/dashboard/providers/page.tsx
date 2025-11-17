// src/app/dashboard/providers/page.tsx
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import Link from 'next/link';

export default async function ProvidersOwned() {
  const { data, error } = await supabaseAdmin
    .from('providers')
    .select('id, name, slug, category_slug, owner_id')
    .order('name', { ascending: true });

  if (error) {
    return <main className="p-8">Failed to load.</main>;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold mb-6">Your listings</h1>
      <div className="grid grid-cols-1 gap-3">
        {(data ?? []).map(p => (
          <Link key={p.id} href={`/providers/${p.slug}`} className="rounded-xl border p-4 hover:shadow">
            <div className="font-medium">{p.name}</div>
            <div className="text-sm text-gray-600">{p.category_slug}</div>
            <div className="text-xs text-gray-400">owner: {p.owner_id ?? '—'}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}