"use client";

import { useEffect, useState, useCallback } from "react";
import { Trophy, Users, PlusCircle, Trash2, RefreshCw, ChevronDown } from "lucide-react";

// Access to this page and its API is controlled by HTTP Basic Auth in middleware.

// ── Types ────────────────────────────────────────────────────────────────────

type League = {
  id: number;
  slug: string;
  name: string;
  season: string | null;
  status: string;
};

type Team = {
  id: number;
  league_id: number;
  slug: string;
  name: string;
  short_name: string | null;
};

type Result = {
  id: number;
  league_id: number;
  home_team_id: number;
  away_team_id: number;
  home_goals: number;
  away_goals: number;
  played_at: string | null;
  venue: string | null;
  home_name?: string;
  away_name?: string;
};

type TableRow = {
  id: number;
  team_id: number;
  pos: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  team_name?: string;
};

type Fixture = {
  id: number;
  league_id: number;
  home_team_id: number;
  away_team_id: number;
  starts_at: string | null;
  venue: string | null;
  status: string;
  home_name?: string;
  away_name?: string;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── Main component ────────────────────────────────────────────────────────────

export default function FootballAdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<"leagues" | "results" | "fixtures" | "table">("leagues");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Data
  const [leagues, setLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [tableRows, setTableRows] = useState<TableRow[]>([]);

  // Selected league for context
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | "">("");

  // New league form
  const [newLeagueName, setNewLeagueName] = useState("");
  const [newLeagueSeason, setNewLeagueSeason] = useState("2025/26");

  // New team form
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamLeagueId, setNewTeamLeagueId] = useState<number | "">("");

  // New result form
  const [resLeagueId, setResLeagueId] = useState<number | "">("");
  const [resHomeId, setResHomeId] = useState<number | "">("");
  const [resAwayId, setResAwayId] = useState<number | "">("");
  const [resHomeGoals, setResHomeGoals] = useState("");
  const [resAwayGoals, setResAwayGoals] = useState("");
  const [resDate, setResDate] = useState("");
  const [resVenue, setResVenue] = useState("");

  // New fixture form
  const [fixLeagueId, setFixLeagueId] = useState<number | "">("");
  const [fixHomeId, setFixHomeId] = useState<number | "">("");
  const [fixAwayId, setFixAwayId] = useState<number | "">("");
  const [fixDate, setFixDate] = useState("");
  const [fixVenue, setFixVenue] = useState("");

  // Middleware enforces HTTP Basic Auth before this page loads.
  useEffect(() => { setIsAdmin(true); }, []);

  // ── Load all data ──────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/football");
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setLeagues(json.leagues ?? []);
      setTeams(json.teams ?? []);
      setResults(json.results ?? []);
      setFixtures(json.fixtures ?? []);
      setTableRows(json.table ?? []);
    } catch (e: any) {
      setErr(e.message ?? "Failed to load data");
    }
  }, []);

  useEffect(() => { if (isAdmin) load(); }, [isAdmin, load]);

  // ── API action helper ──────────────────────────────────────────────────────
  async function action(body: Record<string, any>) {
    setBusy(true);
    setErr(null);
    setOk(null);
    try {
      const res = await fetch("/api/admin/football", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setOk(json.message ?? "Done");
      await load();
    } catch (e: any) {
      setErr(e.message ?? "Action failed");
    } finally {
      setBusy(false);
    }
  }

  // ── Derived helpers ────────────────────────────────────────────────────────
  const teamsForLeague = (lid: number | "") => lid === "" ? [] : teams.filter(t => t.league_id === lid);
  const leagueName = (lid: number) => leagues.find(l => l.id === lid)?.name ?? String(lid);
  const teamName = (tid: number) => teams.find(t => t.id === tid)?.name ?? String(tid);

  const filteredResults = selectedLeagueId === ""
    ? results
    : results.filter(r => r.league_id === selectedLeagueId);

  const filteredFixtures = selectedLeagueId === ""
    ? fixtures
    : fixtures.filter(f => f.league_id === selectedLeagueId);

  const filteredTable = selectedLeagueId === ""
    ? tableRows
    : tableRows.filter(r => {
        const team = teams.find(t => t.id === r.team_id);
        return team?.league_id === selectedLeagueId;
      });

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (isAdmin === null) {
    return <main className="p-10 text-slate-500">Checking access…</main>;
  }
  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Access denied</h1>
        <p className="text-slate-500">Admin login required.</p>
      </main>
    );
  }

  const TABS = [
    { key: "leagues", label: "Leagues & Teams" },
    { key: "results", label: "Results" },
    { key: "fixtures", label: "Fixtures" },
    { key: "table", label: "Tables" },
  ] as const;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="h-5 w-5 text-[#E8002D]" />
            <h1 className="text-2xl font-bold text-slate-900">Football Data Manager</h1>
          </div>
          <p className="text-sm text-slate-500">Add leagues, teams, results and fixtures for Manx football.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">ADMIN</span>
          <button
            onClick={load}
            disabled={busy}
            className="flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {err && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{err}</div>}
      {ok && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{ok}</div>}

      {/* League filter */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Filter by league:</label>
        <select
          value={selectedLeagueId}
          onChange={e => setSelectedLeagueId(e.target.value === "" ? "" : Number(e.target.value))}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#E8002D]/30"
        >
          <option value="">All leagues</option>
          {leagues.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-slate-200">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 px-4 py-2.5 text-sm font-medium transition ${tab === t.key ? "border-b-2 border-[#E8002D] text-[#E8002D]" : "text-slate-600 hover:text-slate-900"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── LEAGUES & TEAMS ─────────────────────────────────────────────────── */}
      {tab === "leagues" && (
        <div className="space-y-6">
          {/* Add league */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <PlusCircle className="h-4 w-4 text-[#E8002D]" /> Add league
            </h2>
            <div className="flex flex-wrap gap-3">
              <input
                value={newLeagueName}
                onChange={e => setNewLeagueName(e.target.value)}
                placeholder="League name (e.g. Canada Life Premier League)"
                className="flex-1 min-w-[220px] rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E8002D]/30"
              />
              <input
                value={newLeagueSeason}
                onChange={e => setNewLeagueSeason(e.target.value)}
                placeholder="Season (e.g. 2025/26)"
                className="w-28 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E8002D]/30"
              />
              <button
                disabled={busy || !newLeagueName.trim()}
                onClick={() => {
                  action({ action: "add_league", name: newLeagueName.trim(), season: newLeagueSeason.trim(), slug: slugify(newLeagueName.trim()) });
                  setNewLeagueName("");
                }}
                className="rounded-full bg-[#E8002D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c00026] disabled:opacity-50"
              >
                Add league
              </button>
            </div>
          </section>

          {/* Add team */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Users className="h-4 w-4 text-[#E8002D]" /> Add team
            </h2>
            <div className="flex flex-wrap gap-3">
              <select
                value={newTeamLeagueId}
                onChange={e => setNewTeamLeagueId(e.target.value === "" ? "" : Number(e.target.value))}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E8002D]/30"
              >
                <option value="">Select league</option>
                {leagues.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <input
                value={newTeamName}
                onChange={e => setNewTeamName(e.target.value)}
                placeholder="Team name (e.g. St George's)"
                className="flex-1 min-w-[200px] rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E8002D]/30"
              />
              <button
                disabled={busy || !newTeamName.trim() || newTeamLeagueId === ""}
                onClick={() => {
                  action({ action: "add_team", league_id: newTeamLeagueId, name: newTeamName.trim(), slug: slugify(newTeamName.trim()) });
                  setNewTeamName("");
                }}
                className="rounded-full bg-[#E8002D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c00026] disabled:opacity-50"
              >
                Add team
              </button>
            </div>
          </section>

          {/* Leagues list */}
          {leagues.map(league => {
            const lTeams = teams.filter(t => t.league_id === league.id);
            return (
              <section key={league.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{league.name}</h3>
                    <p className="text-xs text-slate-400">{league.season ?? "—"} · {lTeams.length} teams · slug: {league.slug}</p>
                  </div>
                  <button
                    onClick={() => action({ action: "delete_league", id: league.id })}
                    disabled={busy}
                    className="text-xs text-rose-500 hover:underline disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
                {lTeams.length === 0 ? (
                  <p className="text-xs text-slate-400">No teams yet.</p>
                ) : (
                  <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {lTeams.map(t => (
                      <li key={t.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-xs">
                        <span className="font-medium text-slate-800">{t.name}</span>
                        <button
                          onClick={() => action({ action: "delete_team", id: t.id })}
                          disabled={busy}
                          className="ml-2 text-slate-400 hover:text-rose-500 disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}

          {leagues.length === 0 && (
            <p className="text-sm text-slate-400">No leagues yet. Add the four IOMFA leagues above to get started.</p>
          )}
        </div>
      )}

      {/* ── RESULTS ─────────────────────────────────────────────────────────── */}
      {tab === "results" && (
        <div className="space-y-6">
          {/* Add result */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-800">Add match result</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">League</label>
                <select
                  value={resLeagueId}
                  onChange={e => { setResLeagueId(e.target.value === "" ? "" : Number(e.target.value)); setResHomeId(""); setResAwayId(""); }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E8002D]/30"
                >
                  <option value="">Select league</option>
                  {leagues.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Home team</label>
                <select
                  value={resHomeId}
                  onChange={e => setResHomeId(e.target.value === "" ? "" : Number(e.target.value))}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E8002D]/30"
                >
                  <option value="">Select home team</option>
                  {teamsForLeague(resLeagueId).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Away team</label>
                <select
                  value={resAwayId}
                  onChange={e => setResAwayId(e.target.value === "" ? "" : Number(e.target.value))}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E8002D]/30"
                >
                  <option value="">Select away team</option>
                  {teamsForLeague(resLeagueId).filter(t => t.id !== resHomeId).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex flex-1 flex-col gap-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Home goals</label>
                  <input
                    type="number" min="0" max="30"
                    value={resHomeGoals}
                    onChange={e => setResHomeGoals(e.target.value)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E8002D]/30"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Away goals</label>
                  <input
                    type="number" min="0" max="30"
                    value={resAwayGoals}
                    onChange={e => setResAwayGoals(e.target.value)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E8002D]/30"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Date played</label>
                <input
                  type="date"
                  value={resDate}
                  onChange={e => setResDate(e.target.value)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E8002D]/30"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Venue (optional)</label>
                <input
                  value={resVenue}
                  onChange={e => setResVenue(e.target.value)}
                  placeholder="e.g. Glencrutchery Road"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E8002D]/30"
                />
              </div>
            </div>
            <button
              disabled={busy || resLeagueId === "" || resHomeId === "" || resAwayId === "" || resHomeGoals === "" || resAwayGoals === "" || !resDate}
              onClick={() => {
                action({
                  action: "add_result",
                  league_id: resLeagueId,
                  home_team_id: resHomeId,
                  away_team_id: resAwayId,
                  home_goals: Number(resHomeGoals),
                  away_goals: Number(resAwayGoals),
                  played_at: resDate,
                  venue: resVenue || null,
                });
                setResHomeGoals(""); setResAwayGoals(""); setResDate(""); setResVenue("");
              }}
              className="mt-4 rounded-full bg-[#E8002D] px-5 py-2 text-sm font-semibold text-white hover:bg-[#c00026] disabled:opacity-50"
            >
              Add result + recalculate table
            </button>
          </section>

          {/* Results list */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-800">
              Results ({filteredResults.length})
            </h2>
            {filteredResults.length === 0 ? (
              <p className="text-sm text-slate-400">No results yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {filteredResults.slice().reverse().map(r => (
                  <li key={r.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <span className="font-semibold text-slate-900">
                        {teamName(r.home_team_id)} {r.home_goals} – {r.away_goals} {teamName(r.away_team_id)}
                      </span>
                      <span className="ml-3 text-xs text-slate-400">
                        {leagueName(r.league_id)} · {r.played_at ? new Date(r.played_at).toLocaleDateString("en-GB") : "—"}
                        {r.venue ? ` · ${r.venue}` : ""}
                      </span>
                    </div>
                    <button
                      onClick={() => action({ action: "delete_result", id: r.id })}
                      disabled={busy}
                      className="ml-4 flex-shrink-0 text-slate-400 hover:text-rose-500 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {/* ── FIXTURES ────────────────────────────────────────────────────────── */}
      {tab === "fixtures" && (
        <div className="space-y-6">
          {/* Add fixture */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-800">Add fixture</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">League</label>
                <select
                  value={fixLeagueId}
                  onChange={e => { setFixLeagueId(e.target.value === "" ? "" : Number(e.target.value)); setFixHomeId(""); setFixAwayId(""); }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E8002D]/30"
                >
                  <option value="">Select league</option>
                  {leagues.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Home team</label>
                <select
                  value={fixHomeId}
                  onChange={e => setFixHomeId(e.target.value === "" ? "" : Number(e.target.value))}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E8002D]/30"
                >
                  <option value="">Select home team</option>
                  {teamsForLeague(fixLeagueId).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Away team</label>
                <select
                  value={fixAwayId}
                  onChange={e => setFixAwayId(e.target.value === "" ? "" : Number(e.target.value))}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E8002D]/30"
                >
                  <option value="">Select away team</option>
                  {teamsForLeague(fixLeagueId).filter(t => t.id !== fixHomeId).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Date &amp; time</label>
                <input
                  type="datetime-local"
                  value={fixDate}
                  onChange={e => setFixDate(e.target.value)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E8002D]/30"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Venue (optional)</label>
                <input
                  value={fixVenue}
                  onChange={e => setFixVenue(e.target.value)}
                  placeholder="e.g. Glencrutchery Road"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E8002D]/30"
                />
              </div>
            </div>
            <button
              disabled={busy || fixLeagueId === "" || fixHomeId === "" || fixAwayId === "" || !fixDate}
              onClick={() => {
                action({
                  action: "add_fixture",
                  league_id: fixLeagueId,
                  home_team_id: fixHomeId,
                  away_team_id: fixAwayId,
                  starts_at: fixDate,
                  venue: fixVenue || null,
                });
                setFixDate(""); setFixVenue("");
              }}
              className="mt-4 rounded-full bg-[#E8002D] px-5 py-2 text-sm font-semibold text-white hover:bg-[#c00026] disabled:opacity-50"
            >
              Add fixture
            </button>
          </section>

          {/* Fixtures list */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-800">
              Upcoming fixtures ({filteredFixtures.length})
            </h2>
            {filteredFixtures.length === 0 ? (
              <p className="text-sm text-slate-400">No fixtures yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {filteredFixtures.map(f => (
                  <li key={f.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <span className="font-semibold text-slate-900">
                        {teamName(f.home_team_id)} vs {teamName(f.away_team_id)}
                      </span>
                      <span className="ml-3 text-xs text-slate-400">
                        {leagueName(f.league_id)} · {f.starts_at ? new Date(f.starts_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "TBD"}
                        {f.venue ? ` · ${f.venue}` : ""}
                      </span>
                    </div>
                    <button
                      onClick={() => action({ action: "delete_fixture", id: f.id })}
                      disabled={busy}
                      className="ml-4 flex-shrink-0 text-slate-400 hover:text-rose-500 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {/* ── TABLE ────────────────────────────────────────────────────────────── */}
      {tab === "table" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Tables are automatically recalculated when you add or delete a result.</p>
            <button
              onClick={() => action({ action: "recalculate_table" })}
              disabled={busy}
              className="flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`} />
              Recalculate all tables
            </button>
          </div>

          {leagues.filter(l => selectedLeagueId === "" || l.id === selectedLeagueId).map(league => {
            const rows = tableRows.filter(r => {
              const team = teams.find(t => t.id === r.team_id);
              return team?.league_id === league.id;
            }).sort((a, b) => a.pos - b.pos);

            if (rows.length === 0 && selectedLeagueId !== "" && selectedLeagueId !== league.id) return null;

            return (
              <section key={league.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-sm font-semibold text-slate-900">{league.name}</h2>
                {rows.length === 0 ? (
                  <p className="text-sm text-slate-400">No table data. Add results to auto-populate.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          <th className="pb-2 pr-3">#</th>
                          <th className="pb-2 pr-3">Team</th>
                          <th className="pb-2 pr-2 text-center">P</th>
                          <th className="pb-2 pr-2 text-center">W</th>
                          <th className="pb-2 pr-2 text-center">D</th>
                          <th className="pb-2 pr-2 text-center">L</th>
                          <th className="pb-2 pr-2 text-center">GF</th>
                          <th className="pb-2 pr-2 text-center">GA</th>
                          <th className="pb-2 pr-2 text-center">GD</th>
                          <th className="pb-2 text-center font-bold">Pts</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {rows.map(r => (
                          <tr key={r.id} className="text-slate-700">
                            <td className="py-2 pr-3 font-medium">{r.pos}</td>
                            <td className="py-2 pr-3 font-semibold">{teamName(r.team_id)}</td>
                            <td className="py-2 pr-2 text-center">{r.played}</td>
                            <td className="py-2 pr-2 text-center">{r.won}</td>
                            <td className="py-2 pr-2 text-center">{r.drawn}</td>
                            <td className="py-2 pr-2 text-center">{r.lost}</td>
                            <td className="py-2 pr-2 text-center">{r.gf}</td>
                            <td className="py-2 pr-2 text-center">{r.ga}</td>
                            <td className="py-2 pr-2 text-center">{r.gd}</td>
                            <td className="py-2 text-center font-bold text-slate-900">{r.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
