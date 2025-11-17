// src/app/sports/components/LeagueTable.tsx
type Row = {
  pos: number; team: string; p: number; w: number; d: number; l: number; gf: number; ga: number; gd: number; pts: number;
};

export default function LeagueTable({ rows }: { rows: Row[] }) {
  if (!rows.length) {
    return <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">No table data yet.</div>;
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-3 py-2">Pos</th>
            <th className="px-3 py-2">Team</th>
            <th className="px-3 py-2">P</th>
            <th className="px-3 py-2">W</th>
            <th className="px-3 py-2">D</th>
            <th className="px-3 py-2">L</th>
            <th className="px-3 py-2">GF</th>
            <th className="px-3 py-2">GA</th>
            <th className="px-3 py-2">GD</th>
            <th className="px-3 py-2">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.team} className="border-t">
              <td className="px-3 py-2">{r.pos}</td>
              <td className="px-3 py-2 font-medium text-gray-900">{r.team}</td>
              <td className="px-3 py-2">{r.p}</td>
              <td className="px-3 py-2">{r.w}</td>
              <td className="px-3 py-2">{r.d}</td>
              <td className="px-3 py-2">{r.l}</td>
              <td className="px-3 py-2">{r.gf}</td>
              <td className="px-3 py-2">{r.ga}</td>
              <td className="px-3 py-2">{r.gd}</td>
              <td className="px-3 py-2 font-semibold text-gray-900">{r.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}