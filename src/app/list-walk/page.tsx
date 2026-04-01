// src/app/list-walk/page.tsx
"use client";

import { useMemo, useState, FormEvent } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { ArrowLeft, Footprints } from "lucide-react";

/** helpers */
function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ListWalkPage() {
  const supabase = supabaseBrowser();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    area: "",
    startLocation: "",
    distanceKm: "",
    durationMins: "",
    difficulty: "",
    routeType: "",
    terrain: "",
    description: "",
    bestFor: "",
    mapLink: "",
    contactName: "",
    contactEmail: "",
  });

  const slug = useMemo(
    () => (form.title ? slugify(form.title) : ""),
    [form.title]
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

    if (
      !form.title.trim() ||
      !form.startLocation.trim() ||
      !form.contactEmail.trim()
    ) {
      setError(
        "Please fill in at least the walk name, start point and contact email."
      );
      return;
    }

    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const distance =
        form.distanceKm.trim() !== "" ? Number(form.distanceKm) || null : null;
      const duration =
        form.durationMins.trim() !== ""
          ? Number(form.durationMins) || null
          : null;

      const routeTypeLower = (form.routeType || "").toLowerCase();
      const isLoop = routeTypeLower === "loop";
      const isCoastal = routeTypeLower === "coastal";

      // Build a single moderation-friendly description blob
      const baseDesc = form.description.trim();
      const extras: string[] = [];

      extras.push(`Start point / parking: ${form.startLocation.trim()}`);
      if (form.terrain.trim()) extras.push(`Terrain: ${form.terrain.trim()}`);
      if (form.contactName.trim())
        extras.push(`Submitted by: ${form.contactName.trim()}`);
      extras.push(`Contact email: ${form.contactEmail.trim()}`);

      const mergedDescription = [
        baseDesc || null,
        extras.join("\n"),
      ]
        .filter(Boolean)
        .join("\n\n");

      const payload = {
        name: form.title.trim(),
        slug, // NOT NULL in DB
        area: form.area.trim() || null,

        summary: form.bestFor.trim() || null,
        description: mergedDescription || null,

        distance_km: distance,
        duration_minutes: duration,
        difficulty: form.difficulty || null,

        loop: isLoop,
        coastal: isCoastal,

        alltrails_url: form.mapLink.trim() || null,

        status: "pending",
        submitted_by: user?.id ?? null,
      };

      const { error: insertError } = await supabase
        .from("walks")
        .insert(payload);

      if (insertError) {
        console.error(insertError);
        setError(
          insertError.message || "Could not submit your walk. Please try again."
        );
        return;
      }

      setSuccess(
        "Thanks — your walk route has been submitted for review. We’ll be in touch if we need anything else."
      );

      setForm({
        title: "",
        area: "",
        startLocation: "",
        distanceKm: "",
        durationMins: "",
        difficulty: "",
        routeType: "",
        terrain: "",
        description: "",
        bestFor: "",
        mapLink: "",
        contactName: "",
        contactEmail: "",
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
            href="/heritage"
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Heritage &amp; Walks
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D90429]/20">
              <Footprints className="h-4 w-4 text-[#D90429]" />
            </div>
            <h1 className="font-playfair text-2xl font-bold sm:text-3xl">
              Submit a walk<span className="text-[#D90429]">.</span>
            </h1>
          </div>
          <p className="mt-2 max-w-xl text-sm text-slate-300">
            Share your favourite Isle of Man loop or glen walk. Once approved,
            it will appear in the Heritage &amp; Walks section.
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
              Walk name *
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
              placeholder="e.g. Peel Hill sunset loop"
              required
            />
            {slug && (
              <p className="mt-1 text-xs text-slate-500">Slug: {slug}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">
              Area / region
            </label>
            <input
              name="area"
              value={form.area}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
              placeholder="e.g. Peel, North, South"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">
              Start point / parking *
            </label>
            <input
              name="startLocation"
              value={form.startLocation}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
              placeholder="Car park or landmark"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">
              Distance (km)
            </label>
            <input
              name="distanceKm"
              value={form.distanceKm}
              onChange={handleChange}
              type="number"
              step="0.1"
              min="0"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
              placeholder="e.g. 4.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">
              Duration (mins)
            </label>
            <input
              name="durationMins"
              value={form.durationMins}
              onChange={handleChange}
              type="number"
              min="0"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
              placeholder="e.g. 90"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">
              Difficulty
            </label>
            <select
              name="difficulty"
              value={form.difficulty}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
            >
              <option value="">Select</option>
              <option value="Easy">Easy</option>
              <option value="Moderate">Moderate</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">
              Route type
            </label>
            <select
              name="routeType"
              value={form.routeType}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
            >
              <option value="">Select</option>
              <option value="loop">Loop</option>
              <option value="out-and-back">Out and back</option>
              <option value="linear">Linear</option>
              <option value="coastal">Coastal</option>
              <option value="glen">Glen</option>
              <option value="summit">Summit</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-800">
              Terrain notes
            </label>
            <input
              name="terrain"
              value={form.terrain}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
              placeholder="e.g. grassy paths, rocky sections, stiles, steep ascent"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-800">
              Overview / key info
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
              placeholder="What makes this walk good? Any hazards or access notes?"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-800">
              Best for
            </label>
            <textarea
              name="bestFor"
              value={form.bestFor}
              onChange={handleChange}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
              placeholder="e.g. Dog-friendly sunset loop, family Sunday stretch, windy-day alternative"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-800">
              Map link (AllTrails / OS Maps / Google)
            </label>
            <input
              name="mapLink"
              value={form.mapLink}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
              placeholder="https://"
            />
          </div>

          <div className="sm:col-span-2 border-t border-slate-100 pt-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Contact details
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              These aren’t stored publicly — just for moderation follow-ups.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">
              Your name
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
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center rounded-full bg-[#D90429] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#b40320] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Submitting…" : "Submit walk"}
          </button>
        </div>
      </form>
    </main>
  );
}