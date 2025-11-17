"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Stub behaviour – replace with API / email integration later
    setSent(true);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <nav className="mb-2 text-xs text-gray-500">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        / <span>Contact</span>
      </nav>

      <section className="space-y-3 rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">
          Contact support
        </h1>
        <p className="text-sm text-gray-600">
          Having an issue with your listing, approvals, or account? Use the form
          below and we&apos;ll get back to you.
        </p>
      </section>

      <section className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
        {sent ? (
          <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
            Thanks — your message has been recorded (in this demo, nothing is
            actually sent). Wire this up to your support inbox or API when
            you&apos;re ready.
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">
              Your name
            </label>
            <input
              required
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="Name"
              name="name"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">
              Your email
            </label>
            <input
              type="email"
              required
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="you@example.com"
              name="email"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">
              What do you need help with?
            </label>
            <textarea
              required
              className="min-h-[120px] w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="Tell us about the issue, the listing, or the account."
              name="message"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-[#D90429] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b50322]"
          >
            Send message
          </button>
        </form>

        <p className="text-[10px] text-gray-500">
          This demo form currently doesn&apos;t send real emails. Connect it to your
          support system (Supabase function, email API, etc.) when ready.
        </p>
      </section>
    </main>
  );
}