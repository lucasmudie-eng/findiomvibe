// src/app/businesses/[slug]/page.tsx
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { MapPin, Globe, Phone, Mail, Clock, ChevronRight } from "lucide-react";
import BusinessProfileTracker from "@/app/providers/components/BusinessProfileTracker";
import BusinessContactPanel from "@/app/providers/components/BusinessContactPanel";
import BusinessesMap from "../BusinessesMap";
import GalleryCarousel from "../GalleryCarousel";

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
  provider_id?: string | null;
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
  const { data: bySlug } = await supabase
    .from("businesses").select("*").eq("slug", slugOrId).maybeSingle();
  if (bySlug) return bySlug as Biz;

  const { data: byId } = await supabase
    .from("businesses").select("*").eq("id", slugOrId).maybeSingle();
  if (byId) return byId as Biz;

  return null;
}

function fmtCategory(cat?: string | null) {
  if (!cat) return "";
  return cat.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()).replace(/\bFood Drink\b/i, "Food / Drink");
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
    <div className="flex items-center gap-0.5 text-amber-400">
      {Array.from({ length: full }).map((_, i) => <span key={`f${i}`}>★</span>)}
      {half && <span className="text-amber-300">☆</span>}
      {Array.from({ length: empty }).map((_, i) => <span key={`e${i}`} className="text-slate-300">★</span>)}
    </div>
  );
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const biz = await getBusiness(params.slug);
  if (!biz) return {};
  const title = biz.name;
  const description = biz.tagline || biz.description?.slice(0, 155) || `${biz.name} — Isle of Man business on ManxHive.`;
  const image = biz.hero_url || (Array.isArray(biz.images) ? biz.images[0] : null) || biz.logo_url;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function BusinessPage({ params }: { params: { slug: string } }) {
  const biz = await getBusiness(params.slug);
  if (!biz) notFound();

  const website   = normalizeUrl(biz.website_url);
  const providerId = biz.provider_id || biz.id;
  const businessId = biz.id;

  const gallery: string[] = [];
  if (Array.isArray(biz.images) && biz.images.length) gallery.push(...biz.images.slice(0, 4));
  else if (biz.hero_url) gallery.push(biz.hero_url);
  else if (biz.logo_url) gallery.push(biz.logo_url);

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

  const contactHref = `/contact?business=${encodeURIComponent(biz.slug || biz.id)}&name=${encodeURIComponent(biz.name)}`;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <BusinessProfileTracker providerId={providerId} businessId={businessId} />

      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-slate-400">
        <Link href="/" className="hover:text-slate-700 transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/businesses" className="hover:text-slate-700 transition-colors">Businesses</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-700">{biz.name}</span>
      </nav>

      {/* ── HERO GALLERY ──────────────────────────────────────────────────── */}
      <GalleryCarousel gallery={gallery} name={biz.name} boosted={biz.boosted} />

      {/* ── PAGE HEADER ───────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {biz.category && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {fmtCategory(biz.category)}
            </span>
          )}
          {biz.subcategory && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {biz.subcategory}
            </span>
          )}
          {biz.area && (
            <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              <MapPin className="h-3 w-3" /> {biz.area}
            </span>
          )}
          {biz.provider_id && (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              ✓ Verified
            </span>
          )}
        </div>

        <h1 className="font-playfair text-3xl font-bold text-slate-900 sm:text-4xl">
          {biz.name}
        </h1>
        {biz.tagline && (
          <p className="mt-2 text-lg text-slate-500">{biz.tagline}</p>
        )}

        {(biz.reviews_avg ?? 0) > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <StarRow avg={biz.reviews_avg} />
            <span className="text-sm text-slate-600">
              {(biz.reviews_avg ?? 0).toFixed(1)}
              {biz.reviews_count ? ` · ${biz.reviews_count} review${biz.reviews_count !== 1 ? "s" : ""}` : ""}
            </span>
          </div>
        )}
      </div>

      {/* ── BODY GRID ─────────────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">

        {/* Left column */}
        <div className="order-2 space-y-6 lg:order-1">

          {/* About */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-playfair mb-3 text-xl font-bold text-slate-900">About</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
              {biz.description || "Profile coming soon."}
            </p>
          </div>

          {/* Services */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-playfair mb-3 text-xl font-bold text-slate-900">
              Services &amp; Prices
            </h2>
            {services.length ? (
              <ul className="divide-y divide-slate-100">
                {services.map((s, i) => (
                  <li key={i} className="flex items-baseline justify-between gap-3 py-2.5 text-sm">
                    <span className="text-slate-700">{s.name || "Service"}</span>
                    {s.price && <span className="font-semibold text-slate-900">{s.price}</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">Services will appear here once added.</p>
            )}
          </div>

          {/* Opening hours + website */}
          {(website || biz.opening_hours) && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-playfair mb-4 text-xl font-bold text-slate-900">Info</h2>
              <div className="space-y-3">
                {website && (
                  <div className="flex items-start gap-3">
                    <Globe className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E8002D]" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Website</p>
                      <a
                        href={website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-0.5 text-sm font-medium text-[#E8002D] hover:underline"
                      >
                        {website.replace(/^https?:\/\//i, "")}
                      </a>
                    </div>
                  </div>
                )}
                {biz.opening_hours && (
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E8002D]" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Opening hours</p>
                      <pre className="mt-0.5 whitespace-pre-wrap text-sm text-slate-700">{biz.opening_hours}</pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-playfair mb-4 text-xl font-bold text-slate-900">Reviews</h2>
              <ul className="space-y-4">
                {reviews.map((r, i) => (
                  <li key={i} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                    {r.rating && <StarRow avg={r.rating} />}
                    {r.text && <p className="mt-2 text-sm text-slate-700">{r.text}</p>}
                    {r.author && <p className="mt-1 text-xs text-slate-400">— {r.author}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="order-1 space-y-4 lg:order-2">
          <BusinessContactPanel
            providerId={providerId}
            businessId={businessId}
            businessName={biz.name}
            website={website}
            email={biz.email ?? undefined}
            phone={biz.phone ?? undefined}
            address={biz.address ?? undefined}
            contactHref={contactHref}
          />

          {/* Quick info */}
          {(biz.phone || biz.email || biz.address) && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Contact
              </h3>
              <div className="space-y-3">
                {biz.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Phone className="h-4 w-4 flex-shrink-0 text-[#E8002D]" />
                    <a href={`tel:${biz.phone}`} className="min-h-[44px] flex items-center hover:text-[#E8002D] transition-colors">{biz.phone}</a>
                  </div>
                )}
                {biz.email && (
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Mail className="h-4 w-4 flex-shrink-0 text-[#E8002D]" />
                    <a href={`mailto:${biz.email}`} className="min-h-[44px] flex items-center hover:text-[#E8002D] transition-colors break-all">{biz.email}</a>
                  </div>
                )}
                {biz.address && (
                  <div className="flex items-start gap-2 text-sm text-slate-700">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E8002D]" />
                    <span>{biz.address}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Map */}
          {(biz.area || biz.address) && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-4 py-3">
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Location
                </h3>
              </div>
              <BusinessesMap
                businesses={[{ id: biz.id, name: biz.name, area: biz.address || biz.area || null, url: undefined }]}
                heightClass="h-[200px]"
                title="Business location"
              />
            </div>
          )}

          <Link
            href="/businesses"
            className="block text-sm font-semibold text-[#E8002D] hover:underline"
          >
            ← Back to businesses
          </Link>
        </div>
      </div>
    </main>
  );
}
