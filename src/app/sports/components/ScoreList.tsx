// src/app/sports/components/ScoreList.tsx
export default function ScoreList({ items }: { items: Array<{ id: string; home: string; away: string; score: string; when?: string }> }) {
  if (!items.length) {
    return <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">No recent scores yet.</div>;
  }
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map(m => (
        <div key={m.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">{m.when ?? "—"}</div>
          <div className="mt-1 text-gray-900">{m.home} vs {m.away}</div>
          <div className="text-2xl font-semibold text-gray-900">{m.score}</div>
        </div>
      ))}
    </div>
  );
}