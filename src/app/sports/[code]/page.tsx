// src/app/sports/[code]/page.tsx
import ScoreList from "@/app/sports/components/ScoreList";
import LeagueTable from "@/app/sports/components/LeagueTable";

const LABELS: Record<string,string> = {
  football: "Football",
  rugby: "Rugby",
  cricket: "Cricket",
  netball: "Netball",
  basketball: "Basketball",
};

async function getScores(code: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/sports/${code}/scores`, { cache: "no-store" });
  if (!res.ok) return { items: [] };
  return res.json();
}

async function getTable(code: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/sports/${code}/table`, { cache: "no-store" });
  if (!res.ok) return { rows: [] };
  return res.json();
}

export default async function SportsCategoryPage({ params }: { params: { code: string } }) {
  const title = LABELS[params.code] ?? params.code;
  const scores = await getScores(params.code);
  const table = await getTable(params.code);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <h1 className="text-3xl font-semibold text-gray-900">{title}</h1>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Latest scores</h2>
        <ScoreList items={scores.items ?? []} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">League table</h2>
        <LeagueTable rows={table.rows ?? []} />
      </section>
    </main>
  );
}