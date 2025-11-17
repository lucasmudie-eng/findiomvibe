// src/components/TeamBadge.tsx
import Image from "next/image";
import Link from "next/link";
import { getTeamDisplayName } from "@/lib/football/utils";

function initialsFromId(id: string) {
  // turn "st-georges" -> "STG", "douglas-royal" -> "DR"
  const parts = id.split("-");
  if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase();
  return parts.map(p => p[0]?.toUpperCase()).join("").slice(0, 3);
}

async function crestExists(path: string) {
  try {
    const res = await fetch(path, { cache: "force-cache" });
    return res.ok;
  } catch { return false; }
}

export default async function TeamBadge({ teamId, href }: { teamId: string; href?: string }) {
  const name = getTeamDisplayName(teamId);
  const svg = `/crests/${teamId}.svg`;
  const png = `/crests/${teamId}.png`;

  const hasSvg = await crestExists(svg);
  const hasPng = !hasSvg && (await crestExists(png));

  const content = (
    <span className="inline-flex items-center gap-2">
      {(hasSvg || hasPng) ? (
        <Image
          src={hasSvg ? svg : png}
          alt={`${name} crest`}
          width={22}
          height={22}
          className="rounded-sm ring-1 ring-zinc-200"
        />
      ) : (
        <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-zinc-100 text-[10px] font-semibold ring-1 ring-zinc-200">
          {initialsFromId(teamId)}
        </span>
      )}
      <span className="align-middle">{name}</span>
    </span>
  );

  return href ? (
    <Link href={href} className="hover:underline">
      {content}
    </Link>
  ) : content;
}