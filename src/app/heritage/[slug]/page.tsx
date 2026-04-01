// src/app/heritage/[slug]/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Route,
  Mountain,
  ExternalLink,
  ParkingCircle,
  CheckCircle2,
  Lightbulb,
  ChevronRight,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import HeritageMap from "@/app/heritage/HeritageMap";
import SaveItemButton from "@/app/components/SaveItemButton";
import { HERITAGE_IMAGE_FALLBACK, WALK_IMAGE_FALLBACK } from "@/lib/images";

type HeritagePlace = {
  id: number;
  slug: string;
  name: string;
  area: string | null;
  summary: string | null;
  description: string | null;
  type: string | null;
  difficulty: string | null;
  duration_mins: number | null;
  distance_km: number | null;
  tags: string[] | null;
  hero_image_url: string | null;
  gallery_images: string[] | null;
  parking_info: string | null;
  facilities: string[] | null;
  best_for: string[] | null;
  tips: string | null;
  external_url: string | null;
  latitude: number | null;
  longitude: number | null;
};

type WalkPreview = {
  id: number;
  slug: string;
  name: string;
  area: string | null;
  difficulty: string | null;
  duration_mins: number | null;
  distance_km: number | null;
  summary: string | null;
  hero_image_url: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

type SuggestedPlace = {
  id: number;
  slug: string;
  name: string;
  area: string | null;
  type: string | null;
  summary: string | null;
  hero_image_url: string | null;
};

type HeritageSitePageProps = {
  params: { slug: string };
};

const SAVED_HERITAGE_KEY = "manxhive_saved_heritage";

const DIFFICULTY_COLOUR: Record<string, string> = {
  easy:     "bg-emerald-100 text-emerald-800",
  moderate: "bg-amber-100 text-amber-800",
  hard:     "bg-rose-100 text-rose-800",
  strenuous:"bg-rose-100 text-rose-800",
};

export default function HeritageSitePage({ params }: HeritageSitePageProps) {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [place, setPlace] = useState<HeritagePlace | null>(null);
  const [walks, setWalks] = useState<WalkPreview[]>([]);
  const [relatedWalks, setRelatedWalks] = useState<WalkPreview[]>([]);
  const [suggestedPlaces, setSuggestedPlaces] = useState<SuggestedPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || !params.slug) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const { data: placeData, error: placeError } = await supabase
          .from("heritage_places")
          .select(
            [
              "id", "slug", "name", "area", "summary", "description", "type",
              "difficulty", "duration_mins", "distance_km", "tags",
              "hero_image_url", "gallery_images", "parking_info", "facilities",
              "best_for", "tips", "external_url", "latitude", "longitude",
            ].join(", ")
          )
          .eq("slug", params.slug)
          .single();

        if (placeError) {
          console.error("[heritage] load place error", placeError);
          if (!cancelled) { setError("Could not load this heritage place."); setLoading(false); }
          return;
        }
        if (!placeData) {
          if (!cancelled) { setError("This heritage place could not be found."); setLoading(false); }
          return;
        }
        if (cancelled) return;

        const typedPlace = placeData as unknown as HeritagePlace;
        setPlace(typedPlace);

        const { data: linkRows, error: linkError } = await supabase
          .from("heritage_site_walks")
          .select("walk_id, order_index")
          .eq("heritage_id", typedPlace.id)
          .order("order_index", { ascending: true });

        if (linkError) {
          console.error("[heritage] load links error", linkError);
          if (!cancelled) { setWalks([]); setLoading(false); }
          return;
        }

        const walkIds = linkRows?.length ? (linkRows.map((r: any) => r.walk_id) as number[]) : [];

        if (!walkIds.length) {
          if (!cancelled) setWalks([]);
          const promises: Promise<unknown>[] = [];
          if (typedPlace.area) {
            promises.push(
              Promise.resolve(
                supabase
                  .from("heritage_walks")
                  .select(["id","slug","name","area","difficulty","duration_mins","distance_km","summary","hero_image_url","latitude","longitude"].join(", "))
                  .eq("area", typedPlace.area)
                  .limit(4)
              ).then(({ data }) => { if (!cancelled && data?.length) setRelatedWalks(data as unknown as WalkPreview[]); })
            );
          }
          if (typedPlace.type) {
            promises.push(
              Promise.resolve(
                supabase
                  .from("heritage_places")
                  .select("id, slug, name, area, type, summary, hero_image_url")
                  .neq("slug", params.slug)
                  .eq("type", typedPlace.type)
                  .limit(4)
              ).then(({ data }) => { if (!cancelled && data?.length) setSuggestedPlaces(data as SuggestedPlace[]); })
            );
          }
          await Promise.all(promises);
          if (!cancelled) setLoading(false);
          return;
        }

        const { data: walkRows, error: walkError } = await supabase
          .from("heritage_walks")
          .select(["id","slug","name","area","difficulty","duration_mins","distance_km","summary","hero_image_url","latitude","longitude"].join(", "))
          .in("id", walkIds);

        if (walkError) {
          console.error("[heritage] load walks error", walkError);
          if (!cancelled) { setWalks([]); setLoading(false); }
          return;
        }

        if (!cancelled) {
          const walkById = new Map<number, WalkPreview>();
          (walkRows || []).forEach((w: any) => walkById.set(w.id, w as WalkPreview));
          const orderedWalks: WalkPreview[] = walkIds.map((id) => walkById.get(id)).filter(Boolean) as WalkPreview[];
          setWalks(orderedWalks);
        }

        // Fetch "You might also like" suggestions
        if (!cancelled && typedPlace.type) {
          const { data: suggestions } = await supabase
            .from("heritage_places")
            .select("id, slug, name, area, type, summary, hero_image_url")
            .neq("slug", params.slug)
            .eq("type", typedPlace.type)
            .limit(4);
          if (!cancelled && suggestions?.length) {
            setSuggestedPlaces(suggestions as SuggestedPlace[]);
          } else if (!cancelled && typedPlace.area) {
            const { data: areaSuggestions } = await supabase
              .from("heritage_places")
              .select("id, slug, name, area, type, summary, hero_image_url")
              .neq("slug", params.slug)
              .eq("area", typedPlace.area)
              .limit(4);
            if (!cancelled) setSuggestedPlaces((areaSuggestions as SuggestedPlace[]) ?? []);
          }
        }

        if (!cancelled) setLoading(false);
      } catch (err) {
        console.error("[heritage] unexpected error", err);
        if (!cancelled) { setError("Something went wrong loading this page."); setLoading(false); }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [supabase, params.slug]);

  // ── helpers ──────────────────────────────────────────────────────────────────

  function toStringArray(value: unknown): string[] {
    if (Array.isArray(value)) return value.map((v) => (v == null ? "" : String(v).trim())).filter((v) => v.length > 0);
    if (typeof value === "string") {
      let s = value.trim();
      // Handle PostgreSQL array literal: {"item one","item two"} or {item,item}
      if (s.startsWith("{") && s.endsWith("}")) {
        s = s.slice(1, -1);
        return s.split(",").map((v) => v.trim().replace(/^"|"$/g, "").trim()).filter((v) => v.length > 0);
      }
      return s.split(",").map((v) => v.trim()).filter((v) => v.length > 0);
    }
    return [];
  }

  function formatDistance(km: number | null | undefined) {
    if (!km) return null;
    return `${km.toFixed(1)} km`;
  }

  function formatDuration(mins: number | null | undefined) {
    if (!mins) return null;
    if (mins < 60) return `${mins} mins`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${h} hr ${m} min` : `${h} hr`;
  }

  // ── derived ───────────────────────────────────────────────────────────────────

  const tags       = toStringArray(place?.tags);
  const facilities = toStringArray(place?.facilities);
  const bestFor    = toStringArray(place?.best_for);

  const heroImage = place?.gallery_images?.[0] || place?.hero_image_url || HERITAGE_IMAGE_FALLBACK;
  const galleryExtras = Array.isArray(place?.gallery_images) && place!.gallery_images!.length > 1
    ? (place!.gallery_images as string[]).slice(1, 5)
    : [];

  const mapMarkers =
    place?.latitude != null && place.longitude != null
      ? [{ id: `place-${place.id}`, title: place.name, lat: place.latitude, lng: place.longitude,
           type: place.type === "viewpoint" ? "viewpoint" : "heritage",
           url: `/heritage/${place.slug}`, area: place.area || undefined, summary: place.summary || undefined }]
      : [];

  const displayedWalks = walks.length ? walks : relatedWalks;

  const diffClass = DIFFICULTY_COLOUR[(place?.difficulty ?? "").toLowerCase()] ?? "bg-slate-100 text-slate-700";

  // ── loading / error ───────────────────────────────────────────────────────────

  if (loading && !place) {
    return (
      <div className="min-h-screen bg-white">
        <div className="h-[60vh] w-full animate-pulse bg-slate-200" />
        <div className="mx-auto max-w-7xl px-4 py-10 space-y-4">
          <div className="h-6 w-48 animate-pulse rounded-full bg-slate-200" />
          <div className="h-10 w-80 animate-pulse rounded-xl bg-slate-200" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-slate-500 mb-4">{error}</p>
        <button onClick={() => router.back()} className="inline-flex items-center gap-1 text-sm font-semibold text-[#D90429] hover:underline">
          <ArrowLeft className="h-4 w-4" /> Go back
        </button>
      </main>
    );
  }

  if (!place) return null;

  // ── render ────────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white min-h-screen">

      {/* ── CINEMATIC HERO ─────────────────────────────────────────────────────── */}
      <section className="relative h-[68vh] min-h-[480px] w-full overflow-hidden">
        {/* Background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImage}
          alt={place.name}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-transparent" />

        {/* Breadcrumb — top left */}
        <div className="absolute left-0 right-0 top-0 z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 pt-5 text-[11px] font-medium text-white/60">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/heritage" className="hover:text-white transition-colors">Heritage &amp; Walks</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/90">{place.name}</span>
          </div>
        </div>

        {/* Hero content — bottom */}
        <div className="absolute inset-x-0 bottom-0 z-10 mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
          {/* Type + tags */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {place.type && (
              <span className="rounded-full bg-[#D90429] px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white">
                {place.type}
              </span>
            )}
            {place.difficulty && (
              <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${diffClass}`}>
                {place.difficulty}
              </span>
            )}
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full bg-white/15 px-3 py-1 text-[11px] text-white/80 backdrop-blur-sm">
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="font-playfair text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            {place.name}
          </h1>

          {/* Summary */}
          {place.summary && (
            <p className="mt-3 max-w-2xl text-base text-white/75 leading-relaxed sm:text-lg">
              {place.summary}
            </p>
          )}

          {/* Meta pills row */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {place.area && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
                <MapPin className="h-3.5 w-3.5 text-[#D90429]" />
                {place.area}
              </span>
            )}
            {place.duration_mins && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
                <Clock className="h-3.5 w-3.5 text-white/60" />
                {formatDuration(place.duration_mins)}
              </span>
            )}
            {place.distance_km && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
                <Route className="h-3.5 w-3.5 text-white/60" />
                {formatDistance(place.distance_km)}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <SaveItemButton
              storageKey={SAVED_HERITAGE_KEY}
              item={{ id: String(place.id), title: place.name, href: `/heritage/${place.slug}`, image: heroImage || null, meta: place.area ?? null, savedAt: new Date().toISOString() }}
            />
            {place.external_url && (
              <a
                href={place.external_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-100 transition-colors"
              >
                Official info <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── GALLERY STRIP ──────────────────────────────────────────────────────── */}
      {galleryExtras.length > 0 && (
        <div className="bg-slate-950 px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
              {galleryExtras.map((img, i) => (
                <div key={i} className="relative h-24 w-40 flex-shrink-0 overflow-hidden rounded-xl sm:h-32 sm:w-52">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`${place.name} ${i + 2}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ───────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_340px]">

          {/* LEFT ── editorial content */}
          <div>

            {/* About — magazine-style prose */}
            {place.description && (
              <div className="mb-12">
                <span className="mb-5 block text-[10px] font-bold uppercase tracking-[0.25em] text-[#D90429]">About this place</span>
                <p className="text-xl font-light leading-[1.8] text-slate-700 whitespace-pre-line">
                  {place.description}
                </p>
              </div>
            )}

            {/* Best for — horizontal pill row */}
            {bestFor.length > 0 && (
              <div className="mb-12">
                <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Best for</span>
                <div className="flex flex-wrap gap-2">
                  {bestFor.map((item) => (
                    <span key={item} className="inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Local tip — full-width editorial callout */}
            {place.tips && (
              <div className="mb-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 p-px shadow-lg">
                <div className="rounded-[calc(1.5rem-1px)] bg-gradient-to-br from-amber-50 to-orange-50 px-7 py-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-0.5 h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center">
                      <Lightbulb className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700 mb-2">Local insider tip</p>
                      <p className="text-base leading-relaxed text-amber-900">{place.tips}</p>
                      {place.external_url && (
                        <a
                          href={place.external_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
                        >
                          Visit official website <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="mb-12 border-t border-slate-100" />

            {/* Linked walks */}
            <div>
              <div className="mb-8 flex items-end justify-between">
                <div>
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">
                    {walks.length > 0 ? "Linked walks" : relatedWalks.length > 0 ? "Walks nearby" : "Walks"}
                  </span>
                  <h2 className="font-playfair text-3xl font-bold text-slate-900">Routes from this spot</h2>
                </div>
                {displayedWalks.length > 0 && (
                  <span className="text-sm text-slate-400">{displayedWalks.length} route{displayedWalks.length !== 1 ? "s" : ""}</span>
                )}
              </div>

              {displayedWalks.length === 0 ? (
                <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-8 py-12 text-center">
                  <Mountain className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                  <p className="text-sm text-slate-500">No walk routes linked yet — this is still worth a visit as a standalone destination.</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {displayedWalks.map((walk) => {
                    const walkImg = walk.hero_image_url || WALK_IMAGE_FALLBACK;
                    return (
                      <Link
                        key={walk.id}
                        href={`/heritage/walks/${walk.slug}`}
                        className="group relative overflow-hidden rounded-3xl bg-slate-900 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
                      >
                        {/* Full-bleed image */}
                        <div className="relative h-52 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={walkImg} alt={walk.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-90" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/30 to-transparent" />
                          <span className="absolute left-3.5 top-3.5 rounded-full bg-[#D90429] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                            Walk
                          </span>
                          {walk.difficulty && (
                            <span className={`absolute right-3.5 top-3.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${DIFFICULTY_COLOUR[(walk.difficulty ?? "").toLowerCase()] ?? "bg-slate-100 text-slate-700"}`}>
                              {walk.difficulty}
                            </span>
                          )}
                        </div>
                        {/* Info overlaid at bottom */}
                        <div className="absolute inset-x-0 bottom-0 px-5 pb-5">
                          <h3 className="font-semibold text-white line-clamp-2 leading-snug">
                            {walk.name}
                          </h3>
                          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                            {walk.area && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-white/60">
                                <MapPin className="h-3 w-3" />{walk.area}
                              </span>
                            )}
                            {formatDuration(walk.duration_mins) && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-white/60">
                                <Clock className="h-3 w-3" />{formatDuration(walk.duration_mins)}
                              </span>
                            )}
                            {formatDistance(walk.distance_km) && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-white/60">
                                <Route className="h-3 w-3" />{formatDistance(walk.distance_km)}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
              {walks.length === 0 && relatedWalks.length > 0 && (
                <p className="mt-4 text-xs text-slate-400">Showing walks in the same area.</p>
              )}
            </div>
          </div>

          {/* RIGHT ── sticky sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">

            {/* Quick facts card */}
            {(place.area || place.difficulty || place.duration_mins || place.distance_km) && (
              <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl">
                <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">At a glance</p>
                <dl className="space-y-4">
                  {place.area && (
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-2 text-sm text-white/50"><MapPin className="h-4 w-4" /> Area</dt>
                      <dd className="text-sm font-semibold text-white">{place.area}</dd>
                    </div>
                  )}
                  {place.type && (
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-2 text-sm text-white/50"><Mountain className="h-4 w-4" /> Type</dt>
                      <dd className="text-sm font-semibold capitalize text-white">{place.type}</dd>
                    </div>
                  )}
                  {place.difficulty && (
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-2 text-sm text-white/50"><Mountain className="h-4 w-4" /> Difficulty</dt>
                      <dd><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${diffClass}`}>{place.difficulty}</span></dd>
                    </div>
                  )}
                  {place.duration_mins && (
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-2 text-sm text-white/50"><Clock className="h-4 w-4" /> Duration</dt>
                      <dd className="text-sm font-semibold text-white">{formatDuration(place.duration_mins)}</dd>
                    </div>
                  )}
                  {place.distance_km && (
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-2 text-sm text-white/50"><Route className="h-4 w-4" /> Distance</dt>
                      <dd className="text-sm font-semibold text-white">{formatDistance(place.distance_km)}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {/* Map */}
            {mapMarkers.length > 0 && (
              <div className="overflow-hidden rounded-3xl border border-slate-100 shadow-sm">
                <div className="h-56">
                  <HeritageMap markers={mapMarkers} heightClass="h-56" title={place.name} />
                </div>
                {place.latitude && place.longitude && (
                  <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-slate-100">
                    <span className="text-xs text-slate-400">
                      {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
                    </span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-[#D90429] hover:underline"
                    >
                      Google Maps <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Practical info */}
            {(place.parking_info || facilities.length > 0) && (
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Practical info</p>
                {place.parking_info && (
                  <div className="mb-5">
                    <div className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <ParkingCircle className="h-4 w-4 text-slate-400" /> Parking
                    </div>
                    <p className="text-sm leading-relaxed text-slate-500">{place.parking_info}</p>
                    {place.latitude && place.longitude && (
                      <a
                        href={`https://www.google.com/maps/search/car+park/@${place.latitude},${place.longitude},15z`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#D90429] hover:underline"
                      >
                        <MapPin className="h-3.5 w-3.5" /> Find nearby car parks
                      </a>
                    )}
                  </div>
                )}
                {facilities.length > 0 && (
                  <div>
                    <p className="mb-3 text-sm font-semibold text-slate-800">Facilities</p>
                    <ul className="space-y-2">
                      {facilities.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Back link */}
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Heritage &amp; Walks
            </button>
          </aside>
        </div>
      </div>

      {/* ── YOU MIGHT ALSO LIKE ─────────────────────────────────────────────────── */}
      {suggestedPlaces.length > 0 && (
        <section className="border-t border-slate-100 bg-slate-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.25em] text-[#D90429]">Discover more</span>
                <h2 className="font-playfair text-3xl font-bold text-slate-900">You might also like</h2>
              </div>
              <Link
                href="/heritage"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
              >
                View all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {suggestedPlaces.map((p) => {
                const img = p.hero_image_url || HERITAGE_IMAGE_FALLBACK;
                return (
                  <Link
                    key={p.id}
                    href={`/heritage/${p.slug}`}
                    className="group relative overflow-hidden rounded-3xl bg-slate-900 shadow-md aspect-[3/4] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={p.name}
                      className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-700 group-hover:scale-110 group-hover:opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent" />

                    {/* Type pill */}
                    {p.type && (
                      <span className="absolute left-3.5 top-3.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
                        {p.type}
                      </span>
                    )}

                    {/* Content */}
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <h3 className="font-playfair text-lg font-bold leading-snug text-white line-clamp-2">
                        {p.name}
                      </h3>
                      {p.area && (
                        <p className="mt-1.5 flex items-center gap-1 text-[11px] text-white/60">
                          <MapPin className="h-3 w-3" /> {p.area}
                        </p>
                      )}
                      {p.summary && (
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/50">
                          {p.summary}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
