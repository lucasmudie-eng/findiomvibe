// scripts/update-football-scores.mjs
// Scraped from fulltime.thefa.com on 8 April 2026
// Run with: node scripts/update-football-scores.mjs
// Note: GF/GA are estimated (site only shows GD); GD and all other stats are exact.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://loilmtqszazyhnzgbudz.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvaWxtdHFzemF6eWhuemdidWR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTkyNzcxOSwiZXhwIjoyMDc3NTAzNzE5fQ.7TldOSWJ0enRbzXAzZJYiKCh0o_D93dN90fhiv4Wm_E";

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── League table standings (scraped 8 Apr 2026) ──────────────────────────────
// GD is exact from fulltime.thefa.com. GF/GA are proportional estimates.
// Format: { slug, pos, p, w, d, l, gf, ga, gd, pts }

const TABLES = {
  "iom-premier-league": [
    { slug: "corinthians",     pos: 1,  p: 21, w: 16, d: 4, l: 1,  gf: 96,  ga: 27,  gd: 69,   pts: 52 },
    { slug: "peel",            pos: 2,  p: 18, w: 15, d: 2, l: 1,  gf: 86,  ga: 27,  gd: 59,   pts: 47 },
    { slug: "laxey",           pos: 3,  p: 19, w: 10, d: 4, l: 5,  gf: 51,  ga: 34,  gd: 17,   pts: 34 },
    { slug: "onchan",          pos: 4,  p: 19, w: 10, d: 4, l: 5,  gf: 59,  ga: 53,  gd: 6,    pts: 34 },
    { slug: "st-marys",        pos: 5,  p: 18, w: 11, d: 0, l: 7,  gf: 57,  ga: 29,  gd: 28,   pts: 33 },
    { slug: "st-johns-united", pos: 6,  p: 20, w: 9,  d: 4, l: 7,  gf: 44,  ga: 36,  gd: 8,    pts: 31 },
    { slug: "rushen-united",   pos: 7,  p: 18, w: 9,  d: 2, l: 7,  gf: 30,  ga: 34,  gd: -4,   pts: 29 },
    { slug: "ramsey",          pos: 8,  p: 17, w: 7,  d: 3, l: 7,  gf: 38,  ga: 46,  gd: -8,   pts: 24 },
    { slug: "union-mills",     pos: 9,  p: 20, w: 7,  d: 3, l: 10, gf: 54,  ga: 65,  gd: -11,  pts: 24 },
    { slug: "ayre-united",     pos: 10, p: 22, w: 5,  d: 6, l: 11, gf: 47,  ga: 64,  gd: -17,  pts: 21 },
    { slug: "braddan",         pos: 11, p: 20, w: 3,  d: 5, l: 12, gf: 44,  ga: 83,  gd: -39,  pts: 14 },
    { slug: "dhsob",           pos: 12, p: 19, w: 1,  d: 2, l: 16, gf: 26,  ga: 64,  gd: -38,  pts: 5  },
    { slug: "foxdale",         pos: 13, p: 17, w: 0,  d: 3, l: 14, gf: 20,  ga: 90,  gd: -70,  pts: 3  },
  ],
  "iom-division-2": [
    { slug: "colby",                  pos: 1,  p: 20, w: 16, d: 2, l: 2,  gf: 60,  ga: 22,  gd: 38,   pts: 50 },
    { slug: "castletown",             pos: 2,  p: 19, w: 13, d: 1, l: 5,  gf: 71,  ga: 18,  gd: 53,   pts: 40 },
    { slug: "marown",                 pos: 3,  p: 16, w: 12, d: 1, l: 3,  gf: 47,  ga: 18,  gd: 29,   pts: 37 },
    { slug: "rycob",                  pos: 4,  p: 19, w: 9,  d: 6, l: 4,  gf: 59,  ga: 35,  gd: 24,   pts: 33 },
    { slug: "pulrose-united",         pos: 5,  p: 17, w: 8,  d: 5, l: 4,  gf: 48,  ga: 33,  gd: 15,   pts: 29 },
    { slug: "malew",                  pos: 6,  p: 16, w: 7,  d: 4, l: 5,  gf: 38,  ga: 33,  gd: 5,    pts: 25 },
    { slug: "st-georges",             pos: 7,  p: 21, w: 6,  d: 3, l: 12, gf: 35,  ga: 46,  gd: -11,  pts: 21 },
    { slug: "douglas-royal",          pos: 8,  p: 18, w: 5,  d: 5, l: 8,  gf: 35,  ga: 40,  gd: -5,   pts: 20 },
    { slug: "governors-athletic",     pos: 9,  p: 20, w: 1,  d: 5, l: 14, gf: 18,  ga: 60,  gd: -42,  pts: 8  },
    { slug: "douglas-and-district",   pos: 10, p: 22, w: 0,  d: 2, l: 20, gf: 10,  ga: 116, gd: -106, pts: 2  },
  ],
  "iom-combination-1": [
    { slug: "corinthians-comb",       pos: 1,  p: 22, w: 15, d: 3, l: 4,  gf: 85,  ga: 35,  gd: 50,   pts: 48 },
    { slug: "peel-comb",              pos: 2,  p: 21, w: 14, d: 3, l: 4,  gf: 97,  ga: 18,  gd: 79,   pts: 45 },
    { slug: "ramsey-comb",            pos: 3,  p: 19, w: 13, d: 4, l: 2,  gf: 81,  ga: 27,  gd: 54,   pts: 43 },
    { slug: "onchan-comb",            pos: 4,  p: 20, w: 13, d: 3, l: 4,  gf: 67,  ga: 28,  gd: 39,   pts: 42 },
    { slug: "rushen-united-comb",     pos: 5,  p: 20, w: 11, d: 4, l: 5,  gf: 59,  ga: 30,  gd: 29,   pts: 37 },
    { slug: "st-marys-comb",          pos: 6,  p: 21, w: 12, d: 1, l: 8,  gf: 50,  ga: 50,  gd: 0,    pts: 37 },
    { slug: "laxey-comb",             pos: 7,  p: 20, w: 10, d: 2, l: 8,  gf: 65,  ga: 57,  gd: 8,    pts: 32 },
    { slug: "dhsob-comb",             pos: 8,  p: 19, w: 8,  d: 3, l: 8,  gf: 46,  ga: 45,  gd: 1,    pts: 27 },
    { slug: "st-johns-united-comb",   pos: 9,  p: 20, w: 8,  d: 0, l: 12, gf: 32,  ga: 55,  gd: -23,  pts: 24 },
    { slug: "ayre-united-comb",       pos: 10, p: 20, w: 6,  d: 0, l: 14, gf: 30,  ga: 53,  gd: -23,  pts: 18 },
    { slug: "braddan-comb",           pos: 11, p: 19, w: 3,  d: 2, l: 14, gf: 25,  ga: 63,  gd: -38,  pts: 11 },
    { slug: "union-mills-comb",       pos: 12, p: 18, w: 2,  d: 1, l: 15, gf: 11,  ga: 65,  gd: -54,  pts: 7  },
    { slug: "foxdale-comb",           pos: 13, p: 19, w: 1,  d: 0, l: 18, gf: 8,   ga: 130, gd: -122, pts: 3  },
  ],
  "iom-combination-2": [
    { slug: "rycob-comb",                   pos: 1,  p: 19, w: 17, d: 1, l: 1,  gf: 111, ga: 15,  gd: 96,   pts: 52 },
    { slug: "pulrose-united-comb",          pos: 2,  p: 19, w: 17, d: 1, l: 1,  gf: 77,  ga: 22,  gd: 55,   pts: 52 },
    { slug: "douglas-athletic-comb",        pos: 3,  p: 19, w: 16, d: 1, l: 2,  gf: 99,  ga: 18,  gd: 81,   pts: 49 },
    { slug: "colby-comb",                   pos: 4,  p: 21, w: 11, d: 5, l: 5,  gf: 61,  ga: 40,  gd: 21,   pts: 38 },
    { slug: "marown-comb",                  pos: 5,  p: 21, w: 11, d: 3, l: 7,  gf: 62,  ga: 40,  gd: 22,   pts: 36 },
    { slug: "castletown-comb",              pos: 6,  p: 22, w: 11, d: 2, l: 9,  gf: 51,  ga: 50,  gd: 1,    pts: 35 },
    { slug: "gymnasium-comb",               pos: 7,  p: 23, w: 10, d: 2, l: 11, gf: 54,  ga: 52,  gd: 2,    pts: 32 },
    { slug: "douglas-royal-comb",           pos: 8,  p: 21, w: 8,  d: 2, l: 11, gf: 36,  ga: 50,  gd: -14,  pts: 26 },
    { slug: "governors-athletic-comb",      pos: 9,  p: 20, w: 6,  d: 2, l: 12, gf: 22,  ga: 60,  gd: -38,  pts: 20 },
    { slug: "michael-united-comb",          pos: 10, p: 20, w: 5,  d: 1, l: 14, gf: 17,  ga: 60,  gd: -43,  pts: 16 },
    { slug: "st-georges-comb",              pos: 11, p: 21, w: 4,  d: 0, l: 17, gf: 19,  ga: 60,  gd: -41,  pts: 12 },
    { slug: "malew-comb",                   pos: 12, p: 17, w: 3,  d: 2, l: 12, gf: 22,  ga: 40,  gd: -18,  pts: 11 },
    { slug: "douglas-district-comb",        pos: 13, p: 21, w: 1,  d: 2, l: 18, gf: 8,   ga: 132, gd: -124, pts: 5  },
  ],
};

// ── New teams to upsert ───────────────────────────────────────────────────────
// Covers teams added/promoted since original seed. Safe to re-run.

const EXTRA_TEAMS = {
  "iom-division-2": [
    { slug: "colby",                name: "Colby First",                  short_name: "Colby"         },
    { slug: "rycob",                name: "RYCOB First",                  short_name: "RYCOB"         },
    { slug: "pulrose-united",       name: "Pulrose United First",         short_name: "Pulrose Utd"   },
    { slug: "malew",                name: "Malew First",                  short_name: "Malew"         },
    { slug: "governors-athletic",   name: "Governors Athletic First",     short_name: "Governors Ath" },
    { slug: "douglas-and-district", name: "Douglas & District First",     short_name: "Douglas & Dist"},
    { slug: "castletown",           name: "Castletown First",             short_name: "Castletown"    },
    { slug: "marown",               name: "Marown First",                 short_name: "Marown"        },
    { slug: "st-georges",           name: "St Georges First",             short_name: "St Georges"    },
    { slug: "douglas-royal",        name: "Douglas Royal First",          short_name: "Douglas Royal" },
  ],
  "iom-combination-1": [
    { slug: "peel-comb",            name: "Peel Combination",             short_name: "Peel"          },
    { slug: "onchan-comb",          name: "Onchan Combination",           short_name: "Onchan"        },
    { slug: "dhsob-comb",           name: "DHSOB Combination",            short_name: "DHSOB"         },
    { slug: "foxdale-comb",         name: "Foxdale Combination",          short_name: "Foxdale"       },
    { slug: "ramsey-comb",          name: "Ramsey Combination",           short_name: "Ramsey"        },
    { slug: "corinthians-comb",     name: "Corinthians Combination",      short_name: "Corinthians"   },
    { slug: "rushen-united-comb",   name: "Rushen United Combination",    short_name: "Rushen Utd"    },
    { slug: "st-marys-comb",        name: "St Marys Combination",         short_name: "St Marys"      },
    { slug: "laxey-comb",           name: "Laxey Combination",            short_name: "Laxey"         },
    { slug: "st-johns-united-comb", name: "St Johns United Combination",  short_name: "St Johns Utd"  },
    { slug: "ayre-united-comb",     name: "Ayre United Combination",      short_name: "Ayre Utd"      },
    { slug: "braddan-comb",         name: "Braddan Combination",          short_name: "Braddan"       },
    { slug: "union-mills-comb",     name: "Union Mills Combination",      short_name: "Union Mills"   },
  ],
  "iom-combination-2": [
    { slug: "rycob-comb",                name: "RYCOB Combination",                short_name: "RYCOB"         },
    { slug: "pulrose-united-comb",       name: "Pulrose United Combination",       short_name: "Pulrose Utd"   },
    { slug: "douglas-athletic-comb",     name: "Douglas Athletic Combination",     short_name: "Douglas Ath"   },
    { slug: "colby-comb",                name: "Colby Combination",                short_name: "Colby"         },
    { slug: "marown-comb",               name: "Marown Combination",               short_name: "Marown"        },
    { slug: "castletown-comb",           name: "Castletown Combination",           short_name: "Castletown"    },
    { slug: "gymnasium-comb",            name: "Gymnasium Combination",            short_name: "Gymnasium"     },
    { slug: "douglas-royal-comb",        name: "Douglas Royal Combination",        short_name: "Douglas Royal" },
    { slug: "governors-athletic-comb",   name: "Governors Athletic Combination",   short_name: "Governors Ath" },
    { slug: "michael-united-comb",       name: "Michael United Combination",       short_name: "Michael Utd"   },
    { slug: "st-georges-comb",           name: "St Georges Combination",           short_name: "St Georges"    },
    { slug: "malew-comb",                name: "Malew Combination",                short_name: "Malew"         },
    { slug: "douglas-district-comb",     name: "Douglas & District Combination",   short_name: "Douglas & Dist"},
  ],
};

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🏈 ManxHive football scores updater");
  console.log("Scraped from fulltime.thefa.com — 8 Apr 2026\n");

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

  console.log("\n🎉 Done! The site will now show live standings.\n");
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
