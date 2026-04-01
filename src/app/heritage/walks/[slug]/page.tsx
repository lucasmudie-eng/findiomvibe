// src/app/heritage/walks/[slug]/page.tsx
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
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import HeritageMap from "@/app/heritage/HeritageMap";
import SaveItemButton from "@/app/components/SaveItemButton";
import { WALK_IMAGE_FALLBACK, HERITAGE_IMAGE_FALLBACK, walkImageUrl } from "@/lib/images";

type Walk = {
  id: number;
  slug: string;
  name: string;
  area: string | null;
  summary: string | null;
  difficulty: string | null;
  duration_mins: number | null;
  distance_km: number | null;
  hero_image_url: string | null;

  // optional / content fields
  description?: string | null;
  tags?: string[] | null;
  gallery_images?: string[] | null;
  parking_info?: string | null;
  facilities?: string[] | null;
  best_for?: string[] | null;
  tips?: string | null;
  external_url?: string | null;

  // map coords
  latitude?: number | null;
  longitude?: number | null;
};

type HeritagePlacePreview = {
  id: number;
  slug: string;
  name: string;
  area: string | null;
  type: string | null;
  hero_image_url: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

type WalkPageProps = {
  params: { slug: string };
};

const SAVED_WALKS_KEY = "manxhive_saved_walks";

export default function HeritageWalkPage({ params }: WalkPageProps) {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [walk, setWalk] = useState<Walk | null>(null);
  const [places, setPlaces] = useState<HeritagePlacePreview[]>([]);
  const [relatedPlaces, setRelatedPlaces] = useState<HeritagePlacePreview[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---- safe array helper ----
  function toStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value
        .map((v) => (v == null ? "" : String(v).trim()))
        .filter((v) => v.length > 0);
    }
    if (typeof value === "string") {
      return value
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
    }
    return [];
  }

  useEffect(() => {
    if (!supabase || !params.slug) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        // 1) Load the walk by slug
        const { data: walkData, error: walkError } = await supabase
          .from("heritage_walks")
          .select(
            [
              "id",
              "slug",
              "name",
              "area",
              "summary",
              "difficulty",
              "duration_mins",
              "distance_km",
              "hero_image_url",
              "description",
              "tags",
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
          .eq("slug", params.slug)
          .single();

        if (walkError) {
          console.error("[heritage] load walk error", walkError);
          if (!cancelled) {
            setError("Could not load this walk.");
            setLoading(false);
          }
          return;
        }

        if (!walkData) {
          if (!cancelled) {
            setError("This walk could not be found.");
            setLoading(false);
          }
          return;
        }

        if (cancelled) return;

        const typedWalk = walkData as unknown as Walk;
        setWalk(typedWalk);

        // 2) Load linked heritage places via the link table
        const { data: linkRows, error: linkError } = await supabase
          .from("heritage_site_walks")
          .select("heritage_id, order_index")
          .eq("walk_id", typedWalk.id)
          .order("order_index", { ascending: true });

        if (linkError) {
          console.error("[heritage] load walk->place links error", linkError);
          if (!cancelled) {
            setPlaces([]);
            setLoading(false);
          }
          return;
        }

        const heritageIds =
          linkRows && linkRows.length
            ? (linkRows.map((r: any) => r.heritage_id) as number[])
            : [];

        if (!heritageIds.length) {
          if (!cancelled) {
            setPlaces([]);
          }

          if (typedWalk.area) {
            const { data: nearbyPlaces } = await supabase
              .from("heritage_places")
              .select(
                [
                  "id",
                  "slug",
                  "name",
                  "area",
                  "type",
                  "hero_image_url",
                  "latitude",
                  "longitude",
                ].join(", ")
              )
              .eq("area", typedWalk.area)
              .limit(4);

            if (!cancelled && nearbyPlaces && nearbyPlaces.length) {
              setRelatedPlaces(nearbyPlaces as unknown as HeritagePlacePreview[]);
            }
          }

          if (!cancelled) {
            setLoading(false);
          }
          return;
        }

        const { data: placeRows, error: placeError } = await supabase
          .from("heritage_places")
          .select(
            [
              "id",
              "slug",
              "name",
              "area",
              "type",
              "hero_image_url",
              "latitude",
              "longitude",
            ].join(", ")
          )
          .in("id", heritageIds);

        if (placeError) {
          console.error("[heritage] load linked places error", placeError);
          if (!cancelled) {
            setPlaces([]);
            setLoading(false);
          }
          return;
        }

        if (!cancelled) {
          const placeById = new Map<number, HeritagePlacePreview>();
          (placeRows || []).forEach((p: any) => {
            placeById.set(p.id, p as HeritagePlacePreview);
          });

          const orderedPlaces: HeritagePlacePreview[] = heritageIds
            .map((id) => placeById.get(id))
            .filter(Boolean) as HeritagePlacePreview[];

          setPlaces(orderedPlaces);
          setLoading(false);
        }
      } catch (err) {
        console.error("[heritage] unexpected walk page error", err);
        if (!cancelled) {
          setError("Something went wrong loading this walk.");
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [supabase, params.slug]);

  // derived arrays (they’ll just be empty for now, which is fine)
  const tags = toStringArray(walk?.tags);
  const facilities = toStringArray(walk?.facilities);
  const bestFor = toStringArray(walk?.best_for);

  const heroImage =
    walk?.hero_image_url ||
    (walk?.slug ? walkImageUrl(walk.slug) : null) ||
    WALK_IMAGE_FALLBACK;

  const mapMarkers =
    walk?.latitude != null && walk.longitude != null
      ? [
          {
            id: `walk-${walk.id}`,
            title: walk.name,
            lat: walk.latitude,
            lng: walk.longitude,
            type: "walk",
            url: `/heritage/walks/${walk.slug}`,
            area: walk.area || undefined,
            summary: walk.summary || undefined,
            distanceKm:
              typeof walk.distance_km === "number" ? walk.distance_km : undefined,
            durationMins:
              typeof walk.duration_mins === "number" ? walk.duration_mins : undefined,
          },
        ]
      : [];

  const nearbyPlaces = [...places, ...relatedPlaces].filter(
    (place) =>
      typeof place.latitude === "number" &&
      typeof place.longitude === "number" &&
      !Number.isNaN(place.latitude) &&
      !Number.isNaN(place.longitude)
  );

  // ---- UI helpers ----
  function formatDistance(km: number | null | undefined) {
    if (!km) return null;
    return `${km.toFixed(1)} km`;
  }

  function formatDuration(mins: number | null | undefined) {
    if (!mins) return null;
    if (mins < 60) return `${mins} mins`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${h} hr ${m} mins` : `${h} hr`;
  }

  // ---- Render states ----
  if (loading && !walk) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="h-10 w-40 animate-pulse rounded-xl bg-slate-200" />
        <div className="mt-4 h-8 w-64 animate-pulse rounded-xl bg-slate-200" />
        <div className="mt-8 h-64 w-full animate-pulse rounded-3xl bg-slate-100" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 space-y-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-3 w-3" />
          Back
        </button>
        <p className="text-sm text-red-600">{error}</p>
      </main>
    );
  }

  if (!walk) return null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        /{" "}
        <Link href="/heritage" className="hover:underline">
          Heritage &amp; walks
        </Link>{" "}
        / <span className="text-slate-900">{walk.name}</span>
      </nav>

      {/* Hero */}
      <section className="grid gap-6 rounded-3xl bg-slate-900 px-6 py-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.62)] md:grid-cols-[minmax(0,1.5fr),minmax(0,1.2fr)]">
        <div className="flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <div className="inline-flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wide">
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px]">
                Isle of Man heritage &amp; walks
              </span>
              <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px]">
                Walk route
              </span>
            </div>

            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              {walk.name}
            </h1>

            {walk.summary && (
              <p className="max-w-xl text-sm text-slate-200">
                {walk.summary}
              </p>
            )}

            <div className="flex flex-wrap gap-3 text-xs text-slate-100">
              {walk.area && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1">
                  <MapPin className="h-3 w-3" />
                  {walk.area}
                </span>
              )}
              {walk.difficulty && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1">
                  <Mountain className="h-3 w-3" />
                  {walk.difficulty}
                </span>
              )}
              {walk.duration_mins && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(walk.duration_mins)}
                </span>
              )}
              {walk.distance_km && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1">
                  <Route className="h-3 w-3" />
                  {formatDistance(walk.distance_km)}
                </span>
              )}
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-100/90">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/5 px-2.5 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="pt-3">
              <SaveItemButton
                storageKey={SAVED_WALKS_KEY}
                item={{
                  id: String(walk.id),
                  title: walk.name,
                  href: `/heritage/walks/${walk.slug}`,
                  image: heroImage || null,
                  meta: walk.area ?? null,
                  savedAt: new Date().toISOString(),
                }}
              />
            </div>
          </div>

          {walk.external_url && (
            <div className="pt-2">
              <a
                href={walk.external_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900 shadow-sm hover:bg-slate-100"
              >
                View route on map
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>

        {/* Hero image + mini gallery */}
        <div className="flex flex-col gap-3">
          <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-slate-800 sm:h-56">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImage}
              alt={walk.name}
              className="h-full w-full object-cover"
            />
          </div>
          {walk.gallery_images && walk.gallery_images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {walk.gallery_images.slice(0, 3).map((img, idx) => (
                <div
                  key={`${img}-${idx}`}
                  className="relative h-16 w-full overflow-hidden rounded-xl bg-slate-800"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`${walk.name} ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Main content grid */}
      <section className="grid gap-6 md:grid-cols-[minmax(0,1.8fr),minmax(0,1.2fr)]">
        {/* Left – overview + linked places */}
        <div className="space-y-6">
          {/* Overview */}
          <article className="rounded-3xl border border-slate-100 bg-white px-6 py-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              Route overview
            </h2>
            {(walk.description || walk.summary) && (
              <p className="mt-2 whitespace-pre-line text-sm text-slate-700">
                {walk.description || walk.summary}
              </p>
            )}

            {bestFor.length > 0 && (
              <div className="mt-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Best for
                </p>
                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                  {bestFor.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-slate-50 px-3 py-1 text-slate-800"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {walk.tips && (
              <div className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-xs text-amber-900">
                <p className="text-[11px] font-semibold uppercase tracking-wide">
                  Local tip
                </p>
                <p className="mt-1">{walk.tips}</p>
              </div>
            )}
          </article>

          {/* Linked heritage places */}
          <section className="rounded-3xl border border-slate-100 bg-white px-6 py-5 shadow-sm">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Heritage places on this route
                </h2>
                <p className="mt-1 text-xs text-slate-600">
                  Stops and viewpoints that feature along this walk.
                </p>
              </div>
            </div>

            {places.length === 0 && relatedPlaces.length === 0 ? (
              <p className="text-xs text-slate-500">
                No specific heritage stops linked yet. You can still enjoy this
                route as a standalone walk.
              </p>
            ) : (
              <ul className="mt-2 space-y-3 text-sm">
                {(places.length > 0 ? places : relatedPlaces).map((place) => (
                  <li key={place.id}>
                    <Link
                      href={`/heritage/${place.slug}`}
                      className="group flex gap-3 rounded-2xl border border-slate-100 px-3 py-3 transition hover:border-[#D90429]/40 hover:bg-slate-50"
                    >
                      <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={place.hero_image_url || HERITAGE_IMAGE_FALLBACK}
                          alt={place.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-slate-900 group-hover:text-[#D90429]">
                            {place.name}
                          </p>
                          <span className="text-[11px] text-slate-500">
                            View place →
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
                          {place.area && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5">
                              <MapPin className="h-3 w-3" />
                              {place.area}
                            </span>
                          )}
                          {place.type && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5">
                              {place.type}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {places.length === 0 && relatedPlaces.length > 0 && (
              <p className="mt-3 text-[11px] text-slate-500">
                Showing nearby heritage places in the same area.
              </p>
            )}
          </section>
        </div>

        {/* Right – practical info + map */}
        <aside className="space-y-4">
          <section className="rounded-3xl border border-slate-100 bg-white px-6 py-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              Practical info
            </h2>
            {walk.parking_info && (
              <div className="mt-2 text-xs text-slate-700">
                <p className="font-semibold text-slate-800">Parking</p>
                <p className="mt-1">{walk.parking_info}</p>
              </div>
            )}
            {facilities.length > 0 && (
              <div className="mt-3 text-xs text-slate-700">
                <p className="font-semibold text-slate-800">Facilities</p>
                <ul className="mt-1 list-inside list-disc space-y-0.5">
                  {facilities.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-slate-100 bg-slate-50 px-6 py-5 text-xs text-slate-700 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Map view
            </p>

            {mapMarkers.length > 0 ? (
              <div className="mt-3 h-56 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <HeritageMap
                  markers={mapMarkers}
                  heightClass="h-56"
                  title={walk.name}
                />
              </div>
            ) : (
              <>
                <p className="mt-1">
                  Add coordinates to this walk to show it on the map.
                </p>
                <div className="mt-3 h-32 rounded-2xl border border-dashed border-slate-200 bg-white" />
              </>
            )}
          </section>

          {nearbyPlaces.length > 0 && (
            <section className="rounded-3xl border border-slate-100 bg-white px-6 py-5 text-xs text-slate-700 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">
                Nearby heritage stops
              </h3>
              <p className="mt-1 text-[11px] text-slate-500">
                Spots linked to this area.
              </p>
              <ul className="mt-3 space-y-2">
                {nearbyPlaces.slice(0, 4).map((place) => (
                  <li key={place.id}>
                    <Link
                      href={`/heritage/${place.slug}`}
                      className="flex items-center justify-between rounded-2xl border border-slate-100 px-3 py-2 transition hover:border-[#D90429]/40 hover:bg-slate-50"
                    >
                      <span className="font-semibold text-slate-800">
                        {place.name}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        View →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </section>
    </main>
  );
}
