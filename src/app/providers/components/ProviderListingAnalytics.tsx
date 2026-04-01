"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Download } from "lucide-react";

const supabase = supabaseBrowser();

type ListingPerfRow = {
  listing_id: string;
  title: string;
  impressions: number;
  views: number;
  enquiries: number;
  boosts: number;
};

type DailyRawRow = {
  day: string;
  listing_id: string | null;
  impressions: number;
  views: number;
  enquiries: number;
  boosts: number;
};

type MetricKey = "views" | "impressions" | "enquiries";
type RangePreset = "7" | "30" | "90" | "custom";

const METRIC_LABELS: Record<MetricKey, string> = {
  views: "Views",
  impressions: "Impressions",
  enquiries: "Enquiries",
};

function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}

function getDaysAgoISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function calcPreviousRange(startISO: string, endISO: string) {
  const msPerDay = 24 * 60 * 60 * 1000;
  const start = new Date(startISO);
  const end = new Date(endISO);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { prevStartISO: startISO, prevEndISO: startISO };
  }

  const diffMs = end.getTime() - start.getTime();
  const days = Math.max(1, Math.round(diffMs / msPerDay) + 1);

  const prevEnd = new Date(start.getTime() - msPerDay);
  const prevStart = new Date(prevEnd.getTime() - (days - 1) * msPerDay);

  return {
    prevStartISO: prevStart.toISOString().slice(0, 10),
    prevEndISO: prevEnd.toISOString().slice(0, 10),
  };
}

function downloadCSV(
  filename: string,
  header: string[],
  rows: (string | number)[][]
) {
  const esc = (val: string | number) => {
    const s = String(val ?? "");
    if (s.includes('"') || s.includes(",") || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const lines = [header, ...rows]
    .map((row) => row.map(esc).join(","))
    .join("\n");

  const blob = new Blob([lines], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function DeltaPill({
  label,
  current,
  previous,
}: {
  label: string;
  current: number;
  previous: number | null;
}) {
  if (previous === null || previous === 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-[10px] text-slate-400">
        {label}: no prior data
      </span>
    );
  }

  const diff = current - previous;
  const pct = (diff / previous) * 100;

  if (!isFinite(pct)) {
    return null;
  }

  const up = pct > 0.5;
  const down = pct < -0.5;
  const approx = !up && !down;

  const text = approx
    ? `${label}: ≈ 0% vs prev`
    : `${label}: ${up ? "▲" : "▼"} ${Math.abs(pct).toFixed(1)}% vs prev`;

  const colorClass = approx
    ? "bg-slate-50 text-slate-500"
    : up
    ? "bg-emerald-50 text-emerald-700"
    : "bg-rose-50 text-rose-700";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${colorClass}`}
    >
      {text}
    </span>
  );
}

export default function ProviderListingAnalytics({
  providerId,
  userId,
}: {
  providerId: string;
  userId?: string | null;
}) {
  const [rows, setRows] = useState<ListingPerfRow[]>([]);
  const [dailyRaw, setDailyRaw] = useState<DailyRawRow[]>([]);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(
    null
  );
  const [metric, setMetric] = useState<MetricKey>("views");
  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const [prevTotals, setPrevTotals] = useState<{
    impressions: number;
    views: number;
    enquiries: number;
    boosts: number;
  } | null>(null);

  // date range state
  const [rangePreset, setRangePreset] = useState<RangePreset>("30");
  const [fromDate, setFromDate] = useState<string>(getDaysAgoISO(30));
  const [toDate, setToDate] = useState<string>(getTodayISO());

  const rangeLabelShort =
    rangePreset === "custom"
      ? `${fromDate || "start"} → ${toDate || "today"}`
      : `last ${rangePreset} days`;

  const rangeLabelHeading =
    rangePreset === "custom" ? "Custom range" : `Last ${rangePreset} days`;

  useEffect(() => {
    if (!providerId) return;

    let cancelled = false;
    const providerKeys = Array.from(
      new Set(
        [providerId, userId].filter(Boolean) as string[]
      )
    );

    (async () => {
      try {
        setLoading(true);

        // establish actual start/end being used
        let startISO: string;
        let endISO: string;

        if (rangePreset === "custom") {
          startISO = fromDate || getDaysAgoISO(30);
          endISO = toDate || getTodayISO();
        } else {
          const days = parseInt(rangePreset, 10);
          startISO = getDaysAgoISO(days);
          endISO = getTodayISO();
        }

        // current period query
        let query = supabase
          .from("analytics_daily")
          .select("day, listing_id, impressions, views, enquiries, boosts")
          .in("provider_id", providerKeys)
          .not("listing_id", "is", null)
          .gte("day", startISO)
          .lte("day", endISO);

        const { data, error } = await query;

        if (cancelled) return;

        if (error) {
          console.error("[ListingAnalytics] analytics_daily error:", error);
          setRows([]);
          setDailyRaw([]);
          setPrevTotals(null);
        } else {
          const daily = (data ?? []) as DailyRawRow[];

          if (!daily.length) {
            setRows([]);
            setDailyRaw([]);
            setPrevTotals(null);
          } else {
            setDailyRaw(daily);

            // aggregate by listing for table
            const byListing = new Map<
              string,
              {
                impressions: number;
                views: number;
                enquiries: number;
                boosts: number;
              }
            >();

            for (const r of daily) {
              if (!r.listing_id) continue;
              const k = r.listing_id;
              const curr =
                byListing.get(k) || {
                  impressions: 0,
                  views: 0,
                  enquiries: 0,
                  boosts: 0,
                };

              curr.impressions += r.impressions || 0;
              curr.views += r.views || 0;
              curr.enquiries += r.enquiries || 0;
              curr.boosts += r.boosts || 0;

              byListing.set(k, curr);
            }

            const listingIds = Array.from(byListing.keys());
            let out: ListingPerfRow[] = [];

            if (listingIds.length) {
              const { data: listingData, error: listingErr } = await supabase
                .from("marketplace_listings")
                .select("id, title")
                .in("id", listingIds);

              if (listingErr) {
                console.error(
                  "[ListingAnalytics] listings error:",
                  listingErr
                );
              }

              const titleMap = new Map<string, string>();
              (listingData ?? []).forEach((l: any) =>
                titleMap.set(l.id, l.title ?? "Untitled")
              );

              out = listingIds.map((id) => {
                const agg = byListing.get(id)!;
                return {
                  listing_id: id,
                  title: titleMap.get(id) ?? "Untitled",
                  impressions: agg.impressions,
                  views: agg.views,
                  enquiries: agg.enquiries,
                  boosts: agg.boosts,
                };
              });
            }

            setRows(out);
            if (!selectedListingId && out.length > 0) {
              setSelectedListingId(out[0].listing_id);
            }

            // previous period totals for deltas
            try {
              const { prevStartISO, prevEndISO } = calcPreviousRange(
                startISO,
                endISO
              );

              let prevQuery = supabase
                .from("analytics_daily")
                .select("impressions, views, enquiries, boosts")
                .in("provider_id", providerKeys)
                .not("listing_id", "is", null)
                .gte("day", prevStartISO)
                .lte("day", prevEndISO);

              const { data: prevData, error: prevErr } = await prevQuery;

              if (prevErr || !prevData) {
                if (prevErr) {
                  console.error(
                    "[ListingAnalytics] prev-period error:",
                    prevErr
                  );
                }
                setPrevTotals(null);
              } else {
                const totalsPrev = (prevData as any[]).reduce(
                  (acc, r) => {
                    acc.impressions += r.impressions || 0;
                    acc.views += r.views || 0;
                    acc.enquiries += r.enquiries || 0;
                    acc.boosts += r.boosts || 0;
                    return acc;
                  },
                  {
                    impressions: 0,
                    views: 0,
                    enquiries: 0,
                    boosts: 0,
                  }
                );
                setPrevTotals(totalsPrev);
              }
            } catch (e) {
              console.error("[ListingAnalytics] prev-period unexpected:", e);
              setPrevTotals(null);
            }
          }
        }
      } catch (err) {
        console.error("[ListingAnalytics] unexpected:", err);
        if (!cancelled) {
          setRows([]);
          setDailyRaw([]);
          setPrevTotals(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setHasLoadedOnce(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [providerId, rangePreset, fromDate, toDate, selectedListingId]);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => {
        acc.impressions += r.impressions;
        acc.views += r.views;
        acc.enquiries += r.enquiries;
        acc.boosts += r.boosts;
        return acc;
      },
      { impressions: 0, views: 0, enquiries: 0, boosts: 0 }
    );
  }, [rows]);

  const overallChartData = useMemo(() => {
    if (!dailyRaw.length) return [];

    const byDay = new Map<
      string,
      { day: string; impressions: number; views: number; enquiries: number }
    >();

    for (const r of dailyRaw) {
      const k = r.day;
      const curr =
        byDay.get(k) || { day: k, impressions: 0, views: 0, enquiries: 0 };

      curr.impressions += r.impressions || 0;
      curr.views += r.views || 0;
      curr.enquiries += r.enquiries || 0;

      byDay.set(k, curr);
    }

    return Array.from(byDay.values()).sort((a, b) => a.day.localeCompare(b.day));
  }, [dailyRaw]);

  const activeListingId =
    selectedListingId || (rows.length > 0 ? rows[0].listing_id : null);

  const activeListingTitle =
    rows.find((r) => r.listing_id === activeListingId)?.title ?? "Listing";

  const listingChartData = useMemo(() => {
    if (!activeListingId) return [];
    return dailyRaw
      .filter((r) => r.listing_id === activeListingId)
      .sort((a, b) => a.day.localeCompare(b.day))
      .map((r) => ({
        day: r.day,
        impressions: r.impressions,
        views: r.views,
        enquiries: r.enquiries,
      }));
  }, [dailyRaw, activeListingId]);

  const metricLabel = METRIC_LABELS[metric];
  const isEmpty = !rows.length && !loading && hasLoadedOnce;

  const handleExportCsv = () => {
    if (!rows.length) return;
    const file = `marketplace-listings-${rangeLabelShort.replace(
      /[^a-zA-Z0-9\-]+/g,
      "_"
    )}.csv`;
    const header = [
      "listing_title",
      "listing_id",
      "impressions",
      "views",
      "enquiries",
      "boosts",
    ];
    const data = rows.map((r) => [
      r.title,
      r.listing_id,
      r.impressions,
      r.views,
      r.enquiries,
      r.boosts,
    ]);
    downloadCSV(file, header, data);
  };

  return (
    <section className="space-y-5 rounded-2xl border bg-white p-5 shadow-sm">
      {/* Header + range + totals */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Listing performance
          </h3>
          <p className="text-[11px] text-slate-500">
            {rangeLabelHeading} · {totals.impressions} impressions ·{" "}
            {totals.views} views · {totals.enquiries} enquiries
          </p>
          {prevTotals && (
            <div className="mt-1 flex flex-wrap gap-1.5">
              <DeltaPill
                label="Views"
                current={totals.views}
                previous={prevTotals.views}
              />
              <DeltaPill
                label="Impressions"
                current={totals.impressions}
                previous={prevTotals.impressions}
              />
              <DeltaPill
                label="Enquiries"
                current={totals.enquiries}
                previous={prevTotals.enquiries}
              />
            </div>
          )}
          {loading && hasLoadedOnce && (
            <p className="mt-1 text-[10px] text-slate-400">Updating…</p>
          )}
        </div>

        {/* Range controls + export */}
        <div className="flex flex-col items-end gap-2 text-[11px]">
          <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
            <div className="inline-flex rounded-full bg-slate-50 p-1">
              {(["7", "30", "90"] as RangePreset[]).map((p) => {
                const active = rangePreset === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setRangePreset(p);
                      setFromDate(getDaysAgoISO(parseInt(p, 10)));
                      setToDate(getTodayISO());
                    }}
                    className={
                      "rounded-full px-2.5 py-1 text-[11px] font-medium transition " +
                      (active
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100")
                    }
                  >
                    {p}d
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setRangePreset("custom")}
                className={
                  "rounded-full px-2.5 py-1 text-[11px] font-medium transition " +
                  (rangePreset === "custom"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100")
                }
              >
                Custom
              </button>
            </div>

            {rangePreset === "custom" && (
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-1 text-slate-500">
                  From
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="rounded-lg border px-2 py-1 text-[11px]"
                  />
                </label>
                <label className="flex items-center gap-1 text-slate-500">
                  To
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="rounded-lg border px-2 py-1 text-[11px]"
                  />
                </label>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-3 w-3" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Metric toggle */}
      <div className="flex flex-wrap gap-2">
        {(["views", "impressions", "enquiries"] as MetricKey[]).map((m) => {
          const active = metric === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => setMetric(m)}
              className={`rounded-full px-3 py-1.5 text-[11px] transition ${
                active
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {METRIC_LABELS[m]}
            </button>
          );
        })}
      </div>

      {/* Overall chart */}
      <div className="rounded-2xl border bg-slate-50/80 p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-slate-900">
            {metricLabel} over time — all listings
          </p>
          <p className="text-[10px] text-slate-500">{rangeLabelShort}</p>
        </div>
        {overallChartData.length > 0 ? (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overallChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="day"
                  tickFormatter={(d) =>
                    new Date(d).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                    })
                  }
                  tick={{ fontSize: 10 }}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value: any) => [value, metricLabel]}
                  labelFormatter={(d) =>
                    new Date(d as string).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })
                  }
                  contentStyle={{ fontSize: 11 }}
                />
                <Line
                  type="monotone"
                  dataKey={metric}
                  stroke="#0f172a"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-[11px] text-slate-500">
            No marketplace activity in this date range yet.
          </p>
        )}
      </div>

      {/* Listing selector */}
      <div className="flex flex-wrap gap-2">
        {rows.map((r) => {
          const active = r.listing_id === activeListingId;
          return (
            <button
              key={r.listing_id}
              type="button"
              onClick={() => setSelectedListingId(r.listing_id)}
              className={`rounded-full px-3 py-1.5 text-[11px] transition ${
                active
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span className="line-clamp-1 max-w-[160px] text-left">
                {r.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Per-listing chart */}
      <div className="rounded-2xl border bg-slate-50/80 p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-slate-900">
            {metricLabel} over time — {activeListingTitle}
          </p>
          <p className="text-[10px] text-slate-500">{rangeLabelShort}</p>
        </div>
        {listingChartData.length > 0 ? (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={listingChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="day"
                  tickFormatter={(d) =>
                    new Date(d).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                    })
                  }
                  tick={{ fontSize: 10 }}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value: any) => [value, metricLabel]}
                  labelFormatter={(d) =>
                    new Date(d as string).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })
                  }
                  contentStyle={{ fontSize: 11 }}
                />
                <Line
                  type="monotone"
                  dataKey={metric}
                  stroke="#0f172a"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-[11px] text-slate-500">
            No activity for this listing in this date range.
          </p>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="w-full text-xs">
          <thead className="border-b bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="py-2 pr-3">Listing</th>
              <th className="py-2 pr-3 text-right">Impr.</th>
              <th className="py-2 pr-3 text-right">Views</th>
              <th className="py-2 pr-3 text-right">Enq.</th>
              <th className="py-2 pr-3 text-right">Boosts</th>
              <th className="py-2 pr-3 text-right">CTR</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-4 text-center text-[11px] text-slate-500"
                >
                  No listing performance data yet for this date range (
                  {rangeLabelShort}).
                </td>
              </tr>
            )}
            {rows.map((r) => {
              const ctr =
                r.impressions > 0
                  ? ((r.views / r.impressions) * 100).toFixed(1) + "%"
                  : "—";

              return (
                <tr
                  key={r.listing_id}
                  className="border-b last:border-b-0 hover:bg-slate-50/60"
                >
                  <td className="max-w-[240px] py-2 pr-3">
                    <div className="line-clamp-2 font-medium text-slate-900">
                      {r.title}
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] text-slate-400">
                      {r.listing_id.slice(0, 8)}…
                    </div>
                  </td>

                  <td className="py-2 pr-3 text-right">{r.impressions}</td>
                  <td className="py-2 pr-3 text-right">{r.views}</td>
                  <td className="py-2 pr-3 text-right">{r.enquiries}</td>
                  <td className="py-2 pr-3 text-right">{r.boosts}</td>
                  <td className="py-2 pr-3 text-right">{ctr}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
