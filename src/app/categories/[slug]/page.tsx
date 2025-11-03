// src/app/categories/[slug]/page.tsx
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import Link from "next/link";

type ProviderRow = {
  id: string;
  slug: string | null;
  name: string;
  location: string | null;
  summary: string | null;
  rating: number | null;
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const categoryLabel = params.slug.replace(/-/g, " ");

  const { data, error } = await supabaseAdmin
    .from("providers")
    .select("id, slug, name, location, summary, rating")
    .eq("category_slug", params.slug)
    .order("name", { ascending: true });

  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-semibold capitalize">{categoryLabel}</h1>
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
          Failed to load providers: {error.message}
        </p>
      </main>
    );
  }

  const providers = (data ?? []) as ProviderRow[];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-4xl font-semibold tracking-tight text-gray-900">
        {categoryLabel.charAt(0).toUpperCase() + categoryLabel.slice(1)}
      </h1>
      <p className="mb-6 text-gray-600">
        {providers.length} provider{providers.length === 1 ? "" : "s"} found
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {providers.map((p) => {
          const safeSlug = (p.slug ?? "").trim() || slugify(p.name);
          const href = `/providers/${encodeURIComponent(safeSlug)}`;
          return (
            <Link
              key={p.id}
              href={href}
              className="block rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#D90429]"
              title={href}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{p.name}</h2>
                  {p.location && (
                    <div className="mt-1 text-sm text-gray-600">{p.location}</div>
                  )}
                  {p.summary && <p className="mt-3 text-gray-700">{p.summary}</p>}
                </div>
                {typeof p.rating === "number" && (
                  <span className="shrink-0 rounded-full bg-yellow-50 px-2 py-0.5 text-sm font-medium text-yellow-800">
                    ★ {p.rating.toFixed(1)}
                  </span>
                )}
              </div>

              <span className="mt-4 inline-flex items-center rounded-lg border px-3 py-1.5 text-sm text-gray-800">
                View profile →
              </span>
            </Link>
          );
        })}
      </div>

      {providers.length === 0 && (
        <div className="mt-10 rounded-2xl border p-6">
          <h3 className="mb-2 text-xl font-semibold">List your business</h3>
          <p className="mb-4 text-gray-600">
            Be the first {categoryLabel} to appear here.
          </p>
          <Link
            href="/dashboard"
            className="inline-block rounded-lg bg-[#D90429] px-4 py-2 text-white hover:bg-[#BF0323]"
          >
            Go to dashboard
          </Link>
        </div>
      )}
    </main>
  );
}