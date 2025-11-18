"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  CheckCircle2,
  MessageCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// ---------- Supabase browser client (defensive) ----------
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase =
  supabaseUrl && supabaseAnon ? createClient(supabaseUrl, supabaseAnon) : null;

// ---------- Types ----------
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

// ---------- Small pill for status ----------
function StatusPill({ status }: { status: string }) {
  const normalized = (status || "").toLowerCase();
  let label = status || "Draft";
  let classes =
    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium";

  if (normalized === "approved" || normalized === "active") {
    label = "Approved";
    classes += " bg-emerald-50 text-emerald-700 border border-emerald-100";
  } else if (normalized === "pending") {
    label = "Pending review";
    classes += " bg-amber-50 text-amber-700 border border-amber-100";
  } else if (normalized === "rejected") {
    label = "Rejected";
    classes += " bg-rose-50 text-rose-700 border border-rose-100";
  } else {
    label = "Draft";
    classes += " bg-gray-50 text-gray-600 border border-gray-200";
  }

  return (
    <span className={classes}>
      <span
        className={
          "h-1.5 w-1.5 rounded-full " +
          (normalized === "approved" || normalized === "active"
            ? "bg-emerald-500"
            : normalized === "pending"
            ? "bg-amber-500"
            : normalized === "rejected"
            ? "bg-rose-500"
            : "bg-gray-400")
        }
      />
      {label}
    </span>
  );
}

// ---------- Page ----------
export default function ProviderDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [provider, setProvider] = useState<Provider | null>(null);

  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [enquiries, setEnquiries] = useState<EnquirySummary[]>([]);

  const [error, setError] = useState<string | null>(null);

  // Load auth + profile + provider + listings + enquiries
  useEffect(() => {
    if (!supabase) {
      setError(
        "Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      setLoading(false);
      return;
    }

    async function load() {
      try {
        setLoading(true);
        setError(null);

        // 1) Who's logged in?
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("[provider-dashboard] auth error:", userError.message);
          setError("Could not verify your session. Please refresh.");
          setLoading(false);
          return;
        }

        if (!user) {
          setLoading(false);
          return; // not logged in; UI below shows CTA
        }

        setUserId(user.id);
        setUserEmail(user.email ?? null);

        // 2) Profile (including is_admin)
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("display_name, is_admin")
          .eq("id", user.id)
          .maybeSingle<Profile>();

        if (profileError) {
          console.error(
            "[provider-dashboard] profile error:",
            profileError.message
          );
        }

        setDisplayName(
          profile?.display_name || user.email || "Your account"
        );
        setIsAdmin(!!profile?.is_admin);

        console.log("[provider-dashboard] user", {
          userId: user.id,
          email: user.email,
          is_admin_column: profile?.is_admin,
          isAdminState: !!profile?.is_admin,
        });

        // 3) Provider record
        const { data: providerRow, error: providerError } = await supabase
          .from("providers")
          .select(
            `
            id,
            user_id,
            name,
            business_name,
            slug,
            status,
            created_at,
            updated_at
          `
          )
          .eq("user_id", user.id)
          .maybeSingle<Provider>();

        if (providerError && providerError.code !== "PGRST116") {
          console.error(
            "[provider-dashboard] provider fetch error:",
            providerError.message
          );
        }

        const finalProvider = providerRow ?? null;
        setProvider(finalProvider);

        // 4) Listings for this user (if any)
        const { data: listingsData, error: listingsError } = await supabase
          .from("marketplace_listings")
          .select(
            "id, title, category, approved, boosted, date_listed, seller_user_id"
          )
          .eq("seller_user_id", user.id)
          .order("date_listed", { ascending: false });

        if (listingsError) {
          console.error(
            "[provider-dashboard] listings error:",
            listingsError.message
          );
        }

        const mappedListings: ListingSummary[] =
          listingsData?.map((l: any) => ({
            id: l.id,
            title: l.title,
            category: l.category ?? null,
            approved: !!l.approved,
            boosted: !!l.boosted,
            date_listed: l.date_listed,
          })) ?? [];

        setListings(mappedListings);

        // 5) Enquiries (best-effort, scoped to this seller)
        try {
          const { data: enquiriesData, error: enquiriesError } = await supabase
            .from("marketplace_enquiries")
            .select(
              `
              id,
              listing_id,
              buyer_name,
              buyer_email,
              message,
              created_at,
              status
            `
            )
            .eq("seller_user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(5);

          if (enquiriesError) {
            console.error(
              "[provider-dashboard] enquiries error:",
              enquiriesError.message
            );
          } else {
            const mappedEnquiries: EnquirySummary[] =
              enquiriesData?.map((e: any) => ({
                id: e.id,
                listing_id: e.listing_id,
                buyer_name: e.buyer_name ?? null,
                buyer_email: e.buyer_email ?? null,
                message_preview: (e.message || "").slice(0, 80),
                created_at: e.created_at,
                status: e.status ?? "New",
              })) ?? [];

            setEnquiries(mappedEnquiries);
          }
        } catch (enquiryCatchErr) {
          console.warn(
            "[provider-dashboard] enquiries table not wired yet:",
            enquiryCatchErr
          );
        }
      } catch (e: any) {
        console.error("[provider-dashboard] unexpected error:", e);
        setError("Something went wrong loading your dashboard.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // ---------- Loading state ----------
  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-sm text-gray-600">Loading your dashboard…</p>
      </main>
    );
  }

  // ---------- Not logged in ----------
  if (!userId) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Provider dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Sign in to manage your business listings, enquiries, and visibility
            across ManxHive.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            {error}
          </div>
        )}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-red-50 p-2">
              <Briefcase className="h-5 w-5 text-[#D90429]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Access your provider tools
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Log in or create a free account to list your business and get
                discovered by people across the Isle of Man.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/account"
                  className="inline-flex items-center justify-center rounded-xl bg-[#D90429] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#b50321]"
                >
                  Log in / Sign up
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
                >
                  Talk to us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ---------- Logged in, no provider profile yet ----------
  if (!provider) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 space-y-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            Provider dashboard
          </h1>
          <p className="text-sm text-gray-600">
            Welcome, {displayName}. Let&apos;s get your business live on
            ManxHive.
          </p>
        </header>

        {error && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            {error}
          </div>
        )}

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex gap-3">
            <div className="mt-0.5 rounded-full bg-red-50 p-2">
              <AlertCircle className="h-5 w-5 text-[#D90429]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                You haven&apos;t listed a business yet
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Create your provider profile to appear in search, showcase
                services, receive enquiries, and feature in local discovery.
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-gray-600">
                <li>Verified presence in the ManxHive business directory</li>
                <li>Direct enquiries without exposing your email address</li>
                <li>Optional boosted placements for extra visibility</li>
              </ul>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#D90429] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#b50321]"
                >
                  Apply to list your business
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
                >
                  Back to homepage
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // ---------- Logged in + provider exists ----------
  const status = provider.status || "pending";

  const completion =
    status === "approved" ? 92 : status === "pending" ? 68 : 40;

  const enquiriesCount = enquiries.length;
  const approvedListings = listings.filter((l) => l.approved).length;

  // Public-facing profile URL
  const publicProfileHref = provider.slug
    ? `/providers/${provider.slug}`
    : `/providers/${provider.id}`;

  const businessLabel =
    provider.business_name || provider.name || displayName || "Your business";

  console.log("[provider-dashboard] final isAdmin state:", isAdmin);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Provider dashboard</span>
            <span className="h-1 w-1 rounded-full bg-gray-300" />
            <span>{provider.slug || provider.id}</span>
          </div>
          <h1 className="mt-1 flex flex-wrap items-center gap-2 text-2xl font-semibold text-gray-900">
            {businessLabel}
            {isAdmin && (
              <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
                Admin
              </span>
            )}
            <StatusPill status={status} />
          </h1>
          <p className="text-sm text-gray-600">
            Manage your profile, listings, and enquiries in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <Link
              href="/provider-dashboard/featured"
              className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-50"
            >
              Manage featured businesses
            </Link>
          )}
          <Link
            href={publicProfileHref}
            className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-50"
          >
            View how you appear
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#D90429] px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-[#b50321]"
          >
            Get support
          </Link>
        </div>
      </header>

      {/* Top stats */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">Profile completion</p>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {completion}%
          </p>
          <p className="mt-1 text-[10px] text-gray-500">
            Complete your details for better rankings in local search.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">Approved listings</p>
            <Briefcase className="h-4 w-4 text-[#D90429]" />
          </div>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {approvedListings}
          </p>
          <p className="mt-1 text-[10px] text-gray-500">
            Listings live on the marketplace.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">Recent enquiries</p>
            <MessageCircle className="h-4 w-4 text-[#D90429]" />
          </div>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {enquiriesCount}
          </p>
          <p className="mt-1 text-[10px] text-gray-500">
            Last few enquiries linked to your listings.
          </p>
        </div>
      </section>

      {/* Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left / main column */}
        <section className="space-y-4 lg:col-span-2">
          {/* Business profile summary */}
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50">
                <Briefcase className="h-5 w-5 text-[#D90429]" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Your business profile
                </h2>
                <p className="text-xs text-gray-600">
                  Keep your information accurate so customers know who you are
                  and how to contact you.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 text-xs text-gray-700 sm:grid-cols-2">
              <div>
                <p className="text-gray-500">Business name</p>
                <p className="font-medium">
                  {businessLabel || "Not set"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Listing slug</p>
                <p className="font-mono text-[10px] text-gray-800">
                  {provider.slug || "n/a"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <StatusPill status={status} />
              </div>
              <div>
                <p className="text-gray-500">Member since</p>
                <p className="font-medium">
                  {provider.created_at
                    ? new Date(provider.created_at).toLocaleDateString()
                    : "n/a"}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-50"
              >
                Update business details
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-50"
              >
                Request boosted placement
              </Link>
            </div>
          </div>

          {/* Listings overview */}
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-gray-900">
                Your marketplace listings
              </h2>
              <Link
                href="/marketplace/create"
                className="text-[10px] font-medium text-[#D90429] hover:underline"
              >
                + Create new listing
              </Link>
            </div>

            {listings.length === 0 ? (
              <p className="text-xs text-gray-600">
                You don&apos;t have any marketplace listings yet.
              </p>
            ) : (
              <ul className="space-y-2 text-xs">
                {listings.slice(0, 6).map((l) => (
                  <li
                    key={l.id}
                    className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium text-gray-900">
                        {l.title}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {l.category || "Uncategorised"} •{" "}
                        {l.date_listed
                          ? new Date(l.date_listed).toLocaleDateString()
                          : "n/a"}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-[9px]">
                      <span
                        className={
                          "rounded-full px-2 py-0.5 " +
                          (l.approved
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700")
                        }
                      >
                        {l.approved ? "Approved" : "Pending"}
                      </span>
                      {l.boosted && (
                        <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[8px] uppercase tracking-wide text-purple-700">
                          Boosted
                        </span>
                      )}
                      <Link
                        href={`/marketplace/item/${l.id}`}
                        className="text-[9px] text-[#D90429] hover:underline"
                      >
                        View
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {listings.length > 6 && (
              <p className="mt-2 text-[9px] text-gray-500">
                Showing latest 6. View all from your{" "}
                <Link
                  href="/account"
                  className="text-[#D90429] hover:underline"
                >
                  account page
                </Link>
                .
              </p>
            )}
          </div>
        </section>

        {/* Right column */}
        <aside className="space-y-4">
          {/* Recent enquiries */}
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-900">
                Recent enquiries
              </h3>
              <MessageCircle className="h-4 w-4 text-[#D90429]" />
            </div>

            {enquiries.length === 0 ? (
              <p className="text-[11px] text-gray-500">
                No enquiries yet. When customers contact you via your listings,
                they&apos;ll appear here.
              </p>
            ) : (
              <>
                <ul className="space-y-2">
                  {enquiries.map((e) => (
                    <li
                      key={e.id}
                      className="rounded-lg border px-2.5 py-2 text-[10px] text-gray-800"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-gray-900">
                          {e.buyer_name || e.buyer_email || "Enquiry"}
                        </span>
                        <span className="text-[8px] text-gray-500">
                          {e.created_at
                            ? new Date(e.created_at).toLocaleDateString()
                            : ""}
                        </span>
                      </div>
                      {e.listing_id && (
                        <div className="mt-0.5 text-[9px] text-gray-500">
                          Listing ID: {e.listing_id}
                        </div>
                      )}
                      <div className="mt-0.5 line-clamp-2 text-[9px] text-gray-700">
                        {e.message_preview}
                      </div>
                      <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-[8px] text-gray-600">
                        <span
                          className={
                            "h-1.5 w-1.5 rounded-full " +
                            (e.status?.toLowerCase() === "new"
                              ? "bg-emerald-500"
                              : e.status?.toLowerCase() === "replied"
                              ? "bg-blue-500"
                              : "bg-gray-400")
                          }
                        />
                        {e.status || "New"}
                      </div>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/account/enquiries"
                  className="mt-2 inline-block text-[10px] font-medium text-[#D90429] hover:underline"
                >
                  View all enquiries
                </Link>
              </>
            )}
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <h3 className="text-xs font-semibold text-gray-900">
              Quick actions
            </h3>
            <div className="mt-3 flex flex-col gap-2 text-xs">
              <Link
                href="/marketplace/create"
                className="inline-flex items-center justify-between rounded-lg border px-3 py-2 hover:bg-gray-50"
              >
                <span>Create a new listing</span>
                <ArrowRight className="h-3 w-3 text-gray-400" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-between rounded-lg border px-3 py-2 hover:bg-gray-50"
              >
                <span>Update my business info</span>
                <ArrowRight className="h-3 w-3 text-gray-400" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-between rounded-lg border px-3 py-2 hover:bg-gray-50"
              >
                <span>Ask about boosted placements</span>
                <ArrowRight className="h-3 w-3 text-gray-400" />
              </Link>
            </div>
          </div>

          {/* Coming soon */}
          <div className="rounded-2xl border bg-gradient-to-br from-[#D90429] via-[#E7423A] to-[#FF7A3C] p-4 text-white shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-white/80">
              Coming soon
            </h3>
            <p className="mt-1 text-sm font-semibold">
              Self-serve listing editor &amp; insights
            </p>
            <p className="mt-1 text-[10px] text-white/80">
              You&apos;ll soon be able to edit your profile, manage images, and
              see performance stats directly from this dashboard.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}