"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

const PREFS_KEY = "manxhive_push_prefs_v1";

type PushPrefs = {
  events: boolean;
  deals: boolean;
  community: boolean;
  heritage: boolean;
};

const DEFAULT_PREFS: PushPrefs = {
  events: true,
  deals: true,
  community: true,
  heritage: false,
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushPreferences() {
  const supabase = supabaseBrowser();
  const [enabled, setEnabled] = useState(false);
  const [prefs, setPrefs] = useState<PushPrefs>(DEFAULT_PREFS);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(PREFS_KEY);
      if (raw) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }, [prefs]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => {
        setEnabled(!!subscription);
      })
      .catch(() => setEnabled(false));
  }, []);

  const subscribe = async () => {
    if (!publicKey) {
      setStatus("Missing VAPID public key.");
      return;
    }

    setBusy(true);
    setStatus(null);

    try {
      const registration = await navigator.serviceWorker.register("/push-sw.js");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const {
        data: { user },
      } = await supabase.auth.getUser();

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription,
          preferences: prefs,
          userId: user?.id ?? null,
        }),
      });

      setEnabled(true);
      setStatus("Push notifications enabled.");
    } catch (err) {
      console.error("[push] subscribe failed", err);
      setStatus("Could not enable push notifications.");
    } finally {
      setBusy(false);
    }
  };

  const unsubscribe = async () => {
    setBusy(true);
    setStatus(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }

      setEnabled(false);
      setStatus("Push notifications disabled.");
    } catch (err) {
      console.error("[push] unsubscribe failed", err);
      setStatus("Could not disable push notifications.");
    } finally {
      setBusy(false);
    }
  };

  const toggle = () => {
    if (busy) return;
    if (enabled) {
      unsubscribe();
    } else {
      subscribe();
    }
  };

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Push notifications
          </h3>
          <p className="text-xs text-slate-500">
            Get alerts for new events, deals, and community updates.
          </p>
        </div>
        <button
          onClick={toggle}
          disabled={busy || !publicKey}
          className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold transition ${
            enabled
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-900 text-white"
          } ${busy || !publicKey ? "opacity-60" : ""}`}
        >
          {enabled ? "Enabled" : "Enable"}
        </button>
      </div>

      {!publicKey && (
        <p className="mt-3 text-[11px] text-amber-600">
          Add NEXT_PUBLIC_VAPID_PUBLIC_KEY to enable push.
        </p>
      )}

      <div className="mt-4 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
        {(
          [
            ["events", "Events"],
            ["deals", "Deals"],
            ["community", "Community"],
            ["heritage", "Heritage & walks"],
          ] as const
        ).map(([key, label]) => (
          <label
            key={key}
            className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"
          >
            <span>{label}</span>
            <input
              type="checkbox"
              checked={prefs[key]}
              onChange={(e) =>
                setPrefs((prev) => ({ ...prev, [key]: e.target.checked }))
              }
            />
          </label>
        ))}
      </div>

      {status && <p className="mt-3 text-[11px] text-slate-500">{status}</p>}
    </div>
  );
}
