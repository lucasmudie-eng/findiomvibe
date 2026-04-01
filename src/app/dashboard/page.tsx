// src/app/dashboard/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  PlusCircle,
  Mail,
  Edit3,
  BarChart3,
  TrendingUp,
  Zap,
  HelpCircle,
  User,
  ShieldCheck,
  Settings,
} from "lucide-react";
import { supabaseServer } from "@/lib/supabase/server";
import ProfileCompletion from "@/app/components/ProfileCompletion";

// Minimal local shape of a provider row for type-safety
type ProviderRow = {
  logo_url?: string | null;
  images?: string[] | null;
  summary?: string | null;
  services?: { name?: string | null }[] | null;
  areas_served?: string[] | null;
  email?: string | null;
  phone?: string | null;
  description?: string | null;
};

function focusLink(id: string) {
  return `/providers/manage?focus=${id}`;
}

function computeCompletion(p: ProviderRow | null) {
  const hasLogo =
    !!p?.logo_url || (Array.isArray(p?.images) && p.images!.length > 0);
  const hasSummary = !!(p?.summary && p.summary.trim().length >= 40);
  const hasServices =
    Array.isArray(p?.services) &&
    p.services!.filter((s) => s?.name && s.name.trim().length > 0).length >= 3;
  const hasAreas =
    Array.isArray(p?.areas_served) && p.areas_served!.length > 0;
  const hasContact = !!p?.email || !!p?.phone;
  const hasPhotos = Array.isArray(p?.images) && p.images!.length >= 3;
  const hasAbout = !!(p?.description && p.description.trim().length >= 120);

  const items = [
    {
      id: "logo",
      label: "Add a logo",
      done: hasLogo,
      hint: "Square PNG/JPG, at least 512×512.",
      actionHref: hasLogo ? undefined : focusLink("logo"),
    },
    {
      id: "summary",
      label: "Write a short summary (≥ 40 chars)",
      done: hasSummary,
      hint: "One or two sentences that sell your service.",
      actionHref: hasSummary ? undefined : focusLink("summary"),
    },
    {
      id: "services",
      label: "Add at least 3 services with pricing",
      done: hasServices,
      hint: "Clear names + simple pricing works best.",
      actionHref: hasServices ? undefined : focusLink("services"),
    },
    {
      id: "areas",
      label: "Specify areas served",
      done: hasAreas,
      hint: "Helps us surface you to nearby customers.",
      actionHref: hasAreas ? undefined : focusLink("areas"),
    },
    {
      id: "contact",
      label: "Add contact info (email or phone)",
      done: hasContact,
      hint: "So customers can reach you instantly.",
      actionHref: hasContact ? undefined : focusLink("contact"),
    },
    {
      id: "photos",
      label: "Upload 3+ photos",
      done: hasPhotos,
      hint: "Real work photos build trust.",
      actionHref: hasPhotos ? undefined : focusLink("photos"),
    },
    {
      id: "about",
      label: "Add an About section (≥ 120 chars)",
      done: hasAbout,
      hint: "Tell customers why you’re great.",
      actionHref: hasAbout ? undefined : focusLink("about"),
    },
  ];

  return { items };
}

export default async function DashboardPage() {
  const supabase = supabaseServer();
  let userName = "there";

  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login?next=/dashboard");

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();

    userName = profile?.display_name || user.email?.split("@")[0] || "there";
  }

  const provider: ProviderRow | null = null;
  const completion = computeCompletion(provider);

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      {/* Welcome banner */}
      <section
        aria-label="Welcome"
        className="relative overflow-hidden rounded-3xl bg-slate-950 text-white shadow-md"
      >
        <div className="pointer-events-none absolute -left-12 -top-12 h-48 w-48 rounded-full bg-[#D90429]/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-slate-700/30 blur-2xl" />
        <div className="relative flex flex-col items-start justify-between gap-6 p-8 sm:flex-row sm:items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Dashboard
            </p>
            <h1 className="mt-1 font-playfair text-3xl font-bold sm:text-4xl">
              Welcome back, {userName}<span className="text-[#D90429]">.</span>
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Manage your listings, track performance, and grow your reach on ManxHive.
            </p>
          </div>
          <div className="shrink-0">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-white/10">
              <User className="h-6 w-6 text-white/70" />
            </div>
          </div>
        </div>
      </section>

      {/* Profile completion */}
      <ProfileCompletion items={completion.items} />

      {/* Quick actions */}
      <section aria-labelledby="quick-actions">
        <h2
          id="quick-actions"
          className="mb-3 text-lg font-semibold text-gray-900"
        >
          Quick actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DashLink
            href="/list-business"
            icon={<PlusCircle className="h-5 w-5 text-[#D90429]" />}
            title="List your business"
            desc="Create a new business listing."
          />
          <DashLink
            href="/account/enquiries"
            icon={<Mail className="h-5 w-5 text-green-600" />}
            title="Enquiries"
            desc="View and manage incoming leads."
          />
          <DashLink
            href="/provider-dashboard"
            icon={<Edit3 className="h-5 w-5 text-yellow-600" />}
            title="Provider dashboard"
            desc="Manage your provider profile, listings, and analytics."
          />
          <DashLink
            href="/provider-dashboard"
            icon={<BarChart3 className="h-5 w-5 text-blue-600" />}
            title="Analytics"
            desc="Track impressions, views, and enquiries."
          />
          <DashLink
            href="/promote"
            icon={<Zap className="h-5 w-5 text-amber-500" />}
            title="Boost a listing"
            desc="Pay once to push your listing higher in results."
          />
          <DashLink
            href="/dashboard/settings"
            icon={<Settings className="h-5 w-5 text-slate-600" />}
            title="Settings"
            desc="Notifications, preferences, and account details."
          />
        </div>
      </section>

      {/* Insights snapshot */}
      <section aria-labelledby="insights">
        <h2 id="insights" className="mb-3 text-lg font-semibold text-gray-900">
          Insights snapshot
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard title="Enquiries (7 days)" value="—" hint="Coming soon" />
          <MetricCard title="Response rate" value="—" hint="Coming soon" />
          <MetricCard
            title="Profile views (7 days)"
            value="—"
            hint="Coming soon"
          />
        </div>
      </section>

      {/* Trust strip */}
      <section
        aria-label="Trust & visibility"
        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
      >
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-600" />
          <div>
            <div className="font-medium text-gray-900">
              Verified listings get more clicks
            </div>
            <p className="mt-0.5 text-sm text-gray-600">
              Add a logo, service areas, and pricing to increase customer trust
              and visibility.
            </p>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section aria-labelledby="resources">
        <h2
          id="resources"
          className="mb-3 text-lg font-semibold text-gray-900"
        >
          Resources & tips
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ResourceLink
            href="/provider-dashboard"
            icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
            title="Get more enquiries"
            desc="Optimise your provider profile to attract more customers."
          />
          <ResourceLink
            href="/promote"
            icon={<Zap className="h-5 w-5 text-amber-500" />}
            title="Promote your listing"
            desc="Pay once to boost visibility — no subscription needed."
          />
          <ResourceLink
            href="/contact"
            icon={<HelpCircle className="h-5 w-5 text-orange-600" />}
            title="Need help?"
            desc="Contact the ManxHive team for support or feedback."
          />
        </div>
      </section>
    </main>
  );
}

function DashLink({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:bg-gray-50"
    >
      <div className="flex items-center gap-2">
        {icon}
        <div className="text-lg font-medium text-gray-900">{title}</div>
      </div>
      <p className="mt-1 text-sm text-gray-600">{desc}</p>
    </Link>
  );
}

function MetricCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-medium text-gray-900">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
      {hint && <div className="mt-1 text-xs text-gray-500">{hint}</div>}
    </div>
  );
}

function ResourceLink({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:bg-gray-50"
    >
      <div className="flex items-center gap-2 font-medium text-gray-900">
        {icon}
        {title}
      </div>
      <p className="mt-1 text-sm text-gray-600">{desc}</p>
    </Link>
  );
}