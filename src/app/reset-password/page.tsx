"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const supabaseRef = useRef(supabaseBrowser());
  const supabase = supabaseRef.current!;
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const init = async () => {
      try {
        setChecking(true);
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          const code = url.searchParams.get("code");
          const hashParams = new URLSearchParams(
            window.location.hash.replace(/^#/, "")
          );
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");

          if (code) {
            await supabase.auth.exchangeCodeForSession(code);
          } else if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
          }
        }
        if (!active) return;
        setReady(true);
      } catch (e) {
        if (!active) return;
        setErr("We couldn't validate this reset link. Please request a new one.");
      } finally {
        if (active) setChecking(false);
      }
    };

    init();
    return () => {
      active = false;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    setErr(null);

    if (password.length < 8) {
      setErr("Please use a password of at least 8 characters.");
      setBusy(false);
      return;
    }

    if (password !== confirm) {
      setErr("Passwords do not match.");
      setBusy(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setErr(error.message);
      setBusy(false);
      return;
    }

    setMsg("Password updated. You can now log in.");
    setBusy(false);
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-4 text-xl font-semibold text-gray-900">
        Reset your password
      </h1>
      <p className="mb-6 text-sm text-gray-600">
        Set a new password for your ManxHive account.
      </p>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">
            New password
          </label>
          <input
            type="password"
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={!ready}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">
            Confirm new password
          </label>
          <input
            type="password"
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            disabled={!ready}
          />
        </div>
        <button
          disabled={busy || checking || !ready}
          className="w-full rounded-lg bg-[#D90429] px-3 py-2 text-sm font-semibold text-white hover:bg-[#b50322] disabled:opacity-50"
        >
          {busy ? "Updating..." : "Update password"}
        </button>
        {checking && (
          <p className="text-sm text-gray-500">Validating reset link…</p>
        )}
        {msg && <p className="text-sm text-emerald-600">{msg}</p>}
        {err && <p className="text-sm text-red-600">{err}</p>}
      </form>

      <p className="mt-4 text-sm text-gray-600">
        Remembered your password?{" "}
        <Link href="/login" className="text-[#D90429] hover:underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
