// src/components/LeadForm.tsx
"use client";

import { useState } from "react";

type Props = {
  providerId?: string | null;
  listingSlug?: string | null;
  categorySlug?: string | null;
  compact?: boolean;
};

export default function LeadForm({ providerId, listingSlug, categorySlug, compact }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle"|"sending"|"ok"|"error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email: email || undefined,
        phone: phone || undefined,
        message: message || undefined,
        categorySlug: categorySlug || undefined,
        providerId: providerId || undefined,
        listingId: listingSlug || undefined,
      }),
    });

    if (res.ok) {
      setStatus("ok");
      setName(""); setEmail(""); setPhone(""); setMessage("");
    } else {
      const j = await res.json().catch(() => ({}));
      setError(j?.error ?? "Something went wrong");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className={compact ? "grid grid-cols-1 gap-3" : "grid grid-cols-2 gap-3"}>
        <input
          className="rounded-md border p-2"
          placeholder="Your name*"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="rounded-md border p-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="rounded-md border p-2"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <textarea
        className="w-full rounded-md border p-2"
        placeholder="What do you need?"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={compact ? 3 : 4}
      />
      <button
        disabled={status === "sending"}
        className="rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-60"
      >
        {status === "sending" ? "Sending..." : "Send enquiry"}
      </button>
      {status === "ok" && <p className="text-sm text-green-700">Thanks! We’ve sent your enquiry.</p>}
      {status === "error" && <p className="text-sm text-red-700">{error}</p>}
      <p className="text-xs text-gray-500">We’ll pass your details to the provider only.</p>
    </form>
  );
}