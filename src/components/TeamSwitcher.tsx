"use client";

import { useRouter } from "next/navigation";

interface TeamOption {
  id: string;
  label: string;
}

interface Props {
  league: string;          // e.g. "iom-premier-league"
  currentTeam: string;     // team id currently viewed
  teams: TeamOption[];     // [{ id, label }]
  className?: string;
}

export default function TeamSwitcher({
  league,
  currentTeam,
  teams,
  className = "",
}: Props) {
  const router = useRouter();

  return (
    <div className={className}>
      <label htmlFor="team-switcher" className="sr-only">
        Switch team
      </label>
      <select
        id="team-switcher"
        value={currentTeam}
        onChange={(e) => router.push(`/sports/football/${league}/${e.target.value}`)}
        className="rounded-lg border bg-white px-3 py-1.5 text-sm text-gray-900"
        aria-label="Switch team"
      >
        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>
    </div>
  );
}