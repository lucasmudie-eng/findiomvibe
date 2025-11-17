"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import Link from "next/link";

export default function SignupPage() {
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    setErr(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErr(error.message);
      setBusy(false);
      return;
    }

    // Create profile row
    const userId = data.user?.id;
    if (userId) {
      await supabase.from("profiles").insert({
        id: userId,
        display_name: name || email,
      });
    }

    setMsg("Account created. Check your email to confirm, then log in.");
    setBusy(false);
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Sign up</h1>
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">Name</label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Display name"
          />
        </div>
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
          {busy ? "Creating account..." : "Sign up"}
        </button>
        {msg && <p className="text-sm text-emerald-600">{msg}</p>}
        {err && <p className="text-sm text-red-600">{err}</p>}
      </form>
      <p className="mt-4 text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="text-[#D90429] hover:underline">
          Log in
        </Link>
      </p>
    </main>
  );
}