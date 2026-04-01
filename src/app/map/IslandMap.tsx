"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

type MarkerType = "events" | "deals" | "businesses" | "heritage" | "walks";

type BaseMarker = {
  id: string;
  title: string;
  type: MarkerType;
  lat: number;
  lng: number;
  meta?: string | null;
  url?: string;
};

const DEFAULT_CENTER: [number, number] = [-4.5481, 54.2361];
const GEOCODE_BBOX = "-4.84,54.00,-4.30,54.42";

const TYPE_LABELS: Record<MarkerType, string> = {
  events: "Events",
  deals: "Deals",
  businesses: "Businesses",
  heritage: "Heritage",
  walks: "Walks",
};

const TYPE_COLORS: Record<MarkerType, string> = {
  events: "#D90429",
  deals: "#F97316",
  businesses: "#0EA5E9",
  heritage: "#9333EA",
  walks: "#16A34A",
};

function normalizeLocation(value: string) {
  return value.trim().toLowerCase();
}

function cacheKey(type: MarkerType) {
  return `manxhive_map_geocodes_${type}_v1`;
}

function loadCache(type: MarkerType): Record<string, { lat: number; lng: number }> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(cacheKey(type));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, { lat: number; lng: number }>;
  } catch {
    return {};
  }
}

function saveCache(type: MarkerType, cache: Record<string, { lat: number; lng: number }>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(cacheKey(type), JSON.stringify(cache));
}

async function geocodeLocation(token: string, location: string) {
  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      location
    )}.json`
  );
  url.searchParams.set("access_token", token);
  url.searchParams.set("limit", "1");
  url.searchParams.set("types", "place,locality,address,poi");
  url.searchParams.set("bbox", GEOCODE_BBOX);
  url.searchParams.set("proximity", "-4.481,54.150");

  const res = await fetch(url.toString());
  if (!res.ok) return null;
  const data = await res.json();
  const coords = data?.features?.[0]?.center;
  if (!Array.isArray(coords) || coords.length < 2) return null;
  return { lng: Number(coords[0]), lat: Number(coords[1]) };
}

export default function IslandMap() {
  const supabaseRef = useRef(supabaseBrowser());
  const [markers, setMarkers] = useState<BaseMarker[]>([]);
  const [activeTypes, setActiveTypes] = useState<MarkerType[]>([
    "events",
    "deals",
    "businesses",
    "heritage",
    "walks",
  ]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const mapRef = useRef<any>(null);
  const mapboxRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markerRefs = useRef<any[]>([]);
  const activePopupRef = useRef<any>(null);

  const filteredMarkers = useMemo(
    () => markers.filter((m) => activeTypes.includes(m.type)),
    [markers, activeTypes]
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    let mounted = true;

    const init = async () => {
      try {
        const mapboxgl = (await import("mapbox-gl")).default;
        mapboxgl.accessToken = token;
        if (!mapboxgl.supported()) {
          if (mounted) setHasError(true);
          return;
        }

        const map = new mapboxgl.Map({
          container: containerRef.current as HTMLElement,
          style: "mapbox://styles/mapbox/light-v11",
          center: DEFAULT_CENTER,
          zoom: 9,
        });

        map.on("load", () => mounted && setIsReady(true));
        map.on("idle", () => mounted && setIsReady(true));
        map.on("error", (event: any) => {
          if (event?.error) console.error("[mapbox] error", event.error);
          if (mounted) setHasError(true);
        });

        map.on("movestart", () => {
          if (activePopupRef.current) {
            activePopupRef.current.remove();
            activePopupRef.current = null;
          }
        });

        mapRef.current = map;
        mapboxRef.current = mapboxgl;
      } catch (err) {
        console.error("[mapbox] init error", err);
        if (mounted) setHasError(true);
      }
    };

    init();
    return () => {
      mounted = false;
      markerRefs.current.forEach((marker) => marker.remove());
      markerRefs.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      mapboxRef.current = null;
    };
  }, []);

  useEffect(() => {
    const supabase = supabaseRef.current;
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    let cancelled = false;
    setLoading(true);

    const load = async () => {
      try {
        const [eventsRes, dealsRes, businessesRes, heritageRes, walksRes] =
          await Promise.all([
            supabase
              .from("events")
              .select("id, title, location, area, starts_at, summary")
              .eq("approved", true)
              .order("starts_at", { ascending: true })
              .limit(120),
            supabase
              .from("deals")
              .select("id, title, area, business_name, discount_label")
              .eq("approved", true)
              .order("created_at", { ascending: false })
              .limit(120),
            supabase
              .from("businesses")
              .select("id, name, area, category, slug")
              .eq("approved", true)
              .order("name", { ascending: true })
              .limit(200),
            supabase
              .from("heritage_places")
              .select("id, name, area, slug, latitude, longitude")
              .limit(200),
            supabase
              .from("heritage_walks")
              .select("id, name, area, slug, latitude, longitude")
              .limit(200),
          ]);

        if (cancelled) return;

        const next: BaseMarker[] = [];

        // Heritage (lat/lng available)
        heritageRes.data?.forEach((row: any) => {
          if (typeof row.latitude !== "number" || typeof row.longitude !== "number") return;
          next.push({
            id: `heritage-${row.id}`,
            title: row.name,
            type: "heritage",
            lat: row.latitude,
            lng: row.longitude,
            meta: row.area,
            url: `/heritage/${row.slug || row.id}`,
          });
        });

        // Walks
        walksRes.data?.forEach((row: any) => {
          if (typeof row.latitude !== "number" || typeof row.longitude !== "number") return;
          next.push({
            id: `walk-${row.id}`,
            title: row.name,
            type: "walks",
            lat: row.latitude,
            lng: row.longitude,
            meta: row.area,
            url: `/heritage/walks/${row.slug || row.id}`,
          });
        });

        // Events, Deals, Businesses (geocode)
        const geocodeGroups: Array<{
          type: MarkerType;
          items: any[];
          label: (row: any) => string;
          title: (row: any) => string;
          meta: (row: any) => string | null;
          url: (row: any) => string;
        }> = [
          {
            type: "events",
            items: eventsRes.data ?? [],
            label: (row) =>
              `${row.location || row.area || "Isle of Man"}, Isle of Man`,
            title: (row) => row.title,
            meta: (row) => row.location || row.area || null,
            url: (row) => `/whats-on/${row.id}`,
          },
          {
            type: "deals",
            items: dealsRes.data ?? [],
            label: (row) =>
              `${row.business_name || row.area || "Isle of Man"}, Isle of Man`,
            title: (row) => row.title,
            meta: (row) => row.discount_label || row.area || null,
            url: (row) => `/deals/${row.id}`,
          },
          {
            type: "businesses",
            items: businessesRes.data ?? [],
            label: (row) => `${row.name}, ${row.area || "Isle of Man"}`,
            title: (row) => row.name,
            meta: (row) => row.category || row.area || null,
            url: (row) => `/businesses/${row.slug || row.id}`,
          },
        ];

        for (const group of geocodeGroups) {
          const cache = loadCache(group.type);
          let cacheDirty = false;
          for (const row of group.items) {
            const label = group.label(row);
            if (!label) continue;
            const key = normalizeLocation(label);
            const cached = cache[key];
            let coords = cached;
            if (!coords) {
              coords = await geocodeLocation(token, label);
              if (coords) {
                cache[key] = coords;
                cacheDirty = true;
              }
            }
            if (coords) {
              next.push({
                id: `${group.type}-${row.id}`,
                title: group.title(row),
                type: group.type,
                lat: coords.lat,
                lng: coords.lng,
                meta: group.meta(row),
                url: group.url(row),
              });
            }
          }
          if (cacheDirty) saveCache(group.type, cache);
        }

        if (!cancelled) {
          setMarkers(next);
          setLoading(false);
        }
      } catch (err) {
        console.error("[island-map] load error", err);
        if (!cancelled) {
          setHasError(true);
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const mapboxgl = mapboxRef.current;
    if (!map || !mapboxgl) return;

    markerRefs.current.forEach((marker) => marker.remove());
    markerRefs.current = [];

    const bounds = new mapboxgl.LngLatBounds();
    let hasBounds = false;

    filteredMarkers.forEach((marker) => {
      const el = document.createElement("div");
      el.className = "h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm";
      el.style.backgroundColor = TYPE_COLORS[marker.type];

      const popupHtml = `
        <div style="min-width:180px;font-family:ui-sans-serif,system-ui,-apple-system;line-height:1.35;">
          <div style="font-weight:600;font-size:13px;color:#0f172a;">${marker.title}</div>
          ${
            marker.meta
              ? `<div style="font-size:11px;color:#475569;margin-top:6px;">${marker.meta}</div>`
              : ""
          }
          <div style="font-size:11px;color:#64748b;margin-top:6px;">${TYPE_LABELS[marker.type]}</div>
        </div>
      `;

      const popup = new mapboxgl.Popup({
        offset: 12,
        closeButton: false,
        closeOnClick: false,
      }).setHTML(popupHtml);

      const mapMarker = new mapboxgl.Marker({ element: el })
        .setLngLat([marker.lng, marker.lat])
        .addTo(map);

      const showPopup = () => {
        if (activePopupRef.current && activePopupRef.current !== popup) {
          activePopupRef.current.remove();
        }
        popup.setLngLat([marker.lng, marker.lat]).addTo(map);
        const popupEl = popup.getElement();
        if (popupEl) {
          popupEl.style.pointerEvents = "none";
        }
        activePopupRef.current = popup;
      };

      const hidePopup = () => {
        if (activePopupRef.current === popup) {
          popup.remove();
          activePopupRef.current = null;
        }
      };

      el.addEventListener("mouseenter", showPopup);
      el.addEventListener("mouseleave", hidePopup);
      el.addEventListener("pointerenter", showPopup);
      el.addEventListener("pointerleave", hidePopup);
      if (marker.url) {
        el.addEventListener("click", () => {
          window.location.href = marker.url as string;
        });
        el.style.cursor = "pointer";
      }

      markerRefs.current.push(mapMarker);
      bounds.extend([marker.lng, marker.lat]);
      hasBounds = true;
    });

    if (hasBounds) {
      map.fitBounds(bounds, { padding: 60, maxZoom: 12 });
    }
  }, [filteredMarkers]);

  const toggleType = (type: MarkerType) => {
    setActiveTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Explore the island map
          </h2>
          <p className="text-xs text-slate-500">
            Filter events, deals, businesses, heritage and walks in one view.
          </p>
        </div>
        <div className="text-[10px] text-slate-500">
          {filteredMarkers.length} pins shown
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        {(Object.keys(TYPE_LABELS) as MarkerType[]).map((type) => (
          <button
            key={type}
            onClick={() => toggleType(type)}
            className={`rounded-full px-3 py-1 font-semibold transition ${
              activeTypes.includes(type)
                ? "bg-slate-900 text-white"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            {TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      <div className="relative h-[320px] w-full overflow-hidden rounded-2xl border border-slate-200">
        {!token ? (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
            Add NEXT_PUBLIC_MAPBOX_TOKEN to view the map.
          </div>
        ) : hasError ? (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
            Map unavailable — check WebGL or Mapbox settings.
          </div>
        ) : (
          <>
            {!isReady && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 text-xs text-slate-500">
                {loading ? "Loading map data..." : "Loading map..."}
              </div>
            )}
            <div ref={containerRef} className="h-full w-full" />
          </>
        )}
      </div>
    </section>
  );
}
