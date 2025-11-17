// src/app/sports/football/team/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, MapPin, Users, ArrowLeft } from "lucide-react";

/** ---------- helpers ---------- **/
const unslug = (slug: string) =>
  slug
    .replace(/-/g, " ")
    .replace(/\band\b/g, "&")
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .replace(/\bDhsob\b/i, "DHSOB")
    .replace(/\bUtd\b/i, "Utd");

const toClubKey = (name: string) =>
  name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

/** ---------- league definitions ---------- **/
const LEAGUE_A = [
  "Corinthians",
  "Laxey",
  "Onchan",
  "Rushen",
  "Peel",
  "St Marys",
  "St Johns United",
  "Ayre United",
  "Ramsey",
  "Union Mills",
  "Braddan",
  "DHSOB",
  "Foxdale",
];
const LEAGUE_B = [
  "Castletown",
  "Colby",
  "RYCOB",
  "Marown",
  "Pulrose United",
  "Douglas Royal",
  "Malew",
  "Governors Athletic",
  "St Georges",
  "Douglas & District",
];
const LEAGUE_C = [...LEAGUE_A];
const LEAGUE_D = [...LEAGUE_B];

const LEAGUE_LABELS: Record<"A" | "B" | "C" | "D", string> = {
  A: "Canada Life Premier League",
  B: "DPS Ltd Division Two",
  C: "Canada Life Combination One",
  D: "DPS Ltd Combination Two",
};

function clubLeagues(club: string) {
  const inA = LEAGUE_A.includes(club);
  const inB = LEAGUE_B.includes(club);
  const inC = LEAGUE_C.includes(club);
  const inD = LEAGUE_D.includes(club);
  // First team: A or B. Combination: C or D.
  const first: "A" | "B" | null = inA ? "A" : inB ? "B" : null;
  const combo: "C" | "D" | null = inC ? "C" : inD ? "D" : null;
  return { first, combo };
}

/** ---------- mock data (swap for FA/Supabase later) ---------- **/
type Match = {
  id: string;
  date: string; // Sat 14:00
  home: string;
  away: string;
  venue?: string;
  status?: "FT" | "LIVE" | "NS"; // finished/live/not started
  score?: string; // "2-1"
};

type TableRow = {
  team: string;
  p: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
};

function mockLast3(name: string): Match[] {
  // simple deterministic-ish filler
  return [
    { id: "r1", date: "Sat 14:00", home: name, away: "Peel", venue: "Home", status: "FT", score: "2-1" },
    { id: "r2", date: "Sat 14:00", home: "Ramsey", away: name, venue: "Away", status: "FT", score: "0-0" },
    { id: "r3", date: "Sat 14:00", home: name, away: "Laxey", venue: "Home", status: "FT", score: "1-3" },
  ];
}

function mockNext3(name: string): Match[] {
  return [
    { id: "n1", date: "Sat 14:00", home: name, away: "Onchan", venue: "Home", status: "NS" },
    { id: "n2", date: "Sat 14:00", home: "St Marys", away: name, venue: "Away", status: "NS" },
    { id: "n3", date: "Sat 14:00", home: name, away: "Union Mills", venue: "Home", status: "NS" },
  ];
}

function mockTableRow(name: string, league: "A" | "B" | "C" | "D"): { pos: number; row: TableRow } {
  // Minimal placeholder; you’ll replace with real table source.
  const row: TableRow = { team: name, p: 8, w: 5, d: 2, l: 1, gf: 14, ga: 8, gd: 6, pts: 17 };
  const pos = { A: 3, B: 2, C: 4, D: 7 }[league];
  return { pos, row };
}

/** ---------- UI bits ---------- **/
function SectionCard({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function MatchList({ items }: { items: Match[] }) {
  return (
    <ul className="divide-y">
      {items.map((m) => (
        <li key={m.id} className="grid grid-cols-1 gap-3 py-3 sm:grid-cols-12 sm:items-center">
          <div className="sm:col-span-7">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{m.home}</span>
              <span className="text-gray-400">vs</span>
              <span className="font-medium text-gray-900">{m.away}</span>
            </div>
            <div className="mt-1 text-sm text-gray-600">
              {m.status === "FT" && m.score ? (
                <span className="font-medium">{m.score}</span>
              ) : m.status === "LIVE" ? (
                <span className="font-medium text-emerald-700">LIVE</span>
              ) : (
                <span className="text-gray-500">Kick-off {m.date}</span>
              )}
              {m.status && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3.5 w-3.5" />
                  {m.status}
                </span>
              )}
            </div>
          </div>
          <div className="sm:col-span-3 text-sm text-gray-600">
            {m.venue && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4 text-gray-400" />
                {m.venue}
              </span>
            )}
          </div>
          <div className="sm:col-span-2">
            <Link
              href="#"
              className="inline-flex w-full items-center justify-center rounded-lg border px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50 sm:w-auto"
            >
              Match centre
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function TeamPage({ params }: { params: { slug: string } }) {
  const club = unslug(params.slug);
  // Normalise known tricky names
  const normalised =
    club
      .replace(/\bSt Mary'?s\b/i, "St Marys")
      .replace(/\bSt John'?s United\b/i, "St Johns United")
      .replace(/\bDouglas And District\b/i, "Douglas & District")
      .replace(/\bPulrose Utd\b/i, "Pulrose United")
      .replace(/\bAyre Utd\b/i, "Ayre United");

  // Verify the club exists in any of the defined leagues
  const all = new Set([...LEAGUE_A, ...LEAGUE_B, ...LEAGUE_C, ...LEAGUE_D].map(toClubKey));
  if (!all.has(toClubKey(normalised))) {
    notFound();
  }

  const { first, combo } = clubLeagues(normalised);

  // Mocked data for both squads (replace with real fetch)
  const last3First = first ? mockLast3(normalised) : [];
  const next3First = first ? mockNext3(normalised) : [];
  const tableFirst = first ? mockTableRow(normalised, first) : null;

  const last3Combo = combo ? mockLast3(`${normalised} Combi`) : [];
  const next3Combo = combo ? mockNext3(`${normalised} Combi`) : [];
  const tableCombo = combo ? mockTableRow(`${normalised} Combi`, combo) : null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/sports" className="hover:underline">
          Sports
        </Link>{" "}
        /{" "}
        <Link href="/sports/football" className="hover:underline">
          Football
        </Link>{" "}
        / <span className="text-gray-800">{normalised}</span>
      </nav>

      {/* Header */}
      <section className="mb-6 rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{normalised}</h1>
            <p className="text-sm text-gray-600">
              {first ? LEAGUE_LABELS[first] : "—"}{" "}
              {combo ? (
                <>
                  &middot; Combination: {LEAGUE_LABELS[combo]}
                </>
              ) : null}
            </p>
          </div>
          <Link
            href="/sports/football"
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to football
          </Link>
        </div>
      </section>

      {/* Two columns: First Team / Combination */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* First Team */}
        <div className="space-y-6">
          <SectionCard
            title="First Team — Last 3"
            action={
              first && (
                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs text-gray-600">
                  <Users className="h-3.5 w-3.5" />
                  {LEAGUE_LABELS[first]}
                </span>
              )
            }
          >
            {first ? <MatchList items={last3First} /> : <p className="text-sm text-gray-600">No first-team league found.</p>}
          </SectionCard>

          <SectionCard title="First Team — Next 3">
            {first ? <MatchList items={next3First} /> : <p className="text-sm text-gray-600">No fixtures.</p>}
          </SectionCard>

          <SectionCard title="First Team — Table position">
            {first && tableFirst ? (
              <div className="text-sm text-gray-700">
                <div className="mb-2">
                  Position: <span className="font-semibold text-gray-900">{tableFirst.pos}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="text-gray-500">
                        <th className="py-2 pr-2">Team</th>
                        <th className="px-2">P</th>
                        <th className="px-2">W</th>
                        <th className="px-2">D</th>
                        <th className="px-2">L</th>
                        <th className="px-2">GF</th>
                        <th className="px-2">GA</th>
                        <th className="px-2">GD</th>
                        <th className="pl-2 text-right">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-2 pr-2 font-medium text-gray-900">{tableFirst.row.team}</td>
                        <td className="px-2">{tableFirst.row.p}</td>
                        <td className="px-2">{tableFirst.row.w}</td>
                        <td className="px-2">{tableFirst.row.d}</td>
                        <td className="px-2">{tableFirst.row.l}</td>
                        <td className="px-2">{tableFirst.row.gf}</td>
                        <td className="px-2">{tableFirst.row.ga}</td>
                        <td className="px-2">{tableFirst.row.gd}</td>
                        <td className="pl-2 text-right font-semibold">{tableFirst.row.pts}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600">No league table found.</p>
            )}
          </SectionCard>
        </div>

        {/* Combination Team */}
        <div className="space-y-6">
          <SectionCard
            title="Combination Team — Last 3"
            action={
              combo && (
                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs text-gray-600">
                  <Users className="h-3.5 w-3.5" />
                  {LEAGUE_LABELS[combo]}
                </span>
              )
            }
          >
            {combo ? <MatchList items={last3Combo} /> : <p className="text-sm text-gray-600">No combination league found.</p>}
          </SectionCard>

          <SectionCard title="Combination Team — Next 3">
            {combo ? <MatchList items={next3Combo} /> : <p className="text-sm text-gray-600">No fixtures.</p>}
          </SectionCard>

          <SectionCard title="Combination Team — Table position">
            {combo && tableCombo ? (
              <div className="text-sm text-gray-700">
                <div className="mb-2">
                  Position: <span className="font-semibold text-gray-900">{tableCombo.pos}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="text-gray-500">
                        <th className="py-2 pr-2">Team</th>
                        <th className="px-2">P</th>
                        <th className="px-2">W</th>
                        <th className="px-2">D</th>
                        <th className="px-2">L</th>
                        <th className="px-2">GF</th>
                        <th className="px-2">GA</th>
                        <th className="px-2">GD</th>
                        <th className="pl-2 text-right">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-2 pr-2 font-medium text-gray-900">{tableCombo.row.team}</td>
                        <td className="px-2">{tableCombo.row.p}</td>
                        <td className="px-2">{tableCombo.row.w}</td>
                        <td className="px-2">{tableCombo.row.d}</td>
                        <td className="px-2">{tableCombo.row.l}</td>
                        <td className="px-2">{tableCombo.row.gf}</td>
                        <td className="px-2">{tableCombo.row.ga}</td>
                        <td className="px-2">{tableCombo.row.gd}</td>
                        <td className="pl-2 text-right font-semibold">{tableCombo.row.pts}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600">No league table found.</p>
            )}
          </SectionCard>
        </div>
      </div>
    </main>
  );
}