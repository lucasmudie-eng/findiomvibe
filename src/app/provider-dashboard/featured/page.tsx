"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { AlertCircle, CheckCircle2, XCircle, Calendar, Star } from "lucide-react";

// ---------- Supabase browser client (defensive) ----------
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase =
  supabaseUrl && supabaseAnon ? createClient(supabaseUrl, supabaseAnon) : null;

type Profile = {
  id: string;
  is_admin: boolean | null;
};

type BusinessRow = {
  id: string;
  name: string;
  slug: string | null;
  area: string | null;
  category: string | null;
  featured_on_home: boolean | null;
  featured_until: string | null;
};

export default function FeaturedBusinessesPage() {
  const [loading, setLoading] = useState(true);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [businesses, setBusinesses] = useState<BusinessRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ---- load admin + businesses (run once) ----
  useEffect(() => {
    if (!supabase) {
      setError(
        "Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      setLoading(false);
      setCheckingAdmin(false);
      return;
    }

    const load = async () => {
      try {
        setError(null);
        setLoading(true);
        setCheckingAdmin(true);

        // 1) Check auth
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("[featured-admin] auth error:", userError.message);
          setError("Could not verify your session. Please refresh.");
          setLoading(false);
          setCheckingAdmin(false);
          return;
        }

        if (!user) {
          setError("You must be logged in to view this page.");
          setLoading(false);
          setCheckingAdmin(false);
          return;
        }

        // 2) Check admin flag
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, is_admin")
          .eq("id", user.id)
          .maybeSingle<Profile>();

        if (profileError) {
          console.error(
            "[featured-admin] profile error:",
            profileError.message
          );
        }

        const admin = !!profile?.is_admin;
        setIsAdmin(admin);
        setCheckingAdmin(false);

        if (!admin) {
          setError("You don’t have permission to manage featured businesses.");
          setLoading(false);
          return;
        }

        // 3) Load businesses
        const { data, error: bizError } = await supabase
          .from("businesses")
          .select(
            "id, name, slug, area, category, featured_on_home, featured_until"
          )
          .order("name", { ascending: true });

        if (bizError) {
          console.error("[featured-admin] businesses error:", bizError.message);
          setError("Could not load businesses.");
          setLoading(false);
          return;
        }

        setBusinesses((data || []) as BusinessRow[]);
        setLoading(false);
      } catch (e: any) {
        console.error("[featured-admin] unexpected error:", e);
        setError("Something went wrong.");
        setLoading(false);
        setCheckingAdmin(false);
      }
    };

    load();
  }, []); // IMPORTANT: [] so it doesn't loop / flicker

  const todayStr = new Date().toISOString().slice(0, 10);

  function computeStatus(b: BusinessRow) {
    const featured = !!b.featured_on_home;
    const until = b.featured_until;
    const active =
      featured &&
      (!until || (typeof until === "string" && until.slice(0, 10) >= todayStr));

    if (active) return "Active on homepage";
    if (featured && until && until.slice(0, 10) < todayStr) return "Expired";
    if (featured) return "Scheduled";
    return "Not featured";
  }

  async function toggleFeatured(b: BusinessRow) {
    if (!supabase || !isAdmin) return;

    const newFeatured = !b.featured_on_home;

    // optimistic update
    setBusinesses((prev) =>
      prev.map((row) =>
        row.id === b.id ? { ...row, featured_on_home: newFeatured } : row
      )
    );

    const { error: updateError } = await supabase
      .from("businesses")
      .update({ featured_on_home: newFeatured })
      .eq("id", b.id);

    if (updateError) {
      console.error("[featured-admin] toggle error:", updateError.message);
      // revert on error
      setBusinesses((prev) =>
        prev.map((row) =>
          row.id === b.id ? { ...row, featured_on_home: b.featured_on_home } : row
        )
      );
      setError("Could not update featured flag for that business.");
    }
  }

  async function setExpiry(b: BusinessRow, days: number | null) {
    if (!supabase || !isAdmin) return;

    const newDate =
      days === null
        ? null
        : new Date(Date.now() + days * 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 10);

    setBusinesses((prev) =>
      prev.map((row) =>
        row.id === b.id ? { ...row, featured_until: newDate } : row
      )
    );

    const { error: updateError } = await supabase
      .from("businesses")
      .update({ featured_until: newDate })
      .eq("id", b.id);

    if (updateError) {
      console.error("[featured-admin] expiry error:", updateError.message);
      setError("Could not update expiry for that business.");
      setBusinesses((prev) =>
        prev.map((row) =>
          row.id === b.id ? { ...row, featured_until: b.featured_until } : row
        )
      );
    }
  }

  if (checkingAdmin || loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-sm text-slate-600">Loading businesses…</p>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <XCircle className="mt-0.5 h-4 w-4" />
          <div>
            <p className="font-semibold">Access denied</p>
            <p className="text-xs">
              You need an admin account to manage featured businesses.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-slate-900">
          Featured businesses
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Choose which approved businesses get the homepage &quot;Featured
          business&quot; slot. You can feature multiple at once — the homepage
          rotates between them.
        </p>
        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <AlertCircle className="mt-0.5 h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </header>

      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Business</th>
              <th className="px-4 py-3">Area</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Featured until</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[11px] text-slate-700">
            {businesses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No businesses found.
                </td>
              </tr>
            ) : (
              businesses.map((b) => {
                const statusLabel = computeStatus(b);
                const active =
                  statusLabel === "Active on homepage" ||
                  statusLabel === "Scheduled";

                return (
                  <tr key={b.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">
                        {b.name}
                      </div>
                      {b.slug && (
                        <div className="font-mono text-[10px] text-slate-400">
                          {b.slug}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">{b.area || "—"}</td>
                    <td className="px-4 py-3">{b.category || "—"}</td>
                    <td className="px-4 py-3">
                      {b.featured_until
                        ? new Date(b.featured_until).toLocaleDateString(
                            "en-GB"
                          )
                        : "No expiry"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] " +
                          (statusLabel === "Active on homepage"
                            ? "bg-emerald-50 text-emerald-700"
                            : statusLabel === "Expired"
                            ? "bg-rose-50 text-rose-700"
                            : statusLabel === "Scheduled"
                            ? "bg-sky-50 text-sky-700"
                            : "bg-slate-50 text-slate-600")
                        }
                      >
                        {statusLabel === "Active on homepage" && (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        {statusLabel === "Expired" && (
                          <XCircle className="h-3 w-3" />
                        )}
                        {statusLabel === "Scheduled" && (
                          <Calendar className="h-3 w-3" />
                        )}
                        {statusLabel === "Not featured" && (
                          <Star className="h-3 w-3" />
                        )}
                        <span>{statusLabel}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => toggleFeatured(b)}
                          className={
                            "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold " +
                            (active
                              ? "bg-slate-900 text-white hover:bg-slate-800"
                              : "bg-slate-100 text-slate-800 hover:bg-slate-200")
                          }
                        >
                          {active ? "Remove from homepage" : "Feature on home"}
                        </button>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => setExpiry(b, 7)}
                            className="rounded-full bg-slate-50 px-2 py-1 text-[9px] text-slate-600 hover:bg-slate-100"
                          >
                            +7d
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpiry(b, 30)}
                            className="rounded-full bg-slate-50 px-2 py-1 text-[9px] text-slate-600 hover:bg-slate-100"
                          >
                            +30d
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpiry(b, null)}
                            className="rounded-full bg-slate-50 px-2 py-1 text-[9px] text-slate-600 hover:bg-slate-100"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}