// src/app/marketplace/item/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  ChevronRight,
  MapPin,
  Tag,
  MessageCircle,
  Sparkles,
  Building2,
  Calendar,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import ContactSellerForm from "@/app/components/ContactSellerForm";
import SaveListingButton from "@/app/marketplace/components/SaveListingButton";
import ShareButton from "@/app/marketplace/components/ShareButton";
import { CATEGORY_LABELS, CategorySlug } from "@/lib/marketplace/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: { persistSession: false },
});

type Listing = {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  area?: string | null;
  price_pence: number | null;
  negotiable?: boolean | null;
  condition?: string | null;
  images?: string[] | null;
  boosted?: boolean | null;
  approved?: boolean | null;
  date_listed?: string | null;
  business_id?: string | null;
  type?: string | null;
  attrs?: {
    make?: string;
    model?: string;
    year?: number;
    mileage?: number;
    fuel?: string;
    transmission?: string;
    engine?: string;
    colour?: string;
    doors?: number;
    owners?: number;
    taxed_until?: string;
    service_history?: string;
    features?: string[];
  } | null;
};

type Business = {
  id: string;
  slug: string | null;
  name: string;
  category?: string | null;
  area?: string | null;
  logo_url?: string | null;
  hero_url?: string | null;
  tagline?: string | null;
};

function fmtPrice(pence?: number | null) {
  if (!pence || pence <= 0) return "£—";
  return "£" + (pence / 100).toLocaleString("en-GB", { maximumFractionDigits: 0 });
}

function fmtDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

async function getListing(id: string): Promise<Listing | null> {
  const { data, error } = await supabase
    .from("marketplace_listings")
    .select(
      `id, title, description, category, area, price_pence, negotiable,
      condition, images, boosted, approved, date_listed,
      business_id, type, attrs`
    )
    .eq("id", id)
    .maybeSingle();

  if (error) { console.error("[item] DB error:", error); return null; }
  if (!data || data.approved === false) return null;

  const rec: any = data;
  if (rec?.attrs && typeof rec.attrs === "string") {
    try { rec.attrs = JSON.parse(rec.attrs); } catch { rec.attrs = null; }
  }
  return rec as Listing;
}

async function getBusiness(businessId: string): Promise<Business | null> {
  const { data, error } = await supabase
    .from("businesses")
    .select("id, slug, name, category, area, logo_url, hero_url, tagline")
    .eq("id", businessId)
    .maybeSingle();

  if (error) { console.error("[item] business lookup error:", error); return null; }
  return (data as Business) || null;
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const item = await getListing(params.id);
  if (!item) return {};
  const title = item.title;
  const price = item.price_pence ? `£${(item.price_pence / 100).toLocaleString("en-GB", { maximumFractionDigits: 0 })}` : null;
  const description = [price, item.description?.slice(0, 120)].filter(Boolean).join(" — ") || `${title} for sale on ManxHive Marketplace, Isle of Man.`;
  const image = Array.isArray(item.images) && item.images.length ? item.images[0] : null;
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

export default async function MarketplaceItemPage({ params }: { params: { id: string } }) {
  const item = await getListing(params.id);
  if (!item) notFound();

  const business = item.business_id ? await getBusiness(item.business_id) : null;

  const mainImage =
    (Array.isArray(item.images) && item.images.length ? item.images[0] : null) ?? null;
  const gallery =
    Array.isArray(item.images) && item.images.length ? item.images : mainImage ? [mainImage] : [];

  const isCar = (item.type || "").toLowerCase() === "car";
  const A = item.attrs || {};
  const categoryLabel =
    item.category &&
    (CATEGORY_LABELS as Record<string, string>)[item.category as CategorySlug];
  const sellerLabel = business?.name || "Private seller";
  const businessHref = business ? `/businesses/${business.slug || business.id}` : null;
  const displayTitle = isCar
    ? [A.make, A.model, A.year].filter(Boolean).join(" ") || item.title
    : item.title;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 space-y-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link href="/" className="hover:text-slate-700 transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/marketplace" className="hover:text-slate-700 transition-colors">Marketplace</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="truncate text-slate-700">{displayTitle}</span>
      </nav>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {item.category && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              <Tag className="h-3 w-3 text-[#E8002D]" />
              {categoryLabel || item.category}
            </span>
          )}
          {item.area && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              <MapPin className="h-3 w-3" />
              {item.area}
            </span>
          )}
          {item.boosted && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#E8002D]/10 px-3 py-1 text-xs font-semibold text-[#E8002D]">
              <Sparkles className="h-3 w-3" />
              Featured listing
            </span>
          )}
          {isCar && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              Car
            </span>
          )}
        </div>

        <h1 className="font-playfair text-3xl font-bold text-slate-900 sm:text-4xl">
          {displayTitle}
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-3xl font-bold text-[#E8002D]">{fmtPrice(item.price_pence)}</span>
          {item.negotiable && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Negotiable
            </span>
          )}
          {item.condition && (
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
              {item.condition}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SaveListingButton
            listingId={item.id}
            title={item.title}
            image={mainImage}
            price={fmtPrice(item.price_pence)}
          />
          <ShareButton title={item.title} />
        </div>
      </div>

      {/* Layout */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">

        {/* Left column */}
        <div className="space-y-6">

          {/* Main image + gallery */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100">
              {mainImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mainImage}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2">
                  <Tag className="h-8 w-8 text-slate-300" />
                  <span className="text-sm text-slate-400">No image provided</span>
                </div>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {gallery.slice(1).map((img, i) => (
                  <div
                    key={i}
                    className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={`${item.title} — image ${i + 2}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-playfair mb-3 text-xl font-bold text-slate-900">
              About this listing
            </h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
              {item.description || "No additional description provided."}
            </p>
          </div>

          {/* Car spec */}
          {isCar && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-playfair mb-4 text-xl font-bold text-slate-900">
                Vehicle spec
              </h2>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                {A.make && (
                  <>
                    <dt className="text-slate-500">Make</dt>
                    <dd className="font-semibold text-slate-900">{A.make}</dd>
                  </>
                )}
                {A.model && (
                  <>
                    <dt className="text-slate-500">Model</dt>
                    <dd className="font-semibold text-slate-900">{A.model}</dd>
                  </>
                )}
                {A.year && (
                  <>
                    <dt className="text-slate-500">Year</dt>
                    <dd className="font-semibold text-slate-900">{A.year}</dd>
                  </>
                )}
                {typeof A.mileage === "number" && (
                  <>
                    <dt className="text-slate-500">Mileage</dt>
                    <dd className="font-semibold text-slate-900">{A.mileage.toLocaleString()} miles</dd>
                  </>
                )}
                {A.fuel && (
                  <>
                    <dt className="text-slate-500">Fuel</dt>
                    <dd className="font-semibold text-slate-900">{A.fuel}</dd>
                  </>
                )}
                {A.transmission && (
                  <>
                    <dt className="text-slate-500">Transmission</dt>
                    <dd className="font-semibold text-slate-900">{A.transmission}</dd>
                  </>
                )}
                {A.engine && (
                  <>
                    <dt className="text-slate-500">Engine</dt>
                    <dd className="font-semibold text-slate-900">{A.engine}</dd>
                  </>
                )}
                {A.colour && (
                  <>
                    <dt className="text-slate-500">Colour</dt>
                    <dd className="font-semibold text-slate-900">{A.colour}</dd>
                  </>
                )}
                {typeof A.doors === "number" && (
                  <>
                    <dt className="text-slate-500">Doors</dt>
                    <dd className="font-semibold text-slate-900">{A.doors}</dd>
                  </>
                )}
                {typeof A.owners === "number" && (
                  <>
                    <dt className="text-slate-500">Owners</dt>
                    <dd className="font-semibold text-slate-900">{A.owners}</dd>
                  </>
                )}
                {A.taxed_until && (
                  <>
                    <dt className="text-slate-500">Taxed until</dt>
                    <dd className="font-semibold text-slate-900">{A.taxed_until}</dd>
                  </>
                )}
                {A.service_history && (
                  <>
                    <dt className="text-slate-500">Service history</dt>
                    <dd className="font-semibold text-slate-900">{A.service_history}</dd>
                  </>
                )}
              </dl>
              {Array.isArray(A.features) && A.features.length > 0 && (
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                    Features
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {A.features.map((f, i) => (
                      <li
                        key={i}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
                      >
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">

          {/* At a glance */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
              At a glance
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-500">Price</dt>
                <dd className="font-bold text-[#E8002D]">{fmtPrice(item.price_pence)}</dd>
              </div>
              {item.condition && (
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-slate-500">Condition</dt>
                  <dd className="font-semibold text-slate-900">{item.condition}</dd>
                </div>
              )}
              {item.area && (
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-slate-500">Location</dt>
                  <dd className="font-semibold text-slate-900">{item.area}</dd>
                </div>
              )}
              {item.date_listed && (
                <div className="flex items-center justify-between gap-2">
                  <dt className="inline-flex items-center gap-1 text-slate-500">
                    <Calendar className="h-3.5 w-3.5" />
                    Listed
                  </dt>
                  <dd className="font-semibold text-slate-900">{fmtDate(item.date_listed)}</dd>
                </div>
              )}
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-500">Negotiable</dt>
                <dd className={`font-semibold ${item.negotiable ? "text-emerald-600" : "text-slate-900"}`}>
                  {item.negotiable ? "Yes" : "No"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Seller */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
              <Building2 className="h-3.5 w-3.5 text-[#E8002D]" />
              Seller
            </h3>
            {business ? (
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {business.logo_url || business.hero_url ? (
                    <img
                      src={business.logo_url || business.hero_url || ""}
                      alt={business.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl font-bold text-slate-300">
                      {business.name[0]}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{business.name}</p>
                  <p className="text-xs text-slate-500">
                    {business.category || "Local business"}
                    {business.area ? ` · ${business.area}` : ""}
                  </p>
                  {business.tagline && (
                    <p className="mt-1 text-xs text-slate-600">{business.tagline}</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600 leading-relaxed">
                Private seller. Meet in a public place and keep conversations on ManxHive.
              </p>
            )}
            {businessHref && (
              <Link
                href={businessHref}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                View business profile →
              </Link>
            )}
          </div>

          {/* Contact form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
              <MessageCircle className="h-3.5 w-3.5 text-[#E8002D]" />
              Send enquiry
            </h3>
            <ContactSellerForm listingId={item.id} seller={sellerLabel} />
            <p className="mt-3 text-[10px] text-slate-400">Listing ID: {item.id}</p>
          </div>

          {/* Back link */}
          <Link
            href="/marketplace"
            className="flex items-center gap-1.5 text-sm font-semibold text-[#E8002D] hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to marketplace
          </Link>
        </aside>
      </div>
    </main>
  );
}
