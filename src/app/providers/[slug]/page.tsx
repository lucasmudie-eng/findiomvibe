// src/app/providers/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import LeadForm from "@/app/components/LeadForm";

type Provider = {
  id: string;
  slug: string;
  name: string;
  location: string | null;
  summary: string | null;
  description: string | null;
  rating: number | null;
  images: string[] | null;
  services: { name: string; price?: string }[] | null;
  areas_served: string[] | null;
  email: string | null;
  phone: string | null;
  category_slug: string | null;
};

// Server Component
export default async function ProviderPage({ params }: { params: { slug: string } }) {
  const { data: p, error } = await supabaseAdmin
    .from("providers")
    .select("*")
    .eq("slug", params.slug)
    .maybeSingle<Provider>();

  if (error || !p) notFound();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      {/* Breadcrumbs */}
      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:underline">Home</Link> /{" "}
        <Link href="/categories" className="hover:underline">Categories</Link> /{" "}
        <span className="text-gray-800">{p.category_slug?.replace(/-/g, " ")}</span> /{" "}
        <span className="text-gray-800">{p.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">{p.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-600">
            {typeof p.rating === "number" && (
              <span className="rounded-full bg-yellow-50 px-2 py-0.5 text-yellow-800">
                ★ {p.rating.toFixed(1)}
              </span>
            )}
            {p.location && <span>{p.location}</span>}
            {p.category_slug && (
              <span className="rounded-full border px-2 py-0.5">
                {p.category_slug.replace(/-/g, " ")}
              </span>
            )}
          </div>
          {p.summary && <p className="mt-3 text-gray-700">{p.summary}</p>}
        </div>
      </div>

      {/* Images */}
      {Array.isArray(p.images) && p.images.length > 0 && (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {p.images.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt={`${p.name} ${i + 1}`}
              className="h-56 w-full rounded-xl object-cover"
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 md:col-span-2">
          {p.description && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900">About</h2>
              <p className="mt-2 text-gray-700">{p.description}</p>
            </section>
          )}

          {Array.isArray(p.services) && p.services.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900">Services & pricing</h2>
              <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {p.services.map((s, i) => (
                  <li key={i} className="rounded-xl border bg-white p-4">
                    <div className="font-medium text-gray-900">{s.name}</div>
                    {s.price && <div className="mt-0.5 text-sm text-gray-600">{s.price}</div>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {Array.isArray(p.areas_served) && p.areas_served.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900">Areas served</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {p.areas_served.map((a) => (
                  <span key={a} className="rounded-full border px-3 py-1 text-sm">{a}</span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right column */}
        <aside className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold">Contact {p.name}</h3>
          {/* LeadForm (client) now expects providerSlug & providerName */}
          <LeadForm providerSlug={p.slug} providerName={p.name} />
          <div className="mt-4 space-y-1 text-sm text-gray-600">
            {p.email && <p>Email: {p.email}</p>}
            {p.phone && <p>Phone: {p.phone}</p>}
          </div>
        </aside>
      </div>
    </main>
  );
}