// src/components/TeamBadge.tsx
import * as React from "react";
import { TEAMS } from "@/lib/football/source";

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map(p => p[0]?.toUpperCase() ?? "");
  return letters.join("");
}

export default function TeamBadge({ teamId, className = "" }: { teamId: string; className?: string }) {
  const team = TEAMS.find(t => t.id === teamId);
  const name = team?.name ?? teamId.replace(/-/g, " ");
  const crest = team?.crestUrl;

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {crest ? (
        // If you later add real crest files, this will just work
        // Put images in /public/crests/<slug>.png or full URLs
        <img
          src={crest}
          alt={`${name} crest`}
          className="h-5 w-5 rounded object-contain bg-white"
          loading="lazy"
        />
      ) : (
        // Fallback badge
        <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-zinc-100 text-[10px] font-semibold text-zinc-700">
          {initials(name)}
        </span>
      )}
      <span className="truncate">{name}</span>
    </span>
  );
}