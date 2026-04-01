// src/app/heritage/walks/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MapPin, Mountain, Clock, Route, ChevronRight, Filter } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import SaveItemButton from "@/app/components/SaveItemButton";

const SAVED_WALKS_KEY = "manxhive_saved_walks";

type Walk = {
  id: number;
  slug: string;
  name: string;
  area: string | null;
  summary: string | null;
  difficulty: string | null;
  duration_mins: number | null;
  distance_km: number | null;
  hero_image_url: string | null;
  best_for: string[] | null;
  tags: string[] | null;
};

type DifficultyFilter = "all" | "Easy" | "Moderate" | "Hard";

function diffBadge(d: string | null | undefined) {
  if (!d) return null;
  if (d === "Easy") return { cls: "bg-emerald-100 text-emerald-700" };
  if (d === "Moderate") return { cls: "bg-amber-100 text-amber-700" };
  if (d === "Hard") return { cls: "bg-rose-100 text-rose-700" };
  return null;
}

function fmtDuration(mins: number | null) {
  if (!mins) return null;
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export default function WalksPage() {
  const supabaseRef = useRef(supabaseBrowser());
  const [walks, setWalks] = useState<Walk[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("all");
  const [area, setArea] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const supabase = supabaseRef.current;
    if (!supabase) { setLoading(false); return; }
    let cancelled = false;

    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("heritage_walks")
        .select("id, slug, name, area, summary, difficulty, duration_mins, distance_km, hero_image_url, best_for, tags")
        .order("name", { ascending: true })
        .limit(200);
      if (!cancelled) {
        setWalks((data as unknown as Walk[]) || []);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const areas = useMemo(() => {
    const set = new Set<string>();
    walks.forEach((w) => { if (w.area) set.add(w.area); });
    return Array.from(set).sort();
  }, [walks]);

  const filtered = useMemo(() => {
    return walks.filter((w) => {
      if (difficulty !== "all" && w.difficulty !== difficulty) return false;
      if (area !== "all" && w.area !== area) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!w.name.toLowerCase().includes(q) && !(w.area || "").toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [walks, difficulty, area, search]);

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="space-y-1">
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
          <Link href="/" className="hover:text-slate-700 transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/heritage" className="hover:text-slate-700 transition-colors">Heritage</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-700">Walks & Routes</span>
        </nav>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600">Isle of Man</p>
            <h1 className="font-playfair text-4xl font-bold text-slate-900 sm:text-5xl">
              Walks &amp; Routes<span className="text-[#D90429]">.</span>
            </h1>
            <p className="mt-2 text-sm text-slate-500 max-w-xl">
              Coastal paths, glen walks and hill routes across the island. Pick a difficulty, find your area, and head out.
            </p>
          </div>
          <Link
            href="/list-walk"
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Mountain className="h-4 w-4" />
            Add a walk
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search walks…"
          className="w-44 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 sm:w-56"
        />

        {/* Difficulty */}
        <div className="flex gap-1.5">
          {(["all", "Easy", "Moderate", "Hard"] as DifficultyFilter[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDifficulty(d)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                difficulty === d
                  ? d === "all" ? "bg-slate-900 text-white" : d === "Easy" ? "bg-emerald-600 text-white" : d === "Moderate" ? "bg-amber-500 text-white" : "bg-rose-600 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300"
              }`}
            >
              {d === "all" ? "All" : d}
            </button>
          ))}
        </div>

        {/* Area */}
        {areas.length > 0 && (
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="all">All areas</option>
            {areas.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        )}

        <span className="text-xs text-slate-400 ml-auto">
          {loading ? "Loading…" : `${filtered.length} walk${filtered.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
          <Mountain className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-semibold text-slate-700">No walks found</p>
          <p className="mt-1 text-xs text-slate-400">Try changing the difficulty or area filter.</p>
          <button
            onClick={() => { setDifficulty("all"); setArea("all"); setSearch(""); }}
            className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((walk) => {
            const badge = diffBadge(walk.difficulty);
            const dur = fmtDuration(walk.duration_mins);

            return (
              <Link
                key={walk.id}
                href={`/heritage/walks/${walk.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:border-emerald-200"
              >
                {/* Image */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  {walk.hero_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={walk.hero_image_url}
                      alt={walk.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Mountain className="h-10 w-10 text-slate-200" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  {/* Difficulty badge */}
                  {badge && (
                    <span className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${badge.cls}`}>
                      {walk.difficulty}
                    </span>
                  )}

                  {/* Save button */}
                  <div
                    className="absolute right-2.5 top-2.5"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  >
                    <SaveItemButton
                      storageKey={SAVED_WALKS_KEY}
                      compact
                      item={{
                        id: String(walk.id),
                        title: walk.name,
                        href: `/heritage/walks/${walk.slug}`,
                        image: walk.hero_image_url || "",
                        meta: walk.area || undefined,
                        savedAt: new Date().toISOString(),
                      }}
                    />
                  </div>

                  {/* Area + meta strip */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex flex-wrap items-center gap-1.5">
                    {walk.area && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white">
                        <MapPin className="h-2.5 w-2.5" />
                        {walk.area}
                      </span>
                    )}
                    {(walk.distance_km || dur) && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white">
                        {walk.distance_km && (
                          <><Route className="h-2.5 w-2.5" />{walk.distance_km.toFixed(1)} km</>
                        )}
                        {dur && <><Clock className="h-2.5 w-2.5 ml-1" />{dur}</>}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card text */}
                <div className="px-4 py-3 space-y-1">
                  <h2 className="font-playfair text-base font-bold leading-snug text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {walk.name}
                  </h2>
                  {walk.summary && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{walk.summary}</p>
                  )}
                  <p className="text-[11px] font-semibold text-[#D90429]">View route →</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
