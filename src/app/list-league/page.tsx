// src/app/list-league/page.tsx
"use client";

import { useMemo, useState, FormEvent } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

/** helpers */
function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ListLeaguePage() {
  const supabase = supabaseBrowser();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    sport: "",
    area: "",
    homeVenue: "",
    ageGroups: "",
    competitions: "",
    website: "",
    lookingFor: "",
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

    if (!form.name.trim() || !form.sport.trim() || !form.contactEmail.trim()) {
      setError(
        "Please complete at least the club / league name, sport and contact email."
      );
      return;
    }

    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Normalise website
      const website =
        form.website.trim() &&
        !/^https?:\/\//i.test(form.website.trim())
          ? `https://${form.website.trim()}`
          : form.website.trim();

      // Merge all non-column form fields into description
      const descParts: string[] = [];

      if (form.homeVenue.trim())
        descParts.push(`Home venue: ${form.homeVenue.trim()}`);
      if (form.ageGroups.trim())
        descParts.push(`Teams / age groups: ${form.ageGroups.trim()}`);
      if (form.competitions.trim())
        descParts.push(`Competitions: ${form.competitions.trim()}`);
      if (form.lookingFor.trim())
        descParts.push(`Looking for: ${form.lookingFor.trim()}`);

      const description =
        descParts.length > 0 ? descParts.join("\n") : null;

      const payload = {
        name: form.name.trim(),
        slug, // MUST NOT be null
        sport_type: form.sport.trim(),
        area: form.area.trim() || null,

        organiser_name: form.contactName.trim() || null,
        organiser_email: form.contactEmail.trim(),
        organiser_phone: form.contactPhone.trim() || null,

        season_info: null,
        description,
        website: website || null,

        status: "pending",
        submitted_by: user?.id ?? null,
      };

      const { error: insertError } = await supabase
        .from("leagues")
        .insert(payload);

      if (insertError) {
        console.error(insertError);
        setError(
          insertError.message ||
            "Could not submit your league / club. Please try again."
        );
        return;
      }

      setSuccess(
        "Thanks — your league / club details have been submitted. We’ll review and add them into the sports hub."
      );

      // Reset form
      setForm({
        name: "",
        sport: "",
        area: "",
        homeVenue: "",
        ageGroups: "",
        competitions: "",
        website: "",
        lookingFor: "",
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
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-0">
      <h1 className="text-2xl font-semibold text-slate-900">
        List a league / club
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Add full club or league info so players, parents and fans can actually
        find you.
      </p>

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
              Club / league name *
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
              placeholder="e.g. Peel AFC, IOM Netball League"
              required
            />
            {slug && (
              <p className="mt-1 text-xs text-slate-500">Slug: {slug}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">
              Sport *
            </label>
            <input
              name="sport"
              value={form.sport}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
              placeholder="e.g. Football, Netball, Hockey"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">
              Area / base
            </label>
            <input
              name="area"
              value={form.area}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
              placeholder="e.g. Douglas, West, Island-wide"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-800">
              Home ground / venue
            </label>
            <input
              name="homeVenue"
              value={form.homeVenue}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
              placeholder="e.g. Peel Football Ground, NSC"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-800">
              Age groups / teams
            </label>
            <input
              name="ageGroups"
              value={form.ageGroups}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
              placeholder="e.g. U8, U10, U12, Senior Men, Senior Women"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-800">
              Competitions / leagues
            </label>
            <input
              name="competitions"
              value={form.competitions}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
              placeholder="Which league(s) or cups do you play in?"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-800">
              Website / socials
            </label>
            <input
              name="website"
              value={form.website}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
              placeholder="Club website or main social link"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-800">
              Currently looking for…
            </label>
            <textarea
              name="lookingFor"
              value={form.lookingFor}
              onChange={handleChange}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
              placeholder="e.g. New players, coaches, referees, volunteers"
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
            {loading ? "Submitting…" : "Submit league / club"}
          </button>
        </div>
      </form>
    </main>
  );
}