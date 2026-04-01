// src/app/account/billing/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";

type Tier = "free" | "plus" | "pro";

type ProfileTier = {
  tier: Tier;
  tier_started_at: string | null;
  tier_expires_at: string | null;
};

export default function AccountBillingResultPage() {
  const supabaseRef = useRef(supabaseBrowser());
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileTier | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"success" | "cancelled" | "unknown">(
    "unknown"
  );

  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("status");
    if (s === "success" || s === "cancelled") {
      setStatus(s);
    } else {
      setStatus("unknown");
    }
  }, []);

  useEffect(() => {
    const supabase = supabaseRef.current;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const {
          data: { user },
          error: userErr,
        } = await supabase!.auth.getUser();

        if (userErr) throw userErr;
        if (!user) {
          setProfile(null);
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("tier, tier_started_at, tier_expires_at")
          .eq("id", user.id)
          .maybeSingle<ProfileTier>();

        if (error) {
          console.error("[billing] profile fetch error:", error.message);
          setProfile(null);
        } else {
          setProfile(
            data ?? {
              tier: "free",
              tier_started_at: null,
              tier_expires_at: null,
            }
          );
        }
      } catch (err) {
        console.error("[billing] unexpected:", err);
        setProfile(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const currentTier = profile?.tier ?? "free";

  const title =
    status === "success"
      ? "Payment complete"
      : status === "cancelled"
      ? "Checkout cancelled"
      : "Billing status";

  const desc =
    status === "success"
      ? "Your payment has been processed. If your tier hasn't updated yet, it'll refresh shortly once PayPal confirms everything."
      : status === "cancelled"
      ? "No charges have been made. You can restart the upgrade flow at any time."
      : "We couldn't determine the status of your last checkout.";

  return (
    <main className="mx-auto max-w-xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border bg-white p-6 text-sm text-slate-700 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          {status === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          ) : status === "cancelled" ? (
            <AlertCircle className="h-5 w-5 text-amber-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-500" />
          )}
          <h1 className="text-base font-semibold text-slate-900">{title}</h1>
        </div>
        <p className="text-sm text-slate-600">{desc}</p>

        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
          <p className="font-semibold text-slate-900">Current plan</p>
          {loading ? (
            <p className="mt-1 text-slate-500">Checking your plan…</p>
          ) : profile ? (
            <>
              <p className="mt-1">
                <span className="font-medium">Tier:</span>{" "}
                <span className="uppercase">{currentTier}</span>
              </p>
              {profile.tier_started_at && (
                <p className="mt-1">
                  <span className="font-medium">Started:</span>{" "}
                  {new Date(profile.tier_started_at).toLocaleDateString("en-GB")}
                </p>
              )}
              {profile.tier_expires_at && (
                <p className="mt-1">
                  <span className="font-medium">Renews / expires:</span>{" "}
                  {new Date(profile.tier_expires_at).toLocaleDateString("en-GB")}
                </p>
              )}
            </>
          ) : (
            <p className="mt-1 text-slate-500">
              We couldn&apos;t load your profile. Try refreshing this page.
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-wrap justify-between gap-2">
          <Link
            href="/provider-dashboard"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to dashboard
          </Link>
          <Link
            href="/account/upgrade"
            className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            Manage plan
          </Link>
        </div>
      </div>
    </main>
  );
}
