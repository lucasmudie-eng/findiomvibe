// src/app/marketplace/[category]/page.tsx
import Link from "next/link";
import {
  CATEGORY_LABELS,
  CategorySlug,
  Listing,
  Paginated,
} from "@/lib/marketplace/types";

interface Props {
  params: { category: CategorySlug };
}

async function fetchCategory(
  slug: CategorySlug
): Promise<Paginated<Listing> | null> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "";
  const res = await fetch(
    `${base}/api/marketplace?category=${encodeURIComponent(slug)}&perPage=50`,
    { next: { revalidate: 60 } }
  ).catch(() => null as any);

  if (!res || !res.ok) return null;
  return res.json();
}

export default async function MarketplaceCategoryPage({ params }: Props) {
  const category = params.category;
  const label = CATEGORY_LABELS[category] || "Marketplace";
  const data = (await fetchCategory(category)) || {
    items: [] as Listing[],
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-4">
      <nav className="text-[11px] text-gray-500">
        <Link href="/marketplace" className="hover:underline">
          Marketplace
        </Link>{" "}
        / <span>{label}</span>
      </nav>

      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-gray-900">{label}</h1>
        <p className="text-xs text-gray-600">
          Showing items listed in {label}. All listings are from local users and
          businesses.
        </p>
      </header>

      <section className="rounded-2xl border bg-white p-4 shadow-sm space-y-2">
        {data.items.length === 0 && (
          <p className="text-xs text-gray-500">
            No items in this category yet.
          </p>
        )}

        {data.items.map((item) => (
          <Link
            key={item.id}
            href={`/marketplace/item/${item.id}`}
            className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs hover:bg-gray-50"
          >
            <div>
              <p className="font-medium text-gray-900">{item.title}</p>
              <p className="text-[10px] text-gray-500">
                {item.area} · {item.condition}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                £{(item.pricePence / 100).toFixed(0)}
              </p>
              {item.negotiable && (
                <p className="text-[9px] text-gray-500">Negotiable</p>
              )}
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}