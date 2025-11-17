export default function LoadingLeague() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      <div className="h-6 w-64 bg-zinc-100 rounded" />
      <div className="h-10 w-full bg-zinc-100 rounded" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-10 w-full bg-zinc-100 rounded" />
      ))}
    </div>
  );
}