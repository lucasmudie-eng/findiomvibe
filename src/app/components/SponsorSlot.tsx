// src/app/components/SponsorSlot.tsx
import React from "react";

/**
 * A reusable ad or partner placeholder box.
 * Use subtle={true} for white-on-red hero usage,
 * or default styling for gray background sections.
 */
export default function SponsorSlot({
  label = "Ad space",
  subtle = false,
}: {
  label?: string;
  subtle?: boolean;
}) {
  const base =
    "flex items-center justify-center rounded-2xl text-[9px] uppercase tracking-wide";

  if (subtle) {
    return (
      <div
        className={
          base +
          " border border-white/40 bg-white/5 text-white/80"
        }
      >
        {label}
      </div>
    );
  }

  return (
    <div
      className={
        base +
        " border border-dashed border-gray-300 bg-gray-50 text-gray-500"
      }
    >
      {label}
    </div>
  );
}