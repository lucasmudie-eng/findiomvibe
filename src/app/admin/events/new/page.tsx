// src/app/admin/events/new/page.tsx
"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Calendar, MapPin, Ticket, Sparkles } from "lucide-react";

type EventCategory = "family" | "sports" | "nightlife" | "community" | "other";

const CATEGORY_LABELS: Record<EventCategory, string> = {
  family: "Family & Kids",
  sports: "Sports",
  nightlife: "Nightlife & Music",
  community: "Community & Culture",
  other: "Other",
};

export default function AdminNewEventPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [form, setForm] = useState({
    title: "",
    category: "other" as EventCategory,
    venue: "",
    starts_at: "",
    ends_at: "",
    summary: "",
    description: "",
    image_url: "",
    ticket_url: "",
    featured: false,
    approved: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  function handleChange(
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const target =
      e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

    const { name, value, type } = target;
    const nextValue =
      type === "checkbox"
        ? (target as HTMLInputElement).checked
        : value;

    setForm((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessId(null);

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!form.starts_at) {
      setError("Start date/time is required.");
      return;
    }

    setSubmitting(true);
    try {
      // Convert datetime-local to ISO
      const startsIso = new Date(form.starts_at).toISOString();
      const endsIso = form.ends_at ? new Date(form.ends_at).toISOString() : null;

      const { data, error: insertError } = await supabase
        .from("events")
        .insert({
          title: form.title.trim(),
          category: form.category,
          venue: form.venue.trim() || null,
          starts_at: startsIso,
          ends_at: endsIso,
          summary: form.summary.trim() || null,
          description: form.description.trim() || null,
          image_url: form.image_url.trim() || null,
          ticket_url: form.ticket_url.trim() || null,
          featured: form.featured,
          approved: form.approved,
        })
        .select("id")
        .maybeSingle();

      if (insertError) {
        console.error("[admin/new-event] insert error", insertError);
        setError(insertError.message || "Failed to create event.");
        return;
      }

      if (data?.id) {
        setSuccessId(data.id as string);
        // optional redirect straight to event page
        // router.push(`/whats-on/${data.id}`);
      }
    } catch (err: any) {
      console.error("[admin/new-event] unexpected error", err);
      setError("Unexpected error creating event.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      {/* Simple guard: this is obviously not secure security, just a reminder */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        This page is intended for internal use only. Make sure it isn&apos;t
        linked publicly. We can wire proper admin checks later.
      </div>

      <nav className="text-xs text-gray-500">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        /{" "}
        <Link href="/whats-on" className="hover:underline">
          What&apos;s On
        </Link>{" "}
        / <span className="text-gray-800">Add event</span>
      </nav>

      <header className="flex items-center justify-between gap-2">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF6F6] px-2 py-1 text-[10px] font-medium text-[#D90429]">
            <Sparkles className="h-3 w-3" />
            Internal tool
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900">
            Add new event
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Creates an event that will appear on the What&apos;s On page and
            homepage previews.
          </p>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm text-sm"
      >
        {/* Title */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-gray-700">
            Title
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]/40"
            placeholder="Port Erin Fireworks Night"
            required
          />
        </div>

        {/* Category & venue */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">
              Category
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]/40"
            >
              {(Object.keys(CATEGORY_LABELS) as EventCategory[]).map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">
              Venue / location
            </label>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <input
                name="venue"
                value={form.venue}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]/40"
                placeholder="Port Erin Beach"
              />
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">
              Starts at
            </label>
            <input
              type="datetime-local"
              name="starts_at"
              value={form.starts_at}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]/40"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">
              Ends at (optional)
            </label>
            <input
              type="datetime-local"
              name="ends_at"
              value={form.ends_at}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]/40"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-gray-700">
            Short summary
          </label>
          <input
            name="summary"
            value={form.summary}
            onChange={handleChange}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]/40"
            placeholder="Family-friendly fireworks and food stalls on the promenade."
          />
          <p className="text-[10px] text-gray-400">
            Shown on the listing cards and homepage.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-gray-700">
            Full description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]/40"
            placeholder="Longer description, schedule, parking info, anything useful."
          />
        </div>

        {/* Media & ticket URL */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">
              Image URL
            </label>
            <input
              name="image_url"
              value={form.image_url}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]/40"
              placeholder="https://picsum.photos/seed/event/800/400"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">
              Ticket URL (optional)
            </label>
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-gray-400" />
              <input
                name="ticket_url"
                value={form.ticket_url}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]/40"
                placeholder="https://… (Eventbrite, organiser site, etc.)"
              />
            </div>
            <p className="text-[10px] text-gray-400">
              If set, users will see a &quot;Buy tickets&quot; button that
              opens this link.
            </p>
          </div>
        </div>

        {/* Flags */}
        <div className="flex flex-wrap gap-4 text-xs">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="featured"
              checked={form.featured}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-[#D90429] focus:ring-[#D90429]"
            />
            <span>Featured pick</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="approved"
              checked={form.approved}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-[#D90429] focus:ring-[#D90429]"
            />
            <span>Approved / visible on site</span>
          </label>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        {successId && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            <span>Event created.</span>
            <Link
              href={`/whats-on/${successId}`}
              className="font-semibold underline"
            >
              View event page →
            </Link>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center rounded-full bg-[#D90429] px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#b80321] disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Create event"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/whats-on")}
            className="text-xs text-gray-500 hover:underline"
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}