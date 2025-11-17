"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    setErr(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErr(error.message);
    } else {
      setMsg("Logged in. You can close this tab or go to your account.");
      window.location.href = "/account";
    }

    setBusy(false);
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Log in</h1>
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">Email</label>
          <input
            type="email"
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">Password</label>
          <input
            type="password"
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          disabled={busy}
          className="w-full rounded-lg bg-[#D90429] px-3 py-2 text-sm font-semibold text-white hover:bg-[#b50322] disabled:opacity-50"
        >
          {busy ? "Logging in..." : "Log in"}
        </button>
        {msg && <p className="text-sm text-emerald-600">{msg}</p>}
        {err && <p className="text-sm text-red-600">{err}</p>}
      </form>
      <p className="mt-4 text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-[#D90429] hover:underline">
          Sign up
        </Link>
      </p>
    </main>
  );
}