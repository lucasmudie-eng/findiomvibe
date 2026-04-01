"use client";

import { useState, FormEvent } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function ProviderHelpPage() {
  const supabase = supabaseBrowser();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    businessName: "",
    name: "",
    email: "",
    topic: "",
    listingUrl: "",
    message: "",
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

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please include your name, email and a short message.");
      return;
    }

    try {
      setLoading(true);

      const { error: insertError } = await supabase
        .from("provider_help_requests")
        .insert({
          business_name: form.businessName || null,
          name: form.name.trim(),
          email: form.email.trim(),
          topic: form.topic || null,
          listing_url: form.listingUrl || null,
          message: form.message.trim(),
          source: "manxhive_header_form",
        });

      if (insertError) {
        console.error(insertError);
        setError("Could not send your message. Please try again.");
        return;
      }

      setSuccess(
        "Thanks — your message has been sent to the team. We’ll reply by email."
      );
      setForm({
        businessName: "",
        name: "",
        email: "",
        topic: "",
        listingUrl: "",
        message: "",
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
        Provider help centre
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        For anything around listings, dashboards or issues with ManxHive. This
        goes straight to the team, not a bot.
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
              Business / organisation
            </label>
            <input
              name="businessName"
              value={form.businessName}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
              placeholder="If this is about a specific business"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">
              Your name *
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-800">
              Topic
            </label>
            <select
              name="topic"
              value={form.topic}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
            >
              <option value="">Select</option>
              <option value="listings">Listings & changes</option>
              <option value="billing">Billing / invoices</option>
              <option value="technical">Technical issue</option>
              <option value="feedback">Feedback / ideas</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-800">
              Relevant ManxHive link (optional)
            </label>
            <input
              name="listingUrl"
              value={form.listingUrl}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
              placeholder="Paste a listing / dashboard URL if it helps"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-800">
              How can we help? *
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={5}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429]"
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
            {loading ? "Sending…" : "Send message"}
          </button>
        </div>
      </form>
    </main>
  );
}