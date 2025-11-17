"use client";

import Link from "next/link";
import { useRef, useState } from "react";

type ActiveForm = "boost" | "ads" | null;

export default function PromotePage() {
  const [activeForm, setActiveForm] = useState<ActiveForm>(null);
  const boostRef = useRef<HTMLDivElement | null>(null);
  const adsRef = useRef<HTMLDivElement | null>(null);

  const openForm = (type: ActiveForm) => {
    setActiveForm(type);

    // Slight delay so the DOM has rendered before scrolling
    setTimeout(() => {
      if (type === "boost" && boostRef.current) {
        boostRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      if (type === "ads" && adsRef.current) {
        adsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
  };

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#D90429]">
          Promote on ManxHive
        </p>
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
          Get your business or campaign in front of the island.
        </h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Use this page to enquire about homepage features, boosted listings, or
          advertising across ManxHive. Choose the option that fits you best and
          send us a quick brief.
        </p>
      </section>

      {/* Two main options */}
      <section className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Boost business */}
        <div className="rounded-3xl border border-slate-100 bg-white px-6 py-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Boost my business profile
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Homepage &quot;Featured business&quot; slots and boosted directory
            visibility for launches, offers or awareness campaigns.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-600">
            <li>Featured business strip on the homepage</li>
            <li>Optional boosted placement in provider / business sections</li>
            <li>Short-term or ongoing campaigns</li>
          </ul>
          <button
            type="button"
            onClick={() => openForm("boost")}
            className="mt-4 inline-flex items-center rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800"
          >
            Enquire about boosting →
          </button>
        </div>

        {/* Advertising */}
        <div className="rounded-3xl border border-slate-100 bg-white px-6 py-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Homepage &amp; site-wide advertising
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Display slots, sponsored content and branded placements across the
            site and within relevant sections.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-600">
            <li>Homepage promo banners and tiles</li>
            <li>Section-specific placements (sports, what&apos;s on, marketplace)</li>
            <li>Longer-term campaigns and brand awareness</li>
          </ul>
          <button
            type="button"
            onClick={() => openForm("ads")}
            className="mt-4 inline-flex items-center rounded-full bg-[#D90429] px-5 py-2 text-xs font-semibold text-white hover:bg-[#b40320]"
          >
            Enquire about advertising →
          </button>
        </div>
      </section>

      {/* Little hint */}
      {activeForm === null && (
        <p className="mt-6 text-xs text-slate-500">
          Choose an option above to open a simple enquiry form.
        </p>
      )}

      {/* Boost business form */}
      {activeForm === "boost" && (
        <section ref={boostRef} className="mt-12">
          <h2 className="text-xl font-semibold text-slate-900">
            Enquiry: Boost my business profile
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Tell us a bit about your business and what you&apos;d like to boost.
          </p>

          <form
            className="mt-5 space-y-4 rounded-3xl border border-slate-100 bg-white px-6 py-6 shadow-sm"
            action="mailto:lucasmudie@gmail.com"
            method="post"
            encType="text/plain"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Your name
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Business name
                </label>
                <input
                  name="business_name"
                  type="text"
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Website / social (optional)
                </label>
                <input
                  name="website"
                  type="text"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700">
                What would you like to boost?
              </label>
              <textarea
                name="boost_details"
                required
                rows={4}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]"
                placeholder="E.g. feature us as 'Featured business' for 4 weeks, highlight our new offer, etc."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Approximate budget (per month)
                </label>
                <input
                  name="budget"
                  type="text"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]"
                  placeholder="e.g. £100–£300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Preferred start date
                </label>
                <input
                  name="start_date"
                  type="text"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]"
                  placeholder="e.g. 1st Feb or ASAP"
                />
              </div>
            </div>

            <input
              type="hidden"
              name="enquiry_type"
              value="boost_business_profile"
            />

            <button
              type="submit"
              className="mt-2 inline-flex items-center rounded-full bg-slate-900 px-6 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              Send enquiry
            </button>
          </form>
        </section>
      )}

      {/* Advertising form */}
      {activeForm === "ads" && (
        <section ref={adsRef} className="mt-12">
          <h2 className="text-xl font-semibold text-slate-900">
            Enquiry: Homepage &amp; site-wide advertising
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Share your campaign idea and we&apos;ll come back with options and pricing.
          </p>

          <form
            className="mt-5 space-y-4 rounded-3xl border border-slate-100 bg-white px-6 py-6 shadow-sm"
            action="mailto:lucasmudie@gmail.com"
            method="post"
            encType="text/plain"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Your name
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Business / organisation
                </label>
                <input
                  name="business_name"
                  type="text"
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Website / social (optional)
                </label>
                <input
                  name="website"
                  type="text"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700">
                What are you looking to advertise?
              </label>
              <textarea
                name="campaign_details"
                required
                rows={4}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]"
                placeholder="E.g. homepage banner for 6 weeks, section-specific ads for sports & deals, etc."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Approximate budget (total)
                </label>
                <input
                  name="budget"
                  type="text"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]"
                  placeholder="e.g. £300–£1,000"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Ideal dates / timeframe
                </label>
                <input
                  name="timeframe"
                  type="text"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]"
                  placeholder="e.g. March–April, or specific dates"
                />
              </div>
            </div>

            <input
              type="hidden"
              name="enquiry_type"
              value="homepage_sitewide_advertising"
            />

            <button
              type="submit"
              className="mt-2 inline-flex items-center rounded-full bg-[#D90429] px-6 py-2 text-xs font-semibold text-white hover:bg-[#b40320]"
            >
              Send enquiry
            </button>
          </form>

          <p className="mt-3 text-xs text-slate-500">
            By submitting this form, you&apos;re sending an email enquiry. We&apos;ll
            reply with options, availability and pricing.
          </p>
        </section>
      )}

      {/* Back link */}
      <section className="mt-10">
        <Link
          href="/"
          className="text-xs font-medium text-[#D90429] hover:underline"
        >
          ← Back to homepage
        </Link>
      </section>
    </main>
  );
}