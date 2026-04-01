// src/app/list-sport/page.tsx
"use client";

import { useMemo, useState, FormEvent } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { ArrowLeft, Dumbbell } from "lucide-react";

/** helpers */
function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ListSportPage() {
  const supabase = supabaseBrowser();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    sportType: "",
    venue: "",
    area: "",
    audience: "",
    schedule: "",
    priceFrom: "",
    website: "",
    description: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });

  const slug = useMemo(
    () => (form.name ? slugify(form.name) : ""),
    [form.name]
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.name.trim() || !form.venue.trim() || !form.contactEmail.trim()) {
      setError(
        "Please fill in at least the session name, venue and contact email."
      );
      return;
    }

    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Normalize website to include protocol if user omitted it
      const website =
        form.website.trim() &&
        !/^https?:\/\//i.test(form.website.trim())
          ? `https://${form.website.trim()}`
          : form.website.trim();

      // Merge audience into description (no dedicated column yet)
      const descParts: string[] = [];
      if (form.description.trim()) descParts.push(form.description.trim());
      if (form.audience.trim()) descParts.push(`Audience: ${form.audience.trim()}`);
      const mergedDescription = descParts.join("\n\n");

      const payload = {
        name: form.name.trim(),
        slug, // NOT NULL in DB
        sport_type: form.sportType.trim() || null,
        area: form.area.trim() || null,
        venue: form.venue.trim(), // required

        description: mergedDescription || null,
        schedule_info: form.schedule.trim() || null,
        cost_info: form.priceFrom.trim() || null,
        website: website || null,

        contact_name: form.contactName.trim() || null,
        contact_email: form.contactEmail.trim(),
        contact_phone: form.contactPhone.trim() || null,

        status: "pending",
        submitted_by: user?.id ?? null,
      };

      const { error: insertError } = await supabase
        .from("sports")
        .insert(payload);

      if (insertError) {
        console.error(insertError);
        setError(
          insertError.message ||
            "Could not submit your sport / class. Please try again."
        );
        return;
      }

      setSuccess(
        "Thanks — your sport / class has been submitted. We’ll review it and get it live."
      );

      setForm({
        name: "",
        sportType: "",
        venue: "",
        area: "",
        audience: "",
        schedule: "",
        priceFrom: "",
        website: "",
        description: "",
        contactName: "",
        contactEmail: "",
        contactPhone: "",
      });
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">

      {/* Hero header */}
      <div className="relative mb-6 overflow-hidden rounded-3xl bg-slate-950 px-7 py-8 text-white shadow-md">
        <div className="pointer-events-none absolute -left-8 -top-8 h-36 w-36 rounded-full bg-[#D90429]/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-28 w-28 rounded-full bg-slate-700/30 blur-2xl" />
        <div className="relative">
          <Link
            href="/sports"
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Sports
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D90429]/20">
              <Dumbbell className="h-4 w-4 text-[#D90429]" />
            </div>
            <h1 className="font-playfair text-2xl font-bold sm:text-3xl">
              Submit a sport or class<span className="text-[#D90429]">.</span>
            </h1>
          </div>
          <p className="mt-2 max-w-xl text-sm text-slate-300">
            Add fitness classes, clubs and recurring activities. Once approved,
            they'll appear in the Sports section of ManxHive.
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-slate-300">
            Free to submit · Usually approved within 24 hours
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {success}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-800">
              Session / class name *
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
              placeholder="e.g. Peel 5-a-side, Beginners Yoga"
              required
            />
            {slug && (
              <p className="mt-1 text-xs text-slate-500">Slug: {slug}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">
              Sport / activity type
            </label>
            <input
              name="sportType"
              value={form.sportType}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
              placeholder="e.g. Football, Yoga, Boxing"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">
              Area / town
            </label>
            <input
              name="area"
              value={form.area}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
              placeholder="e.g. Douglas, Peel"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-800">
              Venue *
            </label>
            <input
              name="venue"
              value={form.venue}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
              placeholder="Sports centre, hall, pitch etc."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">
              Who is it for?
            </label>
            <input
              name="audience"
              value={form.audience}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
              placeholder="e.g. Adults, U12s, Mixed ability"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">
              Days & times
            </label>
            <input
              name="schedule"
              value={form.schedule}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
              placeholder="e.g. Tuesdays 7–8pm, Saturdays 10–11am"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">
              Price from
            </label>
            <input
              name="priceFrom"
              value={form.priceFrom}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
              placeholder="e.g. £5 per session"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">
              Website / booking
            </label>
            <input
              name="website"
              value={form.website}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
              placeholder="https://"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-800">
              Extra info
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
              placeholder="Equipment needed, parking, access, anything else useful."
            />
          </div>

          <div className="sm:col-span-2 border-t border-slate-100 pt-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Contact details
            </h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">
              Contact name
            </label>
            <input
              name="contactName"
              value={form.contactName}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">
              Contact email *
            </label>
            <input
              type="email"
              name="contactEmail"
              value={form.contactEmail}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-800">
              Contact phone (optional)
            </label>
            <input
              name="contactPhone"
              value={form.contactPhone}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
              placeholder="+44…"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center rounded-full bg-[#D90429] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#b40320] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Submitting…" : "Submit sport / class"}
          </button>
        </div>
      </form>
    </main>
  );
}