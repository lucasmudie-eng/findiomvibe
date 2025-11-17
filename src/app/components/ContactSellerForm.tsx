"use client";

import { useState } from "react";

export default function ContactSellerForm({ listingId, seller }: { listingId: string; seller: string }) {
  const [name, setName] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setOk(null);
    setErr(null);

    try {
      const res = await fetch("/api/marketplace/enquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ listingId, seller, name, replyTo, message }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to send");
      setOk("Enquiry sent to the seller. They’ll reply via your email or in-app.");
      setName(""); setReplyTo(""); setMessage("");
    } catch (e: any) {
      setErr(e.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-900">Your name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#D90429]"
          placeholder="Jane Doe"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-900">Your email (for replies)</label>
        <input
          type="email"
          value={replyTo}
          onChange={(e) => setReplyTo(e.target.value)}
          required
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#D90429]"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-900">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#D90429]"
          placeholder="Hi, is this still available? Can you do £120 and meet in Douglas?"
        />
      </div>

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-[#D90429] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#b50322] disabled:opacity-50"
      >
        {busy ? "Sending..." : "Send enquiry"}
      </button>

      {ok && <p className="text-sm text-emerald-600">{ok}</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}

      <p className="text-xs text-gray-500">
        We don’t share your email publicly. The seller will receive your message in their inbox and can reply to you.
      </p>
    </form>
  );
}