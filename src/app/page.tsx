// src/app/page.tsx
import Link from 'next/link'

const categories = [
  { name: 'Cleaners' },
  { name: 'Electricians' },
  { name: 'Plumbers' },
  { name: 'Gardeners' },
  { name: 'Tutors' },
  { name: 'Fitness Coaches' },
  { name: 'Barbers' },
  { name: 'Handymen' },
  { name: 'Driving Instructors' },
]

export default function HomePage() {
  return (
    <section className="max-w-6xl mx-auto p-8 text-center">
      <h1 className="text-4xl font-bold mb-4 text-gray-900">
        Find trusted local providers on the Isle of Man — ManxHive
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Browse categories or list your business for bookings and leads.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {categories.map((category) => (
          <Link
            key={category.name}
            href={`/categories/${category.name.toLowerCase()}`}
            className="block border border-gray-200 rounded-2xl shadow-sm p-6 text-left hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
            <p className="text-gray-500 text-sm mt-1">Explore providers →</p>
          </Link>
        ))}
      </div>

      <Link
        href="/list-business"
        className="bg-red-600 text-white text-lg px-6 py-3 rounded-xl hover:bg-red-700 transition"
      >
        List your business
      </Link>
    </section>
  )
}
