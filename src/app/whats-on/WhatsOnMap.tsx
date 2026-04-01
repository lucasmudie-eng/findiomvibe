"use client";

import { useEffect, useRef, useState } from "react";

type EventMapItem = {
  id: string;
  title: string;
  location: string;
  summary?: string | null;
  startsAt?: string | null;
  url?: string;
};

type MapMarker = {
  id: string;
  title: string;
  location: string;
  summary?: string | null;
  startsAt?: string | null;
  lat: number;
  lng: number;
  url?: string;
};

type WhatsOnMapProps = {
  events: EventMapItem[];
  heightClass?: string;
  title?: string;
};

const DEFAULT_CENTER: [number, number] = [-4.5481, 54.2361];
const GEOCODE_CACHE_KEY = "manxhive_event_geocodes_v1";
const GEOCODE_BBOX = "-4.84,54.00,-4.30,54.42";

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
    // ignore write failures (quota, etc)
  }
}

function formatWhen(startsAt?: string | null) {
  if (!startsAt) return null;
  const d = new Date(startsAt);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
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

export default function WhatsOnMap({
  events,
  heightClass = "h-[260px] md:h-[340px]",
  title = "Events across the island",
}: WhatsOnMapProps) {
  const mapRef = useRef<any>(null);
  const mapboxRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markerRefs = useRef<any[]>([]);
  const activePopupRef = useRef<any>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [markers, setMarkers] = useState<MapMarker[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

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

      const queued = events
        .map((event) => ({
          event,
          location: event.location?.trim() ?? "",
        }))
        .filter((entry) => entry.location.length > 0);

      for (const { event, location } of queued) {
        const key = normalizeLocation(location);
        const cached = cache[key];
        if (cached && Number.isFinite(cached.lat) && Number.isFinite(cached.lng)) {
          nextMarkers.push({
            id: event.id,
            title: event.title,
            location,
            summary: event.summary ?? null,
            startsAt: event.startsAt ?? null,
            lat: cached.lat,
            lng: cached.lng,
            url: event.url,
          });
          continue;
        }

        try {
          const coords = await geocodeLocation(token, location);
          if (coords) {
            cache[key] = coords;
            cacheDirty = true;
            nextMarkers.push({
              id: event.id,
              title: event.title,
              location,
              summary: event.summary ?? null,
              startsAt: event.startsAt ?? null,
              lat: coords.lat,
              lng: coords.lng,
              url: event.url,
            });
          }
        } catch (err) {
          console.warn("[mapbox] geocode failed", location, err);
        }

        if (cancelled) return;
      }

      if (cacheDirty) saveCache(cache);
      if (!cancelled) setMarkers(nextMarkers);
    };

    resolve();

    return () => {
      cancelled = true;
    };
  }, [events]);

  useEffect(() => {
    const map = mapRef.current;
    const mapboxgl = mapboxRef.current;
    if (!map || !mapboxgl) return;

    const bounds = new mapboxgl.LngLatBounds();
    let hasBounds = false;

    markerRefs.current.forEach((marker) => marker.remove());
    markerRefs.current = [];

    markers.forEach((marker) => {
      if (
        typeof marker.lat !== "number" ||
        typeof marker.lng !== "number" ||
        Number.isNaN(marker.lat) ||
        Number.isNaN(marker.lng)
      ) {
        return;
      }

      const el = document.createElement("div");
      el.className = "h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm";
      el.style.backgroundColor = "#D90429";

      const detailRows: string[] = [];
      if (marker.location) detailRows.push(marker.location);
      const when = formatWhen(marker.startsAt);
      if (when) detailRows.push(when);

      const popupHtml = `
        <div style="min-width:180px;font-family:ui-sans-serif,system-ui,-apple-system;line-height:1.35;">
          <div style="font-weight:600;font-size:13px;color:#0f172a;">${marker.title}</div>
          ${marker.summary ? `<div style=\"font-size:11px;color:#64748b;margin-top:4px;\">${marker.summary}</div>` : ""}
          ${detailRows.length ? `<div style=\"font-size:11px;color:#475569;margin-top:6px;\">${detailRows.join(" • ")}</div>` : ""}
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
  }, [markers]);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-slate-200 bg-white ${heightClass}`}
    >
      {!token ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-50 text-sm text-slate-600">
          <span className="font-semibold text-slate-700">Mapbox token needed</span>
          <span className="text-xs text-slate-500">
            Set NEXT_PUBLIC_MAPBOX_TOKEN to enable the map.
          </span>
        </div>
      ) : hasError ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-slate-50 px-6 text-center text-sm text-slate-600">
          <span className="text-base font-semibold text-slate-800">
            Interactive map unavailable
          </span>
          <span className="text-xs text-slate-500">
            We couldn’t load Mapbox. This is usually caused by WebGL being
            blocked or an extension blocking Mapbox requests.
          </span>
          <a
            href={
              markers.length
                ? `https://www.google.com/maps/search/?api=1&query=${markers[0].lat},${markers[0].lng}`
                : `https://www.google.com/maps/search/?api=1&query=${DEFAULT_CENTER[1]},${DEFAULT_CENTER[0]}`
            }
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow hover:bg-slate-100"
          >
            Open in Google Maps →
          </a>
        </div>
      ) : markers.length === 0 ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-50 text-sm text-slate-600">
          <span className="font-semibold text-slate-700">No map pins yet</span>
          <span className="text-xs text-slate-500">
            Add locations to events to show pins here.
          </span>
        </div>
      ) : (
        <>
          {!isReady && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 text-xs text-slate-500">
              Loading map…
            </div>
          )}
          <div ref={containerRef} className="h-full w-full" />
        </>
      )}

      {markers.length > 0 && (
        <a
          href={
            markers.length
              ? `https://www.google.com/maps/search/?api=1&query=${markers[0].lat},${markers[0].lng}`
              : `https://www.google.com/maps/search/?api=1&query=${DEFAULT_CENTER[1]},${DEFAULT_CENTER[0]}`
          }
          target="_blank"
          rel="noreferrer"
          className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow transition hover:bg-white"
        >
          Open in Google Maps →
        </a>
      )}
      <div className="absolute left-4 bottom-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow">
        {title}
      </div>
    </div>
  );
}
