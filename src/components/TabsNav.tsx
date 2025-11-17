"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Tab = { key: "results" | "fixtures" | "table"; label: string };

export default function TabsNav({
  league,
  tabs,
  className = "",
}: {
  league: string;
  tabs?: Tab[];
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const list: Tab[] =
    tabs ?? [
      { key: "results", label: "Results" },
      { key: "fixtures", label: "Fixtures" },
      { key: "table", label: "Table" },
    ];

  const active = (params.get("tab") as Tab["key"]) || "results";

  function go(tab: Tab["key"]) {
    const sp = new URLSearchParams(params.toString());
    sp.set("tab", tab);
    router.push(`${pathname}?${sp.toString()}`, { scroll: false });
  }

  return (
    <div className={`mb-4 flex items-center gap-2 ${className}`}>
      {list.map((t) => (
        <button
          key={t.key}
          onClick={() => go(t.key)}
          className={
            "rounded-full border px-3 py-1.5 text-sm " +
            (active === t.key
              ? "border-[#D90429] text-[#D90429]"
              : "text-gray-700 hover:bg-gray-50")
          }
          aria-pressed={active === t.key}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}