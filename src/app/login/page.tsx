"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import Link from "next/link";
import { Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    setErr(null);

    if (!supabase) {
      setErr("Login is temporarily unavailable. Please try again shortly.");
      setBusy(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErr(error.message);
      } else {
        setMsg("Logged in. Redirecting…");
        window.location.href = "/account";
      }
    } catch {
      setErr("Could not connect. Please check your internet connection and try again.");
    }

    setBusy(false);
  }

  async function onResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setResetBusy(true);
    setResetMsg(null);
    setErr(null);

    if (!email.trim()) {
      setErr("Please enter your email address first.");
      setResetBusy(false);
      return;
    }

    if (!supabase) {
      setResetMsg("Password reset is temporarily unavailable. Please try again shortly.");
      setResetBusy(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setResetMsg(
        error ? error.message : "If that email exists, a reset link has been sent."
      );
    } catch {
      setResetMsg("Could not connect. Please check your internet connection and try again.");
    }

    setResetBusy(false);
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12 sm:py-16">

      {/* Hero card */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-8 py-10 text-white shadow-md">
        <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[#D90429]/25 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-32 w-32 rounded-full bg-slate-700/30 blur-2xl" />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            ManxHive
          </p>
          <h1 className="mt-1 font-playfair text-3xl font-bold">
            Welcome back<span className="text-[#D90429]">.</span>
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Sign in to access your listings, enquiries and saved items.
          </p>
        </div>
      </div>

      {/* Form card */}
      <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                autoComplete="email"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#D90429]/50 focus:outline-none focus:ring-1 focus:ring-[#D90429]/30"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#D90429]/50 focus:outline-none focus:ring-1 focus:ring-[#D90429]/30"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {err && (
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {err}
            </p>
          )}
          {msg && (
            <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
              {msg}
            </p>
          )}

          <button
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#D90429] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#b50322] disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
            {!busy && <ArrowRight className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={() => { setResetMode((v) => !v); setResetMsg(null); }}
            className="w-full text-center text-xs font-semibold text-slate-500 hover:text-[#D90429] transition"
          >
            {resetMode ? "Hide password reset" : "Forgot your password?"}
          </button>
        </form>

        {/* Inline reset */}
        {resetMode && (
          <form
            onSubmit={onResetPassword}
            className="mt-5 space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-5"
          >
            <p className="text-xs text-slate-600">
              Enter your email above, then click to receive a secure reset link.
            </p>
            {resetMsg && (
              <p className="text-xs text-emerald-700">{resetMsg}</p>
            )}
            <button
              type="submit"
              disabled={resetBusy}
              className="w-full rounded-full bg-slate-900 py-2.5 text-xs font-semibold text-white transition hover:bg-black disabled:opacity-60"
            >
              {resetBusy ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}
      </div>

      <p className="mt-5 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-[#D90429] hover:underline">
          Sign up free
        </Link>
      </p>
    </main>
  );
}
