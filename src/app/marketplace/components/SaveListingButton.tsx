"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "manxhive_saved_listings";

type SavedListing = {
  id: string;
  title: string;
  href: string;
  image?: string | null;
  price?: string | null;
  savedAt: string;
};

function readSaved(): SavedListing[] {
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

function writeSaved(next: SavedListing[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export default function SaveListingButton({
  listingId,
  title,
  image,
  price,
}: {
  listingId: string;
  title: string;
  image?: string | null;
  price?: string | null;
}) {
  const [saved, setSaved] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const list = readSaved();
    setSaved(list.some((s) => s.id === listingId));
  }, [listingId]);

  const handleClick = () => {
    const list = readSaved();

    if (list.some((s) => s.id === listingId)) {
      const next = list.filter((s) => s.id !== listingId);
      writeSaved(next);
      setSaved(false);
      setMsg("Removed");
      return;
    }

    const entry: SavedListing = {
      id: listingId,
      title,
      href: window.location.pathname,
      image: image || null,
      price: price || null,
      savedAt: new Date().toISOString(),
    };

    writeSaved([entry, ...list].slice(0, 50));
    setSaved(true);
    setMsg("Saved");
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
        {saved ? "Saved" : "Save listing"}
      </button>
      {msg && <span className="text-[10px] text-slate-500">{msg}</span>}
    </div>
  );
}
