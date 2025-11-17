"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";

type Profile = {
  id: string;
  display_name?: string | null;
  is_admin?: boolean | null;
  plan?: string | null;
  max_boosts?: number | null;
  max_listings?: number | null;
};

type MyListing = {
  id: string;
  title: string;
  category: string;
  approved: boolean;
  boosted: boolean;
  date_listed: string;
};

export default function AccountPage() {
  const supabase = supabaseBrowser();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<MyListing[]>([]);
  const [enquiriesCount, setEnquiriesCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const [resetBusy, setResetBusy] = useState(false);
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [upgradeBusy, setUpgradeBusy] = useState(false);
  const [upgradeMsg, setUpgradeMsg] = useState<string | null>(null);

  const btnBase =
    "inline-flex items-center justify-center rounded-full h-10 px-5 text-sm font-semibold transition-colors select-none";
  const btnPrimary = `${btnBase} bg-[#D90429] text-white hover:bg-[#b50322]`;
  const btnSecondary = `${btnBase} border border-slate-300 text-slate-800 bg-white hover:bg-slate-50`;
  const btnAccent = `${btnBase} border border-rose-200 text-[#B91C1C] bg-rose-50 hover:bg-rose-100`;
  const btnAdmin = `${btnBase} border border-slate-300 text-slate-700 bg-slate-50 hover:bg-slate-100`;

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);

      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser();

      if (authErr) {
        console.error(authErr);
        setError("Could not check your session.");
        setLoading(false);
        return;
      }

      if (!user) {
        const next = encodeURIComponent("/account");
        window.location.href = `/login?next=${next}`;
        return;
      }

      const { data: profileRow } = await supabase
        .from("profiles")
        .select("id, display_name, is_admin, plan, max_boosts, max_listings")
        .eq("id", user.id)
        .maybeSingle();

      const displayName = profileRow?.display_name || user.email || "Your account";
      const profileData: Profile = {
        id: user.id,
        display_name: displayName,
        is_admin: profileRow?.["is_admin"] ?? false,
        plan: (profileRow?.["plan"] as string) ?? "standard",
        max_boosts: profileRow?.["max_boosts"] ?? 1,
        max_listings: profileRow?.["max_listings"] ?? 10,
      };
      setProfile(profileData);

      const { data: listingsData, error: lErr } = await supabase
        .from("marketplace_listings")
        .select("id, title, category, approved, boosted, date_listed")
        .eq("seller_user_id", user.id)
        .order("date_listed", { ascending: false });

      if (lErr) {
        console.error(lErr);
        setError("Could not load your listings.");
      }
      setListings(
        (listingsData || []).map((l: any) => ({
          id: l.id,
          title: l.title,
          category: l.category,
          approved: l.approved,
          boosted: l.boosted,
          date_listed: l.date_listed,
        }))
      );

      const { count, error: eErr } = await supabase
        .from("marketplace_enquiries")
        .select("id", { count: "exact", head: true })
        .eq("seller_user_id", user.id);

      if (!eErr && typeof count === "number") setEnquiriesCount(count);
      setLoading(false);
    })();
    // ✅ no deps — prevents flicker/loop from new client identity each render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogout() {
    setLogoutBusy(true);
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  async function handlePasswordReset() {
    setResetBusy(true);
    setResetMsg(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      setResetMsg("No email found for your account.");
      setResetBusy(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/login`,
    });

    setResetMsg(
      error ? error.message : "If that email exists, a reset link has been sent."
    );
    setResetBusy(false);
  }

  async function startUpgrade(plan: "premium" | "pro") {
    try {
      setUpgradeBusy(true);
      setUpgradeMsg(null);

      const res = await fetch("/api/billing/save-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.url) window.location.href = data.url;
      else setUpgradeMsg(data?.error || "Could not start checkout.");
    } catch (e) {
      console.error(e);
      setUpgradeMsg("Something went wrong starting your upgrade.");
    } finally {
      setUpgradeBusy(false);
    }
  }

  if (loading)
    return (
      <main className="mx-auto max-w-4xl px-4 py-12">
        <p className="text-sm text-gray-600">Loading your account…</p>
      </main>
    );

  if (!profile)
    return (
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-xl font-semibold text-gray-900">Account</h1>
        <p className="mt-2 text-sm text-gray-600">
          You need to log in to view this page.
        </p>
        <Link href="/login" className={btnPrimary}>
          Log in / Sign up
        </Link>
      </main>
    );

  const totalListings = listings.length;
  const approvedListings = listings.filter((l) => l.approved).length;
  const pendingListings = listings.filter((l) => !l.approved).length;
  const planLabel =
    profile.plan === "premium" ? "Premium" : profile.plan === "pro" ? "Pro" : "Standard";
  const canUpgrade = profile.plan !== "pro";

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Header */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-[260px]">
            <h1 className="text-2xl font-semibold text-slate-900">
              {profile.display_name}
            </h1>
            <p className="mt-1 text-slate-600">
              Manage your marketplace presence and activity.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium ${
                  planLabel === "Premium" || planLabel === "Pro"
                    ? "bg-gradient-to-r from-[#D90429] to-orange-400 text-white"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                Plan: {planLabel}
              </span>
              <span className="text-slate-500">
                • Listings {totalListings} • Approved {approvedListings} •{" "}
                Pending {pendingListings} • Enquiries {enquiriesCount}
              </span>
              {Boolean(profile.is_admin) && (
                <span className="ml-1 inline-flex items-center rounded-full bg-slate-900 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-white">
                  ADMIN
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {canUpgrade && (
              <div className="flex gap-2">
                {profile.plan === "standard" && (
                  <>
                    <button
                      onClick={() => startUpgrade("premium")}
                      disabled={upgradeBusy}
                      className={btnPrimary}
                    >
                      {upgradeBusy ? "Starting…" : "Upgrade to Premium"}
                    </button>
                    <button
                      onClick={() => startUpgrade("pro")}
                      disabled={upgradeBusy}
                      className={btnAccent}
                    >
                      Go Pro
                    </button>
                  </>
                )}
                {profile.plan === "premium" && (
                  <button
                    onClick={() => startUpgrade("pro")}
                    disabled={upgradeBusy}
                    className={btnAccent}
                  >
                    Go Pro
                  </button>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={handlePasswordReset} disabled={resetBusy} className={btnSecondary}>
                {resetBusy ? "Sending…" : "Reset password"}
              </button>
              <button onClick={handleLogout} disabled={logoutBusy} className={btnSecondary}>
                {logoutBusy ? "Logging out…" : "Log out"}
              </button>
            </div>
            {resetMsg && <div className="text-xs text-slate-600 text-right">{resetMsg}</div>}
            {upgradeMsg && <div className="text-xs text-rose-600 text-right">{upgradeMsg}</div>}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "LISTINGS", value: totalListings, color: "text-slate-900" },
          { label: "APPROVED", value: approvedListings, color: "text-emerald-600" },
          { label: "PENDING", value: pendingListings, color: "text-amber-600" },
          { label: "ENQUIRIES", value: enquiriesCount, color: "text-[#D90429]" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border bg-white p-4 shadow-sm flex flex-col gap-1"
          >
            <div className="text-[11px] tracking-wide text-slate-500">{s.label}</div>
            <div className={`text-2xl font-semibold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </section>

      {/* Quick actions */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Quick actions</h2>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/marketplace/create" className={btnPrimary}>
            Create new listing
          </Link>
          <Link href="/account/enquiries" className={btnAccent}>
            View your enquiries
          </Link>
          <Link href="/deals/create" className={btnSecondary}>
            Submit a deal
          </Link>
        </div>

        {Boolean(profile.is_admin) && (
          <>
            <div className="my-5 h-px w-full bg-slate-200" />
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/marketplace" className={btnAdmin}>
                Admin: marketplace approvals
              </Link>
              <Link href="/admin/deals" className={btnAdmin}>
                Admin: deals approvals
              </Link>
              <Link href="/admin/businesses-approvals" className={btnAdmin}>
                Admin: businesses approvals
              </Link>
            </div>
          </>
        )}
      </section>

      {/* Listings */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900">My marketplace listings</h3>
          <Link
            href="/marketplace/create"
            className="text-sm font-semibold text-[#D90429] hover:underline"
          >
            + New listing
          </Link>
        </div>

        {error && <p className="mb-2 text-sm text-rose-600">{error}</p>}
        {listings.length === 0 && !error && (
          <p className="text-sm text-slate-600">You haven’t created any listings yet.</p>
        )}

        <ul className="space-y-3">
          {listings.map((l) => (
            <li
              key={l.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm hover:shadow transition-shadow"
            >
              <div className="min-w-0">
                <div className="truncate font-medium text-slate-900">{l.title}</div>
                <div className="text-xs text-slate-500">
                  {new Date(l.date_listed).toLocaleDateString("en-GB")} • {l.category}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`text-[11px] rounded-full px-2.5 py-0.5 font-semibold tracking-wide ${
                    l.approved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {l.approved ? "Approved" : "Pending"}
                </span>
                {l.boosted && (
                  <span className="text-[11px] rounded-full px-2.5 py-0.5 font-semibold tracking-wide bg-purple-50 text-purple-700">
                    Boosted
                  </span>
                )}
                <Link
                  href={`/marketplace/item/${l.id}`}
                  className="text-[13px] font-semibold text-[#D90429] hover:underline"
                >
                  View
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border bg-white p-5 text-sm text-slate-600 shadow-sm">
        Need help with approvals, listings or billing?{" "}
        <Link href="/contact" className="font-semibold text-[#D90429] hover:underline">
          Contact support
        </Link>
        .
      </section>
    </main>
  );
}