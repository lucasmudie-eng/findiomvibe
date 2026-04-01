"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { MapPin, Tag, ArrowRight } from "lucide-react";
import type { Listing } from "@/lib/marketplace/types";

function formatPrice(pence: number) {
  return "£" + (pence / 100).toLocaleString("en-GB", { maximumFractionDigits: 0 });
}

function track(event: string, meta: Record<string, any>) {
  try {
    const payload = {
      event,
      refType: "marketplace_listing",
      refId: meta.refId,
      ...meta,
    };
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch (err) {
    console.warn("[ListingCard.track] error", err);
  }
}

export default function ListingCard({ item }: { item: Listing }) {
  const img = item.images?.[0];
  const safeSeller = item.businessId
    ? "Business seller"
    : item.seller?.trim() || "Local seller";
  const safeArea = item.area?.trim() || "Island-wide";
  const safeDate = item.dateListed
    ? new Date(item.dateListed).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Recently";
  const isBusiness = !!item.businessId;

  const didImpress = useRef(false);

  useEffect(() => {
    if (didImpress.current) return;
    didImpress.current = true;
    track("listing_impression", {
      refId: item.id,
      sellerUserId: (item as any).sellerUserId ?? null,
      category: item.category ?? null,
      area: item.area ?? null,
      pricePence: item.pricePence ?? null,
      boosted: (item as any).boosted ?? false,
    });
  }, [item]);

  const handleClick = () => {
    track("listing_click", {
      refId: item.id,
      sellerUserId: (item as any).sellerUserId ?? null,
      category: item.category ?? null,
      area: item.area ?? null,
      pricePence: item.pricePence ?? null,
      boosted: (item as any).boosted ?? false,
    });
  };

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-[#E8002D]/25 hover:shadow-lg">

      {/* ── Always-visible row ─────────────────────────────────────── */}
      <div className="flex gap-4 p-4">

        {/* Thumbnail */}
        <div className="relative h-24 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-28 sm:w-36">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1">
              <Tag className="h-4 w-4 text-slate-300" />
              <span className="text-[10px] text-slate-300">No image</span>
            </div>
          )}
          {(item as any).boosted && (
            <span className="absolute left-1.5 top-1.5 rounded-full bg-[#E8002D] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white shadow">
              Boosted
            </span>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <Link
              href={`/marketplace/item/${item.id}`}
              onClick={handleClick}
              className="line-clamp-2 text-sm font-semibold text-slate-900 transition-colors group-hover:text-[#E8002D] hover:underline"
            >
              {item.title}
            </Link>
            <span className="shrink-0 rounded-full bg-[#E8002D] px-3 py-1 text-xs font-bold text-white shadow-sm">
              {formatPrice(item.pricePence)}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {safeArea}
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">{safeDate}</span>
            {isBusiness && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                Business
              </span>
            )}
          </div>

          {/* Badges — always visible */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {item.condition && (
              <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] text-slate-600">
                {item.condition}
              </span>
            )}
            <span
              className={
                "rounded-full px-2 py-0.5 text-[10px] " +
                (item.negotiable
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border border-slate-200 text-slate-500")
              }
            >
              {item.negotiable ? "Negotiable" : "Fixed price"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Hover-expand section ────────────────────────────────────── */}
      <div className="grid transition-all duration-300 ease-out [grid-template-rows:0fr] group-hover:[grid-template-rows:1fr]">
        <div className="overflow-hidden">
          <div className="border-t border-slate-100 px-4 pb-4 pt-3">
            {item.description ? (
              <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
                {item.description}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">No description provided.</p>
            )}
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
                By <span className="font-medium text-slate-600">{safeSeller}</span>
                {" · "}
                {safeDate}
              </span>
              <Link
                href={`/marketplace/item/${item.id}`}
                onClick={handleClick}
                className="inline-flex items-center gap-1 rounded-full bg-[#E8002D] px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#c00026]"
              >
                View listing <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
