// src/app/list-event/page.tsx
"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { ArrowLeft, Calendar } from "lucide-react";

const IOM_AREAS = [
  "Douglas", "Peel", "Ramsey", "Castletown", "Port Erin", "Port St Mary",
  "Onchan", "Laxey", "Kirk Michael", "Ballaugh", "St Johns", "Foxdale",
  "Andreas", "Bride", "Jurby", "Crosby", "Union Mills", "Baldrine", "Other",
];

export default function ListEventPage() {
  const supabase = supabaseBrowser();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    category: "",
    location: "",
    area: "",
    startDate: "",
    endDate: "",
    priceFrom: "",
    website: "",
    summary: "",
    description: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });

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

    if (
      !form.title.trim() ||
      !form.location.trim() ||
      !form.contactEmail.trim()
    ) {
      setError(
        "Please complete at least the event name, location and contact email."
      );
      return;
    }

    if (!form.startDate) {
      setError("Please add a start date & time.");
      return;
    }

    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const startsAtIso = new Date(form.startDate).toISOString();
      const endsAtIso = form.endDate
        ? new Date(form.endDate).toISOString()
        : null;

      // normalize ticket/website url
      const ticketUrl =
        form.website.trim() &&
        !/^https?:\/\//i.test(form.website.trim())
          ? `https://${form.website.trim()}`
          : form.website.trim();

      // Pack price + phone into description so we don't lose them
      const extraBits: string[] = [];
      if (form.priceFrom.trim()) extraBits.push(`Price from: ${form.priceFrom.trim()}`);
      if (form.contactPhone.trim()) extraBits.push(`Contact phone: ${form.contactPhone.trim()}`);

      let finalDescription = form.description.trim() || "";
      if (extraBits.length) {
        finalDescription =
          (finalDescription ? `${finalDescription}\n\n` : "") +
          extraBits.join("\n");
      }

      const venueLocation = form.location.trim();

      const { error: insertError } = await supabase.from("events").insert({
        title: form.title.trim(),
        category: form.category || null,
        location: venueLocation,
        venue: venueLocation,
        area: form.area || null,

        starts_at: startsAtIso,
        ends_at: endsAtIso,

        summary: form.summary.trim() || null,
        description: finalDescription || null,
        ticket_url: ticketUrl || null,

        organiser_name: form.contactName.trim() || null,
        organiser_email: form.contactEmail.trim(),

        submitted_by: user?.id ?? null,

        approved: false,
        featured: false,
        is_recurring: false,
        recurrence_frequency: null,
        recurrence_notes: null,
      });

      if (insertError) {
        console.error(insertError);
        setError(
          insertError.message || "Could not submit your event. Please try again."
        );
        return;
      }

      setSuccess(
        "Thanks — your event has been submitted. The team will review it before publishing."
      );

      setForm({
        title: "",
        category: "",
        location: "",
        area: "",
        startDate: "",
        endDate: "",
        priceFrom: "",
        website: "",
        summary: "",
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

  const inputCls = "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]";
  const selectCls = `${inputCls} bg-white`;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">

      {/* Hero header */}
      <div className="relative mb-6 overflow-hidden rounded-3xl bg-slate-950 px-7 py-8 text-white shadow-md">
        <div className="pointer-events-none absolute -left-8 -top-8 h-36 w-36 rounded-full bg-[#D90429]/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-28 w-28 rounded-full bg-slate-700/30 blur-2xl" />
        <div className="relative">
          <Link
            href="/whats-on"
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to What&apos;s On
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D90429]/20">
              <Calendar className="h-4 w-4 text-[#D90429]" />
            </div>
            <h1 className="font-playfair text-2xl font-bold sm:text-3xl">
              Submit an event<span className="text-[#D90429]">.</span>
            </h1>
          </div>
          <p className="mt-2 max-w-xl text-sm text-slate-300">
            Share gigs, community meet-ups, sports fixtures and more. We review
            all submissions before they go live on ManxHive.
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
          <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
            {success}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-800">
              Event name *
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className={inputCls}
              placeholder="e.g. Peel Sunset Run, Laxey Craft Market"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">
              Category
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className={selectCls}
            >
              <option value="">Select category</option>
              <option value="music">Music &amp; nightlife</option>
              <option value="family">Family &amp; kids</option>
              <option value="sport">Sport &amp; fitness</option>
              <option value="culture">Culture &amp; heritage</option>
              <option value="community">Community</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">
              Area / town
            </label>
            <select
              name="area"
              value={form.area}
              onChange={handleChange}
              className={selectCls}
            >
              <option value="">Select area</option>
              {IOM_AREAS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-800">
              Venue / location *
            </label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className={inputCls}
              placeholder="Venue name and address"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">
              Start date &amp; time *
            </label>
            <input
              type="datetime-local"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className={inputCls}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">
              End date &amp; time
            </label>
            <input
              type="datetime-local"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              className={inputCls}
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
              className={inputCls}
              placeholder="e.g. Free, £5, Donation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">
              Website / booking link
            </label>
            <input
              name="website"
              value={form.website}
              onChange={handleChange}
              className={inputCls}
              placeholder="https://"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-800">
              Short summary *
            </label>
            <input
              name="summary"
              value={form.summary}
              onChange={handleChange}
              maxLength={200}
              className={inputCls}
              placeholder="One or two sentences shown in the events list"
              required
            />
            <p className="mt-1 text-[11px] text-slate-400">Shown as the preview text in the What&apos;s On listing. Keep it to 1–2 sentences.</p>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-800">
              Full description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className={inputCls}
              placeholder="Timings, what to expect, age limits, parking, accessibility…"
            />
          </div>

          <div className="sm:col-span-2 border-t border-slate-100 pt-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Contact details
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Not shown publicly — we&apos;ll use this to follow up if needed.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">
              Contact name
            </label>
            <input
              name="contactName"
              value={form.contactName}
              onChange={handleChange}
              className={inputCls}
              placeholder="Your name"
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
              className={inputCls}
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
              className={inputCls}
              placeholder="+44…"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center rounded-full bg-[#D90429] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#b40320] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Submitting…" : "Submit event →"}
          </button>
        </div>
      </form>
    </main>
  );
}
