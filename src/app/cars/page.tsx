// src/app/cars/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type CarListing = {
  id: string;
  title: string;
  price_pence: number | null;
  images?: string[] | null;
  boosted?: boolean | null;
  business_id?: string | null;
  area?: string | null;
  attrs?: {
    make?: string;
    model?: string;
    year?: number;
    mileage?: number;
    fuel?: string;
    transmission?: string;
    colour?: string;
  };
};

type ApiResponse = { items: CarListing[] };

function formatPrice(pence?: number | null) {
  if (!pence || pence <= 0) return "£—";
  return "£" + (pence / 100).toLocaleString("en-GB", { maximumFractionDigits: 0 });
}

export default function CarsPage() {
  const [cars, setCars] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [priceMax, setPriceMax] = useState<string>("");
  const [yearMin, setYearMin] = useState<string>("");
  const [mileageMax, setMileageMax] = useState<string>("");
  const [sellerType, setSellerType] = useState<"all" | "dealer" | "private">("all");

  // Load initial cars (server will prefilter by sellerType as well)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ type: "car", limit: "200" });
        if (sellerType !== "all") params.set("sellerType", sellerType);
        const res = await fetch(`/api/marketplace?${params.toString()}`, { cache: "no-store" });
        const json: ApiResponse = await res.json();
        if (!cancelled) setCars(json.items || []);
      } catch {
        if (!cancelled) setCars([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sellerType]);

  const filtered = useMemo(() => {
    return cars.filter((c) => {
      const a = c.attrs || {};
      if (make && (a.make || "").toLowerCase() !== make.toLowerCase()) return false;
      if (model && (a.model || "").toLowerCase() !== model.toLowerCase()) return false;

      if (priceMax) {
        const max = Number(priceMax);
        if (!Number.isNaN(max) && (c.price_pence ?? 0) / 100 > max) return false;
      }
      if (yearMin) {
        const y = Number(yearMin);
        if (!Number.isNaN(y) && (a.year ?? 0) < y) return false;
      }
      if (mileageMax) {
        const m = Number(mileageMax);
        if (!Number.isNaN(m) && (a.mileage ?? 0) > m) return false;
      }
      return true;
    });
  }, [cars, make, model, priceMax, yearMin, mileageMax]);

  const makes = useMemo(() => {
    const s = new Set<string>();
    cars.forEach((c) => c.attrs?.make && s.add(c.attrs.make));
    return Array.from(s).sort();
  }, [cars]);

  const models = useMemo(() => {
    const s = new Set<string>();
    cars.forEach((c) => c.attrs?.model && s.add(c.attrs.model));
    return Array.from(s).sort();
  }, [cars]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-1 text-xs text-gray-500">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        / <span className="text-gray-800">Cars</span>
      </nav>

      <header className="mb-4">
        <h1 className="text-3xl font-semibold text-slate-900">Cars for sale</h1>
        <p className="mt-1 text-slate-600">
          Local stock listed by island residents and dealers. Filter by seller, make, model, price, year, mileage.
        </p>
      </header>

      {/* Filters */}
      <section className="mb-6 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-6">
          <div>
            <label className="mb-1 block text-xs text-slate-500">Seller</label>
            <select
              value={sellerType}
              onChange={(e) => setSellerType(e.target.value as any)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="dealer">Dealers</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-500">Make</label>
            <select
              value={make}
              onChange={(e) => setMake(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">Any</option>
              {makes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-500">Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">Any</option>
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-500">Max price (£)</label>
            <input
              type="number"
              inputMode="numeric"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="e.g. 10000"
              min={0}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">Min year</label>
            <input
              type="number"
              inputMode="numeric"
              value={yearMin}
              onChange={(e) => setYearMin(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="e.g. 2016"
              min={1970}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">Max mileage</label>
            <input
              type="number"
              inputMode="numeric"
              value={mileageMax}
              onChange={(e) => setMileageMax(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="e.g. 60000"
              min={0}
            />
          </div>
        </div>
      </section>

      {/* Grid */}
      {loading ? (
        <div className="text-sm text-slate-500">Loading cars…</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-slate-500">No cars match your filters.</div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => {
            const img =
              (Array.isArray(c.images) && c.images.length ? c.images[0] : null) ?? "/placeholder/car.jpg";
            const a = c.attrs || {};
            const subtitle = [a.make, a.model, a.year].filter(Boolean).join(" ");
            const sellerBadge = c.business_id ? "Dealer" : "Private";
            return (
              <li key={c.id} className="group rounded-2xl border bg-white p-3 shadow-sm hover:shadow-md transition">
                <Link href={`/marketplace/item/${c.id}`} className="block">
                  <div className="relative mb-3 h-40 w-full overflow-hidden rounded-xl bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={c.title} className="h-full w-full object-cover" />
                    {c.boosted && (
                      <span className="absolute left-2 top-2 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-[#D90429]">
                        Boosted
                      </span>
                    )}
                    <span className="absolute right-2 top-2 rounded-full bg-slate-900/85 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {sellerBadge}
                    </span>
                  </div>
                  <div className="mb-1 flex items-baseline justify-between gap-2">
                    <h3 className="line-clamp-1 font-semibold text-slate-900 group-hover:text-[#D90429]">
                      {subtitle || c.title}
                    </h3>
                    {c.area && <span className="text-[10px] text-slate-500">{c.area}</span>}
                  </div>
                  <div className="text-sm text-slate-700">{formatPrice(c.price_pence)}</div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    {[a.fuel, a.transmission].filter(Boolean).join(" • ")}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}