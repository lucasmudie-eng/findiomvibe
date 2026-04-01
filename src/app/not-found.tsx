// src/app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
      {/* Background blobs */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#D90429]/6 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-slate-100 blur-3xl" />

      <div className="relative z-10 max-w-md">
        {/* Large 404 */}
        <p className="font-playfair text-[9rem] font-bold leading-none tracking-tight text-slate-100 sm:text-[11rem]">
          404
        </p>

        {/* Overlaid headline */}
        <div className="-mt-10 sm:-mt-12">
          <h1 className="font-playfair text-3xl font-bold text-slate-900 sm:text-4xl">
            Lost on the island
            <span className="text-[#D90429]">.</span>
          </h1>
          <p className="mt-3 text-base text-slate-500 leading-relaxed">
            This page doesn&apos;t exist — or it may have moved. Let&apos;s get
            you back to somewhere useful.
          </p>
        </div>

        {/* Quick links */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {[
            { href: "/", label: "Home" },
            { href: "/whats-on", label: "What's On" },
            { href: "/marketplace", label: "Marketplace" },
            { href: "/businesses", label: "Businesses" },
            { href: "/heritage", label: "Heritage & Walks" },
            { href: "/deals", label: "Deals" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-[#D90429]/40 hover:text-[#D90429]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Primary CTA */}
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#D90429] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#b40320]"
        >
          ← Back to ManxHive
        </Link>
      </div>
    </main>
  );
}
