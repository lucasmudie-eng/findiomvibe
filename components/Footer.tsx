export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-gray-500">
        <div>© {new Date().getFullYear()} FindIOM — Isle of Man services</div>
      </div>
    </footer>
  )
}
