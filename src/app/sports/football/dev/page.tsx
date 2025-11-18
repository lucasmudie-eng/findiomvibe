// src/app/sports/football/dev/page.tsx
"use client";

import useSWR from "swr";
import Link from "next/link";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to load");
    return res.json();
  });

export default function DevFootball() {
  const { data, error, isLoading } = useSWR("/api/feed/football", fetcher, {
    revalidateOnFocus: false,
  });

  if (isLoading) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-semibold mb-4">Football Dev Links</h1>
        <p className="text-sm text-gray-600">Loading teams…</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-semibold mb-4">Football Dev Links</h1>
        <p className="text-sm text-red-600">
          Couldn&apos;t load data from <code>/api/feed/football</code>. Check the API route and
          try again.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Football Dev Links</h1>
      <ul className="grid gap-2 sm:grid-cols-2">
        {data.teams.map((t: any) => (
          <li key={t.id}>
            <Link
              href={`/sports/football/${data.league}/${t.id}`}
              className="block rounded-xl border p-3 hover:bg-muted"
            >
              {t.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}