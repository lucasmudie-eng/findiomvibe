// src/app/heritage/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MapPin, Mountain, Landmark, Sun, Compass, ChevronRight } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import HeritageMap from "./HeritageMap";
import SaveItemButton from "@/app/components/SaveItemButton";
import { HERITAGE_HERO_SLIDES } from "@/lib/images";

/* ── count-up hook ─────────────────────────────────────────────────────── */
function useCountUp(target: number, duration = 1400, active = false): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active || target === 0) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);
  return count;
}

/* ── parse PostgreSQL array literal strings ────────────────────────────── */
function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => (v == null ? "" : String(v).trim())).filter((v) => v.length > 0);
  if (typeof value === "string") {
    let s = value.trim();
    if (s.startsWith("{") && s.endsWith("}")) {
      s = s.slice(1, -1);
      return s.split(",").map((v) => v.trim().replace(/^"|"$/g, "").trim()).filter((v) => v.length > 0);
    }
    return s.split(",").map((v) => v.trim()).filter((v) => v.length > 0);
  }
  return [];
}

/* ── difficulty badge helper ───────────────────────────────────────────── */
function diffBadge(d: string | undefined): { label: string; cls: string } | null {
  if (!d) return null;
  if (d === "Easy") return { label: "Easy", cls: "bg-emerald-100 text-emerald-700" };
  if (d === "Moderate") return { label: "Moderate", cls: "bg-amber-100 text-amber-700" };
  if (d === "Hard") return { label: "Hard", cls: "bg-rose-100 text-rose-700" };
  return null;
}

/* ── types ─────────────────────────────────────────────────────────────── */
type DiscoverCategory = "walk" | "heritage" | "viewpoint";

type DiscoverPlace = {
  id: string;
  slug: string;
  name: string;
  category: DiscoverCategory;
  area: string;
  imageUrl: string;
  lat?: number;
  lng?: number;
  distanceKm?: number;
  durationMins?: number;
  difficulty?: "Easy" | "Moderate" | "Hard";
  era?: string;
  cost?: string;
  bestFor?: string;
};

type HeritagePlaceRow = {
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

type HeritageWalkRow = {
  id: number;
  slug: string;
  name: string;
  area: string | null;
  summary: string | null;
  description: string | null;
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


const SAVED_WALKS_KEY = "manxhive_saved_walks";
const SAVED_HERITAGE_KEY = "manxhive_saved_heritage";

type FilterKey = "all" | "walk" | "heritage" | "viewpoint";

/* ── hero carousel slides — edit src/lib/images.ts to update ───────────── */
const HERO_SLIDES = HERITAGE_HERO_SLIDES;

/* ── alternating masonry image heights ─────────────────────────────────── */
const IMG_HEIGHTS = ["h-[220px]", "h-[175px]", "h-[198px]"];

export default function HeritagePage() {
  const supabaseRef = useRef(supabaseBrowser());
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [places, setPlaces] = useState<HeritagePlaceRow[]>([]);
  const [walks, setWalks] = useState<HeritageWalkRow[]>([]);
  const [, setLoading] = useState(true);
  const [statsVisible, setStatsVisible] = useState(false);
  const [heroIdx, setHeroIdx] = useState(0);
  const filterSectionRef = useRef<HTMLDivElement | null>(null);

  /* stats reveal after hero settles */
  useEffect(() => {
    const t = setTimeout(() => setStatsVisible(true), 700);
    return () => clearTimeout(t);
  }, []);

  /* hero carousel auto-advance every 5 s */
  useEffect(() => {
    const id = setInterval(() => setHeroIdx((i) => (i + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(id);
  }, []);

  /* Supabase data fetch */
  useEffect(() => {
    const supabase = supabaseRef.current;
    if (!supabase) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);

        const { data: placeRows } = await supabase
          .from("heritage_places")
          .select(
            [
              "id",
              "slug",
              "name",
              "area",
              "summary",
              "description",
              "type",
              "difficulty",
              "duration_mins",
              "distance_km",
              "tags",
              "hero_image_url",
              "gallery_images",
              "parking_info",
              "facilities",
              "best_for",
              "tips",
              "external_url",
              "latitude",
              "longitude",
            ].join(", ")
          )
          .order("name", { ascending: true })
          .limit(200);

        const { data: walkRows } = await supabase
          .from("heritage_walks")
          .select(
            [
              "id",
              "slug",
              "name",
              "area",
              "summary",
              "description",
              "difficulty",
              "duration_mins",
              "distance_km",
              "tags",
              "hero_image_url",
              "gallery_images",
              "parking_info",
              "facilities",
              "best_for",
              "tips",
              "external_url",
              "latitude",
              "longitude",
            ].join(", ")
          )
          .order("name", { ascending: true })
          .limit(200);

        if (cancelled) return;
        setPlaces((placeRows as unknown as HeritagePlaceRow[]) || []);
        setWalks((walkRows as unknown as HeritageWalkRow[]) || []);
        setLoading(false);
      } catch (err) {
        console.error("[heritage] load error", err);
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ── computed data ─────────────────────────────────────────────────── */
  const allPlaces =
    places.length || walks.length
      ? [
          ...walks.map((w) => ({
            id: String(w.id),
            slug: w.slug,
            name: w.name,
            category: "walk" as const,
            area: w.area || "Isle of Man",
            imageUrl: w.hero_image_url || "",
            lat: w.latitude ?? undefined,
            lng: w.longitude ?? undefined,
            distanceKm:
              typeof w.distance_km === "number" ? w.distance_km : undefined,
            durationMins:
              typeof w.duration_mins === "number" ? w.duration_mins : undefined,
            difficulty: (w.difficulty as any) || undefined,
            bestFor: toStringArray(w.best_for)[0],
          })),
          ...places.map((p) => ({
            id: String(p.id),
            slug: p.slug,
            name: p.name,
            category:
              p.type === "viewpoint"
                ? ("viewpoint" as const)
                : ("heritage" as const),
            area: p.area || "Isle of Man",
            imageUrl: p.hero_image_url || "",
            lat: p.latitude ?? undefined,
            lng: p.longitude ?? undefined,
            distanceKm:
              typeof p.distance_km === "number" ? p.distance_km : undefined,
            durationMins:
              typeof p.duration_mins === "number" ? p.duration_mins : undefined,
            difficulty: (p.difficulty as any) || undefined,
            era: p.type === "heritage" ? p.summary ?? undefined : undefined,
            cost: p.tags?.includes("paid") ? "Entry fee" : undefined,
            bestFor: toStringArray(p.best_for)[0],
          })),
        ] as DiscoverPlace[]
      : [];

  const filteredPlaces = useMemo(
    () =>
      activeFilter === "all"
        ? allPlaces
        : allPlaces.filter((p) => p.category === activeFilter),
    [activeFilter, allPlaces]
  );

  const walkPlaces = allPlaces.filter((p) => p.category === "walk");
  const heritagePlaces = allPlaces.filter((p) => p.category === "heritage");
  const viewPlaces = allPlaces.filter((p) => p.category === "viewpoint");

  const mapMarkers = allPlaces
    .filter((p) => typeof p.lat === "number" && typeof p.lng === "number")
    .map((p) => ({
      id: p.id,
      title: p.name,
      type: p.category,
      lat: p.lat as number,
      lng: p.lng as number,
      url:
        p.category === "walk"
          ? `/heritage/walks/${p.slug}`
          : `/heritage/${p.slug}`,
      area: p.area,
      summary: p.bestFor,
      distanceKm: p.distanceKm,
      durationMins: p.durationMins,
    }));

  const handleFilterClick = (key: FilterKey) => {
    setActiveFilter(key);
    if (typeof window !== "undefined") {
      window.location.hash = "all-places";
    }
    filterSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  /* count-up values */
  const walkCount = useCountUp(walkPlaces.length, 1400, statsVisible);
  const heritageCount = useCountUp(heritagePlaces.length, 1400, statsVisible);
  const viewCount = useCountUp(viewPlaces.length, 1400, statsVisible);

  /* ── render ────────────────────────────────────────────────────────── */
  return (
    <div className="relative bg-white">

      {/* ── CINEMATIC HERO ─────────────────────────────────────────────── */}
      <section className="relative h-[500px] sm:h-[580px] lg:h-[650px] overflow-hidden">
        {/* Rotating background images — crossfade */}
        {HERO_SLIDES.map((slide, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={slide.image}
            src={slide.image}
            alt={slide.name}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              i === heroIdx ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        {/* Bottom-heavy dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />

        {/* Hero content */}
        <div className="relative h-full flex flex-col justify-between px-6 py-8 sm:px-10 lg:px-16 max-w-7xl mx-auto w-full">

          {/* Breadcrumb — top */}
          <nav className="flex items-center gap-1.5 text-xs text-white/60">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/90">Walks &amp; Heritage</span>
          </nav>

          {/* Headline — centre-bottom */}
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#E8002D]">
              Isle of Man
            </p>
            <h1 className="font-cormorant text-5xl sm:text-6xl lg:text-[5rem] font-bold text-white leading-[0.92] italic">
              Walks, Castles<br />&amp; Viewpoints.
            </h1>
            <p className="text-sm text-white/65 max-w-lg leading-relaxed">
              Browse curated walking routes, castles, museums and scenic viewpoints.
              Pick a place, see the key details, then head out and explore.
            </p>
            <div className="flex flex-wrap gap-3 text-xs">
              <button
                type="button"
                onClick={() => handleFilterClick("walk")}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#E8002D] px-5 py-2.5 font-semibold text-white shadow transition hover:bg-[#c00026]"
              >
                <Mountain className="h-3.5 w-3.5" />
                Browse walks
              </button>
              <button
                type="button"
                onClick={() => handleFilterClick("heritage")}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/30 px-5 py-2.5 font-semibold text-white backdrop-blur-sm transition hover:bg-white/25"
              >
                <Landmark className="h-3.5 w-3.5" />
                Heritage places
              </button>
            </div>
          </div>

          {/* Slide label + dot indicators */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] text-white/50 tracking-wide transition-opacity duration-500">
              <span className="text-white/80 font-medium">{HERO_SLIDES[heroIdx].name}</span>
              {" · "}{HERO_SLIDES[heroIdx].area}{" · "}{HERO_SLIDES[heroIdx].category}
            </p>
            <div className="flex items-center gap-1.5">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => setHeroIdx(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === heroIdx
                      ? "w-5 h-1.5 bg-[#E8002D]"
                      : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Stats strip — bottom */}
          <div className="grid grid-cols-3 gap-4 border-t border-white/20 pt-6">
            <div>
              <p className="font-cormorant text-4xl sm:text-5xl font-bold text-white leading-none">
                {walkCount}<span className="text-[#E8002D]">+</span>
              </p>
              <p className="mt-1 text-xs text-white/55 uppercase tracking-wide">Walking routes</p>
            </div>
            <div>
              <p className="font-cormorant text-4xl sm:text-5xl font-bold text-white leading-none">
                {heritageCount}<span className="text-[#E8002D]">+</span>
              </p>
              <p className="mt-1 text-xs text-white/55 uppercase tracking-wide">Heritage sites</p>
            </div>
            <div>
              <p className="font-cormorant text-4xl sm:text-5xl font-bold text-white leading-none">
                {viewCount}<span className="text-[#E8002D]">+</span>
              </p>
              <p className="mt-1 text-xs text-white/55 uppercase tracking-wide">Scenic viewpoints</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ───────────────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">

        {/* ── MAP SECTION ─────────────────────────────────────────── */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-playfair text-xl font-bold text-slate-900">
                Explore on the map
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tap a pin to see what&apos;s nearby, then jump into the full detail page.
              </p>
            </div>
            <p className="text-xs text-slate-400">{mapMarkers.length} pinned locations</p>
          </div>
          <HeritageMap
            markers={mapMarkers}
            title="Walks & heritage across the island"
          />
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[11px] text-slate-600 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                Walks
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-flex h-2 w-2 rounded-full bg-rose-500" />
                Heritage
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-flex h-2 w-2 rounded-full bg-sky-500" />
                Viewpoints
              </span>
            </div>
            <span className="text-[10px] text-slate-400 hidden sm:block">
              Interactive map loads when WebGL is available.
            </span>
          </div>
        </section>

        {/* ── CATEGORY STRIPES ────────────────────────────────────── */}
        <section className="mt-12 space-y-12">

          {/* Walks stripe — emerald identity */}
          <div className="border-l-[3px] border-emerald-500 pl-5 space-y-4">
            <div className="flex items-end justify-between gap-2">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                  <Mountain className="h-3.5 w-3.5" />
                  Coastal &amp; countryside walks
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Short loops, summit routes and glen walks.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleFilterClick("walk")}
                className="shrink-0 text-[11px] font-semibold text-[#E8002D] hover:underline"
              >
                View all walks →
              </button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {walkPlaces.slice(0, 8).map((place) => {
                const badge = diffBadge(place.difficulty);
                return (
                  <Link
                    key={place.id}
                    href={`/heritage/walks/${place.slug}`}
                    className="group w-52 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:border-emerald-200"
                  >
                    <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={place.imageUrl}
                        alt={place.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.06]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                      {/* Difficulty badge overlaid top-left */}
                      {badge && (
                        <span className={`absolute left-2.5 top-2.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.cls}`}>
                          {badge.label}
                        </span>
                      )}
                      {/* Meta at image bottom — hidden on mobile */}
                      <div className="absolute bottom-2 left-2.5 right-2.5 hidden sm:block">
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-white/90">
                          <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5">
                            <MapPin className="h-2.5 w-2.5" />
                            {place.area}
                          </span>
                          {typeof place.distanceKm === "number" && typeof place.durationMins === "number" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5">
                              {place.distanceKm.toFixed(1)} km · {Math.round(place.durationMins / 10) * 10} min
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="px-3 py-2.5">
                      <p className="font-cormorant text-base font-bold leading-snug text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                        {place.name}
                      </p>
                      {place.bestFor && (
                        <p className="mt-0.5 text-[11px] text-slate-400 line-clamp-1">{place.bestFor}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Heritage stripe — amber identity */}
          <div className="border-l-[3px] border-amber-500 pl-5 space-y-4">
            <div className="flex items-end justify-between gap-2">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                  <Landmark className="h-3.5 w-3.5" />
                  Heritage &amp; history
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Castles, museums and landmarks worth a half day.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleFilterClick("heritage")}
                className="shrink-0 text-[11px] font-semibold text-[#E8002D] hover:underline"
              >
                View all heritage →
              </button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {heritagePlaces.slice(0, 6).map((place) => (
                <Link
                  key={place.id}
                  href={`/heritage/${place.slug}`}
                  className="group w-60 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:border-amber-200"
                >
                  <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={place.imageUrl}
                      alt={place.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                    {/* Era badge overlaid top-left — hidden on mobile (summary text too long) */}
                    {place.era && (
                      <span className="absolute left-2.5 top-2.5 hidden sm:inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 max-w-[140px] truncate">
                        {place.era}
                      </span>
                    )}
                    {/* Area at image bottom — hidden on mobile */}
                    <div className="absolute bottom-2 left-2.5 right-2.5 hidden sm:block">
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-white/90">
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5">
                          <MapPin className="h-2.5 w-2.5" />
                          {place.area}
                        </span>
                        {place.cost && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5">
                            {place.cost}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="px-3 py-2.5">
                    <p className="font-cormorant text-base font-bold leading-snug text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-1">
                      {place.name}
                    </p>
                    {place.bestFor && (
                      <p className="mt-0.5 text-[11px] text-slate-400 line-clamp-1">{place.bestFor}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Viewpoints stripe — sky identity */}
          <div className="border-l-[3px] border-sky-500 pl-5 space-y-4">
            <div className="flex items-end justify-between gap-2">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-sky-700">
                  <Sun className="h-3.5 w-3.5" />
                  Sunset &amp; scenic viewpoints
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Easy wins for big views — ideal for golden hour drives.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleFilterClick("viewpoint")}
                className="shrink-0 text-[11px] font-semibold text-[#E8002D] hover:underline"
              >
                View all viewpoints →
              </button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {viewPlaces.slice(0, 6).map((place) => (
                <Link
                  key={place.id}
                  href={`/heritage/${place.slug}`}
                  className="group w-72 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:border-sky-200"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={place.imageUrl}
                      alt={place.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    {/* Area badge top-left */}
                    <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-800">
                      <MapPin className="h-2.5 w-2.5" />
                      {place.area}
                    </span>
                    {/* "Best for" full-width bar at image bottom */}
                    {place.bestFor && (
                      <div className="absolute inset-x-0 bottom-0 bg-black/55 px-3 py-1.5">
                        <p className="text-[10px] font-medium text-white/90 truncate">
                          Best for: {place.bestFor}
                        </p>
                      </div>
                    )}
                    {/* SaveItemButton */}
                    <div
                      className="absolute right-2 top-2"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <SaveItemButton
                        storageKey={
                          place.category === "walk"
                            ? SAVED_WALKS_KEY
                            : SAVED_HERITAGE_KEY
                        }
                        compact
                        item={{
                          id: String(place.id),
                          title: place.name,
                          href:
                            place.category === "walk"
                              ? `/heritage/walks/${place.slug}`
                              : `/heritage/${place.slug}`,
                          image: place.imageUrl,
                          meta: place.area,
                          savedAt: new Date().toISOString(),
                        }}
                      />
                    </div>
                  </div>
                  <div className="px-3 py-2.5">
                    <p className="font-cormorant text-base font-bold leading-snug text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-1">
                      {place.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── MASONRY + STICKY FILTER BAR ─────────────────────────── */}
        <section
          ref={filterSectionRef}
          id="all-places"
          className="mt-14"
        >
          {/* Sticky filter bar */}
          <div className="sticky top-20 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 bg-white/95 backdrop-blur-sm border-b border-slate-100 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3 max-w-7xl mx-auto">
              <div>
                <h2 className="font-playfair text-2xl font-bold text-slate-900">
                  All walks &amp; heritage places
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {filteredPlaces.length} {activeFilter === "all" ? "places" : activeFilter + "s"} · click a card to explore
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {(
                  [
                    { key: "all" as FilterKey, label: "All" },
                    { key: "walk" as FilterKey, label: "Walks" },
                    { key: "heritage" as FilterKey, label: "Heritage" },
                    { key: "viewpoint" as FilterKey, label: "Viewpoints" },
                  ] as const
                ).map((f) => {
                  const isActive = activeFilter === f.key;
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => handleFilterClick(f.key)}
                      className={`inline-flex items-center rounded-full border px-3.5 py-1.5 font-semibold transition ${
                        isActive
                          ? "border-[#E8002D] bg-[#E8002D] text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Masonry grid */}
          <div className="masonry pt-8">
            {filteredPlaces.map((place, idx) => {
              const imgH = IMG_HEIGHTS[idx % 3];
              const href =
                place.category === "walk"
                  ? `/heritage/walks/${place.slug}`
                  : `/heritage/${place.slug}`;

              const catBadge =
                place.category === "walk"
                  ? { label: "Walk", cls: "bg-emerald-100 text-emerald-700" }
                  : place.category === "heritage"
                  ? { label: "Heritage", cls: "bg-amber-100 text-amber-800" }
                  : { label: "Viewpoint", cls: "bg-sky-100 text-sky-700" };

              return (
                <Link
                  key={place.id}
                  href={href}
                  className="masonry-item group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:border-[#E8002D]/30 hover:-translate-y-0.5"
                >
                  {/* Red left-border hover accent */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 w-[3px] rounded-l-2xl bg-[#E8002D] origin-center scale-y-0 transition-transform duration-300 group-hover:scale-y-100 z-10"
                  />

                  {/* Image */}
                  <div className={`relative ${imgH} w-full overflow-hidden bg-slate-100`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={place.imageUrl}
                      alt={place.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    {/* Category + area badges */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex flex-wrap items-center gap-1.5">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${catBadge.cls}`}>
                        {catBadge.label}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-[10px] text-white">
                        <MapPin className="h-2.5 w-2.5" />
                        {place.area}
                      </span>
                    </div>

                    {/* SaveItemButton */}
                    <div
                      className="absolute right-3 top-3"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <SaveItemButton
                        storageKey={
                          place.category === "walk"
                            ? SAVED_WALKS_KEY
                            : SAVED_HERITAGE_KEY
                        }
                        compact
                        item={{
                          id: String(place.id),
                          title: place.name,
                          href,
                          image: place.imageUrl,
                          meta: place.area,
                          savedAt: new Date().toISOString(),
                        }}
                      />
                    </div>
                  </div>

                  {/* Card text */}
                  <div className="px-4 py-3 space-y-1.5">
                    <h3 className="font-cormorant text-lg font-bold leading-snug text-slate-900 group-hover:text-[#E8002D] transition-colors">
                      {place.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {place.category === "walk" &&
                        (place.distanceKm || place.durationMins || place.difficulty) && (
                          <>
                            {typeof place.distanceKm === "number" &&
                              `${place.distanceKm.toFixed(1)} km`}
                            {typeof place.durationMins === "number" &&
                              ` · ${Math.round(place.durationMins / 10) * 10} mins`}
                            {place.difficulty && ` · ${place.difficulty}`}
                          </>
                        )}
                      {place.category === "heritage" && (
                        <>
                          {place.era && place.era}
                          {place.cost && (place.era ? ` · ${place.cost}` : place.cost)}
                        </>
                      )}
                      {place.category === "viewpoint" && place.bestFor && place.bestFor}
                    </p>
                    <p className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E8002D] transition-transform duration-200 group-hover:translate-x-1">
                      View details →
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── INFO BANNER ─────────────────────────────────────────── */}
        <section className="mt-10 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-[11px] text-slate-500">
          <Compass className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
          <p>
            Data is sourced from{" "}
            <code className="rounded bg-slate-200 px-1 py-0.5 text-[10px]">heritage_walks</code>,{" "}
            <code className="rounded bg-slate-200 px-1 py-0.5 text-[10px]">heritage_places</code> and{" "}
            <code className="rounded bg-slate-200 px-1 py-0.5 text-[10px]">heritage_site_walks</code>.
            As we add more records, this page will update automatically with live data.
          </p>
        </section>
      </main>

      {/* ── MASONRY CSS ─────────────────────────────────────────────── */}
      <style jsx>{`
        .masonry {
          column-count: 1;
          column-gap: 1.5rem;
        }
        @media (min-width: 640px) {
          .masonry {
            column-count: 2;
          }
        }
        @media (min-width: 1024px) {
          .masonry {
            column-count: 3;
          }
        }
        .masonry-item {
          break-inside: avoid;
          margin-bottom: 1.5rem;
          display: block;
        }
      `}</style>
    </div>
  );
}
