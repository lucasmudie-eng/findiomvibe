"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Zap, Eye, Trash2, CheckCircle2 } from "lucide-react";

/** Add your admin emails here as a safety net. */
const ADMIN_EMAILS = ["manxhive@gmail.com", "lucasmudie@gmail.com"];

type BizRow = {
  id: string;
  slug: string | null;
  name: string;
  category: string | null;
  subcategory: string | null;
  area: string | null;
  created_at: string | null;
  approved: boolean | null;
  boosted: boolean | null;
};

export default function BusinessesApprovalsPage() {
  const supabase = supabaseBrowser();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);

  const [pending, setPending] = useState<BizRow[]>([]);
  const [live, setLive] = useState<BizRow[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  // --- Admin gate (profiles.is_admin OR email allow-list)
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const { data: userRes, error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;

        const user = userRes?.user || null;
        if (!user) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // Allow-list fallback: if email matches, you're admin.
        const email = (user.email || "").toLowerCase();
        if (email && ADMIN_EMAILS.includes(email)) {
          setIsAdmin(true);
          setLoading(false);
          return;
        }

        // Try profiles.is_admin
        const { data: profile, error: pErr } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .maybeSingle();

        if (pErr) {
          // If policies block this or table differs, don't hard-fail; just leave non-admin.
          setErr((prev) => prev ?? pErr.message);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!profile?.is_admin);
        }
      } catch (e: any) {
        setErr(e?.message ?? "Unable to check admin status.");
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Load lists (only if admin)
  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      setErr(null);
      const [p, l] = await Promise.all([
        supabase
          .from("businesses")
          .select(
            "id, slug, name, category, subcategory, area, created_at, approved, boosted"
          )
          .eq("approved", false)
          .order("created_at", { ascending: true }),
        supabase
          .from("businesses")
          .select(
            "id, slug, name, category, subcategory, area, created_at, approved, boosted"
          )
          .eq("approved", true)
          .order("created_at", { ascending: false }),
      ]);

      if (p.error) setErr((prev) => prev ?? p.error.message);
      if (l.error) setErr((prev) => prev ?? l.error.message);

      setPending(p.data ?? []);
      setLive(l.data ?? []);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const stats = useMemo(() => {
    const liveCount = live.length;
    const pendingCount = pending.length;
    const boostedCount = live.filter((b) => !!b.boosted).length;
    return { liveCount, pendingCount, boostedCount };
  }, [live, pending]);

  async function postAction(
    path:
      | "/api/admin/businesses/approve"
      | "/api/admin/businesses/boost"
      | "/api/admin/businesses/delete",
    body: Record<string, any>
  ) {
    try {
      setBusyId(body.id);
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Request failed ${res.status}`);
      }
      // reload
      const [p, l] = await Promise.all([
        supabase
          .from("businesses")
          .select(
            "id, slug, name, category, subcategory, area, created_at, approved, boosted"
          )
          .eq("approved", false)
          .order("created_at", { ascending: true }),
        supabase
          .from("businesses")
          .select(
            "id, slug, name, category, subcategory, area, created_at, approved, boosted"
          )
          .eq("approved", true)
          .order("created_at", { ascending: false }),
      ]);
      if (!p.error) setPending(p.data ?? []);
      if (!l.error) setLive(l.data ?? []);
    } catch (e: any) {
      setErr(e?.message ?? "Action failed.");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16 text-slate-600">Loading…</main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Businesses approvals
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          You must be an admin to view this page.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Businesses approvals
          </h1>
          <p className="mt-2 text-slate-600">
            Review and approve new business listings, and manage boosted placements.
          </p>
        </div>
        <span className="rounded-full bg-slate-900 px-3.5 py-1 text-xs font-semibold tracking-widest text-white">
          ADMIN
        </span>
      </div>

      {err && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
          {err}
        </div>
      )}

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5">
          <div className="text-slate-500">PENDING APPROVAL</div>
          <div className="mt-2 text-4xl font-semibold text-amber-600">
            {stats.pendingCount}
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-5">
          <div className="text-slate-500">LIVE BUSINESSES</div>
          <div className="mt-2 text-4xl font-semibold text-emerald-600">
            {stats.liveCount}
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-5">
          <div className="text-slate-500">BOOSTED LIVE</div>
          <div className="mt-2 flex items-center gap-2 text-4xl font-semibold text-rose-600">
            <Zap className="h-7 w-7" />
            {stats.boostedCount}
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-5">
          <div className="text-slate-500">ADMIN ACCOUNT</div>
          <div className="mt-2 text-lg font-medium text-slate-700">Active</div>
        </div>
      </div>

      {/* Pending */}
      <section className="mb-10 rounded-2xl border bg-white p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Pending businesses ({stats.pendingCount})
          </h2>
          <div className="text-slate-500">
            Listings where <span className="font-mono">approved = false</span>. Approve
            to make them public.
          </div>
        </div>

        {pending.length === 0 ? (
          <p className="text-slate-500">No pending listings right now.</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {pending.map((b) => (
              <li key={b.id} className="flex items-center justify-between py-4">
                <div className="min-w-0">
                  <div className="text-lg font-medium text-slate-900">{b.name}</div>
                  <div className="mt-0.5 text-sm text-slate-600">
                    {b.category ?? "—"} · {b.subcategory ?? "—"} · {b.area ?? "—"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/businesses/${b.slug || b.id}`}
                    className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm text-slate-800 hover:bg-slate-50"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Link>
                  <button
                    onClick={() =>
                      postAction("/api/admin/businesses/approve", {
                        id: b.id,
                        approved: true,
                      })
                    }
                    disabled={busyId === b.id}
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      postAction("/api/admin/businesses/delete", { id: b.id })
                    }
                    disabled={busyId === b.id}
                    className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100 disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Live */}
      <section className="mb-16 rounded-2xl border bg-white p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Live listings ({stats.liveCount})
          </h2>
          <div className="text-slate-500">
            Manage <span className="font-mono">boosted</span> flags on approved listings.
          </div>
        </div>

        {live.length === 0 ? (
          <p className="text-slate-500">No live businesses yet.</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {live.map((b) => (
              <li key={b.id} className="flex items-center justify-between py-4">
                <div className="min-w-0">
                  <div className="text-lg font-medium text-slate-900">{b.name}</div>
                  <div className="mt-0.5 text-sm text-slate-600">
                    {b.category ?? "—"} · {b.subcategory ?? "—"} · {b.area ?? "—"}
                    {b.created_at ? (
                      <span className="ml-2 text-slate-400">
                        • Live since:{" "}
                        {new Date(b.created_at).toLocaleDateString("en-GB")}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/businesses/${b.slug || b.id}`}
                    className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm text-slate-800 hover:bg-slate-50"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Link>

                  <button
                    onClick={() =>
                      postAction("/api/admin/businesses/boost", {
                        id: b.id,
                        boosted: !b.boosted,
                      })
                    }
                    disabled={busyId === b.id}
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold ${
                      b.boosted
                        ? "bg-rose-600 text-white hover:bg-rose-700"
                        : "bg-rose-50 text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100"
                    }`}
                  >
                    <Zap className="h-4 w-4" />
                    {b.boosted ? "Unboost" : "Boost"}
                  </button>

                  <button
                    onClick={() =>
                      postAction("/api/admin/businesses/delete", { id: b.id })
                    }
                    disabled={busyId === b.id}
                    className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100 disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" />
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