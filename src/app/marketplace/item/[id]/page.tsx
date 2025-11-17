// src/app/marketplace/item/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft, MapPin, Tag, MessageCircle, Sparkles } from "lucide-react";

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

  type?: string | null; // 'general' | 'car'
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
    mot?: string;
    service_history?: string;
    features?: string[];
  } | null;
};

function fmtPrice(pence?: number | null) {
  if (!pence || pence <= 0) return "£—";
  return "£" + (pence / 100).toLocaleString("en-GB", { maximumFractionDigits: 0 });
}

function fmtDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

async function getListing(id: string): Promise<Listing | null> {
  const { data, error } = await supabase
    .from("marketplace_listings")
    .select(
      `
      id, title, description, category, area, price_pence, negotiable,
      condition, images, boosted, approved, date_listed,
      business_id, type, attrs
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[item] DB error:", error);
    return null;
  }
  if (!data || data.approved === false) return null;

  // Defensive: if attrs was stored as text in some rows, parse it.
  const rec: any = data;
  if (rec?.attrs && typeof rec.attrs === "string") {
    try {
      rec.attrs = JSON.parse(rec.attrs);
    } catch {
      rec.attrs = null;
    }
  }
  return rec as Listing;
}

export default async function MarketplaceItemPage({ params }: { params: { id: string } }) {
  const item = await getListing(params.id);
  if (!item) notFound();

  const mainImage =
    (Array.isArray(item.images) && item.images.length ? item.images[0] : null) ?? null;

  const isCar = (item.type || "").toLowerCase() === "car";
  const A = item.attrs || {};

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Breadcrumb / back */}
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-1 text-[10px] text-gray-600 hover:text-[#D90429]"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to marketplace
        </Link>
      </div>

      {/* Header */}
      <section className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-[9px] text-gray-500">
          {item.category && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5">
              <Tag className="h-3 w-3 text-[#D90429]" />
              {item.category}
            </span>
          )}
          {item.area && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {item.area}
            </span>
          )}
          {item.date_listed && <span>Listed {fmtDate(item.date_listed)}</span>}
          {item.boosted && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF6F6] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-[#D90429]">
              <Sparkles className="h-3 w-3" />
              Boosted
            </span>
          )}
          {isCar && <span className="rounded-full bg-slate-100 px-2 py-0.5">Car</span>}
        </div>

        <h1 className="text-xl font-semibold text-gray-900">
          {isCar ? [A.make, A.model, A.year].filter(Boolean).join(" ") || item.title : item.title}
        </h1>

        <div className="flex items-baseline gap-3">
          <p className="text-2xl font-semibold text-[#D90429]">{fmtPrice(item.price_pence)}</p>
          {item.negotiable && (
            <span className="rounded-full bg-green-50 px-2 py-0.5 text-[9px] font-medium text-green-700">
              Negotiable
            </span>
          )}
          {item.condition && (
            <span className="rounded-full bg-gray-50 px-2 py-0.5 text-[9px] text-gray-700">
              {item.condition}
            </span>
          )}
        </div>
      </section>

      {/* Layout: image + details */}
      <section className="grid gap-4 md:grid-cols-[minmax(0,1.6fr),minmax(0,1.1fr)]">
        {/* Image */}
        <div className="rounded-2xl border bg-white p-3 shadow-sm">
          <div className="relative h-64 w-full overflow-hidden rounded-xl bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {mainImage ? (
              <img src={mainImage} alt={item.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                No image provided
              </div>
            )}
          </div>
          {Array.isArray(item.images) && item.images.length > 1 && (
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {item.images.slice(1).map((img, i) => (
                <div
                  key={i}
                  className="relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`${item.title} - ${i + 2}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Side panel */}
        <aside className="space-y-3">
          {/* Car spec */}
          {isCar && (
            <div className="rounded-2xl border bg-white p-4 text-xs text-gray-700 shadow-sm">
              <h2 className="mb-2 text-sm font-semibold text-gray-900">Vehicle spec</h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
                {A.make && (
                  <>
                    <dt className="text-gray-500">Make</dt>
                    <dd className="font-medium text-gray-900">{A.make}</dd>
                  </>
                )}
                {A.model && (
                  <>
                    <dt className="text-gray-500">Model</dt>
                    <dd className="font-medium text-gray-900">{A.model}</dd>
                  </>
                )}
                {A.year && (
                  <>
                    <dt className="text-gray-500">Year</dt>
                    <dd className="font-medium text-gray-900">{A.year}</dd>
                  </>
                )}
                {typeof A.mileage === "number" && (
                  <>
                    <dt className="text-gray-500">Mileage</dt>
                    <dd className="font-medium text-gray-900">
                      {A.mileage.toLocaleString()} miles
                    </dd>
                  </>
                )}
                {A.fuel && (
                  <>
                    <dt className="text-gray-500">Fuel</dt>
                    <dd className="font-medium text-gray-900">{A.fuel}</dd>
                  </>
                )}
                {A.transmission && (
                  <>
                    <dt className="text-gray-500">Transmission</dt>
                    <dd className="font-medium text-gray-900">{A.transmission}</dd>
                  </>
                )}
                {A.engine && (
                  <>
                    <dt className="text-gray-500">Engine</dt>
                    <dd className="font-medium text-gray-900">{A.engine}</dd>
                  </>
                )}
                {A.colour && (
                  <>
                    <dt className="text-gray-500">Colour</dt>
                    <dd className="font-medium text-gray-900">{A.colour}</dd>
                  </>
                )}
                {typeof A.doors === "number" && (
                  <>
                    <dt className="text-gray-500">Doors</dt>
                    <dd className="font-medium text-gray-900">{A.doors}</dd>
                  </>
                )}
                {typeof A.owners === "number" && (
                  <>
                    <dt className="text-gray-500">Owners</dt>
                    <dd className="font-medium text-gray-900">{A.owners}</dd>
                  </>
                )}
                {A.mot && (
                  <>
                    <dt className="text-gray-500">MOT</dt>
                    <dd className="font-medium text-gray-900">{A.mot}</dd>
                  </>
                )}
                {A.service_history && (
                  <>
                    <dt className="text-gray-500">Service history</dt>
                    <dd className="font-medium text-gray-900">{A.service_history}</dd>
                  </>
                )}
              </dl>
              {Array.isArray(A.features) && A.features.length > 0 && (
                <div className="mt-3">
                  <div className="mb-1 text-xs font-semibold text-gray-900">Features</div>
                  <ul className="flex flex-wrap gap-1.5">
                    {A.features.map((f, i) => (
                      <li
                        key={i}
                        className="rounded-full bg-gray-50 px-2 py-0.5 text-[11px] text-gray-700"
                      >
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="rounded-2xl border bg-white p-4 text-xs text-gray-700 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-gray-900">About this item</h3>
            <p className="whitespace-pre-line text-[11px] leading-relaxed">
              {item.description || "No additional description provided."}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-4 text-xs shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-gray-900">Interested?</h3>
            <p className="text-[10px] text-gray-600">
              Send us a message and mention this listing ID and title. We&apos;ll connect you with the seller securely.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <Link
                href={`/contact?listing=${encodeURIComponent(item.id)}&title=${encodeURIComponent(
                  item.title
                )}`}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#D90429] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[#b50322]"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Enquire about this item
              </Link>
              <p className="text-[9px] text-gray-500">Listing ID: {item.id}</p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}