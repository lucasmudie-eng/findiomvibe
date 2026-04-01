// src/app/sports/football/[league]/[team]/page.tsx
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { ArrowLeft, Trophy, Calendar, MapPin, ChevronRight } from "lucide-react";
import type { TeamSnapshot } from "@/lib/football/types";
import { leagueDisplayName, formatTeamName } from "@/lib/football/utils";

// ---------- Team colour gradients ----------

const DEFAULT_GRADIENT = {
  from: "#D90429",
  to: "#f97316",
};

/**
 * Keys here are based on a normalised team *name*:
 *   "St Georges"  -> "stgeorges"
 *   "Michael United" -> "michaelunited"
 */
const TEAM_COLOURS: Record<string, { from: string; to: string }> = {
  corinthians: { from: "#111827", to: "#6B7280" }, // white & black
  laxey: { from: "#047857", to: "#6EE7B7" }, // green & white
  onchanfirst: { from: "#FACC15", to: "#1D4ED8" }, // yellow & blue
  onchan: { from: "#FACC15", to: "#1D4ED8" },

  rushenunited: { from: "#FACC15", to: "#111827" }, // yellow & black
  rushen: { from: "#FACC15", to: "#111827" },

  peel: { from: "#B91C1C", to: "#EF4444" }, // red & white
  stmarys: { from: "#047857", to: "#FACC15" }, // green & yellow
  stjohns: { from: "#1D4ED8", to: "#FACC15" }, // blue & yellow
  ayreunited: { from: "#EA580C", to: "#111827" }, // orange & black

  ramseyfirst: { from: "#1D4ED8", to: "#93C5FD" }, // blue & white
  ramsey: { from: "#1D4ED8", to: "#93C5FD" },

  unionmills: { from: "#7F1D1D", to: "#2563EB" }, // claret & blue
  braddan: { from: "#1D4ED8", to: "#60A5FA" }, // blue
  dhsob: { from: "#1D4ED8", to: "#60A5FA" }, // blue
  foxdale: { from: "#7F1D1D", to: "#1E3A8A" }, // maroon & navy
  castletown: { from: "#B91C1C", to: "#FCA5A5" }, // red & white
  colby: { from: "#111827", to: "#6B7280" }, // black & white
  rycob: { from: "#1D4ED8", to: "#111827" }, // blue & black
  marown: { from: "#7F1D1D", to: "#F97373" }, // maroon
  pulroseunited: { from: "#B91C1C", to: "#F97373" }, // red
  douglasroyal: { from: "#1D4ED8", to: "#DBEAFE" }, // white & blue
  malew: { from: "#B91C1C", to: "#111827" }, // red & black
  stgeorges: { from: "#FACC15", to: "#111827" }, // yellow & black
  governorsathletic: { from: "#B91C1C", to: "#F97373" }, // red
  douglasdistrict: { from: "#1D4ED8", to: "#B91C1C" }, // blue & red

  // Combination-only sides
  michaelunited: { from: "#111827", to: "#047857" }, // black & green
  douglasathleticfc: { from: "#EC4899", to: "#111827" }, // pink & black
};

// ---------- Team bios ----------

const TEAM_BIOS: Record<string, string> = {
  corinthians:
    "Corinthians A.F.C. are based in Douglas and play their home games at Noble’s Park. The club have become one of the stronger sides in Manx football in recent decades, regularly competing in the top division and local cups. They’re known for a strong youth setup and a steady production line of first-team players.",
  laxey:
    "Laxey A.F.C. are based in the village of Laxey on the east coast of the Isle of Man and play at Glen Road. The club famously won a domestic ‘grand slam’ in 2005–06, taking the league title and all three major cups in the same season. They have a passionate local following and a history of producing technically gifted players.",
  onchan:
    "Onchan A.F.C. represent the village of Onchan just north of Douglas and play their home matches at Onchan Stadium. The club has moved between the divisions over the years but are a well-established part of the Manx football scene. They’re known for a strong junior section feeding into the senior sides.",
  onchanfirst:
    "Onchan A.F.C. represent the village of Onchan just north of Douglas and play their home matches at Onchan Stadium. The club has moved between the divisions over the years but are a well-established part of the Manx football scene. They’re known for a strong junior section feeding into the senior sides.",
  rushenunited:
    "Rushen United A.F.C. are based in Port Erin in the south of the island and play at Croit Lowey. They’re one of the most successful Manx clubs historically, with multiple Division One titles and Railway Cup and FA Cup wins. The club has a big local following and a tradition of tough, competitive sides.",
  rushen:
    "Rushen United A.F.C. are based in Port Erin in the south of the island and play at Croit Lowey. They’re one of the most successful Manx clubs historically, with multiple Division One titles and Railway Cup and FA Cup wins. The club has a big local following and a tradition of tough, competitive sides.",
  peel:
    "Peel A.F.C. are one of the oldest and most decorated clubs on the Isle of Man, based at Douglas Road in Peel. They’ve won a long list of league titles and cup competitions, and are traditionally seen as one of the island’s big powerhouses. The club enjoys strong support from the town and surrounding west of the island.",
  stmarys:
    "St Mary’s A.F.C. are based in Douglas and typically play at The Bowl or adjacent facilities in the capital. They’ve enjoyed spells of dominance in the Manx Premier League era, picking up league titles and major cups. St Mary’s sides are often known for expansive, attacking football.",
  stjohns:
    "St John’s United A.F.C. represent the village of St John’s and play their home games at Mullen-e-Clogh. The club has spent time in both the top and second tiers of Manx football and have lifted local cups over the years. They’re closely tied into the local community and are a regular fixture on the island’s football map.",
  ayreunited:
    "Ayre United A.F.C. are based in Andreas in the north of the island and play at Andreas Playing Fields. The club has traditionally moved between divisions but has enjoyed cup success and strong league campaigns at various points. They draw players from the wider northern parishes and have a reputation for being hard to beat at home.",
  ramsey:
    "Ramsey A.F.C. are a historic club from the northern town of Ramsey, playing at Ballacloan Stadium near the harbour. They’ve been regulars in the top division and have collected league and cup honours across different eras. The ground is also used as a popular campsite during TT, adding to the club’s profile beyond football.",
  ramseyfirst:
    "Ramsey A.F.C. are a historic club from the northern town of Ramsey, playing at Ballacloan Stadium near the harbour. They’ve been regulars in the top division and have collected league and cup honours across different eras. The ground is also used as a popular campsite during TT, adding to the club’s profile beyond football.",
  unionmills:
    "Union Mills F.C. are based at Garey Mooar in Braddan on the outskirts of Douglas. The club has bounced between the divisions but remains a well-supported village side with a strong community feel. Their ground is also used as a TT campsite, giving the club extra visibility during the racing calendar.",
  braddan:
    "Braddan A.F.C. represent the parish of Braddan and play their home games at Victoria Road. They have a long history in Manx football, competing in both top and lower divisions over time. Braddan are known for solid, hard-working teams and a strong local identity.",
  dhsob:
    "Douglas High School Old Boys A.F.C. (DHSOB) are based in Douglas and were originally formed by former pupils of Douglas High School. They’ve been a regular presence in the top two tiers and have enjoyed cup success and strong league finishes in different periods. The club typically fields multiple senior sides and has a strong social side to its identity.",
  foxdale:
    "Foxdale A.F.C. are based in the former mining village of Foxdale in the island’s interior. The club has historically competed in the lower divisions, but has collected divisional honours and cup wins such as the Woods Cup and Miners’ Cup. They’re known for their distinctive maroon and navy colours and tight-knit community support.",
  castletown:
    "Castletown Metropolitan F.C. are based in Castletown in the south and play at the historic Malew Road ground. One of the island’s older clubs, they’ve picked up league and cup honours across different eras and are traditionally seen as a strong footballing town. Their red and white colours are well recognised in Manx football.",
  colby:
    "Colby A.F.C. represent the village of Colby in the south and play at Station Fields, close to the railway line. The club has spent time in both divisions and has achieved divisional titles and cup runs at various points. They are known as a resilient village side with strong local backing.",
  rycob:
    "Ramsey Youth Centre and Old Boys F.C. (RYCOB) are based in Ramsey and grew out of the town’s youth centre setup. The club typically competes in the lower divisions but has earned promotions and trophy wins in junior cups. They play an important role in offering football opportunities to younger players in the town.",
  marown:
    "Marown A.F.C. are based in Crosby in the central valley and play at Crosby Playing Fields. The club has moved up and down the league structure, with spells of success in the second tier and cup competitions. Marown sides are often noted for being physically strong and competitive, especially at home.",
  pulroseunited:
    "Pulrose United A.F.C. are based in the Pulrose area of Douglas and play at Groves Road. They’ve been a long-standing club in Manx football, regularly competing in the second tier with occasional spells higher up. Pulrose have a reputation for passionate local support and tough home fixtures.",
  douglasroyal:
    "Douglas Royal F.C. are a Douglas-based club who play at Ballafletcher. Formed from a merger of earlier local sides, they’ve established themselves as a stable club with teams in several divisions. Douglas Royal have been involved in top-flight campaigns and have picked up silverware at various points.",
  malew:
    "Malew A.F.C. represent Ballasalla and the surrounding Malew parish in the south of the island, playing at Clagh Vane. They’ve traditionally featured in the lower divisions but have achieved divisional titles and deep cup runs in local competitions. The club provides a key football outlet for players from the area.",
  stgeorges:
    "St George’s A.F.C. are based in Douglas and play at Glencrutchery Road near the TT Grandstand. They are the dominant Manx club of the modern era, winning multiple top-flight titles and ‘grand slam’ seasons where they swept all major trophies. St George’s have produced numerous island internationals and are widely seen as the benchmark side.",
  governorsathletic:
    "Governor’s Athletic F.C. are a relatively new club in Manx terms, formed in the 1990s and representing the Governor’s Hill / Douglas area. They’ve generally competed in the lower divisions, providing competitive football for a wide squad base. The club is known for its social side and inclusive, open approach.",
  douglasdistrict:
    "Douglas District F.C. are based in Douglas and typically compete in the lower tiers of the Manx league. The club offers local players regular football and has put together competitive sides challenging for promotion spots and cup runs. They add depth to the capital’s football scene alongside the more established names.",
  michaelunited:
    "Michael United A.F.C. represent the rural parish of Michael on the island’s west coast and play at Balleira Road. Traditionally they have spent much of their time outside the top flight, but they’ve enjoyed success in the second tier and junior cups. The club is closely tied to the local community and relies heavily on home-grown players.",
  douglasathleticfc:
    "Douglas Athletic F.C. are a relatively recent addition to the Manx league, based in Douglas and often associated with a modern, social-club feel. They’ve quickly become known for their distinctive pink and black colours and for fielding multiple senior sides. Douglas Athletic have already picked up divisional honours and cup runs despite their short history.",
};

function normaliseName(name: string) {
  return name.toLowerCase().replace(/[^a-z]/g, "");
}

function getTeamGradient(teamSlug: string, explicitName?: string) {
  const pretty =
    explicitName || formatTeamName(teamSlug || "").trim() || teamSlug;
  const key = normaliseName(pretty);
  return TEAM_COLOURS[key] ?? DEFAULT_GRADIENT;
}

function getTeamBio(teamSlug: string, explicitName?: string): string | null {
  const pretty =
    explicitName || formatTeamName(teamSlug || "").trim() || teamSlug;
  const key = normaliseName(pretty);
  return TEAM_BIOS[key] ?? null;
}

// ---------- helpers ----------

function absolute(path: string) {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}${path}`;
}

async function fetchTeam(
  league: string,
  teamId: string
): Promise<TeamSnapshot> {
  const url = absolute(`/api/feed/football?league=${league}&team=${teamId}`);
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) {
    notFound();
  }
  return res.json();
}

// ---------- page ----------

export default async function TeamPage({
  params,
}: {
  params: { league: string; team: string };
}) {
  const { league, team } = params;

  const data = await fetchTeam(league, team);
  if (!data?.team) {
    notFound();
  }

  const leagueName = leagueDisplayName(league);
  const teamName = data.team.name || formatTeamName(team);

  const teamRow = data.table.find((e) => e.teamId === data.team.id);
  const position =
    typeof data.position === "number" ? data.position : teamRow?.pos;

  // changed: drop legacy `p` field, just use `played`
  const played = teamRow?.played;
  const points = teamRow?.points;
  const gf = teamRow?.gf;
  const ga = teamRow?.ga;
  const gd = teamRow?.gd;

  const form = data.last3.slice(0, 5).map((r) => {
    const isHome = r.homeId === data.team.id;
    const ourGoals = isHome ? r.homeGoals : r.awayGoals;
    const theirGoals = isHome ? r.awayGoals : r.homeGoals;

    if (ourGoals > theirGoals) return "W";
    if (ourGoals < theirGoals) return "L";
    return "D";
  });

  const gradient = getTeamGradient(team, data.team.name);
  const bio = getTeamBio(team, data.team.name);

  return (
    <main>
      {/* ── GRADIENT HERO ─────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})` }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">

          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-1.5 text-[11px] text-white/50">
            <Link href="/sports" className="hover:text-white/80 transition-colors">Sports</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/sports/football" className="hover:text-white/80 transition-colors">Football</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/sports/football/${league}`} className="hover:text-white/80 transition-colors">{leagueName}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/80">{teamName}</span>
          </nav>

          <div className="flex flex-wrap items-start justify-between gap-8">
            <div className="max-w-xl space-y-4">
              {/* League badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/90">
                <Trophy className="h-3.5 w-3.5" />
                <span>{leagueName}</span>
                {typeof position === "number" && (
                  <>
                    <span className="opacity-50">·</span>
                    <span>#{position}</span>
                  </>
                )}
              </div>

              <h1 className="font-playfair text-4xl font-bold text-white sm:text-5xl">
                {teamName}
              </h1>

              {/* Stats strip */}
              {(played != null || points != null) && (
                <div className="flex flex-wrap items-center gap-4">
                  {played != null && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{played}</p>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-white/60">Played</p>
                    </div>
                  )}
                  {points != null && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{points}</p>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-white/60">Points</p>
                    </div>
                  )}
                  {gf != null && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{gf}</p>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-white/60">Scored</p>
                    </div>
                  )}
                  {ga != null && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{ga}</p>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-white/60">Conceded</p>
                    </div>
                  )}
                  {gd != null && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{gd >= 0 ? `+${gd}` : gd}</p>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-white/60">GD</p>
                    </div>
                  )}
                </div>
              )}

              {/* Form */}
              {form.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold text-white/60">Recent form</span>
                  <div className="flex gap-1.5">
                    {form.map((result, idx) => (
                      <span
                        key={`${result}-${idx}`}
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${
                          result === "W" ? "bg-emerald-100 text-emerald-800" :
                          result === "L" ? "bg-red-200 text-red-800" :
                          "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {result}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Back to league button */}
            <Link
              href={`/sports/football/${league}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to league
            </Link>
          </div>

          <p className="mt-6 text-[11px] text-white/40">
            Data updated: {data.updatedAt ? new Date(data.updatedAt).toLocaleString("en-GB") : "Recently"}
          </p>
        </div>
      </section>

      {/* ── CONTENT ───────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 sm:py-12 lg:px-8">

        {/* Club bio */}
        {bio && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold text-slate-900">About {teamName}</h2>
            <p className="text-sm leading-relaxed text-slate-600">{bio}</p>
          </section>
        )}

        {/* Grid: results + fixtures + table */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Last 3 results */}
          <section className="lg:col-span-1">
            <h2 className="mb-3 text-base font-semibold text-slate-900">Last 3 results</h2>
            {data.last3.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 px-5 py-6 text-center text-sm text-slate-400">
                No recent results.
              </div>
            ) : (
              <div className="space-y-2">
                {data.last3.map((r) => {
                  const isHome = r.homeId === data.team.id;
                  const opponentId = isHome ? r.awayId : r.homeId;
                  const outcome =
                    r.homeGoals === r.awayGoals ? "D" :
                    (isHome && r.homeGoals > r.awayGoals) || (!isHome && r.awayGoals > r.homeGoals) ? "W" : "L";
                  return (
                    <div key={r.id} className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
                      <div className="flex items-center gap-3">
                        <p className="min-w-0 flex-1 truncate text-right text-sm font-semibold">
                          {isHome ? teamName : formatTeamName(opponentId)}
                        </p>
                        <div className="shrink-0 text-center">
                          <p className="text-xl font-bold tabular-nums text-[#E8002D]">
                            {r.homeGoals} – {r.awayGoals}
                          </p>
                          <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            outcome === "W" ? "bg-emerald-900/60 text-emerald-300" :
                            outcome === "L" ? "bg-red-900/60 text-red-300" :
                            "bg-amber-900/60 text-amber-300"
                          }`}>
                            {outcome}
                          </span>
                        </div>
                        <p className="min-w-0 flex-1 truncate text-left text-sm font-semibold">
                          {isHome ? formatTeamName(opponentId) : teamName}
                        </p>
                      </div>
                      <p className="mt-2 text-center text-[11px] text-slate-500">
                        {new Date(r.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                        {isHome ? " · Home" : " · Away"}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Next 3 fixtures */}
          <section className="lg:col-span-1">
            <h2 className="mb-3 text-base font-semibold text-slate-900">Next 3 fixtures</h2>
            {data.next3.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 px-5 py-6 text-center text-sm text-slate-400">
                No upcoming fixtures.
              </div>
            ) : (
              <div className="space-y-2">
                {data.next3.map((f) => {
                  const isHome = f.homeId === data.team.id;
                  const opponentId = isHome ? f.awayId : f.homeId;
                  return (
                    <div key={f.id} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {isHome ? "Home" : "Away"} vs {formatTeamName(opponentId)}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            {new Date(f.date).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                          {f.venue && (
                            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                              <MapPin className="h-3 w-3" />{f.venue}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Mini league table */}
          <section className="lg:col-span-1">
            <h2 className="mb-3 text-base font-semibold text-slate-900">League table</h2>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400">
                    <th className="py-2 pl-4 pr-1 text-left font-semibold">#</th>
                    <th className="py-2 pr-2 text-left font-semibold">Team</th>
                    <th className="px-1 py-2 text-center font-semibold">P</th>
                    <th className="px-1 py-2 text-center font-semibold">GD</th>
                    <th className="py-2 pl-1 pr-4 text-right font-semibold">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {data.table.map((e, idx) => (
                    <tr
                      key={e.teamId}
                      className={`border-t border-slate-50 ${e.teamId === data.team.id ? "bg-red-50" : "hover:bg-slate-50/50"} transition-colors`}
                    >
                      <td className="py-2 pl-4 pr-1 text-slate-500">{e.pos ?? idx + 1}</td>
                      <td className="py-2 pr-2">
                        <Link
                          href={`/sports/football/${league}/${e.teamId}`}
                          className={`font-medium hover:underline transition-colors ${
                            e.teamId === data.team.id ? "font-semibold text-[#D90429]" : "text-slate-900 hover:text-[#E8002D]"
                          }`}
                        >
                          {formatTeamName(e.teamId)}
                        </Link>
                      </td>
                      <td className="px-1 py-2 text-center text-slate-600">{e.played}</td>
                      <td className="px-1 py-2 text-center text-slate-600">{e.gd != null ? (e.gd > 0 ? `+${e.gd}` : e.gd) : "—"}</td>
                      <td className="py-2 pl-1 pr-4 text-right font-bold text-slate-900">{e.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}