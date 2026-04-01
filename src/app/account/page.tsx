// src/app/account/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { CATEGORY_LABELS } from "@/lib/marketplace/types";
import PushPreferences from "@/app/components/PushPreferences";
import ProviderAnalytics from "@/app/providers/components/ProviderAnalytics";
import { WalletPanel } from "@/components/WalletPanel";
import {
  Plus,
  Mail,
  Calendar,
  Tag,
  BarChart3,
  Zap,
  BookmarkCheck,
  ShieldCheck,
  ChevronRight,
  Bookmark,
} from "lucide-react";

type Profile = {
  id: string;
  display_name?: string | null;
  is_admin?: boolean | null;
};

type MyListing = {
  id: string;
  title: string;
  category: string;
  approved: boolean;
  boosted: boolean;
  date_listed: string;
};

type MyDeal = {
  id: string;
  title: string;
  approved: boolean;
  boosted: boolean;
  created_at: string;
};

type MyEvent = {
  id: string;
  title: string;
  approved: boolean;
  starts_at: string | null;
  created_at: string;
};

type MyBusiness = {
  id: string;
  name: string;
  slug: string | null;
  area: string | null;
  category: string | null;
  boosted_until: string | null;
  featured_on_home: boolean | null;
};

type SavedListing = {
  id: string;
  title: string;
  href: string;
  image?: string | null;
  price?: string | null;
  savedAt: string;
};

type SavedSearch = {
  id: string;
  name: string;
  href: string;
  savedAt: string;
};

const SAVED_LISTINGS_KEY = "manxhive_saved_listings";
const SAVED_SEARCHES_KEY = "manxhive_saved_searches";
const SAVED_EVENTS_KEY = "manxhive_saved_events";
const SAVED_DEALS_KEY = "manxhive_saved_deals";
const SAVED_BUSINESSES_KEY = "manxhive_saved_businesses";
const SAVED_WALKS_KEY = "manxhive_saved_walks";
const SAVED_HERITAGE_KEY = "manxhive_saved_heritage";

type SavedItem = {
  id: string;
  title: string;
  href: string;
  image?: string | null;
  meta?: string | null;
  savedAt: string;
};

export default function AccountPage() {
  const supabase = supabaseBrowser();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [listings, setListings] = useState<MyListing[]>([]);
  const [deals, setDeals] = useState<MyDeal[]>([]);
  const [events, setEvents] = useState<MyEvent[]>([]);
  const [business, setBusiness] = useState<MyBusiness | null>(null);

  const [enquiriesCount, setEnquiriesCount] = useState(0);
  const [newEnquiriesCount, setNewEnquiriesCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [savedEvents, setSavedEvents] = useState<SavedItem[]>([]);
  const [savedDeals, setSavedDeals] = useState<SavedItem[]>([]);
  const [savedBusinesses, setSavedBusinesses] = useState<SavedItem[]>([]);
  const [savedWalks, setSavedWalks] = useState<SavedItem[]>([]);
  const [savedHeritage, setSavedHeritage] = useState<SavedItem[]>([]);

  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const [resetBusy, setResetBusy] = useState(false);
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [provider, setProvider] = useState<{ id: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "analytics">("overview");

  const btnPrimary =
    "inline-flex items-center justify-center rounded-full h-10 px-5 text-sm font-semibold transition-colors select-none bg-[#D90429] text-white hover:bg-[#b50322]";

  const formatSavedDate = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  const readSaved = <T,>(key: string): T[] => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  };

  const writeSaved = <T,>(key: string, items: T[]) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(items));
  };

  // Try common "owner" fields without breaking build if one doesn't exist
  async function loadMine<T>(
    table: string,
    selectCols: string,
    userId: string,
    ownerFields: string[]
  ): Promise<T[]> {
    for (const field of ownerFields) {
      const { data, error } = await supabase
        .from(table)
        .select(selectCols)
        .eq(field, userId)
        .order("created_at", { ascending: false });

      if (!error) return (data as T[]) || [];
    }
    return [];
  }

  async function loadOneBusiness(userId: string): Promise<MyBusiness | null> {
    const ownerFields = ["owner_user_id", "user_id", "claimed_by", "submitted_by"];
    for (const field of ownerFields) {
      const { data, error } = await supabase
        .from("businesses")
        .select(
          "id, name, slug, area, category, boosted_until, featured_on_home, created_at"
        )
        .eq(field, userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) return data as any;
    }
    return null;
  }

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

      // ---- PROFILE ----
      const { data: profileRow } = await supabase
        .from("profiles")
        .select("id, display_name, is_admin")
        .eq("id", user.id)
        .maybeSingle();

      const displayName =
        profileRow?.display_name || user.email || "Your account";

      const profileData: Profile = {
        id: user.id,
        display_name: displayName,
        is_admin: profileRow?.["is_admin"] ?? false,
      };
      setProfile(profileData);

      // ---- PROVIDER (for analytics tab) ----
      const { data: providerRow } = await supabase
        .from("providers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      setProvider(providerRow ? { id: providerRow.id } : null);

      // ---- MARKETPLACE LISTINGS ----
      const { data: listingsData, error: lErr } = await supabase
        .from("marketplace_listings")
        .select("id, title, category, approved, boosted, date_listed, created_at")
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
          approved: !!l.approved,
          boosted: !!l.boosted,
          date_listed: l.date_listed ?? l.created_at,
        }))
      );

      // ---- ENQUIRIES COUNT ----
      const { count, error: eErr } = await supabase
        .from("marketplace_enquiries")
        .select("id", { count: "exact", head: true })
        .eq("seller_user_id", user.id);

      if (!eErr && typeof count === "number") setEnquiriesCount(count);

      const { count: newCount, error: newErr } = await supabase
        .from("marketplace_enquiries")
        .select("id", { count: "exact", head: true })
        .eq("seller_user_id", user.id)
        .in("status", ["new", "open"]);

      if (!newErr && typeof newCount === "number") {
        setNewEnquiriesCount(newCount);
      }

      // ---- MY DEALS ----
      const myDeals = await loadMine<MyDeal>(
        "deals",
        "id, title, approved, boosted, created_at",
        user.id,
        ["submitted_by", "created_by", "user_id", "owner_user_id"]
      );
      setDeals(
        myDeals.map((d: any) => ({
          id: d.id,
          title: d.title ?? "Untitled deal",
          approved: !!d.approved,
          boosted: !!d.boosted,
          created_at: d.created_at,
        }))
      );

      // ---- MY EVENTS ----
      const myEvents = await loadMine<MyEvent>(
        "events",
        "id, title, approved, starts_at, created_at",
        user.id,
        ["submitted_by", "created_by", "user_id", "organiser_user_id"]
      );
      setEvents(
        myEvents.map((ev: any) => ({
          id: ev.id,
          title: ev.title ?? "Untitled event",
          approved: !!ev.approved,
          starts_at: ev.starts_at ?? null,
          created_at: ev.created_at,
        }))
      );

      // ---- MY BUSINESS (IF ANY) ----
      const myBusiness = await loadOneBusiness(user.id);
      setBusiness(myBusiness);

      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadSaved = () => {
      setSavedListings(readSaved<SavedListing>(SAVED_LISTINGS_KEY));
      setSavedSearches(readSaved<SavedSearch>(SAVED_SEARCHES_KEY));
      setSavedEvents(readSaved<SavedItem>(SAVED_EVENTS_KEY));
      setSavedDeals(readSaved<SavedItem>(SAVED_DEALS_KEY));
      setSavedBusinesses(readSaved<SavedItem>(SAVED_BUSINESSES_KEY));
      setSavedWalks(readSaved<SavedItem>(SAVED_WALKS_KEY));
      setSavedHeritage(readSaved<SavedItem>(SAVED_HERITAGE_KEY));
    };

    loadSaved();

    const onStorage = (e: StorageEvent) => {
      if (
        e.key === SAVED_LISTINGS_KEY ||
        e.key === SAVED_SEARCHES_KEY
      ) {
        loadSaved();
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const removeSavedListing = (id: string) => {
    const next = savedListings.filter((l) => l.id !== id);
    setSavedListings(next);
    writeSaved(SAVED_LISTINGS_KEY, next);
  };

  const removeSavedSearch = (id: string) => {
    const next = savedSearches.filter((s) => s.id !== id);
    setSavedSearches(next);
    writeSaved(SAVED_SEARCHES_KEY, next);
  };

  const removeSavedItem = (
    id: string,
    items: SavedItem[],
    setter: (next: SavedItem[]) => void,
    key: string
  ) => {
    const next = items.filter((s) => s.id !== id);
    setter(next);
    writeSaved(key, next);
  };

  const clearSavedListings = () => {
    setSavedListings([]);
    writeSaved(SAVED_LISTINGS_KEY, []);
  };

  const clearSavedSearches = () => {
    setSavedSearches([]);
    writeSaved(SAVED_SEARCHES_KEY, []);
  };

  const clearSavedItems = (setter: (next: SavedItem[]) => void, key: string) => {
    setter([]);
    writeSaved(key, []);
  };

  const prettySearchName = (s: SavedSearch) => {
    if (!s?.name) return "Saved search";
    if (s.name.startsWith("Category: ")) {
      const slug = s.name.replace("Category: ", "").trim();
      const label =
        (CATEGORY_LABELS as Record<string, string>)[slug] || slug;
      return `Category: ${label}`;
    }
    return s.name;
  };

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
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setResetMsg(
      error ? error.message : "If that email exists, a reset link has been sent."
    );
    setResetBusy(false);
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
  const totalSaved =
    savedEvents.length + savedDeals.length + savedBusinesses.length +
    savedWalks.length + savedHeritage.length + savedListings.length;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">

      {/* ── HERO HEADER ───────────────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-md">
        <div className="relative px-6 py-8 sm:px-10 sm:py-10">
          <div className="pointer-events-none absolute -left-12 -top-12 h-48 w-48 rounded-full bg-[#D90429]/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-slate-700/30 blur-2xl" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Your account
              </p>
              <h1 className="mt-1 font-playfair text-3xl font-bold text-white sm:text-4xl">
                {profile.display_name}
                <span className="text-[#D90429]">.</span>
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {[
                  { label: "Listings", value: totalListings, cls: "bg-white/10 text-white" },
                  { label: "Approved", value: approvedListings, cls: "bg-emerald-500/20 text-emerald-300" },
                  { label: "Pending", value: pendingListings, cls: "bg-amber-500/20 text-amber-300" },
                  { label: "Enquiries", value: enquiriesCount, cls: "bg-[#D90429]/20 text-red-300" },
                ].map((s) => (
                  <span key={s.label} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${s.cls}`}>
                    <span className="font-bold">{s.value}</span>
                    <span className="opacity-70">{s.label}</span>
                  </span>
                ))}
                {newEnquiriesCount > 0 && (
                  <span className="inline-flex items-center rounded-full bg-[#D90429] px-3 py-1 text-xs font-semibold text-white">
                    {newEnquiriesCount} new enquiries
                  </span>
                )}
                {Boolean(profile.is_admin) && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold tracking-wide text-white">
                    <ShieldCheck className="h-3 w-3" />
                    ADMIN
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-start gap-2 sm:items-end">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handlePasswordReset}
                  disabled={resetBusy}
                  className="rounded-full border border-white/20 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-white/10 disabled:opacity-60"
                >
                  {resetBusy ? "Sending…" : "Reset password"}
                </button>
                <button
                  onClick={handleLogout}
                  disabled={logoutBusy}
                  className="rounded-full border border-white/20 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-white/10 disabled:opacity-60"
                >
                  {logoutBusy ? "Logging out…" : "Log out"}
                </button>
              </div>
              {resetMsg && <p className="text-xs text-slate-400">{resetMsg}</p>}
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="border-t border-white/10 px-6 sm:px-10">
          <div className="flex gap-1">
            {[
              { key: "overview", label: "Overview" },
              { key: "analytics", label: "Analytics" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as "overview" | "analytics")}
                className={`${tab.key === "analytics" ? "hidden sm:block" : ""} border-b-2 px-4 py-3 text-xs font-semibold transition ${
                  activeTab === tab.key
                    ? "border-[#D90429] text-white"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── ANALYTICS TAB ─────────────────────────────────────────────────── */}
      {activeTab === "analytics" && (
        <div className="hidden sm:block rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
            <BarChart3 className="h-5 w-5 text-[#D90429]" />
            <div>
              <h2 className="font-playfair text-lg font-bold text-slate-900">Performance analytics</h2>
              <p className="text-[11px] text-slate-500">
                Impressions, clicks, views and enquiries across your listings, deals and business profile.
              </p>
            </div>
          </div>
          <div className="p-6">
            {provider ? (
              <ProviderAnalytics providerId={provider.id} userId={profile.id} />
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 px-6 py-10 text-center">
                <BarChart3 className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-700">No provider profile yet</p>
                <p className="mt-1 text-xs text-slate-400">
                  Analytics are available once you have a business or provider profile listed on ManxHive.
                </p>
                <a
                  href="/provider-dashboard"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#D90429] px-4 py-2 text-xs font-semibold text-white hover:bg-[#b50322]"
                >
                  Set up provider profile
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "overview" && <>

      {/* ── QUICK ACTIONS ─────────────────────────────────────────────────── */}
      <section>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Quick actions
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link
            href="/marketplace/create"
            className="group flex flex-col gap-3 rounded-2xl bg-[#D90429] p-5 text-white shadow-sm transition hover:bg-[#b50322]"
          >
            <Plus className="h-5 w-5" />
            <span className="text-sm font-semibold leading-tight">Create a listing</span>
          </Link>
          <Link
            href="/account/enquiries"
            className="group relative flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm transition hover:border-[#D90429]/30 hover:shadow-md"
          >
            <Mail className="h-5 w-5 text-[#D90429]" />
            <span className="text-sm font-semibold leading-tight">View enquiries</span>
            {newEnquiriesCount > 0 && (
              <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#D90429] text-[10px] font-bold text-white">
                {newEnquiriesCount}
              </span>
            )}
          </Link>
          <Link
            href="/whats-on/submit"
            className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm transition hover:border-[#D90429]/30 hover:shadow-md"
          >
            <Calendar className="h-5 w-5 text-[#D90429]" />
            <span className="text-sm font-semibold leading-tight">Submit an event</span>
          </Link>
          <Link
            href="/deals/create"
            className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm transition hover:border-[#D90429]/30 hover:shadow-md"
          >
            <Tag className="h-5 w-5 text-[#D90429]" />
            <span className="text-sm font-semibold leading-tight">Submit a deal</span>
          </Link>
        </div>
      </section>

      {/* ── MAIN CONTENT + SIDEBAR ────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_280px] lg:items-start">

        {/* LEFT: listings, events, deals */}
        <div className="order-2 lg:order-1 space-y-6">

          {/* My listings */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="font-playfair text-lg font-bold text-slate-900">
                My listings
              </h2>
              <Link href="/marketplace/create" className="flex items-center gap-1 text-xs font-semibold text-[#D90429] hover:underline">
                <Plus className="h-3 w-3" />
                New listing
              </Link>
            </div>
            <div className="p-6">
              {error && <p className="mb-3 text-sm text-rose-600">{error}</p>}
              {listings.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 px-5 py-8 text-center">
                  <p className="text-sm font-medium text-slate-700">No listings yet</p>
                  <p className="mt-1 text-xs text-slate-400">Create your first marketplace listing to start getting enquiries.</p>
                  <Link href="/marketplace/create" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#D90429] px-4 py-2 text-xs font-semibold text-white hover:bg-[#b50322]">
                    <Plus className="h-3.5 w-3.5" />
                    Create listing
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {listings.map((l) => (
                    <li key={l.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 truncate text-sm font-medium text-slate-900">{l.title}</p>
                        <Link href={`/marketplace/item/${l.id}`} className="flex flex-shrink-0 items-center gap-0.5 text-xs font-semibold text-[#D90429] hover:underline">
                          View <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="text-xs text-slate-400">
                          {new Date(l.date_listed).toLocaleDateString("en-GB")} · {l.category}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${l.approved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                          {l.approved ? "Live" : "Pending"}
                        </span>
                        {l.boosted && (
                          <span className="flex items-center gap-0.5 rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700">
                            <Zap className="h-2.5 w-2.5" />
                            Boosted
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* My events */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="font-playfair text-lg font-bold text-slate-900">
                My events
              </h2>
              <Link href="/whats-on/submit" className="flex items-center gap-1 text-xs font-semibold text-[#D90429] hover:underline">
                <Plus className="h-3 w-3" />
                Submit event
              </Link>
            </div>
            <div className="p-6">
              {events.length === 0 ? (
                <p className="text-sm text-slate-500">No events submitted yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {events.map((ev) => (
                    <li key={ev.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 truncate text-sm font-medium text-slate-900">{ev.title}</p>
                        <Link href={`/whats-on/${ev.id}`} className="flex flex-shrink-0 items-center gap-0.5 text-xs font-semibold text-[#D90429] hover:underline">
                          View <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="text-xs text-slate-400">
                          {ev.starts_at
                            ? new Date(ev.starts_at).toLocaleDateString("en-GB")
                            : new Date(ev.created_at).toLocaleDateString("en-GB")}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${ev.approved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                          {ev.approved ? "Live" : "Pending"}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* My deals */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="font-playfair text-lg font-bold text-slate-900">
                My deals
              </h2>
              <Link href="/deals/create" className="flex items-center gap-1 text-xs font-semibold text-[#D90429] hover:underline">
                <Plus className="h-3 w-3" />
                New deal
              </Link>
            </div>
            <div className="p-6">
              {deals.length === 0 ? (
                <p className="text-sm text-slate-500">No deals submitted yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {deals.map((d) => (
                    <li key={d.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 truncate text-sm font-medium text-slate-900">{d.title}</p>
                        <Link href={`/deals/${d.id}`} className="flex flex-shrink-0 items-center gap-0.5 text-xs font-semibold text-[#D90429] hover:underline">
                          View <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="text-xs text-slate-400">
                          {new Date(d.created_at).toLocaleDateString("en-GB")}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${d.approved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                          {d.approved ? "Live" : "Pending"}
                        </span>
                        {d.boosted && (
                          <span className="flex items-center gap-0.5 rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700">
                            <Zap className="h-2.5 w-2.5" />
                            Boosted
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="order-1 lg:order-2 space-y-4">

          {/* Analytics CTA */}
          <div className="overflow-hidden rounded-2xl border border-slate-900/10 bg-slate-900 text-white shadow-sm">
            <div className="relative p-5">
              <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[#D90429]/20 blur-2xl" />
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-amber-300" />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                  Analytics
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold">
                Your listing &amp; event stats
              </p>
              <p className="mt-1 text-[11px] text-slate-300">
                Track impressions, views, enquiries and more across all your activity on ManxHive.
              </p>
            </div>
            <div className="border-t border-white/10 px-5 py-3">
              <Link
                href="/provider-dashboard"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-white text-[11px] font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
              >
                Open analytics dashboard
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Wallet / boosts */}
          <WalletPanel userId={profile.id} />

          {/* My business */}
          {business && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">My business</h3>
                <Link
                  href={business.slug ? `/businesses/${business.slug}` : "/businesses"}
                  className="text-xs font-semibold text-[#D90429] hover:underline"
                >
                  View page →
                </Link>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-900">{business.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {[business.area, business.category].filter(Boolean).join(" · ")}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {business.featured_on_home && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                      Featured
                    </span>
                  )}
                  {business.boosted_until && new Date(business.boosted_until) > new Date() && (
                    <span className="flex items-center gap-0.5 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-900">
                      <Zap className="h-2.5 w-2.5" />
                      Boosted until {new Date(business.boosted_until).toLocaleDateString("en-GB")}
                    </span>
                  )}
                </div>
              </div>
              <Link
                href="/promote"
                className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#D90429] px-4 py-2 text-xs font-semibold text-white hover:bg-[#b50322]"
              >
                <Zap className="h-3.5 w-3.5" />
                Boost my business
              </Link>
            </div>
          )}

          {/* Saved summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Bookmark className="h-3.5 w-3.5 text-[#D90429]" />
                <h3 className="text-sm font-semibold text-slate-900">Saved items</h3>
              </div>
              <Link href="#saved-items" className="text-xs font-semibold text-[#D90429] hover:underline">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Events", value: savedEvents.length },
                { label: "Deals", value: savedDeals.length },
                { label: "Businesses", value: savedBusinesses.length },
                { label: "Walks", value: savedWalks.length },
                { label: "Heritage", value: savedHeritage.length },
                { label: "Listings", value: savedListings.length },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-slate-100 bg-slate-50 px-2 py-2 text-center">
                  <div className="text-[10px] text-slate-400">{s.label}</div>
                  <div className="text-base font-bold text-slate-900">{s.value}</div>
                </div>
              ))}
            </div>
            {totalSaved === 0 && (
              <p className="mt-2 text-[11px] text-slate-400">
                Save events, deals, businesses and more using the bookmark button on any listing.
              </p>
            )}
          </div>

          {/* Push prefs */}
          <PushPreferences />

          {/* Admin links */}
          {Boolean(profile.is_admin) && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-900">Admin tools</h3>
              </div>
              <div className="space-y-1.5">
                {[
                  { href: "/admin/marketplace", label: "Marketplace approvals" },
                  { href: "/admin/deals", label: "Deals approvals" },
                  { href: "/admin/businesses-approvals", label: "Business approvals" },
                  { href: "/admin/walks-approvals", label: "Walks approvals" },
                  { href: "/admin/sports-approvals", label: "Sports approvals" },
                  { href: "/admin/leagues-approvals", label: "Leagues approvals" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {link.label}
                    <ChevronRight className="h-3 w-3 text-slate-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Support */}
          <p className="px-1 text-xs text-slate-400">
            Questions?{" "}
            <Link href="/contact" className="font-semibold text-[#D90429] hover:underline">
              Contact support
            </Link>
          </p>
        </aside>
      </div>

      {/* ── SAVED ITEMS ───────────────────────────────────────────────────── */}
      <div id="saved-items">
        <div className="mb-3 flex items-center gap-2">
          <BookmarkCheck className="h-4 w-4 text-[#D90429]" />
          <h2 className="font-playfair text-xl font-bold text-slate-900">
            Saved across ManxHive
          </h2>
          <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
            {totalSaved}
          </span>
        </div>
        <p className="mb-4 text-xs text-slate-500">Saved on this device only.</p>

        {/* Saved listings + searches in 2 columns */}
        <div className="mb-4 grid gap-4 md:grid-cols-2">
          <SavedSection
            title="Saved listings"
            empty="No saved listings yet. Save listings from any item page."
            onClear={clearSavedListings}
            showClear={savedListings.length > 0}
          >
            {savedListings.map((l) => (
              <SavedRow
                key={l.id}
                image={l.image}
                title={l.title}
                meta={l.price ? l.price : "Price on request"}
                savedAt={formatSavedDate(l.savedAt)}
                href={l.href || `/marketplace/item/${l.id}`}
                onRemove={() => removeSavedListing(l.id)}
              />
            ))}
          </SavedSection>

          <SavedSection
            title="Saved searches"
            empty={'No saved searches yet. Use "Save search" on the marketplace page.'}
            onClear={clearSavedSearches}
            showClear={savedSearches.length > 0}
          >
            {savedSearches.map((s) => (
              <SavedRow
                key={s.id}
                title={prettySearchName(s)}
                meta={`Saved ${formatSavedDate(s.savedAt)}`}
                href={s.href || "/marketplace"}
                onRemove={() => removeSavedSearch(s.id)}
              />
            ))}
          </SavedSection>
        </div>

        {/* Other saved in 2-col grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { title: "Saved events", items: savedEvents, key: SAVED_EVENTS_KEY, setter: setSavedEvents, empty: "No saved events yet. Save events from What's On." },
            { title: "Saved deals", items: savedDeals, key: SAVED_DEALS_KEY, setter: setSavedDeals, empty: "No saved deals yet." },
            { title: "Saved businesses", items: savedBusinesses, key: SAVED_BUSINESSES_KEY, setter: setSavedBusinesses, empty: "No saved businesses yet." },
            { title: "Saved walks", items: savedWalks, key: SAVED_WALKS_KEY, setter: setSavedWalks, empty: "No saved walks yet." },
            { title: "Saved heritage", items: savedHeritage, key: SAVED_HERITAGE_KEY, setter: setSavedHeritage, empty: "No saved heritage sites yet." },
          ].map((section) => (
            <SavedSection
              key={section.title}
              title={section.title}
              empty={section.empty}
              onClear={() => clearSavedItems(section.setter, section.key)}
              showClear={section.items.length > 0}
            >
              {section.items.map((item) => (
                <SavedRow
                  key={item.id}
                  image={item.image}
                  title={item.title}
                  meta={item.meta ?? undefined}
                  savedAt={formatSavedDate(item.savedAt)}
                  href={item.href}
                  onRemove={() => removeSavedItem(item.id, section.items, section.setter, section.key)}
                />
              ))}
            </SavedSection>
          ))}
        </div>
      </div>

      </>}

    </main>
  );
}

// ── SUB-COMPONENTS ────────────────────────────────────────────────────────────

function SavedSection({
  title,
  empty,
  onClear,
  showClear,
  children,
}: {
  title: string;
  empty: string;
  onClear: () => void;
  showClear: boolean;
  children: React.ReactNode;
}) {
  const hasChildren = Array.isArray(children)
    ? (children as React.ReactNode[]).filter(Boolean).length > 0
    : !!children;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {showClear && (
          <button onClick={onClear} className="text-xs font-semibold text-[#D90429] hover:underline">
            Clear all
          </button>
        )}
      </div>
      {!hasChildren ? (
        <p className="text-sm text-slate-500">{empty}</p>
      ) : (
        <ul className="divide-y divide-slate-100">{children}</ul>
      )}
    </div>
  );
}

function SavedRow({
  image,
  title,
  meta,
  savedAt,
  href,
  onRemove,
}: {
  image?: string | null;
  title: string;
  meta?: string;
  savedAt?: string;
  href: string;
  onRemove: () => void;
}) {
  return (
    <li className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
      <div className="flex min-w-0 items-center gap-3">
        {image !== undefined && (
          <div className="h-10 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[9px] text-slate-300">No img</div>
            )}
          </div>
        )}
        <div className="min-w-0">
          <div className="truncate text-xs font-medium text-slate-900">{title}</div>
          {(meta || savedAt) && (
            <div className="mt-0.5 truncate text-[10px] text-slate-400">
              {[meta, savedAt].filter(Boolean).join(" · ")}
            </div>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Link href={href} className="rounded px-2 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50">Open</Link>
        <button onClick={onRemove} className="rounded px-2 py-1.5 text-[11px] font-semibold text-[#D90429] hover:bg-red-50">Remove</button>
      </div>
    </li>
  );
}
