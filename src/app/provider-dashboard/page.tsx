// src/app/provider-dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  CheckCircle2,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Zap,
  BarChart3,
  ExternalLink,
  Mail,
  ChevronRight,
  Plus,
  ShieldCheck,
  TrendingUp,
  Clock,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import ProviderAnalytics from "@/app/providers/components/ProviderAnalytics";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase =
  supabaseUrl && supabaseAnon ? createClient(supabaseUrl, supabaseAnon) : null;

type Provider = {
  id: string;
  user_id: string;
  name?: string | null;
  business_name?: string | null;
  slug: string | null;
  status?: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type Profile = {
  id: string;
  display_name: string | null;
  is_admin: boolean | null;
};

type ListingSummary = {
  id: string;
  title: string;
  category: string | null;
  approved: boolean;
  boosted: boolean;
  date_listed: string | null;
};

type EnquirySummary = {
  id: string;
  listing_id: string | null;
  buyer_name?: string | null;
  buyer_email?: string | null;
  message_preview: string;
  created_at: string | null;
  status: string | null;
};

function buildGmailUrl(e: EnquirySummary) {
  const subject = encodeURIComponent("Re: Your enquiry");
  const body = encodeURIComponent(
    `Hi ${e.buyer_name || "there"},\n\nThanks for getting in touch. I'm happy to help.\n\nBest regards,`
  );
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(e.buyer_email || "")}&su=${subject}&body=${body}`;
}

function statusStyle(s: string) {
  const n = (s || "").toLowerCase();
  if (n === "approved" || n === "active")
    return { label: "Approved", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200/60", dot: "bg-emerald-500" };
  if (n === "pending")
    return { label: "Pending review", cls: "bg-amber-50 text-amber-700 ring-amber-200/60", dot: "bg-amber-500" };
  if (n === "rejected")
    return { label: "Rejected", cls: "bg-rose-50 text-rose-700 ring-rose-200/60", dot: "bg-rose-500" };
  return { label: "Draft", cls: "bg-slate-100 text-slate-500 ring-slate-200/60", dot: "bg-slate-400" };
}

function StatusPill({ status }: { status: string }) {
  const { label, cls, dot } = statusStyle(status);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return "n/a";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function relativeDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function ProviderDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [enquiries, setEnquiries] = useState<EnquirySummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "analytics">("overview");

  useEffect(() => {
    if (!supabase) {
      setError("Supabase is not configured.");
      setLoading(false);
      return;
    }

    async function load() {
      try {
        setLoading(true);

        const { data: { user }, error: userError } = await supabase!.auth.getUser();
        if (userError) { setError("Could not verify your session."); setLoading(false); return; }
        if (!user) { setLoading(false); return; }

        setUserId(user.id);

        const { data: profile } = await supabase!
          .from("profiles")
          .select("display_name, is_admin")
          .eq("id", user.id)
          .maybeSingle<Profile>();

        setDisplayName(profile?.display_name || user.email || "Your account");
        setIsAdmin(!!profile?.is_admin);

        const { data: providerRow } = await supabase!
          .from("providers")
          .select("id, user_id, name, business_name, slug, status, created_at, updated_at")
          .eq("user_id", user.id)
          .maybeSingle<Provider>();

        setProvider(providerRow ?? null);

        const { data: listingsData } = await supabase!
          .from("marketplace_listings")
          .select("id, title, category, approved, boosted, date_listed")
          .eq("seller_user_id", user.id)
          .order("date_listed", { ascending: false });

        setListings(
          (listingsData ?? []).map((l: any) => ({
            id: l.id,
            title: l.title,
            category: l.category ?? null,
            approved: !!l.approved,
            boosted: !!l.boosted,
            date_listed: l.date_listed,
          }))
        );

        const { data: enquiriesData } = await supabase!
          .from("marketplace_enquiries")
          .select("id, listing_id, buyer_name, buyer_email, message, created_at, status")
          .eq("seller_user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        setEnquiries(
          (enquiriesData ?? []).map((e: any) => ({
            id: e.id,
            listing_id: e.listing_id,
            buyer_name: e.buyer_name ?? null,
            buyer_email: e.buyer_email ?? null,
            message_preview: (e.message || "").slice(0, 100),
            created_at: e.created_at,
            status: e.status ?? "new",
          }))
        );
      } catch (e: any) {
        console.error(e);
        setError("Something went wrong loading your dashboard.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12">
        <p className="text-sm text-slate-500">Loading your dashboard…</p>
      </main>
    );
  }

  // Not logged in
  if (!userId) {
    return (
      <main className="mx-auto max-w-md px-4 py-12">
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-8 py-10 text-white shadow-md">
          <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[#D90429]/25 blur-3xl" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Provider dashboard</p>
            <h1 className="mt-1 font-playfair text-3xl font-bold">
              Sign in to continue<span className="text-[#D90429]">.</span>
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Manage your business listings, track enquiries, and see performance stats.
            </p>
            <div className="mt-5 flex gap-3">
              <Link href="/login" className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100">
                Log in
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/5">
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const approvedListings = listings.filter((l) => l.approved).length;
  const pendingListings = listings.filter((l) => !l.approved).length;
  const newEnquiries = enquiries.filter((e) => ["new", "open"].includes((e.status || "").toLowerCase())).length;
  const businessLabel = provider?.business_name || provider?.name || displayName || "Your business";
  const publicProfileHref = provider?.slug ? `/businesses/${provider.slug}` : provider ? `/businesses/${provider.id}` : "/businesses";

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white shadow-md">
        <div className="pointer-events-none absolute -left-12 -top-12 h-48 w-48 rounded-full bg-[#D90429]/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-slate-700/30 blur-2xl" />
        <div className="relative px-7 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Provider dashboard
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h1 className="font-playfair text-3xl font-bold sm:text-4xl">
                  {businessLabel}<span className="text-[#D90429]">.</span>
                </h1>
                {provider && <StatusPill status={provider.status || "pending"} />}
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold tracking-wide">
                    <ShieldCheck className="h-3 w-3" />
                    Admin
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-slate-300">
                {displayName} · Member since {provider ? formatDate(provider.created_at) : "today"}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              {provider && (
                <Link
                  href={publicProfileHref}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                >
                  View profile
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/provider-dashboard/featured"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                >
                  Manage featured
                </Link>
              )}
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-100"
              >
                Get support
              </Link>
            </div>
          </div>

          {/* Stat pills in hero */}
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              { label: "Total listings", value: listings.length, icon: <Briefcase className="h-3 w-3" />, cls: "bg-white/10 text-white" },
              { label: "Approved", value: approvedListings, icon: <CheckCircle2 className="h-3 w-3" />, cls: "bg-emerald-500/20 text-emerald-300" },
              { label: "Pending", value: pendingListings, icon: <Clock className="h-3 w-3" />, cls: "bg-amber-500/20 text-amber-300" },
              { label: "New enquiries", value: newEnquiries, icon: <MessageCircle className="h-3 w-3" />, cls: newEnquiries > 0 ? "bg-[#D90429]/80 text-white" : "bg-white/10 text-white" },
            ].map((s) => (
              <div key={s.label} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${s.cls}`}>
                {s.icon}
                <span className="font-bold">{s.value}</span>
                <span className="text-[11px] font-normal opacity-80">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tab switcher */}
        {provider && (
          <div className="border-t border-white/10 px-7 sm:px-10">
            <div className="flex gap-1">
              {[
                { key: "overview", label: "Overview", icon: <Briefcase className="h-3.5 w-3.5" /> },
                { key: "analytics", label: "Analytics", icon: <BarChart3 className="h-3.5 w-3.5" /> },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-1.5 border-b-2 px-4 py-3 text-xs font-semibold transition ${
                    activeTab === tab.key
                      ? "border-[#D90429] text-white"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      {/* No provider profile yet */}
      {!provider && (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#D90429]/10">
            <Briefcase className="h-6 w-6 text-[#D90429]" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Get a full business profile
          </h2>
          <p className="mt-2 mx-auto max-w-sm text-sm text-slate-600">
            List your business on ManxHive to unlock analytics, a verified profile page, and a direct enquiry inbox.
          </p>
          <Link
            href="/list-business"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#D90429] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#b50322]"
          >
            List your business
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Overview tab */}
      {provider && activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">

          {/* Left main */}
          <div className="space-y-5">

            {/* Listings */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h2 className="font-playfair text-lg font-bold text-slate-900">Marketplace listings</h2>
                <Link href="/marketplace/create" className="flex items-center gap-1 text-xs font-semibold text-[#D90429] hover:underline">
                  <Plus className="h-3 w-3" />
                  New listing
                </Link>
              </div>
              <div className="p-6">
                {listings.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 px-5 py-8 text-center">
                    <p className="text-sm font-medium text-slate-700">No listings yet</p>
                    <p className="mt-1 text-xs text-slate-400">Create your first marketplace listing to start getting enquiries.</p>
                    <Link
                      href="/marketplace/create"
                      className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#D90429] px-4 py-2 text-xs font-semibold text-white hover:bg-[#b50322]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Create listing
                    </Link>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {listings.slice(0, 8).map((l) => (
                      <li key={l.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-slate-900">{l.title}</div>
                          <div className="mt-0.5 text-[11px] text-slate-400">
                            {l.category || "Uncategorised"}
                            {l.date_listed && <> · {formatDate(l.date_listed)}</>}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${l.approved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                            {l.approved ? "Live" : "Pending"}
                          </span>
                          {l.boosted && (
                            <span className="flex items-center gap-0.5 rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-semibold text-purple-700">
                              <Zap className="h-2.5 w-2.5" />
                              Boosted
                            </span>
                          )}
                          <Link
                            href={`/marketplace/item/${l.id}`}
                            className="flex items-center gap-0.5 text-xs font-semibold text-[#D90429] hover:underline"
                          >
                            View <ChevronRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {listings.length > 8 && (
                  <p className="mt-3 text-xs text-slate-400">
                    Showing latest 8.{" "}
                    <Link href="/account" className="font-semibold text-[#D90429] hover:underline">
                      View all from account
                    </Link>
                  </p>
                )}
              </div>
            </section>

            {/* Business details */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h2 className="font-playfair text-lg font-bold text-slate-900">Business profile</h2>
                <StatusPill status={provider.status || "pending"} />
              </div>
              <div className="grid gap-4 p-6 sm:grid-cols-2">
                {[
                  { label: "Business name", value: businessLabel },
                  { label: "Slug / URL", value: provider.slug || "Not set", mono: true },
                  { label: "Status", value: provider.status || "pending" },
                  { label: "Member since", value: formatDate(provider.created_at) },
                  { label: "Last updated", value: formatDate(provider.updated_at) },
                ].map((row) => (
                  <div key={row.label}>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{row.label}</p>
                    <p className={`mt-0.5 text-sm font-medium text-slate-900 ${row.mono ? "font-mono text-xs" : ""}`}>
                      {row.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 border-t border-slate-100 px-6 py-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Update business details
                </Link>
                <Link
                  href={publicProfileHref}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  View public page
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </Link>
              </div>
            </section>
          </div>

          {/* Right sidebar */}
          <aside className="space-y-4">

            {/* Boost CTA */}
            <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white shadow-sm">
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/5" />
              <div className="pointer-events-none absolute -bottom-10 right-2 h-28 w-28 rounded-full bg-[#D90429]/40 blur-xl" />
              <div className="relative p-5">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide">
                  <Zap className="h-3 w-3 text-amber-300" />
                  Paid boosts
                </div>
                <p className="mt-3 text-sm font-semibold leading-snug">
                  Get seen first — boost a listing or your profile
                </p>
                <p className="mt-1 text-[11px] text-slate-300">
                  One-time PayPal payment. Live immediately — no subscription needed.
                </p>
              </div>
              <div className="relative border-t border-white/10 px-5 py-3">
                <Link
                  href="/promote"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-white py-2 text-xs font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
                >
                  <Sparkles className="h-3 w-3" />
                  View boost options
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Recent enquiries */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-[#D90429]" />
                  <h3 className="text-sm font-semibold text-slate-900">Recent enquiries</h3>
                </div>
                {newEnquiries > 0 && (
                  <span className="rounded-full bg-[#D90429] px-2.5 py-0.5 text-[11px] font-bold text-white">
                    {newEnquiries} new
                  </span>
                )}
              </div>
              <div className="p-4">
                {enquiries.length === 0 ? (
                  <p className="text-[11px] text-slate-500 text-center py-4">
                    No enquiries yet. They&apos;ll appear here when customers contact you.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {enquiries.map((e) => {
                      const isNew = ["new", "open"].includes((e.status || "").toLowerCase());
                      return (
                        <li
                          key={e.id}
                          className={`rounded-xl border p-3 text-xs ${isNew ? "border-rose-100 bg-rose-50/40" : "border-slate-100 bg-white"}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-slate-900 truncate">
                              {e.buyer_name || e.buyer_email || "Enquiry"}
                            </span>
                            <span className="shrink-0 text-[10px] text-slate-400">{relativeDate(e.created_at)}</span>
                          </div>
                          {e.message_preview && (
                            <p className="mt-1 line-clamp-2 text-[11px] text-slate-500">{e.message_preview}</p>
                          )}
                          <div className="mt-2 flex items-center gap-2">
                            {isNew && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">New</span>}
                            {e.buyer_email && (
                              <a
                                href={buildGmailUrl(e)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600 hover:bg-slate-50"
                              >
                                <Mail className="h-2.5 w-2.5" />
                                Reply
                              </a>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <Link
                  href="/account/enquiries"
                  className="mt-3 flex items-center justify-center gap-1 text-xs font-semibold text-[#D90429] hover:underline"
                >
                  View all enquiries
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Quick actions */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h3 className="text-sm font-semibold text-slate-900">Quick actions</h3>
              </div>
              <div className="p-3 space-y-1">
                {[
                  { href: "/marketplace/create", label: "Create a new listing", icon: <Plus className="h-3.5 w-3.5 text-[#D90429]" /> },
                  { href: "/account/enquiries", label: "Manage enquiries", icon: <MessageCircle className="h-3.5 w-3.5 text-blue-500" /> },
                  { href: "/promote", label: "Boost a listing", icon: <Zap className="h-3.5 w-3.5 text-amber-500" /> },
                  { href: "/contact", label: "Update business info", icon: <Briefcase className="h-3.5 w-3.5 text-slate-400" /> },
                ].map((a) => (
                  <Link
                    key={a.href}
                    href={a.href}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-2.5">
                      {a.icon}
                      {a.label}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Coming soon */}
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#D90429]" />
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Coming soon</h3>
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-900">Self-serve listing editor</p>
              <p className="mt-1 text-[11px] text-slate-500">
                Edit your profile, upload images, and manage pricing directly from this dashboard — no email needed.
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* Analytics tab */}
      {provider && activeTab === "analytics" && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
            <BarChart3 className="h-5 w-5 text-[#D90429]" />
            <div>
              <h2 className="font-playfair text-lg font-bold text-slate-900">Performance analytics</h2>
              <p className="text-[11px] text-slate-500">Impressions, clicks, views and enquiries across your listings and business profile.</p>
            </div>
          </div>
          <div className="p-6">
            <ProviderAnalytics providerId={provider.id} userId={userId} />
          </div>
        </div>
      )}

      {/* Overview + no provider: show listings + enquiries */}
      {!provider && listings.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="font-playfair text-lg font-bold text-slate-900">Your listings</h2>
            <Link href="/marketplace/create" className="text-xs font-semibold text-[#D90429] hover:underline">+ New</Link>
          </div>
          <ul className="divide-y divide-slate-100 px-6">
            {listings.slice(0, 6).map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-slate-900">{l.title}</div>
                  <div className="text-xs text-slate-400">{l.category}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${l.approved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                    {l.approved ? "Live" : "Pending"}
                  </span>
                  <Link href={`/marketplace/item/${l.id}`} className="text-xs font-semibold text-[#D90429] hover:underline">View</Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
