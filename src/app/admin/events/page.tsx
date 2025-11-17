"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import {
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
} from "lucide-react";
import type { WhatsOnCategorySlug } from "@/lib/events/types";
import { WHATS_ON_CATEGORY_LABELS } from "@/lib/events/types";

type AdminProfile = {
  id: string;
  is_admin: boolean;
  email?: string | null;
};

type AdminEvent = {
  id: string;
  title: string;
  category: string;
  start_at: string;
  venue: string | null;
  area: string | null;
  organiser_name: string | null;
  approved: boolean;
  featured: boolean;
};

export default function AdminEventsPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [pending, setPending] = useState<AdminEvent[]>([]);
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
        console.error(authErr);
        setError("Could not verify your session.");
        setLoading(false);
        return;
      }

      if (!user) {
        const next = encodeURIComponent("/admin/events");
        router.replace(`/login?next=${next}`);
        return;
      }

      const { data: profileRow, error: pErr } = await supabase
        .from("profiles")
        .select("id, is_admin")
        .eq("id", user.id)
        .maybeSingle();

      if (pErr) {
        console.error(pErr);
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

      const { data, error: eErr } = await supabase
        .from("whats_on_events")
        .select(
          `
          id,
          title,
          category,
          start_at,
          venue,
          area,
          organiser_name,
          approved,
          featured
        `
        )
        .eq("approved", false)
        .order("start_at", { ascending: true });

      if (eErr) {
        console.error(eErr);
        setError("Could not load pending events.");
        setLoading(false);
        return;
      }

      setPending((data as AdminEvent[]) || []);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleApprove(id: string) {
    try {
      setBusyId(id);
      setError(null);

      const { error } = await supabase
        .from("whats_on_events")
        .update({ approved: true })
        .eq("id", id);

      if (error) {
        console.error(error);
        setError("Could not approve event.");
        return;
      }

      setPending((cur) => cur.filter((ev) => ev.id !== id));
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this event? This cannot be undone.")) return;

    try {
      setBusyId(id);
      setError(null);

      const { error } = await supabase
        .from("whats_on_events")
        .delete()
        .eq("id", id);

      if (error) {
        console.error(error);
        setError("Could not delete event.");
        return;
      }

      setPending((cur) => cur.filter((ev) => ev.id !== id));
    } finally {
      setBusyId(null);
    }
  }

  // ---- UI states ----

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <p className="flex items-center gap-2 text-sm text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading event approvals…
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

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            What&apos;s On approvals
          </h1>
          <p className="text-sm text-gray-600">
            Review and approve event submissions before they appear in
            What&apos;s On.
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
            Pending events ({pending.length})
          </h2>
          <p className="text-[10px] text-gray-500">
            All events with <code>approved = false</code>.
          </p>
        </div>

        {pending.length === 0 ? (
          <p className="text-xs text-gray-500">
            No pending event submissions right now.
          </p>
        ) : (
          <ul className="space-y-2 text-xs">
            {pending.map((ev) => (
              <li
                key={ev.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-gray-900">
                    {ev.title}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[9px] text-gray-500">
                    <span>
                      {WHATS_ON_CATEGORY_LABELS[
                        ev.category as WhatsOnCategorySlug
                      ] || ev.category}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(ev.start_at).toLocaleString()}
                    </span>
                    {ev.venue && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {ev.venue}
                        {ev.area ? `, ${ev.area}` : ""}
                      </span>
                    )}
                    {ev.organiser_name && (
                      <span>By {ev.organiser_name}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[9px]">
                  <button
                    onClick={() => handleApprove(ev.id)}
                    disabled={busyId === ev.id}
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
                  >
                    {busyId === ev.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3 w-3" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => handleDelete(ev.id)}
                    disabled={busyId === ev.id}
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