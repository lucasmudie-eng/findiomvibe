"use client";

import { useRouter } from "next/navigation";

export default function LeagueSwitcher({
  current,
  leagues,
  className = "",
}: {
  current: string;
  leagues: Record<string, string>;
  className?: string;
}) {
  const router = useRouter();

  return (
    <select
      value={current}
      onChange={(e) => router.push(`/sports/football/${e.target.value}`)}
      className={`rounded-md border px-2 py-1 text-sm text-gray-800 ${className}`}
    >
      {Object.entries(leagues).map(([key, label]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </select>
  );
}