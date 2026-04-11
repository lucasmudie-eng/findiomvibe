"use client";

import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

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
    <div className="relative inline-block w-full max-w-xs">
      <select
        value={current}
        onChange={(e) => router.push(`/sports/football/${e.target.value}`)}
        className="w-full appearance-none rounded-xl border border-white/15 bg-white/10 py-2.5 pl-4 pr-10 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E8002D]/50 cursor-pointer"
      >
        {Object.entries(leagues).map(([key, label]) => (
          <option key={key} value={key} className="bg-slate-900 text-white">
            {label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}
