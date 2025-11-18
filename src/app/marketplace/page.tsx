// src/app/marketplace/page.tsx
import Link from "next/link";
import { headers } from "next/headers";
import { Tag, MapPin, Sparkles, Search } from "lucide-react";
import type { Metadata } from "next";
import type { Listing, CategorySlug } from "@/lib/marketplace/types";
import { CATEGORY_LABELS } from "@/lib/marketplace/types";

// Slugs/labels to hide from the left list (we will show a single, special Motors link)
const HIDE_MOTORS_SLUGS = new Set([
  "motors-automotive",
  "automotive",
  "cars",
  "vehicles",
]);
const HIDE_MOTORS_LABELS = new Set(["Motors & Automotive", "Motors", "Cars"]);

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}): Promise<Metadata> {
  const categoryParam = Array.isArray(searchParams?.category)
    ? searchParams?.category[0]
    : searchParams?.category;

  const typeParam = Array.isArray(searchParams?.type)
    ? searchParams?.type[0]
    : searchParams?.type;

  const isMotorsView =
    (typeParam || "").toLowerCase() === "car" ||
    (categoryParam ? HIDE_MOTORS_SLUGS.has(categoryParam) : false);

  const baseTitle = "Marketplace | ManxHive";
  const baseDesc =
    "Local Isle of Man marketplace for tech, home, vehicles and more — clear listings, trusted locals.";

  if (isMotorsView) {
    return {
      title: "Motors & Automotive | ManxHive Marketplace",
      description:
        "Browse cars and other motors from across the Isle of Man. Dealer and private listings with clear details.",
    };
  }

  const categoryLabel =
    (categoryParam &&
      CATEGORY_LABELS[categoryParam as keyof typeof CATEGORY_LABELS]) ||
    null;

  if (!categoryLabel) {
    return { title: baseTitle, description: baseDesc };
  }

  return {
    title: `${categoryLabel} | ManxHive Marketplace`,
    description: `Browse ${categoryLabel.toLowerCase()} listed by locals on the Isle of Man. Trusted, island-first marketplace.`,
  };
}

function absolute(path: string) {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}${path}`;
}

function formatPrice(pence: number) {
  const pounds = pence / 100;
  return `£${pounds.toFixed(0)}`;
}

async function fetchListings(params?: {
  boostedOnly?: boolean;
  category?: string | null;
  type?: string | null;
  sellerType?: "all" | "dealer" | "private";
}): Promise<Listing[]> {
  const search = new URLSearchParams();
  if (params?.boostedOnly) search.set("boosted", "1");
  if (params?.category) search.set("category", params.category);
  if (params?.type) search.set("type", params.type);
  if (params?.sellerType && params.sellerType !== "all") {
    search.set("sellerType", params.sellerType);
  }
  search.set("limit", "50");

  const url = absolute(`/api/marketplace?${search.toString()}`);

  try {
    const res = await fetch(url, { next: { revalidate: 30 } });
    if (!res.ok) {
      console.error("[marketplace] failed to load listings:", res.status);
      return [];
    }
    const data = await res.json();
    return data.items ?? [];
  } catch (err) {
    console.error("[marketplace] error fetching listings:", err);
    return [];
  }
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const categoryParam = Array.isArray(searchParams?.category)
    ? searchParams?.category[0]
    : searchParams?.category;

  const boostedParam = Array.isArray(searchParams?.boosted)
    ? searchParams?.boosted[0]
    : searchParams?.boosted;

  const typeParam = Array.isArray(searchParams?.type)
    ? searchParams?.type[0]
    : searchParams?.type;

  const searchParamRaw = Array.isArray(searchParams?.q)
    ? searchParams?.q[0]
    : searchParams?.q;
  const searchQuery = (searchParamRaw ?? "").trim();
  const hasSearch = searchQuery.length > 0;
  const searchQueryLower = searchQuery.toLowerCase();

  const isMotorsView =
    (typeParam || "").toLowerCase() === "car" ||
    (categoryParam ? HIDE_MOTORS_SLUGS.has(categoryParam) : false);

  const sellerTypeParam = Array.isArray(searchParams?.sellerType)
    ? searchParams?.sellerType[0]
    : searchParams?.sellerType;
  const sellerType: "all" | "dealer" | "private" =
    sellerTypeParam === "dealer"
      ? "dealer"
      : sellerTypeParam === "private"
      ? "private"
      : "all";

  const boostedOnly = boostedParam === "1";

  const isKnownCategory =
    !!categoryParam &&
    Object.prototype.hasOwnProperty.call(CATEGORY_LABELS, categoryParam);

  // Only use a normal category when NOT in the motors view
  const activeCategory = (!isMotorsView && isKnownCategory
    ? categoryParam
    : undefined) as CategorySlug | undefined;

  const [boostedListingsRaw, allListingsRaw] = await Promise.all([
    fetchListings({
      boostedOnly: true,
      category: activeCategory || null,
      type: isMotorsView ? "car" : null,
      sellerType: isMotorsView ? sellerType : "all",
    }),
    fetchListings({
      boostedOnly: false,
      category: activeCategory || null,
      type: isMotorsView ? "car" : null,
      sellerType: isMotorsView ? sellerType : "all",
    }),
  ]);

  // 🔧 Filter out obvious mock / placeholder rows (e.g. £0, empty titles)
  const filterReal = (l: Listing) =>
    (l.pricePence ?? 0) > 0 && (l.title ?? "").trim().length > 0;

  const boostedListings = boostedListingsRaw.filter(filterReal);
  const allListings = allListingsRaw.filter(filterReal);

  // 🔎 Search filter (title, area, condition)
  const matchesSearch = (item: Listing) => {
    if (!hasSearch) return true;
    const fields = [
      item.title ?? "",
      (item as any).area ?? "",
      (item as any).condition ?? "",
    ];
    return fields.some((f) => f.toLowerCase().includes(searchQueryLower));
  };

  const boostedFiltered = boostedListings.filter(matchesSearch);
  const allFiltered = allListings.filter(matchesSearch);

  const mainListings = boostedOnly ? boostedFiltered : allFiltered;

  // Hide any category that corresponds to Motors from the normal list
  const categories = Object.entries(CATEGORY_LABELS).filter(
    ([slug, label]) =>
      !HIDE_MOTORS_SLUGS.has(slug) && !HIDE_MOTORS_LABELS.has(label)
  );

  let headingLabel = activeCategory
    ? CATEGORY_LABELS[activeCategory] || "Listings"
    : boostedOnly
    ? "Boosted listings"
    : isMotorsView
    ? "Motors & Automotive"
    : "Latest listings";

  if (hasSearch) {
    headingLabel = "Search results";
  }

  // Base params for helpers: DON'T bake in `boosted` so the toggle can remove it
  const baseParams = new URLSearchParams();
  if (isMotorsView) baseParams.set("type", "car");
  if (isMotorsView && sellerType !== "all") {
    baseParams.set("sellerType", sellerType);
  }
  if (activeCategory && !isMotorsView) {
    baseParams.set("category", activeCategory);
  }

  const hrefWith = (extra: Record<string, string | undefined | null>) => {
    const p = new URLSearchParams(baseParams);
    Object.entries(extra).forEach(([k, v]) => {
      if (!v) return;
      p.set(k, v);
    });
    const qs = p.toString();
    return qs ? `/marketplace?${qs}` : `/marketplace`;
  };

  // 🔧 Proper toggle: when it's on, clicking removes boosted; when off, it adds boosted=1
  const boostedToggleHref = boostedOnly
    ? // currently filtered → click = remove boosted
      hrefWith({ /* no boosted param */ })
    : // currently not filtered → click = add boosted=1
      hrefWith({ boosted: "1" });

  // Clear search but keep other filters
  const clearSearchHref = (() => {
    const p = new URLSearchParams(baseParams);
    if (boostedOnly) p.set("boosted", "1");
    const qs = p.toString();
    return qs ? `/marketplace?${qs}` : "/marketplace";
  })();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="mb-2 text-xs text-gray-500">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        / <span className="text-gray-800">Marketplace</span>
      </nav>

      {/* Header / intro + search */}
      <section className="flex flex-col gap-3 rounded-2xl border bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-gray-900">
            ManxHive Marketplace
          </h1>
          <p className="text-xs text-gray-500">
            Browse local listings from across the Isle of Man.
          </p>
        </div>

        {/* Search bar */}
        <form
          action="/marketplace"
          method="GET"
          className="flex w-full max-w-xs items-center gap-2 rounded-full border bg-gray-50 px-3 py-1.5 text-xs md:max-w-sm"
        >
          {/* Preserve current filters */}
          {activeCategory && !isMotorsView && (
            <input type="hidden" name="category" value={activeCategory} />
          )}
          {isMotorsView && <input type="hidden" name="type" value="car" />}
          {isMotorsView && sellerType !== "all" && (
            <input type="hidden" name="sellerType" value={sellerType} />
          )}
          {boostedOnly && <input type="hidden" name="boosted" value="1" />}

          <Search className="h-3.5 w-3.5 text-gray-400" />
          <input
            name="q"
            defaultValue={searchQuery}
            placeholder="Search marketplace..."
            className="w-full border-none bg-transparent text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-0"
          />
          {hasSearch && (
            <Link
              href={clearSearchHref}
              className="text-[10px] text-gray-500 hover:text-gray-800"
            >
              Clear
            </Link>
          )}
        </form>

        <div className="flex flex-wrap gap-2 text-xs">
          <Link
            href={boostedToggleHref}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 ${
              boostedOnly
                ? "border-[#D90429] bg-[#D90429]/5 text-[#D90429]"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Boosted only
          </Link>

          <Link
            href="/marketplace/create"
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-gray-700 hover:bg-gray-50"
          >
            List an item
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px,minmax(0,1fr)]">
        {/* Left: Categories */}
        <aside className="space-y-3">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Tag className="h-4 w-4 text-[#D90429]" />
              Browse categories
            </h2>
            <div className="flex flex-col gap-1 text-xs">
              <Link
                href={boostedOnly ? "/marketplace?boosted=1" : "/marketplace"}
                className={`rounded-lg px-2 py-1.5 ${
                  !activeCategory && !isMotorsView
                    ? "bg-[#D90429] text-white"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                All listings
              </Link>

              {categories.map(([slug, label]) => {
                const href = boostedOnly
                  ? `/marketplace?category=${slug}&boosted=1`
                  : `/marketplace?category=${slug}`;
                const active = activeCategory === slug && !isMotorsView;
                return (
                  <Link
                    key={slug}
                    href={href}
                    className={`rounded-lg px-2 py-1.5 ${
                      active
                        ? "bg-[#D90429] text-white"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}

              {/* Single visible Motors entry */}
              <Link
                href={hrefWith({ type: "car" })}
                className={`rounded-lg px-2 py-1.5 ${
                  isMotorsView
                    ? "bg-[#D90429] text-white"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Motors &amp; Automotive
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border bg-gradient-to-br from-[#D90429] via-[#E7423A] to-[#FF7A3C] p-4 text-xs text-white shadow-sm">
            <p className="font-semibold">Boost your listing</p>
            <p className="mt-1 text-white/80">
              Feature your item in the top spots across the marketplace homepage.
              Ideal for vehicles, tech, and premium items.
            </p>
            <Link
              href="/contact"
              className="mt-2 inline-block rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium text-white hover:bg-white/20"
            >
              Talk to us about boosted slots
            </Link>
          </div>
        </aside>

        {/* Right: Listings */}
        <section className="space-y-5">
          {isMotorsView && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-gray-500">Seller:</span>
              <div className="flex flex-wrap gap-2">
                {(["all", "dealer", "private"] as const).map((k) => {
                  const active = sellerType === k;
                  const link = hrefWith({
                    type: "car",
                    sellerType: k === "all" ? undefined : k,
                    category: undefined,
                  });
                  return (
                    <Link
                      key={k}
                      href={link}
                      className={`rounded-full px-3 py-1.5 text-[11px] transition ${
                        active
                          ? "bg-slate-900 text-white"
                          : "bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-slate-300"
                      }`}
                    >
                      {k === "all" ? "All" : k === "dealer" ? "Dealers" : "Private"}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Boosted section */}
          {!boostedOnly && boostedFiltered.length > 0 && (
            <div className="rounded-2xl border bg-[#FFF6F6] p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[#D90429]">
                <Sparkles className="h-3.5 w-3.5" />
                Featured / boosted listings
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {boostedFiltered.map((item) => (
                  <Link
                    key={item.id}
                    href={`/marketplace/item/${item.id}`}
                    className="flex gap-3 rounded-xl border bg-white/80 p-3 text-xs text-gray-800 hover:border-[#D90429] hover:shadow-sm"
                  >
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {item.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[9px] text-gray-400">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-center justify-between gap-2">
                        <p className="line-clamp-1 font-semibold">
                          {item.title}
                        </p>
                        <p className="whitespace-nowrap font-semibold text-[#D90429]">
                          {formatPrice(item.pricePence)}
                        </p>
                      </div>
                      <div className="mt-auto flex items-center gap-2 text-[9px] text-gray-500">
                        <MapPin className="h-3 w-3" />
                        {(item as any).area}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Main Listings */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-sm font-semibold text-gray-900">
                {headingLabel}
                {hasSearch && (
                  <span className="ml-1 text-[11px] font-normal text-gray-500">
                    for “{searchQuery}”
                  </span>
                )}
              </h2>
              {(activeCategory ||
                boostedOnly ||
                isMotorsView ||
                sellerType !== "all" ||
                hasSearch) && (
                <Link
                  href="/marketplace"
                  className="text-[10px] text-[#D90429] hover:underline"
                >
                  Clear filters
                </Link>
              )}
            </div>

            {mainListings.length === 0 ? (
              <p className="rounded-2xl border bg-white p-4 text-xs text-gray-500">
                No listings found for this view yet. Try another category or
                search term, or check back soon.
              </p>
            ) : (
              <ul className="space-y-2">
                {mainListings.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/marketplace/item/${item.id}`}
                      className="flex gap-3 rounded-2xl border bg-white p-3 text-xs text-gray-800 hover:border-[#D90429] hover:shadow-sm"
                    >
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {item.images?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[9px] text-gray-400">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="line-clamp-1 font-semibold">
                            {item.title}
                          </p>
                          <p className="whitespace-nowrap font-semibold text-[#D90429]">
                            {formatPrice(item.pricePence)}
                          </p>
                        </div>
                        <p className="line-clamp-1 text-[10px] text-gray-500">
                          {(item as any).condition || "—"} •{" "}
                          {new Date(
                            (item as any).dateListed
                          ).toLocaleDateString("en-GB")}
                        </p>
                        <div className="mt-auto flex flex-wrap items-center gap-2 text-[9px] text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {(item as any).area}
                          </span>
                          {(item as any).negotiable && (
                            <span className="rounded-full bg-green-50 px-2 py-0.5 text-[9px] text-green-700">
                              Negotiable
                            </span>
                          )}
                          {(item as any).boosted && !boostedOnly && (
                            <span className="rounded-full bg-[#FFF6F6] px-2 py-0.5 text-[9px] text-[#D90429]">
                              Boosted
                            </span>
                          )}
                          {isMotorsView && (
                            <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[9px] text-slate-700">
                              {(item as any).businessId ? "Dealer" : "Private"}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}