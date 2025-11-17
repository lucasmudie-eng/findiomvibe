"use client";

import { useEffect, useRef, useState } from "react";
import UpdateMeta from "@/components/UpdateMeta";
import { formatScoreLine } from "@/lib/football/utils";

type ResultRow = {
  id: string;
  homeId: string;
  awayId: string;
  homeGoals: number;
  awayGoals: number;
  date: string;
};

export default function ResultsPanel({ league }: { league: string }) {
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<number | null>(null);

  const liveEnabled =
    typeof window !== "undefined" &&
    (window as any).NEXT_PUBLIC_FOOTBALL_LIVE_ENABLED !== undefined
      ? String((window as any).NEXT_PUBLIC_FOOTBALL_LIVE_ENABLED) === "true"
      : process.env.NEXT_PUBLIC_FOOTBALL_LIVE_ENABLED === "true";

  async function load() {
    const ac = new AbortController();
    try {
      const r = await fetch(`/api/feed/football?league=${league}`, {
        cache: "no-store",
        signal: ac.signal,
      });
      const data = await r.json();
      const res = Array.isArray(data?.resultsRecent) ? data.resultsRecent : [];
      // newest first
      setRows([...res].reverse());
      if (typeof data?.updatedAt === "string") setUpdatedAt(data.updatedAt);
    } catch {
      // ignore for now
    } finally {
      setLoading(false);
    }
    return () => ac.abort();
  }

  useEffect(() => {
    setLoading(true);
    load();
    timerRef.current = window.setInterval(load, 60_000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [league]);

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Latest results</h3>
        <UpdateMeta updatedAt={updatedAt} liveEnabled={liveEnabled} />
      </div>

      {loading && rows.length === 0 && (
        <div className="py-3 text-sm text-gray-500">Loading…</div>
      )}

      {!loading && rows.length === 0 && (
        <div className="py-3 text-sm text-gray-500">No results yet.</div>
      )}

      <div className="divide-y">
        {rows.map((r) => {
          const f = formatScoreLine(r.homeId, r.awayId, r.homeGoals, r.awayGoals);
          return (
            <div key={r.id} className="grid grid-cols-12 items-center py-3">
              <div className="col-span-5 truncate font-medium text-gray-900">
                {f.left}
              </div>
              <div className="col-span-2 text-center tabular-nums font-semibold">
                {f.score}
              </div>
              <div className="col-span-5 truncate text-right font-medium text-gray-900">
                {f.right}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}