// src/app/promote/page.tsx
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  BarChart3,
  MapPin,
  Rocket,
  CalendarClock,
  Users,
  Star,
} from "lucide-react";

export default function PromotePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
      {/* Top breadcrumb / back link */}
      <div className="mb-2">
        <Link
          href="/provider-dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to provider dashboard
        </Link>
      </div>

      {/* Hero */}
      <section className="overflow-hidden rounded-3xl border border-slate-900/10 bg-slate-950 text-slate-50 shadow-md">
        <div className="relative px-6 py-8 sm:px-10 sm:py-10">
          <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-[#D90429]/40 blur-2xl opacity-80" />
          <div className="pointer-events-none absolute bottom-[-3rem] right-[-2rem] h-36 w-36 rounded-full bg-slate-500/30 blur-3xl opacity-70" />

          <div className="relative grid gap-8 lg:grid-cols-[1.5fr,1fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium uppercase tracking-wide">
                <Sparkles className="h-3 w-3" />
                Promote on ManxHive
              </div>
              <h1 className="mt-3 text-2xl sm:text-3xl font-semibold leading-tight">
                Put your business in front of more people on the Isle of Man.
              </h1>
              <p className="mt-3 max-w-xl text-sm text-slate-200/85">
                Pay once to push your listing, deal, or business profile higher
                in search, categories, and discovery areas across ManxHive.
                No subscriptions, no monthly fees.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/provider-dashboard"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900 shadow-sm hover:bg-slate-100"
                >
                  Go to your dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-xs font-medium text-slate-50 hover:bg-white/5"
                >
                  Talk to us about promotion
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Stats / bullet column */}
            <div className="relative rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-200/90">
                Why boost on ManxHive?
              </p>
              <div className="mt-3 space-y-3 text-[11px] text-slate-200/90">
                <div className="flex gap-2">
                  <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#D90429]/20">
                    <BarChart3 className="h-3.5 w-3.5 text-[#FFCC4D]" />
                  </div>
                  <div>
                    <p className="font-semibold">More eyes, more enquiries</p>
                    <p className="text-slate-300/80">
                      Push your best offers up the page where locals actually
                      click.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#D90429]/20">
                    <MapPin className="h-3.5 w-3.5 text-[#FFCC4D]" />
                  </div>
                  <div>
                    <p className="font-semibold">Local-first placement</p>
                    <p className="text-slate-300/80">
                      Designed around Isle of Man buyers looking for real,
                      nearby providers.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#D90429]/20">
                    <Rocket className="h-3.5 w-3.5 text-[#FFCC4D]" />
                  </div>
                  <div>
                    <p className="font-semibold">Pay once, no commitment</p>
                    <p className="text-slate-300/80">
                      One-time payments only — boost for as many days as you
                      need, with no ongoing subscription.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Boost types */}
      <section className="grid gap-6 md:grid-cols-[1.4fr,1fr] items-start">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Boost types
              </h2>
              <p className="mt-1 text-[11px] text-slate-600">
                Choose how and where you want extra visibility. We keep the
                rules simple and predictable.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <BoostTypeCard
              title="Listing boost"
              subtitle="24 hours"
              icon={<Rocket className="h-4 w-4" />}
              description="Push one marketplace listing higher in its category and search results for a day."
              bestFor="Flash offers, fresh stock, time-sensitive services."
            />
            <BoostTypeCard
              title="Weekend boost"
              subtitle="Fri–Sun"
              icon={<CalendarClock className="h-4 w-4" />}
              description="Keep your listing close to the top across the weekend peak when locals are browsing."
              bestFor="Events, experiences, trades, and seasonal offers."
            />
            <BoostTypeCard
              title="Business spotlight"
              subtitle="Multi-day"
              icon={<Users className="h-4 w-4" />}
              description="Boost your business profile across ManxHive discovery sections and relevant pages."
              bestFor="Brand awareness and long-term local presence."
            />
          </div>

          <p className="mt-4 text-[11px] text-slate-600">
            We&apos;ll always show boosted content clearly and keep placements
            fair for all providers on the island.
          </p>
        </div>

        {/* Practical tips / CTA */}
        <div className="flex flex-col gap-4">
          <div className="rounded-3xl border bg-slate-900 text-slate-50 p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-300" />
              <h3 className="text-xs font-semibold uppercase tracking-wide text-white/80">
                Make boosts count
              </h3>
            </div>
            <ul className="mt-3 space-y-1.5 text-[11px] text-slate-200/90">
              <li>• Use your best photos and a clear, simple title.</li>
              <li>
                • Time boosts for evenings and weekends when traffic typically
                rises.
              </li>
              <li>
                • Keep pricing and availability up to date to convert views into
                enquiries.
              </li>
              <li>
                • Refresh long-running listings so they feel current and
                relevant.
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-800 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  How it works
                </p>
                <p className="mt-1 text-sm font-semibold">
                  Pick your boost, pay once via PayPal
                </p>
              </div>
              <CreditCardIcon />
            </div>
            <ol className="mt-3 space-y-1.5 text-[11px] text-slate-600">
              <li>1. Choose what you want to boost — listing, deal, or business.</li>
              <li>2. Select the number of boost days and complete the PayPal payment.</li>
              <li>3. Your boost goes live immediately — no waiting, no approval needed.</li>
            </ol>
            <div className="mt-3">
              <Link
                href="/provider-dashboard"
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#D90429] hover:underline"
              >
                Go to your dashboard to boost
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ-ish strip */}
      <section className="rounded-3xl border bg-slate-50 p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-3 text-[11px] text-slate-700">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Will boosting affect organic results?
            </p>
            <p className="mt-2">
              Organic relevance still matters. Boosts temporarily improve your
              placement but don&apos;t remove other providers from view.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Is there a subscription?
            </p>
            <p className="mt-2">
              No. ManxHive is completely free to use. Boosts are one-time
              payments only — you pay for exactly what you need, when you need
              it.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              How do I see what worked?
            </p>
            <p className="mt-2">
              Your provider dashboard shows enquiries and key metrics. We&apos;ll
              keep expanding analytics so you can see how boosts perform over
              time.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

// ----------------- Helper components -----------------

type BoostTypeCardProps = {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  description: string;
  bestFor: string;
};

function BoostTypeCard({
  title,
  subtitle,
  icon,
  description,
  bestFor,
}: BoostTypeCardProps) {
  return (
    <div className="flex flex-col rounded-2xl border bg-slate-50 px-4 py-3 text-[11px] text-slate-800">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/5">
            {icon}
          </div>
          <p className="text-[12px] font-semibold text-slate-900">{title}</p>
        </div>
        <span className="rounded-full bg-slate-900/5 px-2 py-0.5 text-[10px] font-medium text-slate-700">
          {subtitle}
        </span>
      </div>
      <p className="mt-2 text-[11px] text-slate-600">{description}</p>
      <p className="mt-2 text-[10px] text-slate-500">
        <span className="font-semibold text-slate-700">Best for:</span>{" "}
        {bestFor}
      </p>
    </div>
  );
}

function CreditCardIcon() {
  return (
    <div className="flex h-9 w-14 items-center justify-center rounded-xl bg-slate-900 text-slate-50">
      <div className="flex h-6 w-10 flex-col justify-between rounded-lg bg-slate-800 p-1 text-[7px]">
        <div className="flex items-center justify-between">
          <span className="h-2 w-3 rounded-sm bg-[#D90429]" />
          <span className="h-1 w-4 rounded-sm bg-slate-600" />
        </div>
        <div className="h-1 w-6 rounded-sm bg-slate-600" />
      </div>
    </div>
  );
}