// src/components/ContentCard.tsx
import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import clsx from "clsx";

type ContentCardVariant = "grid" | "hero";

interface ContentCardProps {
  variant?: ContentCardVariant; // "grid" = 4:3, "hero" = 16:9
  href: string;

  imageUrl: string;
  imageAlt?: string;

  categoryLabel?: string; // e.g. "Events", "Deals", "Marketplace"
  categoryTone?: "red" | "blue" | "green" | "neutral"; // optional colour tweak

  dateLabel?: string; // e.g. "10 Oct 2024"
  title: string;
  location?: string;
  description?: string;
  ctaLabel?: string; // e.g. "Read story"
}

export function ContentCard({
  variant = "grid",
  href,
  imageUrl,
  imageAlt,
  categoryLabel,
  categoryTone = "red",
  dateLabel,
  title,
  location,
  description,
  ctaLabel = "View",
}: ContentCardProps) {
  const aspectRatio = variant === "hero" ? "16 / 9" : "4 / 3";

  const categoryClasses = {
    red: "bg-rose-50 text-rose-600",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    neutral: "bg-slate-100 text-slate-600",
  }[categoryTone];

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* Image */}
      <div
        className="relative w-full overflow-hidden bg-slate-200"
        style={{ aspectRatio }}
      >
        <Image
          src={imageUrl}
          alt={imageAlt || title}
          fill
          sizes="(min-width: 1024px) 320px, 100vw"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-3">
        <div className="flex items-center justify-between gap-2 text-xs">
          {categoryLabel && (
            <span
              className={clsx(
                "inline-flex items-center rounded-full px-2 py-0.5 font-semibold uppercase tracking-wide",
                "text-[10px]",
                categoryClasses
              )}
            >
              {categoryLabel}
            </span>
          )}

          {dateLabel && (
            <span className="text-[11px] font-medium text-slate-500">
              {dateLabel}
            </span>
          )}
        </div>

        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">
          {title}
        </h3>

        {location && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3 w-3" />
            <span>{location}</span>
          </div>
        )}

        {description && (
          <p className="mt-1 line-clamp-3 text-xs text-slate-600">
            {description}
          </p>
        )}

        <div className="mt-3 flex items-center text-xs font-semibold text-rose-600">
          {ctaLabel}
          <span className="ml-1 transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}