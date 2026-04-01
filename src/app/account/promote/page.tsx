// src/app/promote/page.tsx
"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

type EnquiryType = "boost-business" | "advertising";

export default function PromotePage() {
  const [openForm, setOpenForm] = useState<EnquiryType | null>(null);

  const [boostForm, setBoostForm] = useState({
    name: "",
    email: "",
    businessName: "",
    message: "",
  });

  const [adsForm, setAdsForm] = useState({
    name: "",
    email: "",
    campaignGoal: "",
    budget: "",
    message: "",
  });

  function toggleForm(type: EnquiryType) {
    setOpenForm((prev) => (prev === type ? null : type));
  }

  function handleBoostSubmit(e: FormEvent) {
    e.preventDefault();

    // For now we route to contact with prefilled context.
    const qs = new URLSearchParams({
      type: "boost-business",
      name: boostForm.name,
      email: boostForm.email,
      business: boostForm.businessName,
      message: boostForm.message,
    }).toString();

    window.location.href = `/contact?${qs}`;
  }

  function handleAdsSubmit(e: FormEvent) {
    e.preventDefault();

    const qs = new URLSearchParams({
      type: "advertising",
      name: adsForm.name,
      email: adsForm.email,
      goal: adsForm.campaignGoal,
      budget: adsForm.budget,
      message: adsForm.message,
    }).toString();

    window.location.href = `/contact?${qs}`;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#D90429]">
          Promote on ManxHive
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-slate-900 sm:text-5xl">
          Get your business or campaign in front of the island.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-slate-700">
          Use this page to enquire about homepage features, boosted listings, or
          advertising across ManxHive. Choose the option that fits you best and
          send us a quick brief.
        </p>
      </div>

      <section className="grid gap-6 md:grid-cols-2">
        {/* Boost business card */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Boost my business profile
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Homepage &quot;Featured business&quot; slots and boosted directory
            visibility for launches, offers or awareness campaigns.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            <li>• Featured business strip on the homepage</li>
            <li>• Optional boosted placement in provider / business sections</li>
            <li>• Short-term or ongoing campaigns</li>
          </ul>

          <button
            onClick={() => toggleForm("boost-business")}
            className="mt-6 inline-flex items-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Enquire about boosting →
          </button>

          {openForm === "boost-business" && (
            <form
              onSubmit={handleBoostSubmit}
              className="mt-5 space-y-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
                  placeholder="Your name"
                  value={boostForm.name}
                  onChange={(e) =>
                    setBoostForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
                <input
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
                  placeholder="Email"
                  type="email"
                  value={boostForm.email}
                  onChange={(e) =>
                    setBoostForm((f) => ({ ...f, email: e.target.value }))
                  }
                  required
                />
              </div>

              <input
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                placeholder="Business name"
                value={boostForm.businessName}
                onChange={(e) =>
                  setBoostForm((f) => ({
                    ...f,
                    businessName: e.target.value,
                  }))
                }
                required
              />

              <textarea
                className="min-h-[110px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                placeholder="What are you trying to promote, and for how long?"
                value={boostForm.message}
                onChange={(e) =>
                  setBoostForm((f) => ({ ...f, message: e.target.value }))
                }
                required
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full bg-[#D90429] px-5 py-2 text-sm font-semibold text-white hover:bg-[#b50322]"
                >
                  Send enquiry →
                </button>
                <button
                  type="button"
                  onClick={() => setOpenForm(null)}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                This will open Contact with your brief pre-filled.
              </p>
            </form>
          )}
        </div>

        {/* Advertising card */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Homepage &amp; site-wide advertising
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Display slots, sponsored content and branded placements across the
            site and within relevant sections.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            <li>• Homepage promo banners and tiles</li>
            <li>• Section-specific placements (sports, what&apos;s on, marketplace)</li>
            <li>• Longer-term campaigns and brand awareness</li>
          </ul>

          <button
            onClick={() => toggleForm("advertising")}
            className="mt-6 inline-flex items-center rounded-full bg-[#D90429] px-5 py-2 text-sm font-semibold text-white hover:bg-[#b50322]"
          >
            Enquire about advertising →
          </button>

          {openForm === "advertising" && (
            <form
              onSubmit={handleAdsSubmit}
              className="mt-5 space-y-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
                  placeholder="Your name"
                  value={adsForm.name}
                  onChange={(e) =>
                    setAdsForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
                <input
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
                  placeholder="Email"
                  type="email"
                  value={adsForm.email}
                  onChange={(e) =>
                    setAdsForm((f) => ({ ...f, email: e.target.value }))
                  }
                  required
                />
              </div>

              <input
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                placeholder="Campaign goal (e.g. awareness, sales, event turnout)"
                value={adsForm.campaignGoal}
                onChange={(e) =>
                  setAdsForm((f) => ({ ...f, campaignGoal: e.target.value }))
                }
                required
              />

              <input
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                placeholder="Approx budget / timeframe"
                value={adsForm.budget}
                onChange={(e) =>
                  setAdsForm((f) => ({ ...f, budget: e.target.value }))
                }
              />

              <textarea
                className="min-h-[110px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                placeholder="Tell us what you want to run and where."
                value={adsForm.message}
                onChange={(e) =>
                  setAdsForm((f) => ({ ...f, message: e.target.value }))
                }
                required
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full bg-[#D90429] px-5 py-2 text-sm font-semibold text-white hover:bg-[#b50322]"
                >
                  Send enquiry →
                </button>
                <button
                  type="button"
                  onClick={() => setOpenForm(null)}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                This will open Contact with your brief pre-filled.
              </p>
            </form>
          )}
        </div>
      </section>

      <div className="mt-8">
        <Link href="/" className="text-sm font-semibold text-[#D90429] hover:underline">
          ← Back to homepage
        </Link>
      </div>
    </main>
  );
}