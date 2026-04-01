"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function VenueFilter({
  venues,
  value,
  label = "Venue",
  paramKey = "venue",
}: {
  venues: string[];
  value?: string | null;
  label?: string;
  paramKey?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  const current = value ?? "";

  return (
    <label className="flex items-center gap-2 text-xs font-medium text-gray-600">
      <span className="whitespace-nowrap">{label}</span>
      <select
        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-gray-700 shadow-sm"
        value={current}
        onChange={(event) => {
          const next = event.target.value;
          const params = new URLSearchParams(search?.toString());
          if (!next) {
            params.delete(paramKey);
          } else {
            params.set(paramKey, next);
          }
          router.replace(
            params.toString() ? `${pathname}?${params}` : pathname
          );
        }}
      >
        <option value="">All venues</option>
        {venues.map((venue) => (
          <option key={venue} value={venue}>
            {venue}
          </option>
        ))}
      </select>
    </label>
  );
}
