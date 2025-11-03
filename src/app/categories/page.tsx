// src/app/categories/page.tsx
import Link from "next/link";
import LeadForm from "@components/LeadForm";

const CATEGORIES = [
  { slug: "cleaners", label: "Cleaners" },
  { slug: "electricians", label: "Electricians" },
  { slug: "plumbers", label: "Plumbers" },
  { slug: "gardeners", label: "Gardeners" },
  { slug: "tutors", label: "Tutors" },
  { slug: "fitness-coaches", label: "Fitness Coaches" },
  { slug: "barbers", label: "Barbers" },
  { slug: "handymen", label: "Handymen" },
  { slug: "driving-instructors", label: "Driving Instructors" },
];

export default function CategoriesPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight text-gray-900">
        Browse categories
      </h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/categories/${c.slug}`}
            className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition"
          >
            <h2 className="text-xl font-medium text-gray-900">{c.label}</h2>
            <p className="mt-1 text-gray-600">Explore providers →</p>
          </Link>
        ))}
      </div>
    </main>
  );
}