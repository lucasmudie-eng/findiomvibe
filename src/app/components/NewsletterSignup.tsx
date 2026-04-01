"use client";

import { useState } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Failed");
      }
      setStatus("success");
      setMessage("You’re on the list. Weekly digest incoming.");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage("Could not subscribe. Please try again.");
    }
  };

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
    >
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-900">
          Weekly digest
        </p>
        <p className="text-xs text-slate-500">
          Top events, deals, and community highlights — once a week.
        </p>
      </div>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm focus:border-[#D90429] focus:outline-none focus:ring-1 focus:ring-[#D90429] sm:w-[220px]"
          required
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center justify-center rounded-full bg-[#D90429] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#b40320] disabled:opacity-70"
        >
          {status === "loading" ? "Joining..." : "Join"}
        </button>
      </div>
      {message && (
        <p
          className={`text-xs ${
            status === "success" ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
