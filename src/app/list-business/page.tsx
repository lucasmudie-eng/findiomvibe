// src/app/list-business/page.tsx
"use client";

import { useState } from "react";

export default function ListBusinessPage() {
  const [form, setForm] = useState({
    businessName: "",
    category: "",
    contactName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_type: "provider-signup",
          business_name: form.businessName,
          category: form.category,
          name: form.contactName,
          email: form.email,
          phone: form.phone,
          message: form.message || "New provider signup",
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("ok");
      setForm({
        businessName: "",
        category: "",
        contactName: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-gray-900">List your business on ManxHive</h1>
      <p className="mt-2 text-gray-700">
        Fill this out and we’ll get you set up. You’ll appear in search and receive enquiries from local customers.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Business name</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={form.businessName}
              onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="e.g. Cleaners"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact name</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={form.contactName}
              onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Anything else?</label>
            <textarea
              rows={4}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            />
          </div>
        </div>

        <button
          className="rounded-lg bg-[#D90429] px-4 py-2 font-medium text-white hover:bg-[#BF0323] disabled:opacity-60"
          disabled={status === "sending"}
        >
          {status === "sending" ? "Sending…" : "Submit"}
        </button>

        {status === "ok" && (
          <p className="text-sm text-green-700">Thanks — we’ll be in touch to complete your listing.</p>
        )}
        {status === "error" && (
          <p className="text-sm text-red-700">Sorry — something went wrong. Please try again.</p>
        )}
      </form>
    </main>
  );
}