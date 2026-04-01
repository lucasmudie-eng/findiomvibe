// src/app/businesses/GalleryCarousel.tsx
"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function GalleryCarousel({
  gallery,
  name,
  boosted,
}: {
  gallery: string[];
  name: string;
  boosted?: boolean | null;
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (gallery.length <= 1) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % gallery.length), 4000);
    return () => clearInterval(id);
  }, [gallery.length]);

  if (!gallery.length) {
    return (
      <div className="mb-8 flex h-48 items-center justify-center rounded-2xl bg-slate-100">
        <span className="text-5xl font-bold text-slate-200">{name[0]}</span>
      </div>
    );
  }

  const prev = () => setIdx((i) => (i - 1 + gallery.length) % gallery.length);
  const next = () => setIdx((i) => (i + 1) % gallery.length);

  return (
    <div className="mb-8 relative h-[340px] sm:h-[460px] overflow-hidden rounded-2xl bg-slate-100">
      {/* Crossfading images */}
      {gallery.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src + i}
          src={src}
          alt={`${name} — photo ${i + 1}`}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            i === idx ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Subtle bottom gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

      {/* Boosted badge */}
      {boosted && (
        <span className="absolute left-3 top-3 rounded-full bg-[#E8002D] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
          Boosted
        </span>
      )}

      {/* Image counter */}
      {gallery.length > 1 && (
        <div className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
          {idx + 1} / {gallery.length}
        </div>
      )}

      {/* Prev / Next arrows */}
      {gallery.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-slate-900 shadow-sm backdrop-blur-sm hover:bg-white transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next image"
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-slate-900 shadow-sm backdrop-blur-sm hover:bg-white transition"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {gallery.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
          {gallery.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              aria-label={`Go to image ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === idx
                  ? "w-5 h-1.5 bg-[#E8002D]"
                  : "w-1.5 h-1.5 bg-white/60 hover:bg-white"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
