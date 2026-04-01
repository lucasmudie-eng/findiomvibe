// scripts/update-football-scores.mjs
// Scraped from fulltime.thefa.com on 15 March 2026
// Run with: node scripts/update-football-scores.mjs

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://loilmtqszazyhnzgbudz.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvaWxtdHFzemF6eWhuemdidWR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTkyNzcxOSwiZXhwIjoyMDc3NTAzNzE5fQ.7TldOSWJ0enRbzXAzZJYiKCh0o_D93dN90fhiv4Wm_E";

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── League table standings (scraped 15 Mar 2026) ─────────────────────────────
// Format: { slug, pos, p, w, d, l, gf, ga, gd, pts }

const TABLES = {
  "iom-premier-league": [
    { slug: "corinthians",      pos: 1,  p: 19, w: 14, d: 4, l: 1,  gf: 75, ga: 24, gd: 51,   pts: 46 },
    { slug: "peel",             pos: 2,  p: 16, w: 13, d: 2, l: 1,  gf: 71, ga: 24, gd: 47,   pts: 41 },
    { slug: "st-marys",         pos: 3,  p: 17, w: 11, d: 0, l: 6,  gf: 56, ga: 27, gd: 29,   pts: 33 },
    { slug: "laxey",            pos: 4,  p: 17, w: 9,  d: 4, l: 4,  gf: 47, ga: 30, gd: 17,   pts: 31 },
    { slug: "rushen-united",    pos: 5,  p: 17, w: 9,  d: 2, l: 6,  gf: 30, ga: 32, gd: -2,   pts: 29 },
    { slug: "onchan",           pos: 6,  p: 17, w: 8,  d: 4, l: 5,  gf: 48, ga: 47, gd: 1,    pts: 28 },
    { slug: "st-johns-united",  pos: 7,  p: 15, w: 6,  d: 4, l: 5,  gf: 36, ga: 27, gd: 9,    pts: 22 },
    { slug: "ramsey",           pos: 8,  p: 15, w: 6,  d: 2, l: 7,  gf: 32, ga: 41, gd: -9,   pts: 20 },
    { slug: "ayre-united",      pos: 9,  p: 20, w: 5,  d: 5, l: 10, gf: 45, ga: 58, gd: -13,  pts: 20 },
    { slug: "union-mills",      pos: 10, p: 17, w: 5,  d: 3, l: 9,  gf: 40, ga: 55, gd: -15,  pts: 18 },
    { slug: "braddan",          pos: 11, p: 18, w: 3,  d: 4, l: 11, gf: 40, ga: 75, gd: -35,  pts: 13 },
    { slug: "dhsob",            pos: 12, p: 16, w: 1,  d: 2, l: 13, gf: 24, ga: 54, gd: -30,  pts: 5  },
    { slug: "foxdale",          pos: 13, p: 14, w: 0,  d: 2, l: 12, gf: 21, ga: 71, gd: -50,  pts: 2  },
  ],
  "iom-division-2": [
    { slug: "ramsey-second",           pos: 1,  p: 24, w: 17, d: 5, l: 2,  gf: 100, ga: 27,  gd: 73,   pts: 56 },
    { slug: "pulrose-united",          pos: 2,  p: 24, w: 17, d: 4, l: 3,  gf: 100, ga: 25,  gd: 75,   pts: 55 },
    { slug: "rycob",                   pos: 3,  p: 24, w: 16, d: 6, l: 2,  gf: 88,  ga: 35,  gd: 53,   pts: 54 },
    { slug: "foxdale-second",          pos: 4,  p: 24, w: 15, d: 3, l: 6,  gf: 83,  ga: 39,  gd: 44,   pts: 48 },
    { slug: "malew",                   pos: 5,  p: 24, w: 15, d: 3, l: 6,  gf: 76,  ga: 45,  gd: 31,   pts: 48 },
    { slug: "union-mills-second",      pos: 6,  p: 24, w: 11, d: 4, l: 9,  gf: 72,  ga: 53,  gd: 19,   pts: 37 },
    { slug: "onchan-second",           pos: 7,  p: 24, w: 11, d: 2, l: 11, gf: 76,  ga: 56,  gd: 20,   pts: 35 },
    { slug: "colby",                   pos: 8,  p: 24, w: 11, d: 1, l: 12, gf: 62,  ga: 60,  gd: 2,    pts: 34 },
    { slug: "ayre-united-second",      pos: 9,  p: 24, w: 11, d: 1, l: 12, gf: 56,  ga: 57,  gd: -1,   pts: 34 },
    { slug: "douglas-and-district",    pos: 10, p: 24, w: 7,  d: 0, l: 17, gf: 57,  ga: 97,  gd: -40,  pts: 21 },
    { slug: "gymnasium",               pos: 11, p: 24, w: 6,  d: 2, l: 16, gf: 43,  ga: 100, gd: -57,  pts: 20 },
    { slug: "michael-united",          pos: 12, p: 24, w: 1,  d: 2, l: 21, gf: 27,  ga: 127, gd: -100, pts: 5  },
    { slug: "governors-athletic",      pos: 13, p: 24, w: 1,  d: 1, l: 22, gf: 30,  ga: 149, gd: -119, pts: 4  },
  ],
  "iom-combination-1": [
    { slug: "ramsey-comb",           pos: 1,  p: 22, w: 19, d: 2, l: 1,  gf: 93,  ga: 31,  gd: 62,   pts: 59 },
    { slug: "rushen-united-comb",    pos: 2,  p: 22, w: 17, d: 1, l: 4,  gf: 101, ga: 23,  gd: 78,   pts: 52 },
    { slug: "ayre-united-comb",      pos: 3,  p: 22, w: 13, d: 1, l: 8,  gf: 72,  ga: 55,  gd: 17,   pts: 40 },
    { slug: "st-marys-comb",         pos: 4,  p: 22, w: 12, d: 3, l: 7,  gf: 73,  ga: 44,  gd: 29,   pts: 39 },
    { slug: "union-mills-comb",      pos: 5,  p: 22, w: 11, d: 4, l: 7,  gf: 72,  ga: 63,  gd: 9,    pts: 37 },
    { slug: "laxey-comb",            pos: 6,  p: 22, w: 9,  d: 2, l: 11, gf: 70,  ga: 63,  gd: 7,    pts: 29 },
    { slug: "corinthians-comb",      pos: 7,  p: 22, w: 8,  d: 4, l: 10, gf: 58,  ga: 70,  gd: -12,  pts: 28 },
    { slug: "marown-comb",           pos: 8,  p: 22, w: 7,  d: 5, l: 10, gf: 44,  ga: 65,  gd: -21,  pts: 26 },
    { slug: "st-johns-united-comb",  pos: 9,  p: 22, w: 7,  d: 3, l: 12, gf: 47,  ga: 60,  gd: -13,  pts: 24 },
    { slug: "braddan-comb",          pos: 10, p: 22, w: 7,  d: 1, l: 14, gf: 36,  ga: 73,  gd: -37,  pts: 22 },
    { slug: "peel-comb",             pos: 11, p: 22, w: 5,  d: 4, l: 13, gf: 35,  ga: 52,  gd: -17,  pts: 19 },
    { slug: "douglas-royal-comb",    pos: 12, p: 22, w: 2,  d: 0, l: 20, gf: 24,  ga: 126, gd: -102, pts: 6  },
  ],
  "iom-combination-2": [
    { slug: "colby-comb",                   pos: 1,  p: 22, w: 19, d: 1, l: 2,  gf: 109, ga: 32,  gd: 77,   pts: 58 },
    { slug: "braddan-comb-2",               pos: 2,  p: 22, w: 14, d: 2, l: 6,  gf: 77,  ga: 51,  gd: 26,   pts: 44 },
    { slug: "rycob-comb",                   pos: 3,  p: 22, w: 13, d: 4, l: 5,  gf: 73,  ga: 32,  gd: 41,   pts: 43 },
    { slug: "governors-athletic-comb",      pos: 4,  p: 22, w: 12, d: 0, l: 10, gf: 69,  ga: 53,  gd: 16,   pts: 36 },
    { slug: "dhsob-comb",                   pos: 5,  p: 22, w: 12, d: 2, l: 8,  gf: 60,  ga: 31,  gd: 29,   pts: 35 }, // points adjusted
    { slug: "pulrose-united-comb",          pos: 6,  p: 22, w: 10, d: 1, l: 11, gf: 47,  ga: 61,  gd: -14,  pts: 31 },
    { slug: "douglas-athletic-comb",        pos: 7,  p: 22, w: 8,  d: 3, l: 11, gf: 68,  ga: 56,  gd: 12,   pts: 27 },
    { slug: "castletown-comb",              pos: 8,  p: 22, w: 8,  d: 1, l: 13, gf: 53,  ga: 52,  gd: 1,    pts: 25 },
    { slug: "douglas-district-comb",        pos: 9,  p: 22, w: 8,  d: 1, l: 13, gf: 51,  ga: 81,  gd: -30,  pts: 25 },
    { slug: "gymnasium-comb",               pos: 10, p: 22, w: 7,  d: 2, l: 13, gf: 49,  ga: 104, gd: -55,  pts: 23 },
    { slug: "douglas-royal-comb",           pos: 11, p: 22, w: 6,  d: 1, l: 15, gf: 32,  ga: 77,  gd: -45,  pts: 19 },
    { slug: "michael-united-comb",          pos: 12, p: 22, w: 6,  d: 0, l: 16, gf: 28,  ga: 86,  gd: -58,  pts: 18 },
  ],
};

// ── Teams to upsert (name for display, slug for lookup) ──────────────────────
// Includes new teams not in the original seed (Malew, Douglas Athletic, etc.)

const EXTRA_TEAMS = {
  "iom-division-2": [
    { slug: "ramsey-second",        name: "Ramsey Second",          short_name: "Ramsey" },
    { slug: "pulrose-united",       name: "Pulrose United First",   short_name: "Pulrose Utd" },
    { slug: "rycob",                name: "RYCOB First",            short_name: "RYCOB" },
    { slug: "foxdale-second",       name: "Foxdale Second",         short_name: "Foxdale" },
    { slug: "malew",                name: "Malew First",            short_name: "Malew" },
    { slug: "union-mills-second",   name: "Union Mills Second",     short_name: "Union Mills" },
    { slug: "onchan-second",        name: "Onchan Second",          short_name: "Onchan" },
    { slug: "colby",                name: "Colby First",            short_name: "Colby" },
    { slug: "ayre-united-second",   name: "Ayre United Second",     short_name: "Ayre Utd" },
    { slug: "douglas-and-district", name: "Douglas & District",     short_name: "Douglas & Dist" },
    { slug: "gymnasium",            name: "Gymnasium First",        short_name: "Gymnasium" },
    { slug: "michael-united",       name: "Michael United First",   short_name: "Michael Utd" },
    { slug: "governors-athletic",   name: "Governors Athletic First", short_name: "Governors Ath" },
  ],
  "iom-combination-1": [
    { slug: "marown-comb",        name: "Marown Combination",        short_name: "Marown" },
    { slug: "douglas-royal-comb", name: "Douglas Royal Combination", short_name: "Douglas Royal" },
  ],
  "iom-combination-2": [
    { slug: "colby-comb",              name: "Colby Combination",              short_name: "Colby" },
    { slug: "braddan-comb-2",          name: "Braddan Combination",            short_name: "Braddan" },
    { slug: "rycob-comb",              name: "RYCOB Combination",              short_name: "RYCOB" },
    { slug: "governors-athletic-comb", name: "Governors Athletic Combination", short_name: "Governors Ath" },
    { slug: "dhsob-comb",              name: "DHSOB Combination",              short_name: "DHSOB" },
    { slug: "pulrose-united-comb",     name: "Pulrose United Combination",     short_name: "Pulrose Utd" },
    { slug: "douglas-athletic-comb",   name: "Douglas Athletic Combination",   short_name: "Douglas Ath" },
    { slug: "castletown-comb",         name: "Castletown Combination",         short_name: "Castletown" },
    { slug: "douglas-district-comb",   name: "Douglas & District Combination", short_name: "Douglas & Dist" },
    { slug: "gymnasium-comb",          name: "Gymnasium Combination",          short_name: "Gymnasium" },
    { slug: "douglas-royal-comb",      name: "Douglas Royal Combination",      short_name: "Douglas Royal" },
    { slug: "michael-united-comb",     name: "Michael United Combination",     short_name: "Michael Utd" },
  ],
};

// ── Recent Premier League results (scraped 15 Mar 2026) ──────────────────────
// Format: [homeSlug, homeGoals, awayGoals, awaySlug, dateISO]

const PREMIER_RESULTS = [
  ["ayre-united",     1, 1, "corinthians",     "2026-03-14"],
  ["laxey",          4, 1, "dhsob",            "2026-03-14"],
  ["onchan",         1, 12,"peel",             "2026-03-14"],
  ["ramsey",         4, 1, "union-mills",      "2026-03-14"],
  ["st-johns-united",3, 3, "foxdale",          "2026-03-14"],
  ["ayre-united",    2, 3, "ramsey",           "2026-03-07"],
  ["laxey",          3, 2, "st-johns-united",  "2026-03-07"],
  ["rushen-united",  5, 4, "foxdale",          "2026-03-07"],
  ["corinthians",    4, 0, "ramsey",           "2026-02-28"],
  ["rushen-united",  1, 3, "ayre-united",      "2026-02-28"],
  ["st-marys",       7, 2, "braddan",          "2026-02-21"],
  ["braddan",        0, 3, "rushen-united",    "2026-01-31"],
  ["dhsob",          1, 2, "braddan",          "2026-01-24"],
  ["laxey",          0, 3, "union-mills",      "2026-01-24"],
];

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🏈 ManxHive football scores updater");
  console.log("Scraped from fulltime.thefa.com — 15 Mar 2026\n");

  // 1. Fetch league rows
  const { data: leagues, error: leagueErr } = await db
    .from("sports_leagues")
    .select("id, slug")
    .eq("sport_code", "football")
    .eq("status", "active");

  if (leagueErr || !leagues?.length) {
    console.error("❌ Could not fetch leagues:", leagueErr?.message);
    console.error("   Make sure the sports_core migration and seed have run.");
    process.exit(1);
  }

  const leagueIdBySlug = Object.fromEntries(leagues.map((l) => [l.slug, l.id]));
  console.log("✅ Found leagues:", Object.keys(leagueIdBySlug).join(", "));

  // 2. Fetch all existing teams
  const { data: allTeams } = await db
    .from("sports_teams")
    .select("id, slug, league_id");

  const teamIdMap = new Map(); // "leagueId:teamSlug" → teamId
  for (const t of allTeams ?? []) {
    teamIdMap.set(`${t.league_id}:${t.slug}`, t.id);
  }

  // 3. Upsert any missing teams
  for (const [leagueSlug, teams] of Object.entries(EXTRA_TEAMS)) {
    const leagueId = leagueIdBySlug[leagueSlug];
    if (!leagueId) { console.warn(`  ⚠ League not found: ${leagueSlug}`); continue; }

    for (const team of teams) {
      const key = `${leagueId}:${team.slug}`;
      if (!teamIdMap.has(key)) {
        const { data, error } = await db
          .from("sports_teams")
          .upsert({ league_id: leagueId, slug: team.slug, name: team.name, short_name: team.short_name },
            { onConflict: "league_id,slug" })
          .select("id")
          .single();
        if (error) {
          console.warn(`  ⚠ Could not upsert team ${team.slug}:`, error.message);
        } else {
          teamIdMap.set(key, data.id);
          console.log(`  ➕ Added team: ${team.name}`);
        }
      }
    }
  }

  // 4. Upsert league tables
  console.log("\n📊 Updating league tables...");

  for (const [leagueSlug, rows] of Object.entries(TABLES)) {
    const leagueId = leagueIdBySlug[leagueSlug];
    if (!leagueId) { console.warn(`  ⚠ League not found: ${leagueSlug}`); continue; }

    let updated = 0;
    let skipped = 0;

    for (const row of rows) {
      const teamId = teamIdMap.get(`${leagueId}:${row.slug}`);
      if (!teamId) {
        console.warn(`  ⚠ Team not found in DB: ${row.slug} (${leagueSlug}) — skipping`);
        skipped++;
        continue;
      }

      const { error } = await db
        .from("sports_league_tables")
        .upsert(
          {
            league_id: leagueId,
            team_id: teamId,
            pos: row.pos,
            played: row.p,
            won: row.w,
            drawn: row.d,
            lost: row.l,
            gf: row.gf,
            ga: row.ga,
            gd: row.gd,
            points: row.pts,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "league_id,team_id" }
        );

      if (error) {
        console.warn(`  ⚠ Table upsert failed for ${row.slug}:`, error.message);
        skipped++;
      } else {
        updated++;
      }
    }

    console.log(`  ✅ ${leagueSlug}: ${updated} rows updated, ${skipped} skipped`);
  }

  // 5. Insert recent Premier League results (skip if already present by date+teams)
  console.log("\n⚽ Inserting recent Premier League results...");

  const premLeagueId = leagueIdBySlug["iom-premier-league"];
  let resultsAdded = 0;
  let resultsDupe = 0;

  if (premLeagueId) {
    for (const [homeSlug, homeGoals, awayGoals, awaySlug, date] of PREMIER_RESULTS) {
      const homeId = teamIdMap.get(`${premLeagueId}:${homeSlug}`);
      const awayId = teamIdMap.get(`${premLeagueId}:${awaySlug}`);

      if (!homeId || !awayId) {
        console.warn(`  ⚠ Team not found: ${homeSlug} vs ${awaySlug}`);
        continue;
      }

      // Check if this result already exists
      const { data: existing } = await db
        .from("sports_match_results")
        .select("id")
        .eq("league_id", premLeagueId)
        .eq("home_team_id", homeId)
        .eq("away_team_id", awayId)
        .gte("played_at", `${date}T00:00:00Z`)
        .lte("played_at", `${date}T23:59:59Z`)
        .maybeSingle();

      if (existing) {
        resultsDupe++;
        continue;
      }

      const { error } = await db.from("sports_match_results").insert({
        league_id: premLeagueId,
        home_team_id: homeId,
        away_team_id: awayId,
        home_goals: homeGoals,
        away_goals: awayGoals,
        played_at: `${date}T15:00:00Z`,
      });

      if (error) {
        console.warn(`  ⚠ Result insert failed (${homeSlug} vs ${awaySlug}):`, error.message);
      } else {
        resultsAdded++;
      }
    }
    console.log(`  ✅ ${resultsAdded} new results added, ${resultsDupe} already existed`);
  }

  console.log("\n🎉 Done! The site will now show live standings.\n");
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
