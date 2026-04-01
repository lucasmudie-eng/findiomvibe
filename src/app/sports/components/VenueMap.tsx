"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type FixtureMapItem = {
  id: string;
  venue: string;
  title: string;
  when?: string;
  url?: string;
};

type MapMarker = FixtureMapItem & {
  lat: number;
  lng: number;
};

const DEFAULT_CENTER: [number, number] = [-4.5481, 54.2361];
const GEOCODE_BBOX = "-4.84,54.00,-4.30,54.42";
const GEOCODE_CACHE_KEY = "manxhive_sports_venue_geocodes_v1";

function normalizeLocation(value: string) {
  return value.trim().toLowerCase();
}

function loadCache(): Record<string, { lat: number; lng: number }> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(GEOCODE_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, { lat: number; lng: number }>;
  } catch {
    return {};
  }
}

function saveCache(cache: Record<string, { lat: number; lng: number }>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore write failures
  }
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

export default function VenueMap({
  fixtures,
  heightClass = "h-[240px] md:h-[320px]",
}: {
  fixtures: FixtureMapItem[];
  heightClass?: string;
}) {
  const mapRef = useRef<any>(null);
  const mapboxRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markerRefs = useRef<any[]>([]);
  const activePopupRef = useRef<any>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [hasError, setHasError] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const fixturesKey = useMemo(
    () => fixtures.map((f) => `${f.id}|${f.venue}`).join("|"),
    [fixtures]
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

        const markReady = () => {
          if (!mounted) return;
          setIsReady(true);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        };

        map.on("load", markReady);
        map.on("idle", markReady);

        map.on("error", (event: any) => {
          if (event?.error) {
            console.error("[mapbox] error", event.error);
          }
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

        timeoutRef.current = setTimeout(() => {
          if (mounted) setHasError(true);
        }, 12000);
      } catch (err) {
        console.error("[mapbox] init error", err);
        if (mounted) setHasError(true);
      }
    };

    init();

    return () => {
      mounted = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
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
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    let cancelled = false;

    const resolve = async () => {
      const cache = loadCache();
      let cacheDirty = false;
      const nextMarkers: MapMarker[] = [];

      for (const fixture of fixtures) {
        if (!fixture.venue) continue;
        const label = `${fixture.venue}, Isle of Man`;
        const key = normalizeLocation(label);

        let coords = cache[key];
        if (!coords) {
          coords = await geocodeLocation(token, label);
          if (coords) {
            cache[key] = coords;
            cacheDirty = true;
          }
        }

        if (!coords) continue;
        nextMarkers.push({
          ...fixture,
          lat: coords.lat,
          lng: coords.lng,
        });
      }

      if (cacheDirty) saveCache(cache);
      if (!cancelled) setMarkers(nextMarkers);
    };

    resolve();
    return () => {
      cancelled = true;
    };
  }, [fixturesKey]);

  useEffect(() => {
    const map = mapRef.current;
    const mapboxgl = mapboxRef.current;
    if (!map || !mapboxgl) return;

    markerRefs.current.forEach((marker) => marker.remove());
    markerRefs.current = [];

    const bounds = new mapboxgl.LngLatBounds();
    let hasBounds = false;

    markers.forEach((m) => {
      if (
        typeof m.lat !== "number" ||
        typeof m.lng !== "number" ||
        Number.isNaN(m.lat) ||
        Number.isNaN(m.lng)
      ) {
        return;
      }

      const el = document.createElement("div");
      el.className =
        "h-3 w-3 rounded-full border-2 border-white shadow-sm bg-[#D90429]";

      const popupHtml = `
        <div style="min-width:190px;font-family:ui-sans-serif,system-ui,-apple-system;line-height:1.35;">
          <div style="font-weight:600;font-size:13px;color:#0f172a;">${m.venue}</div>
          <div style="font-size:11px;color:#475569;margin-top:4px;">${m.title}</div>
          ${m.when ? `<div style=\"font-size:11px;color:#64748b;margin-top:6px;\">${m.when}</div>` : ""}
        </div>
      `;

      const popup = new mapboxgl.Popup({
        offset: 12,
        closeButton: false,
        closeOnClick: false,
      }).setHTML(popupHtml);

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([m.lng, m.lat])
        .addTo(map);

      const showPopup = () => {
        if (activePopupRef.current && activePopupRef.current !== popup) {
          activePopupRef.current.remove();
        }
        popup.setLngLat([m.lng, m.lat]).addTo(map);
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
      if (m.url) {
        el.addEventListener("click", () => {
          window.location.href = m.url as string;
        });
        el.style.cursor = "pointer";
      }

      markerRefs.current.push(marker);
      bounds.extend([m.lng, m.lat]);
      hasBounds = true;
    });

    if (hasBounds) {
      map.fitBounds(bounds, { padding: 60, maxZoom: 12 });
    }
  }, [markers]);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const hasMarkers = markers.length > 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div
        ref={containerRef}
        className={`w-full ${heightClass} ${hasError ? "hidden" : ""}`}
      />

      {!token && (
        <div className="flex h-[220px] items-center justify-center text-sm text-slate-500">
          Mapbox token needed to load venue map.
        </div>
      )}

      {token && hasError && (
        <div className="flex h-[220px] items-center justify-center text-sm text-slate-500">
          Map unavailable — check WebGL or Mapbox settings.
        </div>
      )}

      {token && !hasError && !isReady && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-slate-500">
          Loading map...
        </div>
      )}

      {token && isReady && !hasMarkers && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
          No venues pinned yet.
        </div>
      )}
    </div>
  );
}
