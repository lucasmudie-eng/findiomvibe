"use client";

import useSWR from "swr";
import Link from "next/link";
import { Trophy, Calendar, MapPin } from "lucide-react";
import type { LeagueBundle } from "@/lib/football/types";
import { formatScoreLine } from "@/lib/football/utils";
import { DEFAULT_LEAGUE } from "@/lib/football/source";

// Fallback: if for any reason DEFAULT_LEAGUE is missing, use prem.
const FALLBACK_LEAGUE = "iom-premier-league";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to load");
    return res.json();
  });

export default function FootballNow() {
  const league = DEFAULT_LEAGUE || (FALLBACK_LEAGUE as const);
  const { data, error, isLoading } = useSWR<LeagueBundle>(
    `/api/feed/football?league=${league}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const results = data?.resultsRecent ?? [];
  const fixtures = data?.fixturesUpcoming ?? [];

  const lastTwo = [...results].slice(-2).reverse();
  const nextTwo = fixtures.slice(0, 2);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Latest results */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-[#D90429]" />
            <h3 className="text-xs font-semibold text-gray-900">
              Latest results
            </h3>
          </div>
          <Link
            href="/sports/football/iom-premier-league?tab=results"
            className="text-[9px] text-[#D90429] hover:underline"
          >
            View all
          </Link>
        </div>

        {isLoading && (
          <p className="text-[10px] text-gray-500">Loading…</p>
        )}
        {error && (
          <p className="text-[10px] text-red-500">
            Couldn&apos;t load results.
          </p>
        )}
        {!isLoading && !error && lastTwo.length === 0 && (
          <p className="text-[10px] text-gray-500">
            No results yet.
          </p>
        )}

        <ul className="space-y-1.5">
          {lastTwo.map((r) => {
            const line = formatScoreLine(
              r.homeId,
              r.awayId,
              r.homeGoals,
              r.awayGoals
            );
            return (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-3 py-2 text-[10px]"
              >
                <div>
                  <div className="font-semibold text-gray-900">
                    {line.left} {line.score} {line.right}
                  </div>
                  <div className="text-[9px] text-gray-500">
                    {new Date(r.date).toLocaleString(undefined, {
                      weekday: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    · FT
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Upcoming fixtures */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-[#D90429]" />
            <h3 className="text-xs font-semibold text-gray-900">
              Upcoming fixtures
            </h3>
          </div>
          <Link
            href="/sports/football/iom-premier-league?tab=fixtures"
            className="text-[9px] text-[#D90429] hover:underline"
          >
            View schedule
          </Link>
        </div>

        {isLoading && (
          <p className="text-[10px] text-gray-500">Loading…</p>
        )}
        {error && (
          <p className="text-[10px] text-red-500">
            Couldn&apos;t load fixtures.
          </p>
        )}
        {!isLoading && !error && nextTwo.length === 0 && (
          <p className="text-[10px] text-gray-500">
            No upcoming fixtures.
          </p>
        )}

        <ul className="space-y-1.5">
          {nextTwo.map((f) => {
            const line = formatScoreLine(f.homeId, f.awayId);
            return (
              <li
                key={f.id}
                className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-3 py-2 text-[10px]"
              >
                <div>
                  <div className="font-semibold text-gray-900">
                    {line.left} {line.score} {line.right}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[9px] text-gray-500">
                    <span>
                      {new Date(f.date).toLocaleString(undefined, {
                        weekday: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {f.venue && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {f.venue}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}