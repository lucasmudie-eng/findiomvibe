"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "manxhive_saved_searches";

type SavedSearch = {
  id: string;
  name: string;
  href: string;
  savedAt: string;
};

function readSaved(): SavedSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSaved(next: SavedSearch[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function buildLabelFromUrl(url: string) {
  try {
    const u = new URL(url, window.location.origin);
    const q = u.searchParams.get("q");
    const category = u.searchParams.get("category");
    const type = u.searchParams.get("type");
    if (q) return `Search: ${q}`;
    if (type === "car") return "Motors & Automotive";
    if (category) return `Category: ${category}`;
    return "Marketplace";
  } catch {
    return "Marketplace";
  }
}

export default function SaveSearchButton() {
  const [saved, setSaved] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const href = window.location.pathname + window.location.search;
    const list = readSaved();
    setSaved(list.some((s) => s.href === href));
  }, []);

  const handleClick = () => {
    const href = window.location.pathname + window.location.search;
    const list = readSaved();

    if (list.some((s) => s.href === href)) {
      const next = list.filter((s) => s.href !== href);
      writeSaved(next);
      setSaved(false);
      setMsg("Search removed");
      return;
    }

    const name = buildLabelFromUrl(window.location.href);
    const entry: SavedSearch = {
      id: `search_${Date.now()}`,
      name,
      href,
      savedAt: new Date().toISOString(),
    };

    writeSaved([entry, ...list].slice(0, 20));
    setSaved(true);
    setMsg("Search saved");
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        className={`rounded-full border px-3 py-1 text-[11px] transition ${
          saved
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
        }`}
        aria-pressed={saved}
      >
        {saved ? "Saved" : "Save search"}
      </button>
      {msg && <span className="text-[10px] text-slate-500">{msg}</span>}
    </div>
  );
}
