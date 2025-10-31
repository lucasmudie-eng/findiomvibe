export default function Header() {
  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a href="/" className="text-xl font-semibold">FindIOM</a>
        <nav className="flex gap-4 text-sm">
          <a href="/categories/fitness">Fitness</a>
          <a href="/categories/cleaners">Cleaners</a>
          <a href="/categories/tutors">Tutors</a>
          <a
            href="/dashboard"
            className="rounded-lg border px-3 py-1.5 hover:bg-gray-50"
          >
            Provider Dashboard
          </a>
        </nav>
      </div>
    </header>
  )
}
