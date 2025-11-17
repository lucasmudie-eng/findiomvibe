"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORY_LABELS, CategorySlug } from "@/lib/marketplace/types";

const ORDER: CategorySlug[] = [
  "electronics",
  "fashion",
  "home-garden",
  "health-beauty",
  "toys-games",
  "sports-outdoors",
  "media",
  "automotive",
  "pet-supplies",
];

export default function CategoryNav() {
  const pathname = usePathname();

  return (
    <aside className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-2 text-sm font-semibold text-gray-900">Categories</div>
      <nav className="space-y-1">
        {ORDER.map((slug) => {
          const href = `/marketplace/${slug}`;
          const active = pathname === href || pathname.startsWith(`${href}?`);
          return (
            <Link
              key={slug}
              href={href}
              className={
                "block rounded-lg px-3 py-2 text-sm " +
                (active
                  ? "bg-[#D90429] text-white"
                  : "hover:bg-gray-50 text-gray-800")
              }
            >
              {CATEGORY_LABELS[slug]}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}