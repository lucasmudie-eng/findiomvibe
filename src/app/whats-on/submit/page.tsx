// src/app/whats-on/submit/page.tsx

"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Loader2, Sparkles } from "lucide-react";

type EventCategory = "family" | "sports" | "nightlife" | "community" | "other";

const CATEGORY_OPTIONS: { value: EventCategory; label: string }[] = [
  { value: "family", label: "Family & Kids" },
  { value: "sports", label: "Sports" },
  { value: "nightlife", label: "Nightlife & Music" },
  { value: "community", label: "Community & Culture" },
  { value: "other", label: "Other" },
];

type RecurrenceFrequency = "weekly" | "monthly" | "daily" | "other";

const RECURRENCE_OPTIONS: { value: RecurrenceFrequency; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "daily", label: "Daily" },
  { value: "other", label: "Other / custom" },
];

export default function SubmitEventPage() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRecurringChecked, setIsRecurringChecked] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const organiserName = String(formData.get("organiserName") || "").trim();
    const organiserEmail = String(formData.get("organiserEmail") || "").trim();
    const title = String(formData.get("title") || "").trim();
    const category = (formData.get("category") || "other") as EventCategory;
    const venue = String(formData.get("venue") || "").trim();
    const startsDate = String(formData.get("startsDate") || "").trim();
    const startsTime = String(formData.get("startsTime") || "").trim();
    const endsDate = String(formData.get("endsDate") || "").trim();
    const ticketUrl = String(formData.get("ticketUrl") || "").trim();
    const summary = String(formData.get("summary") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const imageUrl = String(formData.get("imageUrl") || "").trim();

    const isRecurring = formData.get("isRecurring") === "on";
    const recurrenceFrequency = String(
      formData.get("recurrenceFrequency") || ""
    ).trim();
    const recurrenceNotes = String(
      formData.get("recurrenceNotes") || ""
    ).trim();

    if (!title || !venue || !startsDate) {
      setErrorMessage("Title, venue and start date are required.");
      return;
    }

    const starts_at_iso = buildIso(startsDate, startsTime || "00:00");
    const ends_at_iso = endsDate ? buildIso(endsDate, "23:59") : null;

    // Build payload for the API route – keys must match route.ts
    const payload = new FormData();
    payload.set("title", title);
    payload.set("venue", venue);
    payload.set("category", category);
    payload.set("starts_at", starts_at_iso);
    if (ends_at_iso) payload.set("ends_at", ends_at_iso);
    if (summary) payload.set("summary", summary);
    if (description) payload.set("description", description);
    if (ticketUrl) payload.set("ticket_url", ticketUrl);
    if (imageUrl) payload.set("image_url", imageUrl);

    if (organiserName) payload.set("organiser_name", organiserName);
    if (organiserEmail) payload.set("organiser_email", organiserEmail);

    payload.set("recurring", isRecurring ? "true" : "false");
    if (isRecurring && recurrenceFrequency) {
      payload.set("recurring_frequency", recurrenceFrequency);
    }
    if (isRecurring && recurrenceNotes) {
      payload.set("recurring_notes", recurrenceNotes);
    }

    setLoading(true);
    try {
      const res = await fetch("/api/events/submit", {
        method: "POST",
        body: payload,
      });

      if (!res.ok) {
        let message =
          "There was a problem submitting your event. Please try again or email us directly.";

        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {
          // ignore JSON parse errors, keep default message
        }

        setErrorMessage(message);
        return;
      }

      // Success
      form.reset();
      setIsRecurringChecked(false);
      setSuccessMessage(
        "Thanks – your event has been submitted. We’ll review it and publish it on What’s On if approved."
      );
    } catch (err) {
      console.error("[submit-event] unexpected error:", err);
      setErrorMessage(
        "Unexpected error submitting your event. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="mb-1 text-xs text-gray-500">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        /{" "}
        <Link href="/whats-on" className="hover:underline">
          What&apos;s On
        </Link>{" "}
        / <span className="text-gray-800">Submit an event</span>
      </nav>

      {/* Header */}
      <header className="rounded-2xl border bg-white p-5 shadow-sm space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF6F6] px-2 py-1 text-[10px] font-medium text-[#D90429]">
          <Sparkles className="h-3 w-3" />
          List your event on ManxHive
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Submit an event
        </h1>
        <p className="text-sm text-gray-600">
          Send us your event, fixture or community moment. We&apos;ll review it
          and, if approved, add it to the What&apos;s On guide.
        </p>
        <p className="text-[11px] text-gray-400">
          This form is for one-off and recurring events. For long-term listings
          or advertising,{" "}
          <Link
            href="/contact"
            className="font-medium text-[#D90429] hover:underline"
          >
            get in touch
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
        >
          {showForm ? "Hide event form" : "Open event form"}
        </button>
      </header>

      {/* Form */}
      {showForm && (
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            {/* Organiser */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Your name
                </label>
                <input
                  name="organiserName"
                  type="text"
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]"
                  placeholder="Name of organiser or contact"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Email for queries
                </label>
                <input
                  name="organiserEmail"
                  type="email"
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]"
                  placeholder="We’ll contact you here if needed"
                />
              </div>
            </div>

            {/* Title + venue */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Event title *
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]"
                  placeholder="Port Erin Fireworks Night"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Venue / location *
                </label>
                <input
                  name="venue"
                  type="text"
                  required
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]"
                  placeholder="Port Erin Beach"
                />
              </div>
            </div>

            {/* Category + ticket URL */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Category
                </label>
                <select
                  name="category"
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Ticket / booking URL
                </label>
                <input
                  name="ticketUrl"
                  type="url"
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]"
                  placeholder="https://…"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Start date *{" "}
                  <span className="text-[10px] text-gray-400">
                    (first date if recurring)
                  </span>
                </label>
                <input
                  name="startsDate"
                  type="date"
                  required
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Start time
                </label>
                <input
                  name="startsTime"
                  type="time"
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  End date (optional)
                </label>
                <input
                  name="endsDate"
                  type="date"
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]"
                />
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Event image URL
              </label>
              <input
                name="imageUrl"
                type="url"
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]"
                placeholder="https://… (poster or photo)"
              />
              <p className="mt-1 text-[10px] text-gray-400">
                Use a direct link to a poster or image (we’ll show this on the
                listing and detail page).
              </p>
            </div>

            {/* Recurring controls */}
            <div className="space-y-2 rounded-xl border bg-slate-50 px-3 py-3">
              <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
                <input
                  type="checkbox"
                  name="isRecurring"
                  checked={isRecurringChecked}
                  onChange={(e) => setIsRecurringChecked(e.target.checked)}
                  className="h-3 w-3 rounded border-gray-300 text-[#D90429] focus:ring-[#D90429]"
                />
                This is a recurring event
              </label>

              {isRecurringChecked && (
                <div className="grid gap-3 sm:grid-cols-[minmax(0,200px),1fr]">
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-gray-700">
                      Frequency
                    </label>
                    <select
                      name="recurrenceFrequency"
                      className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]"
                      defaultValue="weekly"
                    >
                      {RECURRENCE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-gray-700">
                      Notes about recurrence
                    </label>
                    <input
                      name="recurrenceNotes"
                      type="text"
                      className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]"
                      placeholder="E.g. Every Thursday until March, first Sunday of the month, etc."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Summary */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Short summary (shown in list) *
              </label>
              <input
                name="summary"
                type="text"
                required
                maxLength={200}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]"
                placeholder="One or two sentences about the event."
              />
              <p className="mt-1 text-[10px] text-gray-400">
                Aim for around 1–2 sentences.
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Full description
              </label>
              <textarea
                name="description"
                rows={5}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]"
                placeholder="Anything else useful – timings, age limits, parking, accessibility, etc."
              />
            </div>

            {/* Status messages */}
            {successMessage && (
              <div className="rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                {errorMessage}
              </div>
            )}

            {/* Submit */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full bg-[#D90429] px-4 py-2 text-xs font-semibold text-white hover:bg-[#b80321] disabled:opacity-60"
              >
                {loading && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                {loading ? "Submitting…" : "Submit event"}
              </button>
              <p className="text-[10px] text-gray-400">
                We aim to review submissions within 1–2 working days.
              </p>
            </div>
          </form>
        </section>
      )}
    </main>
  );
}

function buildIso(dateStr: string, timeStr: string) {
  // dateStr = YYYY-MM-DD, timeStr = HH:MM
  return new Date(`${dateStr}T${timeStr}:00`).toISOString();
}