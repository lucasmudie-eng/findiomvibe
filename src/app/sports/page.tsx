// src/app/sports/page.tsx
import Link from "next/link";
import { Trophy, Calendar, MapPin, Activity } from "lucide-react";

export default function SportsLandingPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      {/* Breadcrumb */}
      <nav className="mb-2 text-sm text-gray-500">
        <span>Sports</span>
      </nav>

      {/* Hero */}
      <section className="rounded-3xl bg-gradient-to-r from-[#D90429] via-[#f97316] to-[#facc15] p-8 text-white shadow-lg">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3 max-w-xl">
            <h1 className="text-3xl font-semibold">
              Live sport across the Isle of Man
            </h1>
            <p className="text-sm md:text-base text-red-50/90">
              Scores, fixtures, and league tables for local competitions —
              starting with Manx football, with more sports to follow.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/sports/football"
                className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-[#D90429] shadow-sm hover:bg-white"
              >
                <Trophy className="h-4 w-4" />
                Explore Football
              </Link>
            </div>
          </div>

          {/* Quick highlight card */}
          <div className="w-full max-w-xs rounded-2xl bg-white/95 p-4 text-sm text-gray-900 shadow-md">
            <div className="mb-2 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-[#D90429]" />
              <h2 className="font-semibold text-gray-900">
                Manx Football Hub
              </h2>
            </div>
            <p className="text-xs text-gray-600 mb-2">
              Live tables, latest results, and fixtures for all four divisions.
            </p>
            <Link
              href="/sports/football"
              className="inline-flex items-center gap-1 text-xs font-medium text-[#D90429] hover:underline"
            >
              Go to football
            </Link>
          </div>
        </div>
      </section>

      {/* Placeholder / future sports */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[#D90429]" />
            <h3 className="font-semibold text-gray-900 text-sm">
              Football
            </h3>
          </div>
          <p className="text-xs text-gray-600">
            Canada Life Premier League, DPS Ltd Division Two and
            Combination leagues.
          </p>
          <Link
            href="/sports/football"
            className="mt-auto inline-flex text-xs font-medium text-[#D90429] hover:underline"
          >
            View football hub
          </Link>
        </div>

        <div className="rounded-2xl border bg-white p-4 flex flex-col gap-2 opacity-70">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-gray-400" />
            <h3 className="font-semibold text-gray-800 text-sm">
              More sports coming soon
            </h3>
          </div>
          <p className="text-xs text-gray-600">
            Rugby, netball, hockey, motorsport &amp; more — built once leagues
            come onboard.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#D90429]" />
            <h3 className="font-semibold text-gray-900 text-sm">
              Submit a league
            </h3>
          </div>
          <p className="text-xs text-gray-600">
            Run a league or club and want your scores here?
          </p>
          <Link
            href="/contact"
            className="mt-auto inline-flex text-xs font-medium text-[#D90429] hover:underline"
          >
            Get in touch
          </Link>
        </div>
      </section>
    </main>
  );
}