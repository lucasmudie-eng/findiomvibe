// src/app/sports/components/LeaguesClient.tsx
"use client";

import { useMemo, useState } from "react";

type LeagueData = {
  id: string;
  name: string;
  table: { pos: number; team: string; pts: number }[];
  results: { id: string; home: string; away: string; score: string; when: string }[];
};

export default function LeaguesClient({
  leagues,
  defaultLeagueId,
}: {
  leagues: LeagueData[];
  defaultLeagueId?: string;
}) {
  const initial = useMemo(
    () => leagues.find((l) => l.id === defaultLeagueId)?.id || leagues[0]?.id,
    [leagues, defaultLeagueId]
  );
  const [leagueId, setLeagueId] = useState<string>(initial);

  const active = leagues.find((l) => l.id === leagueId) ?? leagues[0];

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      {/* Selector */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="text-lg font-semibold text-gray-900">Football</div>
          <span className="rounded-full border px-2 py-0.5 text-xs text-gray-600">
            Live (demo)
          </span>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <span className="whitespace-nowrap">League:</span>
          <select
            id="league"
            className="rounded-lg border px-2 py-1 text-sm"
            value={leagueId}
            onChange={(e) => setLeagueId(e.target.value)}
          >
            {leagues.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Table + Results grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Table */}
        <div className="rounded-xl border bg-white p-4">
          <div className="mb-3 text-sm font-medium text-gray-900">
            {active.name} — Table
          </div>
          <div className="overflow-hidden rounded-lg border">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-3 py-2 w-12">#</th>
                  <th className="px-3 py-2">Team</th>
                  <th className="px-3 py-2 text-right w-16">Pts</th>
                </tr>
              </thead>
              <tbody>
                {active.table.map((r) => (
                  <tr key={r.pos} className="border-t">
                    <td className="px-3 py-2 text-gray-600">{r.pos}</td>
                    <td className="px-3 py-2 text-gray-900">{r.team}</td>
                    <td className="px-3 py-2 text-right font-medium text-gray-900">
                      {r.pts}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Latest results */}
        <div className="rounded-xl border bg-white p-4">
          <div className="mb-3 text-sm font-medium text-gray-900">
            {active.name} — Latest results
          </div>
          <ul className="space-y-2">
            {active.results.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
              >
                <div className="text-gray-900">
                  <span className="font-medium">{m.home}</span>{" "}
                  <span className="text-gray-500">vs</span>{" "}
                  <span className="font-medium">{m.away}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-gray-100 px-2 py-0.5 font-semibold text-gray-900">
                    {m.score}
                  </span>
                  <span className="text-xs text-gray-500">{m.when}</span>
                </div>
              </li>
            ))}
          </ul>
          {active.results.length === 0 && (
            <div className="text-sm text-gray-500">No recent results.</div>
          )}
        </div>
      </div>
    </div>
  );
}