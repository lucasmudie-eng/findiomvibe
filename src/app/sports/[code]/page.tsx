// src/app/sports/[code]/page.tsx
import { headers } from "next/headers";
import Link from "next/link";
import { ChevronRight, ArrowRight } from "lucide-react";
import ScoreList from "@/app/sports/components/ScoreList";
import LeagueTable from "@/app/sports/components/LeagueTable";
import { resolveSportName } from "@/lib/sports/source";

function absolute(path: string) {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}${path}`;
}

async function getScores(code: string) {
  const res = await fetch(absolute(`/api/sports/${code}/scores`), { cache: "no-store" });
  if (!res.ok) return { items: [] };
  return res.json();
}

async function getTable(code: string) {
  const res = await fetch(absolute(`/api/sports/${code}/table`), { cache: "no-store" });
  if (!res.ok) return { rows: [] };
  return res.json();
}

export default async function SportsCategoryPage({ params }: { params: { code: string } }) {
  const title = resolveSportName(params.code);
  const scores = await getScores(params.code);
  const table = await getTable(params.code);
  const hasData =
    (scores.items && scores.items.length > 0) ||
    (table.rows && table.rows.length > 0);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 space-y-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link href="/" className="hover:text-slate-700 transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/sports" className="hover:text-slate-700 transition-colors">Sports</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-700">{title}</span>
      </nav>

      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E8002D] mb-2">
            {hasData ? "Live league data" : "Coming soon"}
          </p>
          <h1 className="font-playfair text-4xl font-bold text-slate-900 sm:text-5xl">
            {title}<span className="text-[#E8002D]">.</span>
          </h1>
          <p className="mt-3 max-w-xl text-base text-slate-500 leading-relaxed">
            {hasData
              ? "Latest scores and tables for local competitions."
              : "We're preparing this section. Leagues and clubs can submit their details now, and we'll publish tables and results as soon as they're ready."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/list-league"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#E8002D] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#c00026] transition"
          >
            Submit a league
          </Link>
          <Link
            href="/list-sport"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            List a sport / class
          </Link>
        </div>
      </div>

      {/* Content */}
      {hasData ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-playfair mb-4 text-xl font-bold text-slate-900">
                Latest scores
              </h2>
              <ScoreList items={scores.items ?? []} />
            </section>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-playfair mb-4 text-xl font-bold text-slate-900">
              League table
            </h2>
            <LeagueTable rows={table.rows ?? []} />
          </aside>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm text-center">
          <p className="text-4xl mb-4">🏆</p>
          <h2 className="font-playfair text-xl font-bold text-slate-900 mb-2">
            {title} hub coming soon
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            We're working to bring full {title.toLowerCase()} coverage to ManxHive.
            If you run a league or club, submit your details now.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/list-league"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#E8002D] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#c00026] transition"
            >
              Submit a league <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/sports"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              ← Back to sports
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
