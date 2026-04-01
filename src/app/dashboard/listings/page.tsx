// src/app/dashboard/listings/page.tsx
import Link from "next/link";
import { PlusCircle, Megaphone, ClipboardCheck, ArrowRight } from "lucide-react";

const checklist = [
  "Use a clear title with service + area (e.g. 'Emergency Plumber - Douglas').",
  "Add at least 3 real photos so people trust the listing immediately.",
  "Keep pricing and availability current to reduce drop-off.",
  "Refresh your listing weekly if you're actively promoting it.",
];

export default function ListingsPage() {
  return (
    <main className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Provider dashboard
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Listings</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Create and improve listings that convert views into messages. Start with one
          strong listing, then boost the best performers.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/marketplace/create"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#D90429] px-4 py-2 text-xs font-semibold text-white hover:bg-[#b40320]"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Create listing
          </Link>
          <Link
            href="/wallet"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Megaphone className="h-3.5 w-3.5" />
            Open boosts wallet
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-[#D90429]" />
            <h2 className="text-sm font-semibold text-slate-900">High-converting checklist</h2>
          </div>
          <ul className="space-y-2 text-sm text-slate-700">
            {checklist.map((item) => (
              <li key={item} className="rounded-lg bg-slate-50 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-slate-100 shadow-sm">
          <h2 className="text-sm font-semibold">Next milestones</h2>
          <p className="mt-2 text-sm text-slate-300">
            We&apos;re wiring listing management controls here next (edit/archive status,
            boost history, and quick performance snapshots).
          </p>
          <div className="mt-4 space-y-2 text-xs text-slate-200">
            <p>1) Draft and publish from one panel</p>
            <p>2) Duplicate listing for seasonal offers</p>
            <p>3) One-click boost scheduling</p>
          </div>
          <Link
            href="/provider-help"
            className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-amber-300 hover:underline"
          >
            Request priority feature
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
