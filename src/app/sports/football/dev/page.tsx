const getBaseUrl = () =>
  typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export default async function DevFootball() {
  const res = await fetch(`${getBaseUrl()}/api/feed/football`, { next: { revalidate: 60 } });
  const data = await res.json();

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Football Dev Links</h1>
      <ul className="grid sm:grid-cols-2 gap-2">
        {data.teams.map((t: any) => (
          <li key={t.id}>
            <a
              className="block border rounded-xl p-3 hover:bg-muted"
              href={`/sports/football/${data.league}/${t.id}`}
            >
              {t.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}