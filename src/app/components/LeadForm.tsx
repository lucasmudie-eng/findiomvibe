// src/app/components/LeadForm.tsx
"use client";

import { useState } from "react";

type Props = {
  providerSlug: string;
  providerName: string;
};

export default function LeadForm({ providerSlug, providerName }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerSlug,
          providerName,
          name,
          email,
          message,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Request failed");
      }

      setStatus("ok");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "Something went wrong");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-2 space-y-3">
      <input
        className="w-full rounded-lg border px-3 py-2"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        className="w-full rounded-lg border px-3 py-2"
        placeholder="Your email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <textarea
        className="w-full rounded-lg border px-3 py-2"
        placeholder={`Message for ${providerName}`}
        rows={5}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
      />

      <button
        type="submit"
        className="w-full rounded-lg bg-[#D90429] px-4 py-2 font-medium text-white hover:bg-[#BF0323] disabled:opacity-60"
        disabled={status === "sending"}
      >
        {status === "sending" ? "Sending…" : "Send enquiry"}
      </button>

      {status === "ok" && (
        <p className="text-sm text-green-700">Thanks — your enquiry has been sent.</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-700">Sorry — {error}</p>
      )}
    </form>
  );
}