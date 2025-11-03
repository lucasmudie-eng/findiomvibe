// src/app/dashboard/page.tsx
import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
        Provider Dashboard
      </h1>
      <p className="mt-2 text-gray-600">
        Manage your listings, leads, and profile details here.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/list-business"
          className="rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <h2 className="text-lg font-semibold text-gray-900">Create a listing</h2>
          <p className="mt-1 text-sm text-gray-600">
            Add your business to ManxHive and start receiving enquiries.
          </p>
        </Link>

        <Link
          href="/dashboard/leads"
          className="rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <h2 className="text-lg font-semibold text-gray-900">View leads</h2>
          <p className="mt-1 text-sm text-gray-600">
            See enquiries that customers have sent to your listings.
          </p>
        </Link>
      </div>

      <div className="mt-8 rounded-xl border bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">Coming soon</h3>
        <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
          <li>Listing analytics (views, enquiries, conversion)</li>
          <li>Profile completeness checklist</li>
          <li>Multi-location / multi-service management</li>
        </ul>
      </div>
    </main>
  );
}