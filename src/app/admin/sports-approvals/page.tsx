"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Eye, Trash2, CheckCircle2 } from "lucide-react";

const ADMIN_EMAILS = ["manxhive@gmail.com", "lucasmudie@gmail.com"];

type SportRow = {
  id: number;
  slug: string | null;
  name: string;
  sport_type: string | null;
  area: string | null;
  venue: string | null;
  submitted_at: string | null;
  status: string;
};

export default function SportsApprovalsPage() {
  const supabase = supabaseBrowser();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [pending, setPending] = useState<SportRow[]>([]);
  const [live, setLive] = useState<SportRow[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);

  // admin gate
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const { data: userRes, error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;

        const user = userRes?.user;
        if (!user) {
          setIsAdmin(false);
          return;
        }

        const email = (user.email || "").toLowerCase();
        if (email && ADMIN_EMAILS.includes(email)) {
          setIsAdmin(true);
          return;
        }

        const { data: profile, error: pErr } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .maybeSingle();

        if (pErr) {
          setIsAdmin(false);
          setErr(pErr.message);
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
  }, []);

  // load lists
  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      setErr(null);
      const [p, l] = await Promise.all([
        supabase
          .from("sports")
          .select("id, slug, name, sport_type, area, venue, submitted_at, status")
          .eq("status", "pending")
          .order("submitted_at", { ascending: true }),
        supabase
          .from("sports")
          .select("id, slug, name, sport_type, area, venue, submitted_at, status")
          .eq("status", "published")
          .order("submitted_at", { ascending: false }),
      ]);

      if (p.error) setErr(p.error.message);
      if (l.error) setErr((prev) => prev ?? l.error.message);

      setPending(p.data ?? []);
      setLive(l.data ?? []);
    })();
  }, [isAdmin]);

  const stats = useMemo(
    () => ({ pending: pending.length, live: live.length }),
    [pending, live]
  );

  async function postAction(
    path: "/api/admin/sports/approve" | "/api/admin/sports/delete",
    body: Record<string, any>
  ) {
    try {
      setBusyId(body.id);
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());

      // reload
      const [p, l] = await Promise.all([
        supabase
          .from("sports")
          .select("id, slug, name, sport_type, area, venue, submitted_at, status")
          .eq("status", "pending")
          .order("submitted_at", { ascending: true }),
        supabase
          .from("sports")
          .select("id, slug, name, sport_type, area, venue, submitted_at, status")
          .eq("status", "published")
          .order("submitted_at", { ascending: false }),
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
      <main className="mx-auto max-w-6xl px-6 py-16 text-slate-600">
        Loading…
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Sports approvals
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
            Sports approvals
          </h1>
          <p className="mt-2 text-slate-600">
            Review new sports / classes before they go live.
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

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5">
          <div className="text-slate-500">PENDING</div>
          <div className="mt-2 text-4xl font-semibold text-amber-600">
            {stats.pending}
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-5">
          <div className="text-slate-500">LIVE</div>
          <div className="mt-2 text-4xl font-semibold text-emerald-600">
            {stats.live}
          </div>
        </div>
      </div>

      {/* Pending */}
      <section className="mb-10 rounded-2xl border bg-white p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-3">
          Pending sports ({stats.pending})
        </h2>

        {pending.length === 0 ? (
          <p className="text-slate-500">No pending submissions.</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {pending.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-4">
                <div className="min-w-0">
                  <div className="text-lg font-medium text-slate-900">{s.name}</div>
                  <div className="mt-0.5 text-sm text-slate-600">
                    {s.sport_type ?? "—"} · {s.area ?? "—"} · {s.venue ?? "—"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/sports/${s.slug || s.id}`}
                    className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm text-slate-800 hover:bg-slate-50"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Link>
                  <button
                    onClick={() =>
                      postAction("/api/admin/sports/approve", { id: s.id })
                    }
                    disabled={busyId === s.id}
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      postAction("/api/admin/sports/delete", { id: s.id })
                    }
                    disabled={busyId === s.id}
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
      <section className="rounded-2xl border bg-white p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-3">
          Live sports ({stats.live})
        </h2>

        {live.length === 0 ? (
          <p className="text-slate-500">No live sports yet.</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {live.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-4">
                <div className="min-w-0">
                  <div className="text-lg font-medium text-slate-900">{s.name}</div>
                  <div className="mt-0.5 text-sm text-slate-600">
                    {s.sport_type ?? "—"} · {s.area ?? "—"} · {s.venue ?? "—"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/sports/${s.slug || s.id}`}
                    className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm text-slate-800 hover:bg-slate-50"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Link>
                  <button
                    onClick={() =>
                      postAction("/api/admin/sports/delete", { id: s.id })
                    }
                    disabled={busyId === s.id}
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