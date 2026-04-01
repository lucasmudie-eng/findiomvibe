// src/app/list-community-event/page.tsx
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function ListCommunityEventPage() {
  const supabase = supabaseBrowser();

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    title: "",
    location: "",
    datetime: "",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      title: form.title.trim(),
      location: form.location.trim() || null,
      datetime_text: form.datetime.trim() || null,
      description: form.description.trim() || null,
      contact_name: form.name.trim(),
      contact_email: form.email.trim(),
      status: "pending",
    };

    const { error: insertError } = await supabase
      .from("community_events")
      .insert(payload);

    if (insertError) {
      console.error(insertError);
      setError("Could not submit event. Please try again.");
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setForm({
      name: "",
      email: "",
      title: "",
      location: "",
      datetime: "",
      description: "",
    });
    setLoading(false);
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-4 text-xs text-slate-500">
        <Link href="/">Home</Link> / <span>List a community event</span>
      </nav>

      <section className="rounded-3xl border bg-white px-6 py-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">
          List a community event
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Tell us about free/low-cost community events. We’ll review and publish.
        </p>
      </section>

      <section className="mt-6 rounded-3xl border bg-white px-6 py-6 shadow-sm">
        {submitted && (
          <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-xs text-emerald-900">
            Thank you — we’ll review your event shortly.
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-900">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-semibold">Your name</label>
            <input
              required
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border px-3 py-2"
            />
          </div>

          <div>
            <label className="text-xs font-semibold">Email</label>
            <input
              required
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border px-3 py-2"
            />
          </div>

          <div>
            <label className="text-xs font-semibold">Event name</label>
            <input
              required
              name="title"
              value={form.title}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border px-3 py-2"
            />
          </div>

          <div>
            <label className="text-xs font-semibold">Location</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border px-3 py-2"
            />
          </div>

          <div>
            <label className="text-xs font-semibold">Date / time</label>
            <input
              name="datetime"
              value={form.datetime}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border px-3 py-2"
            />
          </div>

          <div>
            <label className="text-xs font-semibold">Description</label>
            <textarea
              required
              rows={5}
              name="description"
              value={form.description}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border px-3 py-2"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-[#D90429] px-5 py-2 text-sm font-semibold text-white"
          >
            {loading ? "Submitting…" : "Submit event"}
          </button>
        </form>
      </section>
    </main>
  );
}