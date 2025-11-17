// src/app/businesses/[slug]/page.tsx
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

// Supabase server client (public reads)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
);

type Service = { name?: string; price?: string | number };
type Review  = { rating?: number; text?: string; author?: string };

type Biz = {
  id: string;
  slug: string | null;
  name: string;
  tagline?: string | null;

  category?: string | null;
  subcategory?: string | null;
  area?: string | null;

  description?: string | null;
  opening_hours?: string | null;
  website_url?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;

  images?: string[] | null;
  hero_url?: string | null;
  logo_url?: string | null;

  boosted?: boolean | null;

  reviews_avg?: number | null;
  reviews_count?: number | null;
  services_json?: Service[] | string | null;
  reviews_json?: Review[] | string | null;
};

async function getBusiness(slugOrId: string): Promise<Biz | null> {
  // slug first
  {
    const { data } = await supabase
      .from("businesses")
      .select("*")
      .eq("slug", slugOrId)
      .maybeSingle();
    if (data) return data as Biz;
  }
  // id fallback
  {
    const { data } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", slugOrId)
      .maybeSingle();
    if (data) return data as Biz;
  }
  return null;
}

function fmtCategoryLabel(cat?: string | null) {
  if (!cat) return "";
  return cat
    .replace(/-/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase())
    .replace(/\bFood Drink\b/i, "Food / Drink");
}

function normalizeUrl(url?: string | null) {
  if (!url) return null;
  const t = url.trim();
  return t ? (/^https?:\/\//i.test(t) ? t : `https://${t}`) : null;
}

function StarRow({ avg }: { avg?: number | null }) {
  const n = Math.max(0, Math.min(5, Math.round(((avg ?? 0) * 2)) / 2));
  const full = Math.floor(n);
  const half = n - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <div className="flex items-center gap-1 text-amber-500">
      {Array.from({ length: full }).map((_, i) => <span key={`f${i}`}>★</span>)}
      {half && <span>☆</span>}
      {Array.from({ length: empty }).map((_, i) => <span key={`e${i}`} className="text-slate-300">★</span>)}
    </div>
  );
}

export default async function BusinessPage({ params }: { params: { slug: string } }) {
  const biz = await getBusiness(params.slug);
  if (!biz) notFound();

  const website = normalizeUrl(biz.website_url);

  // Gallery: max 3 tiles
  const gallery: string[] = [];
  if (Array.isArray(biz.images) && biz.images.length) gallery.push(...biz.images.slice(0, 3));
  else if (biz.hero_url) gallery.push(biz.hero_url);
  else if (biz.logo_url) gallery.push(biz.logo_url);

  // Parse services / reviews if stored as jsonb or text
  const services: Service[] = (() => {
    const raw = (biz as any).services_json;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try { return JSON.parse(raw as string); } catch { return []; }
  })();

  const reviews: Review[] = (() => {
    const raw = (biz as any).reviews_json;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try { return JSON.parse(raw as string); } catch { return []; }
  })();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-4 text-xs text-slate-500">
        <Link href="/businesses" className="hover:underline">Businesses</Link>
        <span> / </span>
        <span className="text-slate-700">{biz.name}</span>
      </nav>

      {/* Header */}
      <header className="mb-5">
        <h1 className="text-3xl font-semibold text-slate-900">{biz.name}</h1>
        {biz.tagline && <p className="mt-1 text-slate-700">{biz.tagline}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          {biz.category && <span className="rounded-full bg-slate-100 px-2 py-0.5">{fmtCategoryLabel(biz.category)}</span>}
          {biz.subcategory && <span className="rounded-full bg-slate-100 px-2 py-0.5">{biz.subcategory}</span>}
          {biz.area && <span className="rounded-full bg-slate-100 px-2 py-0.5">{biz.area}</span>}
        </div>
      </header>

      {/* Gallery */}
      <section className="mb-8">
        <div className="grid gap-3 md:grid-cols-3">
          {gallery.length ? (
            gallery.map((src, i) => (
              <div key={i} className="relative h-44 w-full overflow-hidden rounded-xl bg-slate-100 md:h-52">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`${biz.name} ${i + 1}`} className="h-full w-full object-cover" />
              </div>
            ))
          ) : (
            <>
              <div className="flex h-44 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400 md:h-52">
                No images yet
              </div>
              <div className="hidden h-44 rounded-xl bg-slate-50 md:block md:h-52" />
              <div className="hidden h-44 rounded-xl bg-slate-50 md:block md:h-52" />
            </>
          )}
        </div>
      </section>

      {/* Body */}
      <section className="grid gap-6 md:grid-cols-[minmax(0,1.6fr),minmax(0,1fr)]">
        {/* LEFT */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-2 text-lg font-semibold text-slate-900">About</h2>
            <p className="whitespace-pre-line text-sm text-slate-700">
              {biz.description || "Profile coming soon."}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-2 text-base font-semibold text-slate-900">Services & Prices</h3>
            {services.length ? (
              <ul className="space-y-2 text-sm text-slate-700">
                {services.map((s, i) => (
                  <li key={i} className="flex items-baseline justify-between gap-3">
                    <span>{s.name || "Service"}</span>
                    {s.price ? <span className="text-slate-900">{s.price}</span> : <span />}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">Services will appear here once added.</p>
            )}
          </div>

          {(website || biz.opening_hours) && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-2 text-base font-semibold text-slate-900">Info</h3>
              <div className="space-y-2 text-sm">
                {website && (
                  <div>
                    <span className="text-slate-500">Website: </span>
                    <a href={website} target="_blank" rel="noopener noreferrer" className="text-[#D90429] hover:underline">
                      {website.replace(/^https?:\/\//i, "")}
                    </a>
                  </div>
                )}
                {biz.opening_hours && (
                  <div>
                    <div className="text-slate-500">Opening hours</div>
                    <pre className="whitespace-pre-wrap text-sm text-slate-700">{biz.opening_hours}</pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-base font-semibold text-slate-900">Contact</h3>
            <div className="space-y-2 text-sm">
              {website && (
                <div>
                  <a href={website} target="_blank" rel="noopener noreferrer" className="text-[#D90429] hover:underline">
                    Visit website
                  </a>
                </div>
              )}
              {biz.email && (
                <div>
                  <span className="text-slate-500">Email: </span>
                  <a href={`mailto:${biz.email}`} className="hover:underline">{biz.email}</a>
                </div>
              )}
              {biz.phone && (
                <div>
                  <span className="text-slate-500">Phone: </span>
                  <a href={`tel:${biz.phone}`} className="hover:underline">{biz.phone}</a>
                </div>
              )}
              {biz.address && (
                <div>
                  <div className="text-slate-500">Address</div>
                  <div className="text-slate-700">{biz.address}</div>
                </div>
              )}
            </div>

            <div className="mt-4">
              <Link
                href={`/contact?business=${encodeURIComponent(biz.slug || biz.id)}&name=${encodeURIComponent(biz.name)}`}
                className="inline-flex w-full items-center justify-center rounded-full bg-[#D90429] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b50322]"
              >
                Contact ManxHive about this business
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-2 text-base font-semibold text-slate-900">Customer reviews</h3>
            {(biz.reviews_avg || 0) > 0 ? (
              <>
                <div className="mb-2 flex items-center gap-2">
                  <StarRow avg={biz.reviews_avg} />
                  <span className="text-sm text-slate-600">
                    {(biz.reviews_avg ?? 0).toFixed(1)} / 5
                    {biz.reviews_count ? ` • ${biz.reviews_count} reviews` : ""}
                  </span>
                </div>
                {(reviews || []).slice(0, 3).map((r, i) => (
                  <div key={i} className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
                    {r.text || "No comment provided."}
                    {r.author && <div className="mt-1 text-xs text-slate-500">— {r.author}</div>}
                  </div>
                ))}
                {!reviews?.length && (
                  <p className="text-sm text-slate-500">No written reviews yet.</p>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-500">No ratings yet.</p>
            )}
          </div>

          {biz.boosted && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              Boosted placement
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}