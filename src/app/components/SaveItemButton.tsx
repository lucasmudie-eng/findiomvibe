"use client";

import { useEffect, useState } from "react";
import { toggleSaved, isSaved, type SavedItem } from "@/lib/saved";

type SaveItemButtonProps = {
  storageKey: string;
  item: SavedItem;
  className?: string;
  compact?: boolean;
};

export default function SaveItemButton({
  storageKey,
  item,
  className,
  compact = false,
}: SaveItemButtonProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isSaved(storageKey, item.id));
  }, [storageKey, item.id]);

  const label = saved ? "Saved" : "Save";

  return (
    <button
      type="button"
      onClick={() => setSaved(toggleSaved(storageKey, item))}
      className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-[10px] font-semibold transition ${
        saved
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      } ${compact ? "px-2.5 py-0.5 text-[9px]" : ""} ${className ?? ""}`}
    >
      {label}
    </button>
  );
}
