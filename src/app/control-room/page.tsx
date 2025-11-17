// src/app/control-room/page.tsx
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY env vars for control room."
  );
}

type EventRow = {
  id: string;
  title: string | null;
  starts_at: string | null;
  venue: string | null;
  category: string | null;
  summary: string | null;
  ticket_url: string | null;
  featured: boolean | null;
  approved: boolean | null;
};

type ListingRow = {
  id: string;
  title: string | null;
  category: string | null;
  area: string | null;
  price_pence: number | null;
  boosted: boolean | null;
  approved: boolean | null;
  date_listed: string | null;
};

type BusinessRow = {
  id: string;
  name: string | null;
  area: string | null;
  category: string | null;
  approved: boolean | null;
  featured_on_home: boolean | null;
};

type DealRow = {
  id: string;
  title: string | null;
  business_name: string | null;
  area: string | null;
  valid_until: string | null;
  approved: boolean | null;
};

async function loadData() {
  const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
    auth: { persistSession: false },
  });

  const nowIso = new Date().toISOString();

  const [eventsRes, listingsRes, businessesRes, dealsRes] = await Promise.all([
    supabase
      .from("events")
      .select(
        "id, title, starts_at, venue, category, summary, ticket_url, featured, approved"
      )
      .gte("starts_at", nowIso)
      .order("starts_at", { ascending: true })
      .limit(30),
    supabase
      .from("marketplace_listings")
      .select(
        "id, title, category, area, price_pence, boosted, approved, date_listed"
      )
      .order("date_listed", { ascending: false })
      .limit(30),
    supabase
      .from("businesses")
      .select("id, name, area, category, approved, featured_on_home")
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("deals")
      .select("id, title, business_name, area, valid_until, approved")
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  if (eventsRes.error) {
    console.error("[control-room] events load error", eventsRes.error);
  }
  if (listingsRes.error) {
    console.error("[control-room] listings load error", listingsRes.error);
  }
  if (businessesRes.error) {
    console.error("[control-room] businesses load error", businessesRes.error);
  }
  if (dealsRes.error) {
    console.error("[control-room] deals load error", dealsRes.error);
  }

  return {
    events: (eventsRes.data as EventRow[] | null) ?? [],
    listings: (listingsRes.data as ListingRow[] | null) ?? [],
    businesses: (businessesRes.data as BusinessRow[] | null) ?? [],
    deals: (dealsRes.data as DealRow[] | null) ?? [],
  };
}

function formatDateTime(value: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatPricePence(p: number | null) {
  if (p == null) return "";
  return `£${(p / 100).toFixed(0)}`;
}

function formatShortTime(value: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function LoginScreen({ hasError }: { hasError: boolean }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-600">
          ManxHive • Control Room
        </p>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">
          Admin access
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Enter your control room password to manage live site content.
        </p>

        {hasError && (
          <p className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
            Password was incorrect. Please try again.
          </p>
        )}

        <form
          method="POST"
          action="/api/control-room-login"
          className="mt-4 space-y-3"
        >
          <div className="space-y-1">
            <label
              htmlFor="password"
              className="text-[11px] font-medium text-slate-700"
            >
              Control room password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              required
            />
          </div>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-400"
          >
            Enter control room
          </button>
        </form>

        <p className="mt-4 text-[10px] text-slate-500">
          This area is restricted. Keep your password safe.
        </p>
      </div>
    </main>
  );
}

export default async function ControlRoomPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // ===== PASSWORD GATE (cookie only) =====
  const cookieStore = cookies();
  const authCookie = cookieStore.get("mh_cr_auth")?.value;
  const loginAtCookie = cookieStore.get("mh_cr_login_at")?.value || null;
  const expiresAtCookie = cookieStore.get("mh_cr_expires_at")?.value || null;

  const authorised = authCookie === "yes";

  const errorParam = Array.isArray(searchParams?.error)
    ? searchParams?.error[0]
    : searchParams?.error;
  const hasError = errorParam === "1";

  if (!authorised) {
    return <LoginScreen hasError={hasError} />;
  }
  // ===== END PASSWORD GATE =====

  const { events, listings, businesses, deals } = await loadData();

  const lastLoginLabel = loginAtCookie
    ? formatDateTime(loginAtCookie)
    : "This session";
  const sessionExpiresTime = formatShortTime(expiresAtCookie);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-2 rounded-2xl border bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">
            ManxHive • Control Room
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            Site admin dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Approve, feature and manage content across events, marketplace,
            businesses and deals.
          </p>
          <p className="mt-2 text-[11px] text-slate-500">
            Logged in as <span className="font-semibold">admin</span>.{" "}
            <span className="inline-block">
              Last login: {lastLoginLabel}
              {sessionExpiresTime && (
                <> • Session expires at {sessionExpiresTime}</>
              )}
            </span>
          </p>
        </div>
        <div className="space-y-2 text-xs text-slate-500 md:text-right">
          <p>
            You&apos;re using{" "}
            <span className="font-mono text-[11px]">
              SUPABASE_SERVICE_KEY
            </span>{" "}
            via server-only admin client.
          </p>
          <p>Changes here update live data immediately.</p>
          <form
            method="POST"
            action="/api/control-room-logout"
            className="inline-flex justify-end"
          >
            <button
              type="submit"
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
            >
              Log out
            </button>
          </form>
        </div>
      </header>

      {/* Quick actions */}
      <section className="rounded-2xl border bg-white p-4 shadow-sm text-xs">
        <p className="mb-2 text-[11px] font-semibold text-slate-700">
          Quick actions
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/whats-on#submit-event"
            className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-slate-800"
          >
            + Add new event
          </Link>
          <Link
            href="/deals#submit-deal"
            className="inline-flex items-center rounded-full border border-slate-200 bg.white px-3 py-1.5 text-[11px] font-medium text-slate-900 hover:bg-slate-50"
          >
            + Add new deal
          </Link>
          <Link
            href="/marketplace#submit-listing"
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-900 hover:bg-slate-50"
          >
            + Add marketplace listing
          </Link>
          <Link
            href="/list-business"
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-900 hover:bg-slate-50"
          >
            + Add business
          </Link>
        </div>
        <p className="mt-2 text-[10px] text-slate-400">
          These link to the same submission flows your users see, so you can
          quickly add content and then approve/feature it below.
        </p>
      </section>

      {/* Tabs summary */}
      <section className="grid gap-3 text-xs md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-3 shadow-sm">
          <p className="text-[11px] text-slate-500">Upcoming events</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">
            {events.length}
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-3 shadow-sm">
          <p className="text-[11px] text-slate-500">Marketplace listings</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">
            {listings.length}
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-3 shadow-sm">
          <p className="text-[11px] text-slate-500">Businesses</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">
            {businesses.length}
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-3 shadow-sm">
          <p className="text-[11px] text-slate-500">Deals</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">
            {deals.length}
          </p>
        </div>
      </section>

      {/* Events */}
      <section className="space-y-3 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">
            Events moderation
          </h2>
          <Link
            href="/whats-on"
            className="text-xs font-medium text-rose-600 hover:underline"
          >
            View public What&apos;s On →
          </Link>
        </div>
        {events.length === 0 ? (
          <p className="text-xs text-slate-500">No upcoming events.</p>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="min-w-full border-separate border-spacing-y-1">
              <thead className="text-[11px] text-slate-500">
                <tr>
                  <th className="px-2 py-1 text-left">Title</th>
                  <th className="px-2 py-1 text-left">When</th>
                  <th className="px-2 py-1 text-left">Venue</th>
                  <th className="px-2 py-1 text-left">Category</th>
                  <th className="px-2 py-1 text-left">Approved</th>
                  <th className="px-2 py-1 text-left">Featured</th>
                  <th className="px-2 py-1 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => {
                  const approved = !!ev.approved;
                  const featured = !!ev.featured;
                  return (
                    <tr key={ev.id} className="bg-slate-50/60">
                      <td className="px-2 py-1 align-top">
                        <div className="font-medium text-slate-900">
                          {ev.title || "(no title)"}
                        </div>
                        {ev.summary && (
                          <div className="line-clamp-1 text-[11px] text-slate-500">
                            {ev.summary}
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-1 align-top">
                        {formatDateTime(ev.starts_at)}
                      </td>
                      <td className="px-2 py-1 align-top">
                        {ev.venue || ""}
                      </td>
                      <td className="px-2 py-1 align-top">
                        {ev.category || ""}
                      </td>
                      <td className="px-2 py-1 align-top">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] ${
                            approved
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {approved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="px-2 py-1 align-top">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] ${
                            featured
                              ? "bg-indigo-50 text-indigo-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {featured ? "Featured" : "—"}
                        </span>
                      </td>
                      <td className="space-y-1 px-2 py-1 align-top text-right">
                        <div className="inline-flex flex-wrap justify-end gap-1">
                          <form
                            method="POST"
                            action="/api/admin/update"
                            className="inline"
                          >
                            <input type="hidden" name="table" value="events" />
                            <input type="hidden" name="id" value={ev.id} />
                            <input
                              type="hidden"
                              name="field"
                              value="approved"
                            />
                            <input
                              type="hidden"
                              name="value"
                              value={approved ? "false" : "true"}
                            />
                            <button
                              type="submit"
                              className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-medium text-white hover:bg-slate-800"
                            >
                              {approved ? "Unapprove" : "Approve"}
                            </button>
                          </form>
                          <form
                            method="POST"
                            action="/api/admin/update"
                            className="inline"
                          >
                            <input type="hidden" name="table" value="events" />
                            <input type="hidden" name="id" value={ev.id} />
                            <input
                              type="hidden"
                              name="field"
                              value="featured"
                            />
                            <input
                              type="hidden"
                              name="value"
                              value={featured ? "false" : "true"}
                            />
                            <button
                              type="submit"
                              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-medium text-slate-900 hover:bg-slate-100"
                            >
                              {featured ? "Unfeature" : "Make featured"}
                            </button>
                          </form>
                          <Link
                            href={`/whats-on/${ev.id}`}
                            className="rounded-full border border-rose-200 bg-white px-2.5 py-1 text-[10px] font-medium text-rose-600 hover:bg-rose-50"
                          >
                            View page
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Marketplace */}
      <section className="space-y-3 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">
            Marketplace moderation
          </h2>
          <Link
            href="/marketplace"
            className="text-xs font-medium text-rose-600 hover:underline"
          >
            View public marketplace →
          </Link>
        </div>
        {listings.length === 0 ? (
          <p className="text-xs text-slate-500">No listings found.</p>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="min-w-full border-separate border-spacing-y-1">
              <thead className="text-[11px] text-slate-500">
                <tr>
                  <th className="px-2 py-1 text-left">Title</th>
                  <th className="px-2 py-1 text-left">Area</th>
                  <th className="px-2 py-1 text-left">Category</th>
                  <th className="px-2 py-1 text-left">Price</th>
                  <th className="px-2 py-1 text-left">Approved</th>
                  <th className="px-2 py-1 text-left">Boosted</th>
                  <th className="px-2 py-1 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((l) => {
                  const approved = !!l.approved;
                  const boosted = !!l.boosted;
                  return (
                    <tr key={l.id} className="bg-slate-50/60">
                      <td className="px-2 py-1 align-top">
                        <div className="font-medium text-slate-900">
                          {l.title || "(no title)"}
                        </div>
                      </td>
                      <td className="px-2 py-1 align-top">{l.area || ""}</td>
                      <td className="px-2 py-1 align-top">
                        {l.category || ""}
                      </td>
                      <td className="px-2 py-1 align-top">
                        {formatPricePence(l.price_pence)}
                      </td>
                      <td className="px-2 py-1 align-top">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] ${
                            approved
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {approved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="px-2 py-1 align-top">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] ${
                            boosted
                              ? "bg-indigo-50 text-indigo-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {boosted ? "Boosted" : "—"}
                        </span>
                      </td>
                      <td className="space-y-1 px-2 py-1 align-top text-right">
                        <div className="inline-flex flex-wrap justify-end gap-1">
                          <form
                            method="POST"
                            action="/api/admin/update"
                            className="inline"
                          >
                            <input
                              type="hidden"
                              name="table"
                              value="marketplace_listings"
                            />
                            <input type="hidden" name="id" value={l.id} />
                            <input
                              type="hidden"
                              name="field"
                              value="approved"
                            />
                            <input
                              type="hidden"
                              name="value"
                              value={approved ? "false" : "true"}
                            />
                            <button
                              type="submit"
                              className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-medium text-white hover:bg-slate-800"
                            >
                              {approved ? "Unapprove" : "Approve"}
                            </button>
                          </form>
                          <form
                            method="POST"
                            action="/api/admin/update"
                            className="inline"
                          >
                            <input
                              type="hidden"
                              name="table"
                              value="marketplace_listings"
                            />
                            <input type="hidden" name="id" value={l.id} />
                            <input
                              type="hidden"
                              name="field"
                              value="boosted"
                            />
                            <input
                              type="hidden"
                              name="value"
                              value={boosted ? "false" : "true"}
                            />
                            <button
                              type="submit"
                              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-medium text-slate-900 hover:bg-slate-100"
                            >
                              {boosted ? "Unboost" : "Boost"}
                            </button>
                          </form>
                          <Link
                            href={`/marketplace/item/${l.id}`}
                            className="rounded-full border border-rose-200 bg-white px-2.5 py-1 text-[10px] font-medium text-rose-600 hover:bg-rose-50"
                          >
                            View page
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Businesses */}
      <section className="space-y-3 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">
            Business directory
          </h2>
          <Link
            href="/businesses"
            className="text-xs font-medium text-rose-600 hover:underline"
          >
            View public businesses →
          </Link>
        </div>
        {businesses.length === 0 ? (
          <p className="text-xs text-slate-500">No businesses found.</p>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="min-w-full border-separate border-spacing-y-1">
              <thead className="text-[11px] text-slate-500">
                <tr>
                  <th className="px-2 py-1 text-left">Name</th>
                  <th className="px-2 py-1 text-left">Area</th>
                  <th className="px-2 py-1 text-left">Category</th>
                  <th className="px-2 py-1 text-left">Approved</th>
                  <th className="px-2 py-1 text-left">Home featured</th>
                  <th className="px-2 py-1 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {businesses.map((b) => {
                  const approved = !!b.approved;
                  const featured = !!b.featured_on_home;
                  return (
                    <tr key={b.id} className="bg-slate-50/60">
                      <td className="px-2 py-1 align-top">
                        <div className="font-medium text-slate-900">
                          {b.name || "(no name)"}
                        </div>
                      </td>
                      <td className="px-2 py-1 align-top">{b.area || ""}</td>
                      <td className="px-2 py-1 align-top">
                        {b.category || ""}
                      </td>
                      <td className="px-2 py-1 align-top">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] ${
                            approved
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {approved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="px-2 py-1 align-top">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] ${
                            featured
                              ? "bg-indigo-50 text-indigo-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {featured ? "Featured" : "—"}
                        </span>
                      </td>
                      <td className="space-y-1 px-2 py-1 align-top text-right">
                        <div className="inline-flex flex-wrap justify-end gap-1">
                          <form
                            method="POST"
                            action="/api/admin/update"
                            className="inline"
                          >
                            <input
                              type="hidden"
                              name="table"
                              value="businesses"
                            />
                            <input type="hidden" name="id" value={b.id} />
                            <input
                              type="hidden"
                              name="field"
                              value="approved"
                            />
                            <input
                              type="hidden"
                              name="value"
                              value={approved ? "false" : "true"}
                            />
                            <button
                              type="submit"
                              className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-medium text-white hover:bg-slate-800"
                            >
                              {approved ? "Unapprove" : "Approve"}
                            </button>
                          </form>
                          <form
                            method="POST"
                            action="/api/admin/update"
                            className="inline"
                          >
                            <input
                              type="hidden"
                              name="table"
                              value="businesses"
                            />
                            <input type="hidden" name="id" value={b.id} />
                            <input
                              type="hidden"
                              name="field"
                              value="featured_on_home"
                            />
                            <input
                              type="hidden"
                              name="value"
                              value={featured ? "false" : "true"}
                            />
                            <button
                              type="submit"
                              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-medium text-slate-900 hover:bg-slate-100"
                            >
                              {featured ? "Remove home feature" : "Feature home"}
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Deals */}
      <section className="mb-10 space-y-3 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">
            Deals moderation
          </h2>
          <Link
            href="/deals"
            className="text-xs font-medium text-rose-600 hover:underline"
          >
            View public deals →
          </Link>
        </div>
        {deals.length === 0 ? (
          <p className="text-xs text-slate-500">No deals found.</p>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="min-w-full border-separate border-spacing-y-1">
              <thead className="text-[11px] text-slate-500">
                <tr>
                  <th className="px-2 py-1 text-left">Title</th>
                  <th className="px-2 py-1 text-left">Business</th>
                  <th className="px-2 py-1 text-left">Area</th>
                  <th className="px-2 py-1 text-left">Valid until</th>
                  <th className="px-2 py-1 text-left">Approved</th>
                  <th className="px-2 py-1 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((d) => {
                  const approved = !!d.approved;
                  return (
                    <tr key={d.id} className="bg-slate-50/60">
                      <td className="px-2 py-1 align-top">
                        <div className="font-medium text-slate-900">
                          {d.title || "(no title)"}
                        </div>
                      </td>
                      <td className="px-2 py-1 align-top">
                        {d.business_name || ""}
                      </td>
                      <td className="px-2 py-1 align-top">{d.area || ""}</td>
                      <td className="px-2 py-1 align-top">
                        {formatDate(d.valid_until)}
                      </td>
                      <td className="px-2 py-1 align-top">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] ${
                            approved
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {approved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="space-y-1 px-2 py-1 align-top text-right">
                        <div className="inline-flex flex-wrap justify-end gap-1">
                          <form
                            method="POST"
                            action="/api/admin/update"
                            className="inline"
                          >
                            <input type="hidden" name="table" value="deals" />
                            <input type="hidden" name="id" value={d.id} />
                            <input
                              type="hidden"
                              name="field"
                              value="approved"
                            />
                            <input
                              type="hidden"
                              name="value"
                              value={approved ? "false" : "true"}
                            />
                            <button
                              type="submit"
                              className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-medium text-white hover:bg-slate-800"
                            >
                              {approved ? "Unapprove" : "Approve"}
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}