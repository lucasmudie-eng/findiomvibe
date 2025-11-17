"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, MapPin } from "lucide-react";
import UpdateMeta from "@/components/UpdateMeta";
import { formatScoreLine } from "@/lib/football/utils";

type FixtureRow = {
  id: string;
  homeId: string;
  awayId: string;
  date: string;
  venue?: string;
};

export default function FixturesPanel({ league }: { league: string }) {
  const [rows, setRows] = useState<FixtureRow[]>([]);
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
      const fx = Array.isArray(data?.fixturesUpcoming) ? data.fixturesUpcoming : [];
      setRows(fx);
      if (typeof data?.updatedAt === "string") setUpdatedAt(data.updatedAt);
    } catch {
      // ignore
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
        <h3 className="text-lg font-semibold text-gray-900">Upcoming fixtures</h3>
        <UpdateMeta updatedAt={updatedAt} liveEnabled={liveEnabled} />
      </div>

      {loading && rows.length === 0 && (
        <div className="py-3 text-sm text-gray-500">Loading…</div>
      )}

      {!loading && rows.length === 0 && (
        <div className="py-3 text-sm text-gray-500">No upcoming fixtures.</div>
      )}

      <div className="divide-y">
        {rows.map((f) => {
          const line = formatScoreLine(f.homeId, f.awayId);
          return (
            <div key={f.id} className="grid grid-cols-12 items-center gap-y-1 py-3">
              <div className="col-span-5 truncate font-medium text-gray-900">
                {line.left}
              </div>
              <div className="col-span-2 text-center text-gray-500">{line.score}</div>
              <div className="col-span-5 truncate text-right font-medium text-gray-900">
                {line.right}
              </div>
              <div className="col-span-12 mt-1 flex items-center justify-between text-xs text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(f.date).toLocaleString(undefined, {
                    weekday: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {f.venue && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {f.venue}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}