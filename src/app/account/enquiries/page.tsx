"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import {
  Loader2,
  AlertTriangle,
  MessageCircle,
  Mail,
  Calendar,
} from "lucide-react";

type AdminProfile = {
  id: string;
  is_admin: boolean;
  email?: string | null;
};

type AdminEnquiry = {
  id: string;
  listing_id: string;
  buyer_name: string;
  buyer_email: string;
  message: string;
  status: string;
  created_at: string;
  listing?: {
    title: string | null;
    seller_user_id: string | null;
  } | null;
};

function StatusPill({ status }: { status: string }) {
  const s = (status || "").toLowerCase();

  let label = status || "open";
  let className =
    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium ";

  if (s === "open" || s === "new") {
    label = "New";
    className += "bg-rose-50 text-rose-700";
  } else if (s === "replied") {
    label = "Replied";
    className += "bg-emerald-50 text-emerald-700";
  } else if (s === "archived" || s === "closed") {
    label = "Archived";
    className += "bg-gray-100 text-gray-600";
  } else {
    className += "bg-gray-50 text-gray-500";
  }

  return (
    <span className={className}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

export default function AdminEnquiriesPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [enquiries, setEnquiries] = useState<AdminEnquiry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);

      // 1) Check auth
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
        const next = encodeURIComponent("/admin/enquiries");
        router.replace(`/login?next=${next}`);
        return;
      }

      // 2) Check profile / admin flag
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

      // 3) Load all enquiries, newest first
      const { data, error: eErr } = await supabase
        .from("marketplace_enquiries")
        .select(
          `
          id,
          listing_id,
          buyer_name,
          buyer_email,
          message,
          status,
          created_at,
          marketplace_listings (
            title,
            seller_user_id
          )
        `
        )
        .order("created_at", { ascending: false });

      if (eErr) {
        console.error(eErr);
        setError("Could not load enquiries.");
        setLoading(false);
        return;
      }

      const mapped: AdminEnquiry[] =
        data?.map((row: any) => ({
          id: row.id,
          listing_id: row.listing_id,
          buyer_name: row.buyer_name,
          buyer_email: row.buyer_email,
          message: row.message,
          status: row.status,
          created_at: row.created_at,
          listing: row.marketplace_listings || null,
        })) ?? [];

      setEnquiries(mapped);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Derived stats ----------
  const total = enquiries.length;
  const newCount = enquiries.filter((e) =>
    ["open", "new"].includes((e.status || "").toLowerCase())
  ).length;
  const replied = enquiries.filter(
    (e) => (e.status || "").toLowerCase() === "replied"
  ).length;
  const archived = enquiries.filter((e) =>
    ["archived", "closed"].includes((e.status || "").toLowerCase())
  ).length;

  // ---------- UI States ----------

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <p className="flex items-center gap-2 text-sm text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading admin enquiries…
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
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Marketplace enquiries (admin)
          </h1>
          <p className="text-sm text-gray-600">
            Read-only view of all enquiry traffic across ManxHive listings.
            Helpful for spotting misuse, volume spikes, and support issues.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 text-right text-[10px]">
          <span className="rounded-full bg-slate-900 px-3 py-1 font-semibold uppercase tracking-wide text-white">
            Admin
          </span>
          {profile.email && (
            <span className="text-gray-500">{profile.email}</span>
          )}
        </div>
      </header>

      {/* Errors */}
      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-4 text-xs shadow-sm">
          <p className="text-[10px] font-medium text-gray-500">Total</p>
          <p className="mt-1 text-xl font-semibold text-gray-900">{total}</p>
        </div>
        <div className="rounded-2xl border bg-white p-4 text-xs shadow-sm">
          <p className="text-[10px] font-medium text-gray-500">New / open</p>
          <p className="mt-1 text-xl font-semibold text-rose-600">
            {newCount}
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-4 text-xs shadow-sm">
          <p className="text-[10px] font-medium text-gray-500">Replied</p>
          <p className="mt-1 text-xl font-semibold text-emerald-600">
            {replied}
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-4 text-xs shadow-sm">
          <p className="text-[10px] font-medium text-gray-500">Archived</p>
          <p className="mt-1 text-xl font-semibold text-gray-600">
            {archived}
          </p>
        </div>
      </section>

      {/* Enquiries table */}
      <section className="rounded-2xl border bg-white p-4 text-xs shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <MessageCircle className="h-4 w-4 text-[#D90429]" />
            All enquiries
          </h2>
          <p className="text-[10px] text-gray-500">
            Newest first. Status is informational; updates can be wired in later.
          </p>
        </div>

        {enquiries.length === 0 ? (
          <p className="text-xs text-gray-500">
            No enquiries found yet. Once buyers start using the forms, they will
            appear here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2 text-[10px]">
              <thead className="text-[9px] uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-2 pb-1 text-left">When</th>
                  <th className="px-2 pb-1 text-left">Listing</th>
                  <th className="px-2 pb-1 text-left">From</th>
                  <th className="px-2 pb-1 text-left">Message</th>
                  <th className="px-2 pb-1 text-left">Status</th>
                  <th className="px-2 pb-1 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((e) => (
                  <tr
                    key={e.id}
                    className="rounded-xl bg-gray-50 align-top text-gray-800"
                  >
                    <td className="rounded-l-xl px-2 py-2 align-top">
                      <div className="flex items-center gap-1 text-[9px] text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {new Date(e.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-2 py-2 align-top">
                      <div className="flex flex-col gap-0.5">
                        <span className="line-clamp-2 font-medium">
                          {e.listing?.title || "Unknown listing"}
                        </span>
                        <span className="text-[8px] text-gray-500">
                          {e.listing_id}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-2 align-top">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">
                          {e.buyer_name || "Unknown"}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[8px] text-gray-500">
                          <Mail className="h-3 w-3" />
                          {e.buyer_email}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-2 align-top">
                      <p className="line-clamp-3 text-[9px] text-gray-700">
                        {e.message}
                      </p>
                    </td>
                    <td className="px-2 py-2 align-top">
                      <StatusPill status={e.status} />
                    </td>
                    <td className="rounded-r-xl px-2 py-2 align-top text-right">
                      <Link
                        href={`/marketplace/item/${e.listing_id}`}
                        target="_blank"
                        className="text-[9px] font-medium text-[#D90429] hover:underline"
                      >
                        View listing
                      </Link>
                      {/* future: mark replied/archived buttons here */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}