"use client";

import { useEffect, useRef, useState } from "react";

type MapMarker = {
  id: string;
  title: string;
  type: string;
  lat: number;
  lng: number;
  url?: string;
  area?: string;
  summary?: string;
  distanceKm?: number;
  durationMins?: number;
};

type HeritageMapProps = {
  markers: MapMarker[];
  heightClass?: string;
  title?: string;
};

const DEFAULT_CENTER: [number, number] = [-4.5481, 54.2361];

export default function HeritageMap({
  markers,
  heightClass = "h-[380px] md:h-[460px]",
  title = "Explore the Isle of Man",
}: HeritageMapProps) {
  const mapRef = useRef<any>(null);
  const mapboxRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markerRefs = useRef<any[]>([]);
  const activePopupRef = useRef<any>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isReady, setIsReady] = useState(false);

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
    const map = mapRef.current;
    const mapboxgl = mapboxRef.current;
    if (!map || !mapboxgl) return;

    const bounds = new mapboxgl.LngLatBounds();
    let hasBounds = false;

    markerRefs.current.forEach((marker) => marker.remove());
    markerRefs.current = [];

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
      el.className = "h-3 w-3 rounded-full border-2 border-white shadow-sm";
      el.style.backgroundColor =
        m.type === "walk"
          ? "#16a34a"
          : m.type === "heritage"
          ? "#D90429"
          : "#0ea5e9";

      const detailRows: string[] = [];
      if (m.area) detailRows.push(m.area);
      if (typeof m.distanceKm === "number") {
        detailRows.push(`${m.distanceKm.toFixed(1)} km`);
      }
      if (typeof m.durationMins === "number") {
        detailRows.push(`${Math.round(m.durationMins / 10) * 10} mins`);
      }

      const popupHtml = `
        <div style="min-width:180px;font-family:ui-sans-serif,system-ui,-apple-system;line-height:1.35;">
          <div style="font-weight:600;font-size:13px;color:#0f172a;">${m.title}</div>
          ${m.summary ? `<div style="font-size:11px;color:#64748b;margin-top:4px;">${m.summary}</div>` : ""}
          ${detailRows.length ? `<div style="font-size:11px;color:#475569;margin-top:6px;">${detailRows.join(" • ")}</div>` : ""}
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

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-slate-200 bg-white ${heightClass}`}
    >
      {!token ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-50 text-sm text-slate-600">
          <span className="font-semibold text-slate-700">
            Mapbox token needed
          </span>
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
            Add lat/lng values to show places here.
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
