"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";

const tabs = [
  { key: "fixtures", label: "Fixtures" },
  { key: "results", label: "Results" },
  { key: "table", label: "Table" },
];

export function LeagueTabs() {
  const search = useSearchParams();
  const pathname = usePathname();
  const active = search.get("tab") ?? "fixtures";

  return (
    <div className="flex gap-2 border-b">
      {tabs.map((t) => {
        const href = `${pathname}?tab=${t.key}`;
        const isActive = active === t.key;
        return (
          <Link
            key={t.key}
            href={href}
            className={`px-3 py-2 text-sm border-b-2 -mb-px ${
              isActive ? "border-black font-semibold" : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}