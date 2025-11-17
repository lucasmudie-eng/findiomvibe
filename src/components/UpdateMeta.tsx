"use client";

import { useEffect, useMemo, useState } from "react";

function timeAgo(iso?: string) {
  if (!iso) return "";
  const dt = new Date(iso).getTime();
  const s = Math.max(0, Math.floor((Date.now() - dt) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

export default function UpdateMeta({
  updatedAt,
  liveEnabled,
  className = "",
}: {
  updatedAt?: string;
  liveEnabled?: boolean;
  className?: string;
}) {
  const [tick, setTick] = useState(0);
  // re-render every 10s so the “ago” stays fresh
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 10_000);
    return () => window.clearInterval(id);
  }, []);
  // avoid “unused” warning
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = tick;

  const ago = useMemo(() => timeAgo(updatedAt), [updatedAt, tick]);

  return (
    <div className={`flex items-center gap-2 text-xs ${className}`}>
      <span
        className={
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 " +
          (liveEnabled
            ? "bg-green-600/15 text-green-700"
            : "bg-gray-500/15 text-gray-700")
        }
        title={liveEnabled ? "Using live data feed" : "Using mock data"}
      >
        <span
          className={
            "inline-block h-1.5 w-1.5 rounded-full " +
            (liveEnabled ? "bg-green-600" : "bg-gray-500")
          }
        />
        {liveEnabled ? "Live" : "Cached"}
      </span>
      {updatedAt && (
        <span className="text-gray-500" title={updatedAt}>
          Updated {ago}
        </span>
      )}
    </div>
  );
}