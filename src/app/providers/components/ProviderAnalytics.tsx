"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import ProviderListingAnalytics from "./ProviderListingAnalytics";
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

type BusinessDailyRow = {
  day: string;
  impressions: number;
  clicks: number;
};

type EventDailyRow = {
  day: string;
  event_id: string;
  impressions: number;
  views: number;
  clicks: number;
  ticket_clicks: number;
};

type EventMeta = {
  id: string;
  title: string | null;
  starts_at: string | null;
  location: string | null;
};

type BusinessMeta = {
  id: string;
  name: string | null;
  slug: string | null;
};

type TabKey = "marketplace" | "business" | "events" | "deals";
type ProviderAnalyticsProps = {
  providerId: string; // providers.id
  userId: string | null; // auth user id
};

type RangePreset = "7" | "30" | "90" | "custom";

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

export default function ProviderAnalytics({
  providerId,
  userId,
}: ProviderAnalyticsProps) {
  const [tab, setTab] = useState<TabKey>("marketplace");

  return (
    <section className="space-y-4">
      <ProviderAnalyticsOverview providerId={providerId} userId={userId} />

      {/* Tab strip */}
      <div className="flex flex-wrap gap-2 text-xs">
        <TabButton
          label="Marketplace"
          active={tab === "marketplace"}
          onClick={() => setTab("marketplace")}
        />
        <TabButton
          label="Business profile"
          active={tab === "business"}
          onClick={() => setTab("business")}
        />
        <TabButton
          label="Events"
          active={tab === "events"}
          onClick={() => setTab("events")}
        />
        <TabButton
          label="Deals"
          active={tab === "deals"}
          onClick={() => setTab("deals")}
        />
      </div>

      {/* Panels */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        {tab === "marketplace" && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Marketplace performance
            </h2>
            <p className="text-[11px] text-slate-500">
              Impressions, views, enquiries and boosts for your marketplace
              listings.
            </p>
            <ProviderListingAnalytics providerId={providerId} userId={userId} />
          </div>
        )}

        {tab === "business" && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Business profile performance
            </h2>
            <p className="text-[11px] text-slate-500">
              Views and clicks on your main business profile page.
            </p>
            <BusinessAnalytics providerId={providerId} userId={userId} />
          </div>
        )}

        {tab === "events" && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Events performance
            </h2>
            <p className="text-[11px] text-slate-500">
              Track impressions, views and ticket clicks for your events.
            </p>
            <EventsAnalytics providerId={providerId} userId={userId} />
          </div>
        )}

        {tab === "deals" && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Deals performance
            </h2>
            <p className="text-[11px] text-slate-500">
              Track your submitted deals — approval status, boosts and engagement.
            </p>
            <DealsAnalytics userId={userId} />
          </div>
        )}
      </div>
    </section>
  );
}

// ---- Tab button ----
function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "inline-flex items-center rounded-full px-3 py-1.5 text-[11px] transition " +
        (active
          ? "bg-slate-900 text-white shadow-sm"
          : "bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-slate-300")
      }
    >
      {label}
    </button>
  );
}

// ---- Overview snapshot ----
function ProviderAnalyticsOverview({
  providerId,
  userId,
}: {
  providerId: string;
  userId: string | null;
}) {
  const [loading, setLoading] = useState(true);
  const [marketTotals, setMarketTotals] = useState({
    impressions: 0,
    views: 0,
    enquiries: 0,
  });
  const [businessTotals, setBusinessTotals] = useState({
    impressions: 0,
    clicks: 0,
  });
  const [topListing, setTopListing] = useState<{
    id: string;
    title: string;
    views: number;
  } | null>(null);
  const [responseRate, setResponseRate] = useState<{
    replied: number;
    total: number;
  } | null>(null);
  const [freshnessLabel, setFreshnessLabel] = useState<string>("—");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!providerId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const startISO = getDaysAgoISO(30);
        const endISO = getTodayISO();

        const [marketRes, bizRes, enquiriesRes] = await Promise.all([
          supabase
            .from("analytics_daily")
            .select("day, listing_id, impressions, views, enquiries")
            .eq("provider_id", providerId)
            .not("listing_id", "is", null)
            .gte("day", startISO)
            .lte("day", endISO),
          supabase
            .from("analytics_business_daily")
            .select("day, impressions, clicks")
            .eq("provider_id", providerId)
            .gte("day", startISO)
            .lte("day", endISO),
          userId
            ? supabase
                .from("marketplace_enquiries")
                .select("id, status, created_at")
                .eq("seller_user_id", userId)
                .gte("created_at", startISO)
                .lte("created_at", endISO)
            : Promise.resolve({ data: [], error: null }),
        ]);

        if (cancelled) return;

        if (marketRes.error) {
          console.error("[analytics overview] market error", marketRes.error);
        }
        if (bizRes.error) {
          console.error("[analytics overview] business error", bizRes.error);
        }

        const marketRows = (marketRes.data ?? []) as Array<any>;
        const bizRows = (bizRes.data ?? []) as Array<any>;

        const totalsMarket = marketRows.reduce(
          (acc, row) => {
            acc.impressions += row.impressions || 0;
            acc.views += row.views || 0;
            acc.enquiries += row.enquiries || 0;
            return acc;
          },
          { impressions: 0, views: 0, enquiries: 0 }
        );

        const totalsBiz = bizRows.reduce(
          (acc, row) => {
            acc.impressions += row.impressions || 0;
            acc.clicks += row.clicks || 0;
            return acc;
          },
          { impressions: 0, clicks: 0 }
        );

        setMarketTotals(totalsMarket);
        setBusinessTotals(totalsBiz);

        // determine freshness
        const latestMarket = marketRows[marketRows.length - 1]?.day;
        const latestBiz = bizRows[bizRows.length - 1]?.day;
        const allDates = [latestMarket, latestBiz].filter(Boolean).sort();
        const latest = allDates[allDates.length - 1];
        setFreshnessLabel(latest ? `Updated ${latest}` : "No recent updates");

        // top listing by views
        if (marketRows.length) {
          const byListing = new Map<string, { views: number; impressions: number }>();
          marketRows.forEach((r) => {
            if (!r.listing_id) return;
            const current = byListing.get(r.listing_id) || {
              views: 0,
              impressions: 0,
            };
            current.views += r.views || 0;
            current.impressions += r.impressions || 0;
            byListing.set(r.listing_id, current);
          });

          const sorted = Array.from(byListing.entries()).sort(
            (a, b) => b[1].views - a[1].views
          );
          const top = sorted[0];
          if (top) {
            const listingId = top[0];
            const { data: listingData } = await supabase
              .from("marketplace_listings")
              .select("id, title")
              .eq("id", listingId)
              .maybeSingle();

            if (!cancelled) {
              setTopListing({
                id: listingId,
                title: listingData?.title ?? "Listing",
                views: top[1].views,
              });
            }
          }
        }

        if (enquiriesRes && !("error" in enquiriesRes) && !cancelled) {
          const rows = ((enquiriesRes as any).data ?? []) as Array<any>;
          const replied = rows.filter(
            (r) => (r.status ?? "").toLowerCase() === "replied"
          ).length;
          setResponseRate({ replied, total: rows.length });
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[analytics overview] unexpected", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [providerId, userId]);

  const marketCtr =
    marketTotals.impressions > 0
      ? ((marketTotals.views / marketTotals.impressions) * 100).toFixed(1)
      : "0.0";
  const businessCtr =
    businessTotals.impressions > 0
      ? ((businessTotals.clicks / businessTotals.impressions) * 100).toFixed(1)
      : "0.0";

  const responseLabel = responseRate
    ? responseRate.total === 0
      ? "No enquiries yet"
      : `${Math.round((responseRate.replied / responseRate.total) * 100)}% replied`
    : "—";

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Performance snapshot
          </h3>
          <p className="text-[11px] text-slate-500">
            {loading ? "Loading analytics…" : freshnessLabel}
          </p>
        </div>
        {topListing && (
          <div className="rounded-full bg-slate-50 px-3 py-1 text-[11px] text-slate-600">
            Top listing:{" "}
            <span className="font-semibold text-slate-900">
              {topListing.title}
            </span>{" "}
            ({topListing.views} views)
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Marketplace views (30d)"
          value={marketTotals.views}
        />
        <Stat
          label="Marketplace enquiries (30d)"
          value={marketTotals.enquiries}
        />
        <Stat label="Marketplace CTR" value={`${marketCtr}%`} />
        <Stat label="Business CTR" value={`${businessCtr}%`} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-600">
        <span className="rounded-full bg-slate-50 px-2 py-1">
          Business impressions: {businessTotals.impressions}
        </span>
        <span className="rounded-full bg-slate-50 px-2 py-1">
          Business clicks: {businessTotals.clicks}
        </span>
        <span className="rounded-full bg-slate-50 px-2 py-1">
          Response rate: {responseLabel}
        </span>
      </div>
    </div>
  );
}

// ---- Business analytics panel (analytics_business_daily) ----
function BusinessAnalytics({
  providerId,
  userId,
}: {
  providerId: string;
  userId: string | null;
}) {
  const [rows, setRows] = useState<BusinessDailyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const [businesses, setBusinesses] = useState<BusinessMeta[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | "all">(
    "all"
  );

  const [rangePreset, setRangePreset] = useState<RangePreset>("30");
  const [fromDate, setFromDate] = useState<string>(getDaysAgoISO(30));
  const [toDate, setToDate] = useState<string>(getTodayISO());

  const [prevTotals, setPrevTotals] = useState<{
    impressions: number;
    clicks: number;
  } | null>(null);

  const rangeLabelShort =
    rangePreset === "custom"
      ? `${fromDate || "start"} → ${toDate || "today"}`
      : `last ${rangePreset} days`;

  const rangeLabelHeading =
    rangePreset === "custom" ? "Custom range" : `Last ${rangePreset} days`;

  // 1) Load businesses for this provider/user for the dropdown
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase
          .from("businesses")
          .select("id, name, slug")
          .or(
            userId
              ? `submitted_by.eq.${userId},provider_id.eq.${providerId}`
              : `provider_id.eq.${providerId}`
          )
          .order("name", { ascending: true });

        if (cancelled) return;

        if (error) {
          console.error(
            "[BusinessAnalytics] business list error:",
            error.message
          );
          setBusinesses([]);
        } else {
          setBusinesses((data as any as BusinessMeta[]) ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[BusinessAnalytics] business list unexpected:", err);
          setBusinesses([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [providerId, userId]);

  // 2) Load analytics rows (filtered by provider + business + date range)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!providerId && !userId) {
        setRows([]);
        setPrevTotals(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
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

        // current period
        let query = supabase
          .from("analytics_business_daily")
          .select("day, impressions, clicks")
          .eq("provider_id", providerId)
          .gte("day", startISO)
          .lte("day", endISO)
          .order("day", { ascending: true });

        if (selectedBusinessId !== "all") {
          query = query.eq("business_id", selectedBusinessId);
        }

        const { data, error } = await query;

        if (cancelled) return;

        if (error) {
          console.error("[BusinessAnalytics] analytics error:", error.message);
          setRows([]);
          setPrevTotals(null);
        } else {
          const cast = ((data as any) || []).map((r: any) => ({
            day: r.day,
            impressions: r.impressions ?? 0,
            clicks: r.clicks ?? 0,
          })) as BusinessDailyRow[];

          setRows(cast);

          // previous period totals for deltas
          try {
            const { prevStartISO, prevEndISO } = calcPreviousRange(
              startISO,
              endISO
            );

            let prevQuery = supabase
              .from("analytics_business_daily")
              .select("impressions, clicks")
              .eq("provider_id", providerId)
              .gte("day", prevStartISO)
              .lte("day", prevEndISO);

            if (selectedBusinessId !== "all") {
              prevQuery = prevQuery.eq("business_id", selectedBusinessId);
            }

            const { data: prevData, error: prevErr } = await prevQuery;

            if (prevErr || !prevData) {
              if (prevErr) {
                console.error(
                  "[BusinessAnalytics] prev-period error:",
                  prevErr
                );
              }
              setPrevTotals(null);
            } else {
              const totalsPrev = (prevData as any[]).reduce(
                (acc, r) => {
                  acc.impressions += r.impressions || 0;
                  acc.clicks += r.clicks || 0;
                  return acc;
                },
                { impressions: 0, clicks: 0 }
              );
              setPrevTotals(totalsPrev);
            }
          } catch (e) {
            console.error("[BusinessAnalytics] prev-period unexpected:", e);
            setPrevTotals(null);
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[BusinessAnalytics] unexpected:", err);
          setRows([]);
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
  }, [providerId, selectedBusinessId, rangePreset, fromDate, toDate, userId]);

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => {
          acc.impressions += r.impressions;
          acc.clicks += r.clicks;
          return acc;
        },
        { impressions: 0, clicks: 0 }
      ),
    [rows]
  );

  const ctr =
    totals.impressions > 0
      ? (totals.clicks / totals.impressions) * 100
      : 0;

  const prevCtr =
    prevTotals && prevTotals.impressions > 0
      ? (prevTotals.clicks / prevTotals.impressions) * 100
      : null;

  const chartData = useMemo(
    () =>
      rows.map((r) => ({
        day: new Date(r.day).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        }),
        impressions: r.impressions,
        clicks: r.clicks,
      })),
    [rows]
  );

  const isEmpty = !rows.length && !loading && hasLoadedOnce;

  const currentBiz =
    selectedBusinessId === "all"
      ? null
      : businesses.find((b) => b.id === selectedBusinessId) || null;

  const handleExportCsv = () => {
    if (!rows.length) return;
    const file = `business-analytics-${rangeLabelShort.replace(
      /[^a-zA-Z0-9\-]+/g,
      "_"
    )}.csv`;
    const header = ["day", "impressions", "clicks", "ctr_percent"];
    const data = rows.map((r) => [
      r.day,
      r.impressions,
      r.clicks,
      r.impressions > 0
        ? ((r.clicks / r.impressions) * 100).toFixed(2)
        : "0.00",
    ]);
    downloadCSV(file, header, data);
  };

  return (
    <div className="space-y-4">
      {/* Filters + date range */}
      <div className="flex flex-col gap-3 text-[11px] md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500">Business:</span>
            <select
              className="rounded-lg border px-2 py-1 text-[11px] text-slate-800"
              value={selectedBusinessId}
              onChange={(e) =>
                setSelectedBusinessId(
                  e.target.value === "all" ? "all" : e.target.value
                )
              }
            >
              <option value="all">All businesses</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name || b.slug || b.id}
                </option>
              ))}
            </select>
          </div>
          {currentBiz && (
            <span className="text-slate-400">
              Showing data for{" "}
              <span className="font-medium">
                {currentBiz.name || currentBiz.slug || "selected business"}
              </span>
            </span>
          )}
          {loading && hasLoadedOnce && (
            <span className="text-[10px] text-slate-400">Updating…</span>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 md:flex-row md:items-center">
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

          <div className="flex items-center gap-2">
            <span className="hidden text-slate-500 md:inline">
              {rangeLabelHeading}
            </span>
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
      </div>

      {/* Optional empty-state card */}
      {isEmpty && (
        <div className="rounded-xl border bg-slate-50 px-4 py-3 text-[12px] text-slate-600">
          No business profile analytics yet for this date range (
          {rangeLabelShort}). As visitors view and interact with your profile,
          data will appear here.
        </div>
      )}

      {/* Top stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Stat
          label={`Profile impressions (${rangeLabelShort})`}
          value={totals.impressions}
        />
        <Stat
          label={`Profile clicks (${rangeLabelShort})`}
          value={totals.clicks}
        />
        <Stat label="Profile CTR" value={`${ctr.toFixed(1)}%`} />
      </div>

      {prevTotals && (
        <div className="flex flex-wrap gap-1.5">
          <DeltaPill
            label="Impressions"
            current={totals.impressions}
            previous={prevTotals.impressions}
          />
          <DeltaPill
            label="Clicks"
            current={totals.clicks}
            previous={prevTotals.clicks}
          />
          {prevCtr !== null && (
            <DeltaPill label="CTR" current={ctr} previous={prevCtr} />
          )}
        </div>
      )}

      {/* Chart */}
      <div className="rounded-2xl border bg-slate-50 p-4">
        <h3 className="mb-2 text-xs font-semibold text-slate-900">
          Trend over time
        </h3>
        {chartData.length > 0 ? (
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  allowDecimals={false}
                  minTickGap={10}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 11,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="impressions"
                  stroke="#94a3b8"
                  strokeWidth={1.8}
                  dot={false}
                  name="Impressions"
                />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#0f172a"
                  strokeWidth={1.8}
                  dot={false}
                  name="Clicks"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-[11px] text-slate-500">
            No business profile activity in this date range.
          </p>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-white p-4">
        <h3 className="mb-2 text-xs font-semibold text-slate-900">
          Daily breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="py-1.5 pr-3">Day</th>
                <th className="py-1.5 pr-3">Impressions</th>
                <th className="py-1.5 pr-3">Clicks</th>
                <th className="py-1.5 pr-3">CTR</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-3 text-center text-[11px] text-slate-500"
                  >
                    No rows for this range.
                  </td>
                </tr>
              )}
              {rows.map((r) => {
                const rowCtr =
                  r.impressions > 0
                    ? (r.clicks / r.impressions) * 100
                    : 0;
                return (
                  <tr key={r.day + String(rowCtr)} className="border-t">
                    <td className="py-1.5 pr-3">
                      {new Date(r.day).toLocaleDateString("en-GB")}
                    </td>
                    <td className="py-1.5 pr-3">{r.impressions}</td>
                    <td className="py-1.5 pr-3">{r.clicks}</td>
                    <td className="py-1.5 pr-3">
                      {rowCtr.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---- Events placeholder ----
function EventsAnalyticsPlaceholder() {
  return (
    <div className="rounded-xl border bg-slate-50 px-4 py-3 text-[12px] text-slate-600">
      Events analytics is coming soon. Once your events are listed and tracked,
      this section will show impressions, clicks, and interest over time.
      <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
        <a
          href="/list-event"
          className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#D90429] shadow-sm"
        >
          Submit an event
        </a>
        <a
          href="/events"
          className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] text-slate-700"
        >
          View events hub
        </a>
      </div>
    </div>
  );
}

function EventsAnalytics({
  providerId,
  userId,
}: {
  providerId: string;
  userId: string | null;
}) {
  const [events, setEvents] = useState<EventMeta[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | "all">("all");
  const [rows, setRows] = useState<EventDailyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const [rangePreset, setRangePreset] = useState<RangePreset>("30");
  const [fromDate, setFromDate] = useState<string>(getDaysAgoISO(30));
  const [toDate, setToDate] = useState<string>(getTodayISO());

  const rangeLabelShort =
    rangePreset === "custom"
      ? `${fromDate || "start"} → ${toDate || "today"}`
      : `last ${rangePreset} days`;

  useEffect(() => {
    if (!userId) {
      setEvents([]);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("id, title, starts_at, location, submitted_by")
          .eq("submitted_by", userId)
          .order("starts_at", { ascending: true });

        if (cancelled) return;

        if (error) {
          console.error("[EventsAnalytics] events load error", error.message);
          setEvents([]);
        } else {
          setEvents((data as any as EventMeta[]) ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[EventsAnalytics] events load unexpected", err);
          setEvents([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [providerId, userId]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!userId || !events.length) {
        setRows([]);
        setLoading(false);
        return;
      }

      setLoading(true);

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

      try {
        const eventIds = events.map((ev) => ev.id);
        let query = supabase
          .from("analytics_events_daily")
          .select("day, event_id, impressions, views, clicks, ticket_clicks")
          .in("event_id", eventIds)
          .gte("day", startISO)
          .lte("day", endISO)
          .order("day", { ascending: true });

        if (selectedEventId !== "all") {
          query = query.eq("event_id", selectedEventId);
        }

        const { data, error } = await query;

        if (cancelled) return;

        if (error) {
          console.error("[EventsAnalytics] daily error", error.message);
          setRows([]);
        } else {
          const cast = ((data as any) || []).map((r: any) => ({
            day: r.day,
            event_id: r.event_id,
            impressions: r.impressions ?? 0,
            views: r.views ?? 0,
            clicks: r.clicks ?? 0,
            ticket_clicks: r.ticket_clicks ?? 0,
          })) as EventDailyRow[];
          setRows(cast);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[EventsAnalytics] daily unexpected", err);
          setRows([]);
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
  }, [events, selectedEventId, rangePreset, fromDate, toDate, userId]);

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => {
          acc.impressions += r.impressions;
          acc.views += r.views;
          acc.clicks += r.clicks;
          acc.ticketClicks += r.ticket_clicks;
          return acc;
        },
        { impressions: 0, views: 0, clicks: 0, ticketClicks: 0 }
      ),
    [rows]
  );

  const viewCtr =
    totals.impressions > 0
      ? (totals.views / totals.impressions) * 100
      : 0;
  const ticketCtr =
    totals.views > 0 ? (totals.ticketClicks / totals.views) * 100 : 0;

  const chartData = useMemo(
    () =>
      rows.map((r) => ({
        day: new Date(r.day).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        }),
        impressions: r.impressions,
        views: r.views,
        ticketClicks: r.ticket_clicks,
      })),
    [rows]
  );

  const isEmpty = !rows.length && !loading && hasLoadedOnce;

  const eventMap = useMemo(() => {
    const map = new Map<string, EventMeta>();
    events.forEach((ev) => map.set(ev.id, ev));
    return map;
  }, [events]);

  const perEventTotals = useMemo(() => {
    const map = new Map<
      string,
      { impressions: number; views: number; ticketClicks: number }
    >();
    rows.forEach((r) => {
      const curr =
        map.get(r.event_id) || { impressions: 0, views: 0, ticketClicks: 0 };
      curr.impressions += r.impressions;
      curr.views += r.views;
      curr.ticketClicks += r.ticket_clicks;
      map.set(r.event_id, curr);
    });
    return Array.from(map.entries()).map(([id, totals]) => ({
      id,
      ...totals,
    }));
  }, [rows]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 text-[11px] md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500">Event:</span>
            <select
              className="rounded-lg border px-2 py-1 text-[11px] text-slate-800"
              value={selectedEventId}
              onChange={(e) =>
                setSelectedEventId(
                  e.target.value === "all" ? "all" : e.target.value
                )
              }
            >
              <option value="all">All events</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title || `Event ${ev.id}`}
                </option>
              ))}
            </select>
          </div>
          {loading && hasLoadedOnce && (
            <span className="text-[10px] text-slate-400">Updating…</span>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 md:flex-row md:items-center">
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
      </div>

      {isEmpty && (
        <div className="rounded-xl border bg-slate-50 px-4 py-3 text-[12px] text-slate-600">
          No event analytics yet for {rangeLabelShort}. Once people view your
          event pages, stats will appear here.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Event impressions" value={totals.impressions} />
        <Stat label="Event views" value={totals.views} />
        <Stat label="View CTR" value={`${viewCtr.toFixed(1)}%`} />
        <Stat label="Ticket CTR" value={`${ticketCtr.toFixed(1)}%`} />
      </div>

      <div className="rounded-2xl border bg-slate-50 p-4">
        <h3 className="mb-2 text-xs font-semibold text-slate-900">
          Trend over time
        </h3>
        {chartData.length > 0 ? (
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="impressions"
                  stroke="#94a3b8"
                  strokeWidth={1.8}
                  dot={false}
                  name="Impressions"
                />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#0f172a"
                  strokeWidth={1.8}
                  dot={false}
                  name="Views"
                />
                <Line
                  type="monotone"
                  dataKey="ticketClicks"
                  stroke="#D90429"
                  strokeWidth={1.8}
                  dot={false}
                  name="Ticket clicks"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-[11px] text-slate-500">
            No event activity in this date range.
          </p>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="w-full text-xs">
          <thead className="border-b bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="py-2 pr-3">Event</th>
              <th className="py-2 pr-3 text-right">Impr.</th>
              <th className="py-2 pr-3 text-right">Views</th>
              <th className="py-2 pr-3 text-right">Tickets</th>
              <th className="py-2 pr-3 text-right">Ticket CTR</th>
            </tr>
          </thead>
          <tbody>
            {perEventTotals.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-4 text-center text-[11px] text-slate-500"
                >
                  No event analytics yet.
                </td>
              </tr>
            )}
            {perEventTotals.map((row) => {
              const ev = eventMap.get(row.id);
              const ticketCtrRow =
                row.views > 0
                  ? ((row.ticketClicks / row.views) * 100).toFixed(1) + "%"
                  : "—";
              return (
                <tr
                  key={row.id}
                  className="border-b last:border-b-0 hover:bg-slate-50/60"
                >
                  <td className="py-2 pr-3">
                    <div className="font-medium text-slate-900">
                      {ev?.title || "Event"}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {ev?.starts_at
                        ? new Date(ev.starts_at).toLocaleDateString("en-GB")
                        : "Date tbc"}
                    </div>
                  </td>
                  <td className="py-2 pr-3 text-right">
                    {row.impressions}
                  </td>
                  <td className="py-2 pr-3 text-right">{row.views}</td>
                  <td className="py-2 pr-3 text-right">
                    {row.ticketClicks}
                  </td>
                  <td className="py-2 pr-3 text-right">{ticketCtrRow}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---- Deals analytics ----
type DealRow = {
  id: string;
  title: string | null;
  approved: boolean;
  boosted: boolean;
  created_at: string | null;
};

function DealsAnalytics({ userId }: { userId: string | null }) {
  const [deals, setDeals] = useState<DealRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [rangePreset, setRangePreset] = useState<RangePreset>("30");
  const [fromDate, setFromDate] = useState(getDaysAgoISO(30));
  const [toDate, setToDate] = useState(getTodayISO());

  const rangeLabelShort =
    rangePreset === "custom"
      ? `${fromDate || "start"} → ${toDate || "today"}`
      : `last ${rangePreset} days`;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!userId) { setLoading(false); return; }
      setLoading(true);
      try {
        const startISO = rangePreset === "custom" ? fromDate || getDaysAgoISO(30) : getDaysAgoISO(parseInt(rangePreset, 10));
        const endISO = rangePreset === "custom" ? toDate || getTodayISO() : getTodayISO();

        const ownerFields = ["submitted_by", "created_by", "user_id", "owner_user_id"];
        let result: DealRow[] = [];

        for (const field of ownerFields) {
          const { data, error } = await supabase!
            .from("deals")
            .select("id, title, approved, boosted, created_at")
            .eq(field, userId)
            .gte("created_at", startISO)
            .lte("created_at", endISO + "T23:59:59")
            .order("created_at", { ascending: false });
          if (!error && data && data.length > 0) {
            result = data as DealRow[];
            break;
          }
        }

        if (!cancelled) setDeals(result);
      } catch (e) {
        console.error("[DealsAnalytics]", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId, rangePreset, fromDate, toDate]);

  const total = deals.length;
  const approved = deals.filter((d) => d.approved).length;
  const pending = deals.filter((d) => !d.approved).length;
  const boosted = deals.filter((d) => d.boosted).length;

  const handleExportCsv = () => {
    if (!deals.length) return;
    downloadCSV(
      `deals-analytics-${rangeLabelShort.replace(/[^a-zA-Z0-9\-]+/g, "_")}.csv`,
      ["id", "title", "approved", "boosted", "created_at"],
      deals.map((d) => [d.id, d.title ?? "", d.approved ? "yes" : "no", d.boosted ? "yes" : "no", d.created_at ?? ""])
    );
  };

  return (
    <div className="space-y-4">
      {/* Date range + export */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px]">
        <div className="inline-flex rounded-full bg-slate-50 p-1">
          {(["7", "30", "90"] as RangePreset[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => { setRangePreset(p); setFromDate(getDaysAgoISO(parseInt(p, 10))); setToDate(getTodayISO()); }}
              className={"rounded-full px-2.5 py-1 font-medium transition " + (rangePreset === p ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100")}
            >{p}d</button>
          ))}
          <button
            type="button"
            onClick={() => setRangePreset("custom")}
            className={"rounded-full px-2.5 py-1 font-medium transition " + (rangePreset === "custom" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100")}
          >Custom</button>
        </div>
        {rangePreset === "custom" && (
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1 text-slate-500">From<input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="rounded-lg border px-2 py-1 text-[11px]" /></label>
            <label className="flex items-center gap-1 text-slate-500">To<input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="rounded-lg border px-2 py-1 text-[11px]" /></label>
          </div>
        )}
        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-slate-700 hover:bg-slate-50"
        >
          <Download className="h-3 w-3" />
          Export CSV
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label={`Total deals (${rangeLabelShort})`} value={loading ? "—" : total} />
        <Stat label="Approved / live" value={loading ? "—" : approved} />
        <Stat label="Pending review" value={loading ? "—" : pending} />
        <Stat label="Boosted" value={loading ? "—" : boosted} />
      </div>

      {/* Deal list */}
      {!loading && deals.length === 0 && (
        <div className="rounded-xl border bg-slate-50 px-4 py-3 text-[12px] text-slate-600">
          No deals found for this date range ({rangeLabelShort}). Submit a deal to see it tracked here.
        </div>
      )}

      {!loading && deals.length > 0 && (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-slate-500">
                <th className="px-3 py-2 font-semibold">Deal title</th>
                <th className="px-3 py-2 font-semibold">Submitted</th>
                <th className="px-3 py-2 font-semibold text-center">Status</th>
                <th className="px-3 py-2 font-semibold text-center">Boost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deals.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="max-w-[220px] truncate px-3 py-2 font-medium text-slate-900">
                    {d.title ?? "Untitled deal"}
                  </td>
                  <td className="px-3 py-2 text-slate-500">
                    {d.created_at ? new Date(d.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${d.approved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      {d.approved ? "Live" : "Pending"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    {d.boosted ? (
                      <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700">Boosted</span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---- Reusable Stat card ----
function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="text-[11px] tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">
        {value}
      </div>
    </div>
  );
}
