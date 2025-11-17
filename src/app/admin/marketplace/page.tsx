"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  Zap,
} from "lucide-react";

type AdminProfile = {
  id: string;
  is_admin: boolean;
  email?: string | null;
};

type AdminListing = {
  id: string;
  title: string;
  category: string | null;
  approved: boolean;
  boosted: boolean | null;
  date_listed: string | null;
  seller_user_id: string | null;
};

export default function AdminMarketplacePage() {
  const supabase = supabaseBrowser();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [pending, setPending] = useState<AdminListing[]>([]);
  const [live, setLive] = useState<AdminListing[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // ---------------- Load admin + listings ----------------
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);

      // 1) Auth
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser();

      if (authErr) {
        console.error("[admin/marketplace] auth error", authErr);
        setError("Could not verify your session.");
        setLoading(false);
        return;
      }

      if (!user) {
        const next = encodeURIComponent("/admin/marketplace");
        router.replace(`/login?next=${next}`);
        return;
      }

      // 2) Profile / admin flag
      const { data: profileRow, error: pErr } = await supabase
        .from("profiles")
        .select("id, is_admin")
        .eq("id", user.id)
        .maybeSingle();

      if (pErr) {
        console.error("[admin/marketplace] profile error", pErr);
        setError("Could not load your profile.");
        setLoading(false);
        return;
      }

      if (!profileRow?.is_admin) {
        // Not an admin
        setProfile({
          id: user.id,
          is_admin: false,
          email: user.email,
        });
        setLoading(false);
        return;
      }

      setProfile({
        id: user.id,
        is_admin: true,
        email: user.email,
      });

      // 3) Load listings: pending + live
      const { data: listings, error: lErr } = await supabase
        .from("marketplace_listings")
        .select(
          "id, title, category, approved, boosted, date_listed, seller_user_id"
        )
        .order("date_listed", { ascending: true });

      if (lErr) {
        console.error("[admin/marketplace] listings error", lErr);
        setError("Could not load marketplace listings.");
        setLoading(false);
        return;
      }

      const all = (listings || []) as AdminListing[];
      setPending(all.filter((l) => !l.approved));
      setLive(all.filter((l) => l.approved));
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------- Actions ----------------

  async function handleApprove(id: string) {
    try {
      setBusyId(id);
      setError(null);

      const { error } = await supabase
        .from("marketplace_listings")
        .update({ approved: true })
        .eq("id", id);

      if (error) {
        console.error("[admin/marketplace] approve error", error);
        setError("Could not approve listing.");
        return;
      }

      setPending((cur) => {
        const match = cur.find((l) => l.id === id);
        if (!match) return cur.filter((l) => l.id !== id);
        setLive((liveCur) => [{ ...match, approved: true }, ...liveCur]);
        return cur.filter((l) => l.id !== id);
      });
    } finally {
      setBusyId(null);
    }
  }

  async function handleToggleBoost(id: string, current: boolean | null) {
    try {
      setBusyId(id);
      setError(null);

      const nextBoosted = !current;

      const { error } = await supabase
        .from("marketplace_listings")
        .update({ boosted: nextBoosted })
        .eq("id", id);

      if (error) {
        console.error("[admin/marketplace] boost error", error);

        // If your DB trigger for plan limits raises a specific message, surface it:
        if (error.message && /Boost limit/i.test(error.message)) {
          setError(error.message);
        } else {
          setError("Could not update boosted status.");
        }
        return;
      }

      // Update in both lists if present
      setPending((cur) =>
        cur.map((l) =>
          l.id === id ? { ...l, boosted: nextBoosted } : l
        )
      );
      setLive((cur) =>
        cur.map((l) =>
          l.id === id ? { ...l, boosted: nextBoosted } : l
        )
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this listing? This cannot be undone.")) {
      return;
    }

    try {
      setBusyId(id);
      setError(null);

      const { error } = await supabase
        .from("marketplace_listings")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("[admin/marketplace] delete error", error);
        setError("Could not delete listing.");
        return;
      }

      setPending((cur) => cur.filter((l) => l.id !== id));
      setLive((cur) => cur.filter((l) => l.id !== id));
    } finally {
      setBusyId(null);
    }
  }

  // ---------------- UI states ----------------

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <p className="flex items-center gap-2 text-sm text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading admin panel…
        </p>
      </main>
    );
  }

  if (!profile?.is_admin) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 space-y-3">
        <h1 className="text-xl font-semibold text-gray-900">
          Admin access required
        </h1>
        <p className="text-sm text-gray-600">
          This page is only available to ManxHive admins.
        </p>
        <Link
          href="/"
          className="inline-flex items-center rounded-lg bg-[#D90429] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b50322]"
        >
          Back to homepage
        </Link>
      </main>
    );
  }

  const pendingCount = pending.length;
  const liveCount = live.length;
  const boostedCount = live.filter((l) => l.boosted).length;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Marketplace approvals
          </h1>
          <p className="text-sm text-gray-600">
            Review and approve new listings, and manage boosted placements
            across ManxHive. Boost caps are enforced per provider plan.
          </p>
        </div>
        <div className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
          Admin
        </div>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-3 text-xs shadow-sm">
          <div className="text-[10px] uppercase text-gray-500">
            Pending approval
          </div>
          <div className="mt-1 text-lg font-semibold text-[#D90429]">
            {pendingCount}
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-3 text-xs shadow-sm">
          <div className="text-[10px] uppercase text-gray-500">
            Live listings
          </div>
          <div className="mt-1 text-lg font-semibold text-gray-900">
            {liveCount}
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-3 text-xs shadow-sm">
          <div className="text-[10px] uppercase text-gray-500">
            Boosted live
          </div>
          <div className="mt-1 flex items-center gap-1 text-lg font-semibold text-amber-600">
            <Zap className="h-4 w-4" />
            {boostedCount}
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-3 text-xs shadow-sm">
          <div className="text-[10px] uppercase text-gray-500">
            Admin account
          </div>
          <div className="mt-1 text-[11px] font-medium text-gray-800">
            {profile.email || "—"}
          </div>
        </div>
      </section>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Pending approvals */}
      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-gray-900">
            Pending listings ({pendingCount})
          </h2>
          <p className="text-[10px] text-gray-500">
            Listings where <code>approved = false</code>. Approve to make them
            public.
          </p>
        </div>

        {pendingCount === 0 ? (
          <p className="text-xs text-gray-500">
            No pending listings right now.
          </p>
        ) : (
          <ul className="space-y-2 text-xs">
            {pending.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-gray-900">
                    {item.title}
                  </div>
                  <div className="flex flex-wrap gap-2 text-[10px] text-gray-500">
                    <span>{item.category || "Uncategorised"}</span>
                    <span>
                      Submitted:{" "}
                      {item.date_listed
                        ? new Date(
                            item.date_listed
                          ).toLocaleDateString()
                        : "n/a"}
                    </span>
                    {item.seller_user_id && (
                      <span className="text-gray-400">
                        Seller: {item.seller_user_id}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[9px]">
                  <Link
                    href={`/marketplace/item/${item.id}`}
                    className="text-[#D90429] hover:underline"
                    target="_blank"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleApprove(item.id)}
                    disabled={busyId === item.id}
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
                  >
                    {busyId === item.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3 w-3" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={busyId === item.id}
                    className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 font-medium text-rose-600 hover:bg-rose-100 disabled:opacity-50"
                  >
                    <XCircle className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Live listings + boost control */}
      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-gray-900">
            Live listings ({liveCount})
          </h2>
          <p className="text-[10px] text-gray-500">
            Manage boosted flags on approved listings.
          </p>
        </div>

        {liveCount === 0 ? (
          <p className="text-xs text-gray-500">
            No live listings yet. Once you approve listings, they&apos;ll appear
            here.
          </p>
        ) : (
          <ul className="space-y-2 text-xs">
            {live.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-gray-900">
                    {item.title}
                  </div>
                  <div className="flex flex-wrap gap-2 text-[10px] text-gray-500">
                    <span>{item.category || "Uncategorised"}</span>
                    <span>
                      Live since:{" "}
                      {item.date_listed
                        ? new Date(
                            item.date_listed
                          ).toLocaleDateString()
                        : "n/a"}
                    </span>
                    {item.boosted && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF6F6] px-2 py-0.5 text-[9px] text-[#D90429]">
                        <Zap className="h-3 w-3" />
                        Boosted
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[9px]">
                  <Link
                    href={`/marketplace/item/${item.id}`}
                    className="text-[#D90429] hover:underline"
                    target="_blank"
                  >
                    View
                  </Link>
                  <button
                    onClick={() =>
                      handleToggleBoost(item.id, !!item.boosted)
                    }
                    disabled={busyId === item.id}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold text-white disabled:opacity-50 ${
                      item.boosted
                        ? "bg-slate-500 hover:bg-slate-600"
                        : "bg-amber-500 hover:bg-amber-600"
                    }`}
                  >
                    {busyId === item.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Zap className="h-3 w-3" />
                    )}
                    {item.boosted ? "Remove boost" : "Boost"}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={busyId === item.id}
                    className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 font-medium text-rose-600 hover:bg-rose-100 disabled:opacity-50"
                  >
                    <XCircle className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}