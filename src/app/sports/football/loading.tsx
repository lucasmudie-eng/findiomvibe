export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="h-8 w-40 bg-zinc-100 rounded" />
      <div className="grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border p-4 space-y-3">
            <div className="h-6 w-48 bg-zinc-100 rounded" />
            {Array.from({ length: 6 }).map((__, j) => (
              <div key={j} className="h-8 w-full bg-zinc-100 rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}