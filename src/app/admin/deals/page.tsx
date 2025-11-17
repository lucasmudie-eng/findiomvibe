// src/app/admin/deals/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import {
  DEAL_CATEGORY_LABELS,
  type DealCategory,
} from "@/lib/deals/types";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";

type AdminProfile = {
  id: string;
  is_admin: boolean;
  email?: string | null;
};

type AdminDeal = {
  id: string;
  business_name: string | null;
  title: string;
  category: DealCategory | null;
  area: string | null;
  discount_label: string | null;
  boosted: boolean;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
};

export default function AdminDealsPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [pending, setPending] = useState<AdminDeal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);

      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser();

      if (authErr) {
        console.error("[admin/deals] auth error", authErr);
        setError("Could not verify your session.");
        setLoading(false);
        return;
      }

      if (!user) {
        const next = encodeURIComponent("/admin/deals");
        router.replace(`/login?next=${next}`);
        return;
      }

      const { data: profileRow, error: pErr } = await supabase
        .from("profiles")
        .select("id, is_admin")
        .eq("id", user.id)
        .maybeSingle();

      if (pErr) {
        console.error("[admin/deals] profile error", pErr);
        setError("Could not load your profile.");
        setLoading(false);
        return;
      }

      if (!profileRow?.is_admin) {
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

      const { data, error: dErr } = await supabase
        .from("deals")
        .select(
          `
            id,
            business_name,
            title,
            category,
            area,
            discount_label,
            boosted,
            starts_at,
            expires_at,
            created_at
          `
        )
        .eq("approved", false)
        .order("created_at", { ascending: true });

      if (dErr) {
        console.error("[admin/deals] load error", dErr);
        setError("Could not load pending deals.");
        setLoading(false);
        return;
      }

      setPending((data as AdminDeal[]) || []);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleApprove(id: string) {
    try {
      setBusyId(id);
      setError(null);

      const { error } = await supabase
        .from("deals")
        .update({ approved: true })
        .eq("id", id);

      if (error) {
        console.error("[admin/deals] approve error", error);
        setError("Could not approve deal.");
        return;
      }

      setPending((cur) => cur.filter((d) => d.id !== id));
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this deal? This cannot be undone.")) return;

    try {
      setBusyId(id);
      setError(null);

      const { error } = await supabase
        .from("deals")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("[admin/deals] delete error", error);
        setError("Could not delete deal.");
        return;
      }

      setPending((cur) => cur.filter((d) => d.id !== id));
    } finally {
      setBusyId(null);
    }
  }

  // ---------- UI states ----------

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <p className="flex items-center gap-2 text-sm text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading deals admin…
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

  // ---------- Main ----------

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Deals approvals
          </h1>
          <p className="text-sm text-gray-600">
            Review and approve new deals before they appear on ManxHive.
          </p>
        </div>
        <div className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
          Admin
        </div>
      </header>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-gray-900">
            Pending deals ({pending.length})
          </h2>
          <p className="text-[10px] text-gray-500">
            Showing all deals where <code>approved = false</code>.
          </p>
        </div>

        {pending.length === 0 ? (
          <p className="text-xs text-gray-500">
            No pending deals right now.
          </p>
        ) : (
          <ul className="space-y-2 text-xs">
            {pending.map((d) => (
              <li
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-gray-900">
                    {d.title}
                  </div>
                  <div className="flex flex-wrap gap-2 text-[9px] text-gray-500">
                    {d.business_name && <span>{d.business_name}</span>}
                    {d.category && (
                      <span>
                        {DEAL_CATEGORY_LABELS[d.category] ??
                          d.category}
                      </span>
                    )}
                    {d.discount_label && (
                      <span className="text-[#D90429]">
                        {d.discount_label}
                      </span>
                    )}
                    {d.area && <span>{d.area}</span>}
                    {d.starts_at && (
                      <span>
                        From{" "}
                        {new Date(d.starts_at).toLocaleDateString()}
                      </span>
                    )}
                    {d.expires_at && (
                      <span>
                        Until{" "}
                        {new Date(d.expires_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[9px]">
                  <button
                    onClick={() => handleApprove(d.id)}
                    disabled={busyId === d.id}
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[9px] font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
                  >
                    {busyId === d.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3 w-3" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => handleDelete(d.id)}
                    disabled={busyId === d.id}
                    className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[9px] font-medium text-rose-600 hover:bg-rose-100 disabled:opacity-50"
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