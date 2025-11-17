// src/app/dashboard/page.tsx
import Link from "next/link";
import {
  PlusCircle,
  Mail,
  Edit3,
  BarChart3,
  TrendingUp,
  Megaphone,
  HelpCircle,
  User,
  CreditCard,
  ShieldCheck,
  Settings,
} from "lucide-react";
import ProfileCompletion from "@/app/components/ProfileCompletion";
import { getCurrentProvider, ProviderRow } from "@/lib/providerQueries";

function focusLink(id: string) {
  return `/providers/manage?focus=${id}`;
}

function computeCompletion(p: ProviderRow | null) {
  // Booleans based on your real provider row (p can be null)
  const hasLogo = !!(p?.logo_url || (Array.isArray(p?.images) && p!.images!.length > 0));
  const hasSummary = !!(p?.summary && p.summary.trim().length >= 20);
  const hasServices = Array.isArray(p?.services) && p!.services!.filter(s => s?.name).length >= 3;
  const hasAreas = Array.isArray(p?.areas_served) && p!.areas_served!.length > 0;
  const hasContact = !!(p?.email) && !!(p?.phone);
  const hasPhotos = Array.isArray(p?.images) && p!.images!.length >= 3;
  const hasAbout = !!(p?.description && p.description.trim().length >= 120);

  const items = [
    { id: "logo",    label: "Add a logo",                         done: hasLogo,    hint: "Square PNG/JPG, at least 512×512.",   actionHref: hasLogo ? undefined : focusLink("logo") },
    { id: "summary", label: "Write a short summary (≥ 40 chars)", done: hasSummary, hint: "One or two sentences that sell your service.", actionHref: hasSummary ? undefined : focusLink("summary") },
    { id: "services",label: "Add at least 3 services with pricing",done: hasServices,hint: "Clear names + simple pricing works best.",     actionHref: hasServices ? undefined : focusLink("services") },
    { id: "areas",   label: "Specify areas served",               done: hasAreas,   hint: "Helps us surface you to nearby customers.",     actionHref: hasAreas ? undefined : focusLink("areas") },
    { id: "contact", label: "Add contact info (email or phone)",  done: hasContact, hint: "So customers can reach you instantly.",        actionHref: hasContact ? undefined : focusLink("contact") },
    { id: "photos",  label: "Upload 3+ photos",                   done: hasPhotos,  hint: "Real work photos build trust.",               actionHref: hasPhotos ? undefined : focusLink("photos") },
    { id: "about",   label: "Add an About section (≥ 120 chars)", done: hasAbout,   hint: "Tell customers why you’re great.",            actionHref: hasAbout ? undefined : focusLink("about") },
  ];

  return { items };
}

export default async function DashboardPage() {
  const userName = "Lucas"; // TODO: auth later
  const provider = await getCurrentProvider();
  const completion = computeCompletion(provider);

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      {/* Welcome banner with avatar */}
      <section
        aria-label="Welcome"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#D90429] via-[#E63946] to-[#D90429] text-white shadow-md"
      >
        <div className="relative flex flex-col items-start justify-between gap-6 p-8 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold sm:text-3xl">
              Welcome back, {userName}! 👋
            </h1>
            <p className="mt-2 text-white/90">
              Manage your listings, track performance, and grow your reach on ManxHive.
            </p>
          </div>
          <div className="shrink-0">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white/20">
              {/* Provider logo if available, else user icon */}
              {provider?.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={provider.logo_url}
                  alt="Logo"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-white" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Profile completion */}
      <ProfileCompletion items={completion.items} />

      {/* Quick actions */}
      <section aria-labelledby="quick-actions">
        <h2 id="quick-actions" className="mb-3 text-lg font-semibold text-gray-900">
          Quick actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DashLink
            href="/list-business"
            icon={<PlusCircle className="h-5 w-5 text-[#D90429]" />}
            title="List your business"
            desc="Create a new listing."
          />
          <DashLink
            href="/dashboard/leads"
            icon={<Mail className="h-5 w-5 text-green-600" />}
            title="Enquiries"
            desc="View and manage incoming leads."
          />
          <DashLink
            href="/providers/manage"
            icon={<Edit3 className="h-5 w-5 text-yellow-600" />}
            title="Edit profile"
            desc="Update your business info, images, and details."
          />
          <DashLink
            href="/dashboard/analytics"
            icon={<BarChart3 className="h-5 w-5 text-blue-600" />}
            title="Analytics"
            desc="Track performance (coming soon)."
          />
          <DashLink
            href="/dashboard/billing"
            icon={<CreditCard className="h-5 w-5 text-purple-600" />}
            title="Billing & plan"
            desc="Manage plan and invoices."
          />
          <DashLink
            href="/dashboard/settings"
            icon={<Settings className="h-5 w-5 text-gray-700" />}
            title="Settings"
            desc="Notifications, team, preferences."
          />
        </div>
      </section>

      {/* Insights snapshot (still placeholder) */}
      <section aria-labelledby="insights">
        <h2 id="insights" className="mb-3 text-lg font-semibold text-gray-900">
          Insights snapshot
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard title="Enquiries (7 days)" value="—" hint="Coming soon" />
          <MetricCard title="Response rate" value="—" hint="Coming soon" />
          <MetricCard title="Profile views (7 days)" value="—" hint="Coming soon" />
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
            <div className="font-medium text-gray-900">Verified listings get more clicks</div>
            <p className="mt-0.5 text-sm text-gray-600">
              Add a logo, service areas, and pricing to increase customer trust and visibility.
            </p>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section aria-labelledby="resources">
        <h2 id="resources" className="mb-3 text-lg font-semibold text-gray-900">
          Resources & tips
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ResourceLink
            href="#"
            icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
            title="Get more enquiries"
            desc="Optimise your profile to attract more customers."
          />
          <ResourceLink
            href="#"
            icon={<Megaphone className="h-5 w-5 text-indigo-600" />}
            title="Promote your listing"
            desc="Boost your visibility with featured placement."
          />
          <ResourceLink
            href="#"
            icon={<HelpCircle className="h-5 w-5 text-orange-600" />}
            title="Need help?"
            desc="Visit our help centre or contact support."
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