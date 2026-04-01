// scripts/seed-football-data.mjs
// Run with: node scripts/seed-football-data.mjs
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://loilmtqszazyhnzgbudz.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvaWxtdHFzemF6eWhuemdidWR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTkyNzcxOSwiZXhwIjoyMDc3NTAzNzE5fQ.7TldOSWJ0enRbzXAzZJYiKCh0o_D93dN90fhiv4Wm_E";

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Teams per league ─────────────────────────────────────────────────────────

const TEAMS = {
  "iom-premier-league": [
    { slug: "corinthians", name: "Corinthians First", short_name: "Corinthians" },
    { slug: "peel", name: "Peel First", short_name: "Peel" },
    { slug: "st-marys", name: "St Marys First", short_name: "St Marys" },
    { slug: "rushen-united", name: "Rushen United First", short_name: "Rushen Utd" },
    { slug: "laxey", name: "Laxey First", short_name: "Laxey" },
    { slug: "onchan", name: "Onchan First", short_name: "Onchan" },
    { slug: "st-johns-united", name: "St Johns United First", short_name: "St Johns Utd" },
    { slug: "ayre-united", name: "Ayre United First", short_name: "Ayre Utd" },
    { slug: "union-mills", name: "Union Mills First", short_name: "Union Mills" },
    { slug: "ramsey", name: "Ramsey First", short_name: "Ramsey" },
    { slug: "braddan", name: "Braddan First", short_name: "Braddan" },
    { slug: "dhsob", name: "DHSOB First", short_name: "DHSOB" },
    { slug: "foxdale", name: "Foxdale First", short_name: "Foxdale" },
  ],
  "iom-division-2": [
    { slug: "colby", name: "Colby First", short_name: "Colby" },
    { slug: "castletown", name: "Castletown First", short_name: "Castletown" },
    { slug: "marown", name: "Marown First", short_name: "Marown" },
    { slug: "rycob", name: "RYCOB First", short_name: "RYCOB" },
    { slug: "pulrose-united", name: "Pulrose United First", short_name: "Pulrose Utd" },
    { slug: "malew", name: "Malew First", short_name: "Malew" },
    { slug: "douglas-royal", name: "Douglas Royal First", short_name: "Douglas Royal" },
    { slug: "st-georges", name: "St Georges First", short_name: "St Georges" },
    { slug: "governors-athletic", name: "Governors Athletic First", short_name: "Governors Ath" },
    { slug: "douglas-district", name: "Douglas & District First", short_name: "Douglas & Dist" },
  ],
  "iom-combination-1": [
    { slug: "corinthians-comb", name: "Corinthians Combination", short_name: "Corinthians" },
    { slug: "ramsey-comb", name: "Ramsey Combination", short_name: "Ramsey" },
    { slug: "peel-comb", name: "Peel Combination", short_name: "Peel" },
    { slug: "rushen-united-comb", name: "Rushen United Combination", short_name: "Rushen Utd" },
    { slug: "st-marys-comb", name: "St Marys Combination", short_name: "St Marys" },
    { slug: "onchan-comb", name: "Onchan Combination", short_name: "Onchan" },
    { slug: "laxey-comb", name: "Laxey Combination", short_name: "Laxey" },
    { slug: "dhsob-comb", name: "DHSOB Combination", short_name: "DHSOB" },
    { slug: "st-johns-united-comb", name: "St Johns United Combination", short_name: "St Johns Utd" },
    { slug: "ayre-united-comb", name: "Ayre United Combination", short_name: "Ayre Utd" },
    { slug: "braddan-comb", name: "Braddan Combination", short_name: "Braddan" },
    { slug: "union-mills-comb", name: "Union Mills Combination", short_name: "Union Mills" },
    { slug: "foxdale-comb", name: "Foxdale Combination", short_name: "Foxdale" },
  ],
  "iom-combination-2": [
    { slug: "pulrose-united-comb", name: "Pulrose United Combination", short_name: "Pulrose Utd" },
    { slug: "rycob-comb", name: "RYCOB Combination", short_name: "RYCOB" },
    { slug: "douglas-athletic-comb", name: "Douglas Athletic Combination", short_name: "Douglas Ath" },
    { slug: "colby-comb", name: "Colby Combination", short_name: "Colby" },
    { slug: "marown-comb", name: "Marown Combination", short_name: "Marown" },
    { slug: "gymnasium-comb", name: "Gymnasium Combination", short_name: "Gymnasium" },
    { slug: "castletown-comb", name: "Castletown Combination", short_name: "Castletown" },
    { slug: "douglas-royal-comb", name: "Douglas Royal Combination", short_name: "Douglas Royal" },
    { slug: "governors-athletic-comb", name: "Governors Athletic Combination", short_name: "Governors Ath" },
    { slug: "michael-united-comb", name: "Michael United Combination", short_name: "Michael Utd" },
    { slug: "st-georges-comb", name: "St Georges Combination", short_name: "St Georges" },
    { slug: "malew-comb", name: "Malew Combination", short_name: "Malew" },
    { slug: "douglas-district-comb", name: "Douglas & District Combination", short_name: "Douglas & Dist" },
  ],
};

// ── Results (league matches only; HW=3-0, AW=0-3) ───────────────────────────
// Format: [leagueSlug, date, homeTeamSlug, homeGoals, awayGoals, awayTeamSlug]

const RESULTS = [
  // ── Premier League ──────────────────────────────────────────────────────────
  ["iom-premier-league", "2025-08-30", "ayre-united", 7, 1, "foxdale"],
  ["iom-premier-league", "2025-08-30", "corinthians", 6, 1, "union-mills"],
  ["iom-premier-league", "2025-08-30", "ramsey", 4, 7, "peel"],
  ["iom-premier-league", "2025-08-30", "rushen-united", 2, 1, "braddan"],
  ["iom-premier-league", "2025-08-30", "st-johns-united", 1, 2, "laxey"],
  ["iom-premier-league", "2025-08-30", "st-marys", 5, 1, "dhsob"],
  ["iom-premier-league", "2025-09-02", "braddan", 3, 8, "corinthians"],
  ["iom-premier-league", "2025-09-02", "dhsob", 0, 2, "ramsey"],
  ["iom-premier-league", "2025-09-02", "foxdale", 1, 4, "rushen-united"],
  ["iom-premier-league", "2025-09-02", "laxey", 3, 2, "st-marys"],
  ["iom-premier-league", "2025-09-02", "onchan", 2, 2, "st-johns-united"],
  ["iom-premier-league", "2025-09-02", "peel", 3, 3, "ayre-united"],
  ["iom-premier-league", "2025-09-06", "ayre-united", 4, 2, "dhsob"],
  ["iom-premier-league", "2025-09-06", "corinthians", 10, 1, "foxdale"],
  ["iom-premier-league", "2025-09-06", "ramsey", 1, 3, "laxey"],
  ["iom-premier-league", "2025-09-06", "rushen-united", 3, 2, "peel"],
  ["iom-premier-league", "2025-09-06", "union-mills", 3, 3, "braddan"],
  ["iom-premier-league", "2025-09-06", "st-marys", 2, 3, "onchan"],
  ["iom-premier-league", "2025-09-13", "dhsob", 0, 2, "rushen-united"],
  ["iom-premier-league", "2025-09-13", "foxdale", 1, 5, "union-mills"],
  ["iom-premier-league", "2025-09-13", "laxey", 2, 1, "ayre-united"],
  ["iom-premier-league", "2025-09-13", "onchan", 3, 1, "ramsey"],
  ["iom-premier-league", "2025-09-13", "peel", 1, 1, "corinthians"],
  ["iom-premier-league", "2025-09-13", "st-johns-united", 3, 2, "st-marys"],
  ["iom-premier-league", "2025-09-20", "ayre-united", 2, 4, "onchan"],
  ["iom-premier-league", "2025-09-20", "braddan", 6, 1, "foxdale"],
  ["iom-premier-league", "2025-09-20", "corinthians", 5, 3, "dhsob"],
  ["iom-premier-league", "2025-09-20", "ramsey", 4, 2, "st-johns-united"],
  ["iom-premier-league", "2025-09-20", "rushen-united", 0, 0, "laxey"],
  ["iom-premier-league", "2025-09-27", "dhsob", 2, 7, "union-mills"],
  ["iom-premier-league", "2025-09-27", "laxey", 0, 0, "corinthians"],
  ["iom-premier-league", "2025-09-27", "onchan", 3, 1, "rushen-united"],
  ["iom-premier-league", "2025-09-27", "peel", 10, 2, "braddan"],
  ["iom-premier-league", "2025-09-27", "st-johns-united", 2, 2, "ayre-united"],
  ["iom-premier-league", "2025-09-27", "st-marys", 1, 2, "ramsey"],
  ["iom-premier-league", "2025-10-04", "ayre-united", 0, 4, "st-marys"],
  ["iom-premier-league", "2025-10-04", "braddan", 3, 3, "dhsob"],
  ["iom-premier-league", "2025-10-04", "corinthians", 3, 1, "onchan"],
  ["iom-premier-league", "2025-10-11", "dhsob", 3, 1, "foxdale"],
  ["iom-premier-league", "2025-10-11", "laxey", 7, 1, "braddan"],
  ["iom-premier-league", "2025-10-11", "onchan", 5, 1, "union-mills"],
  ["iom-premier-league", "2025-10-11", "ramsey", 2, 4, "ayre-united"],
  ["iom-premier-league", "2025-10-11", "st-johns-united", 0, 0, "corinthians"],
  ["iom-premier-league", "2025-10-11", "st-marys", 2, 1, "rushen-united"],
  ["iom-premier-league", "2025-10-18", "braddan", 3, 4, "onchan"],
  ["iom-premier-league", "2025-10-18", "corinthians", 1, 0, "st-marys"],
  ["iom-premier-league", "2025-10-18", "foxdale", 2, 9, "laxey"],
  ["iom-premier-league", "2025-10-18", "peel", 7, 1, "dhsob"],
  ["iom-premier-league", "2025-10-18", "rushen-united", 2, 0, "ramsey"],
  ["iom-premier-league", "2025-10-18", "union-mills", 2, 4, "st-johns-united"],
  ["iom-premier-league", "2025-10-25", "ayre-united", 2, 3, "rushen-united"],
  ["iom-premier-league", "2025-10-25", "laxey", 4, 5, "peel"],
  ["iom-premier-league", "2025-10-25", "onchan", 2, 2, "foxdale"],
  ["iom-premier-league", "2025-10-25", "st-johns-united", 6, 1, "braddan"],
  ["iom-premier-league", "2025-10-25", "st-marys", 6, 2, "union-mills"],
  ["iom-premier-league", "2025-11-01", "braddan", 2, 5, "st-marys"],
  ["iom-premier-league", "2025-11-01", "corinthians", 5, 1, "ayre-united"],
  ["iom-premier-league", "2025-11-01", "peel", 2, 0, "onchan"],
  ["iom-premier-league", "2025-11-01", "union-mills", 4, 4, "ramsey"],
  ["iom-premier-league", "2025-11-08", "ayre-united", 2, 1, "union-mills"],
  ["iom-premier-league", "2025-11-08", "onchan", 3, 3, "dhsob"],
  ["iom-premier-league", "2025-11-08", "ramsey", 3, 3, "braddan"],
  ["iom-premier-league", "2025-11-08", "rushen-united", 0, 7, "corinthians"],
  ["iom-premier-league", "2025-11-08", "st-johns-united", 0, 3, "peel"],
  ["iom-premier-league", "2025-11-08", "st-marys", 8, 0, "foxdale"],
  ["iom-premier-league", "2025-11-15", "braddan", 4, 4, "ayre-united"],
  ["iom-premier-league", "2025-11-15", "peel", 2, 1, "st-marys"],
  ["iom-premier-league", "2025-11-15", "union-mills", 1, 1, "rushen-united"],
  ["iom-premier-league", "2025-11-22", "dhsob", 1, 2, "st-marys"],
  ["iom-premier-league", "2025-11-22", "laxey", 4, 4, "onchan"],
  ["iom-premier-league", "2025-11-22", "rushen-united", 1, 2, "st-johns-united"],
  ["iom-premier-league", "2025-11-22", "union-mills", 0, 8, "corinthians"],
  ["iom-premier-league", "2025-11-29", "ayre-united", 2, 4, "peel"],
  ["iom-premier-league", "2025-11-29", "corinthians", 4, 1, "braddan"],
  ["iom-premier-league", "2025-11-29", "union-mills", 0, 1, "laxey"],
  ["iom-premier-league", "2025-12-13", "ayre-united", 2, 2, "laxey"],
  ["iom-premier-league", "2025-12-13", "corinthians", 0, 5, "peel"],
  ["iom-premier-league", "2025-12-13", "ramsey", 2, 0, "onchan"],
  ["iom-premier-league", "2025-12-13", "rushen-united", 1, 0, "dhsob"],
  ["iom-premier-league", "2025-12-13", "union-mills", 5, 4, "foxdale"],
  ["iom-premier-league", "2025-12-13", "st-marys", 2, 1, "st-johns-united"],
  ["iom-premier-league", "2026-01-03", "st-marys", 2, 1, "laxey"],
  ["iom-premier-league", "2026-01-10", "dhsob", 1, 3, "corinthians"],
  ["iom-premier-league", "2026-01-10", "foxdale", 0, 2, "braddan"],
  ["iom-premier-league", "2026-01-10", "onchan", 6, 1, "ayre-united"],
  ["iom-premier-league", "2026-01-10", "peel", 2, 1, "union-mills"],
  ["iom-premier-league", "2026-01-10", "st-johns-united", 5, 0, "ramsey"],
  ["iom-premier-league", "2026-01-17", "ayre-united", 0, 3, "st-johns-united"],
  ["iom-premier-league", "2026-01-17", "braddan", 1, 4, "peel"],
  ["iom-premier-league", "2026-01-24", "dhsob", 1, 2, "braddan"],
  ["iom-premier-league", "2026-01-24", "laxey", 0, 3, "union-mills"],
  ["iom-premier-league", "2026-01-24", "onchan", 3, 6, "corinthians"],
  ["iom-premier-league", "2026-01-24", "peel", 2, 0, "foxdale"],
  ["iom-premier-league", "2026-01-24", "st-marys", 5, 2, "ayre-united"],
  ["iom-premier-league", "2026-01-31", "braddan", 0, 3, "rushen-united"],
  ["iom-premier-league", "2026-02-21", "st-marys", 7, 2, "braddan"],
  ["iom-premier-league", "2026-02-28", "corinthians", 4, 0, "ramsey"],
  ["iom-premier-league", "2026-02-28", "rushen-united", 1, 3, "ayre-united"],
  ["iom-premier-league", "2026-03-07", "ayre-united", 2, 3, "ramsey"],
  ["iom-premier-league", "2026-03-07", "laxey", 3, 2, "st-johns-united"],
  ["iom-premier-league", "2026-03-07", "rushen-united", 5, 4, "foxdale"],

  // ── Division Two ────────────────────────────────────────────────────────────
  ["iom-division-2", "2025-09-02", "douglas-district", 0, 5, "castletown"],
  ["iom-division-2", "2025-09-02", "douglas-royal", 2, 3, "pulrose-united"],
  ["iom-division-2", "2025-09-02", "governors-athletic", 3, 5, "colby"],
  ["iom-division-2", "2025-09-06", "castletown", 10, 1, "douglas-royal"],
  ["iom-division-2", "2025-09-06", "colby", 4, 0, "douglas-district"],
  ["iom-division-2", "2025-09-06", "malew", 2, 1, "rycob"],
  ["iom-division-2", "2025-09-06", "st-georges", 1, 2, "marown"],
  ["iom-division-2", "2025-09-13", "douglas-district", 0, 5, "castletown"],
  ["iom-division-2", "2025-09-13", "douglas-royal", 3, 3, "colby"],
  ["iom-division-2", "2025-09-13", "marown", 3, 1, "pulrose-united"],
  ["iom-division-2", "2025-09-13", "governors-athletic", 1, 1, "malew"],
  ["iom-division-2", "2025-09-20", "castletown", 6, 2, "marown"],
  ["iom-division-2", "2025-09-20", "colby", 2, 1, "pulrose-united"],
  ["iom-division-2", "2025-09-20", "malew", 7, 1, "douglas-district"],
  ["iom-division-2", "2025-09-20", "rycob", 3, 1, "governors-athletic"],
  ["iom-division-2", "2025-09-27", "douglas-district", 0, 4, "rycob"],
  ["iom-division-2", "2025-09-27", "douglas-royal", 4, 1, "malew"],
  ["iom-division-2", "2025-09-27", "marown", 1, 5, "colby"],
  ["iom-division-2", "2025-09-27", "st-georges", 2, 4, "pulrose-united"],
  ["iom-division-2", "2025-10-04", "castletown", 5, 0, "st-georges"],
  ["iom-division-2", "2025-10-04", "rycob", 5, 1, "douglas-royal"],
  ["iom-division-2", "2025-10-11", "douglas-district", 1, 4, "rycob"],
  ["iom-division-2", "2025-10-11", "douglas-royal", 4, 2, "governors-athletic"],
  ["iom-division-2", "2025-10-11", "marown", 7, 2, "malew"],
  ["iom-division-2", "2025-10-11", "pulrose-united", 3, 1, "castletown"],
  ["iom-division-2", "2025-10-11", "st-georges", 3, 5, "colby"],
  ["iom-division-2", "2025-10-18", "colby", 3, 0, "pulrose-united"],
  ["iom-division-2", "2025-10-18", "douglas-district", 1, 1, "douglas-royal"],
  ["iom-division-2", "2025-10-18", "rycob", 1, 1, "marown"],
  ["iom-division-2", "2025-10-25", "castletown", 5, 3, "colby"],
  ["iom-division-2", "2025-10-25", "marown", 5, 0, "governors-athletic"],
  ["iom-division-2", "2025-10-25", "pulrose-united", 9, 1, "douglas-district"],
  ["iom-division-2", "2025-10-25", "st-georges", 3, 3, "malew"],
  ["iom-division-2", "2025-11-01", "douglas-district", 1, 8, "marown"],
  ["iom-division-2", "2025-11-01", "douglas-royal", 7, 3, "governors-athletic"],
  ["iom-division-2", "2025-11-01", "rycob", 4, 2, "st-georges"],
  ["iom-division-2", "2025-11-08", "castletown", 2, 1, "malew"],
  ["iom-division-2", "2025-11-08", "colby", 6, 1, "douglas-district"],
  ["iom-division-2", "2025-11-08", "pulrose-united", 1, 1, "rycob"],
  ["iom-division-2", "2025-11-08", "st-georges", 5, 0, "governors-athletic"],
  ["iom-division-2", "2025-11-15", "douglas-district", 0, 2, "st-georges"],
  ["iom-division-2", "2025-11-15", "rycob", 3, 3, "castletown"],
  ["iom-division-2", "2025-11-22", "douglas-district", 0, 3, "pulrose-united"],
  ["iom-division-2", "2025-11-22", "douglas-royal", 2, 2, "st-georges"],
  ["iom-division-2", "2025-11-22", "governors-athletic", 0, 6, "castletown"],
  ["iom-division-2", "2025-11-22", "rycob", 0, 1, "colby"],
  ["iom-division-2", "2025-11-29", "castletown", 9, 0, "douglas-district"],
  ["iom-division-2", "2025-11-29", "colby", 4, 3, "governors-athletic"],
  ["iom-division-2", "2025-11-29", "pulrose-united", 2, 2, "douglas-royal"],
  ["iom-division-2", "2025-11-29", "st-georges", 1, 2, "marown"],
  ["iom-division-2", "2025-12-06", "douglas-district", 0, 3, "colby"],
  ["iom-division-2", "2025-12-06", "rycob", 10, 1, "malew"],
  ["iom-division-2", "2025-12-13", "malew", 5, 3, "governors-athletic"],
  ["iom-division-2", "2025-12-13", "rycob", 1, 3, "st-georges"],
  ["iom-division-2", "2026-01-03", "douglas-royal", 2, 8, "castletown"],
  ["iom-division-2", "2026-01-10", "douglas-district", 0, 11, "malew"],
  ["iom-division-2", "2026-01-10", "douglas-royal", 3, 4, "pulrose-united"],
  ["iom-division-2", "2026-01-10", "governors-athletic", 2, 2, "rycob"],
  ["iom-division-2", "2026-01-10", "st-georges", 1, 2, "colby"],
  ["iom-division-2", "2026-01-17", "governors-athletic", 0, 1, "pulrose-united"],
  ["iom-division-2", "2026-01-17", "rycob", 5, 1, "douglas-district"],
  ["iom-division-2", "2026-01-24", "douglas-district", 0, 0, "governors-athletic"],
  ["iom-division-2", "2026-01-24", "marown", 0, 3, "colby"],
  ["iom-division-2", "2026-01-24", "st-georges", 3, 2, "castletown"],
  ["iom-division-2", "2026-01-24", "douglas-royal", 4, 4, "rycob"],
  ["iom-division-2", "2026-01-31", "castletown", 5, 1, "malew"],
  ["iom-division-2", "2026-01-31", "st-georges", 2, 0, "governors-athletic"],
  ["iom-division-2", "2026-01-31", "marown", 4, 2, "douglas-royal"],
  ["iom-division-2", "2026-02-28", "colby", 4, 1, "castletown"],
  ["iom-division-2", "2026-02-28", "douglas-royal", 5, 0, "douglas-district"],
  ["iom-division-2", "2026-02-28", "governors-athletic", 0, 6, "marown"],
  ["iom-division-2", "2026-02-28", "malew", 3, 0, "st-georges"],
  ["iom-division-2", "2026-03-07", "governors-athletic", 3, 0, "douglas-district"],
  ["iom-division-2", "2026-03-07", "malew", 1, 0, "colby"],
  ["iom-division-2", "2026-03-07", "marown", 6, 5, "st-georges"],

  // ── Combination 1 ───────────────────────────────────────────────────────────
  // HW = home walkover = 3-0; AW = away walkover = 0-3
  ["iom-combination-1", "2025-08-30", "braddan-comb", 2, 5, "rushen-united-comb"],
  ["iom-combination-1", "2025-08-30", "dhsob-comb", 4, 6, "st-marys-comb"],
  ["iom-combination-1", "2025-08-30", "foxdale-comb", 0, 5, "ayre-united-comb"],
  ["iom-combination-1", "2025-08-30", "laxey-comb", 3, 4, "st-johns-united-comb"],
  ["iom-combination-1", "2025-08-30", "peel-comb", 0, 0, "ramsey-comb"],
  ["iom-combination-1", "2025-08-30", "union-mills-comb", 0, 10, "corinthians-comb"],
  ["iom-combination-1", "2025-09-03", "st-marys-comb", 5, 4, "laxey-comb"],
  ["iom-combination-1", "2025-09-03", "ayre-united-comb", 0, 5, "peel-comb"],
  ["iom-combination-1", "2025-09-03", "corinthians-comb", 7, 2, "braddan-comb"],
  ["iom-combination-1", "2025-09-03", "ramsey-comb", 4, 3, "dhsob-comb"],
  ["iom-combination-1", "2025-09-03", "rushen-united-comb", 11, 0, "foxdale-comb"],
  ["iom-combination-1", "2025-09-03", "st-johns-united-comb", 0, 4, "onchan-comb"],
  ["iom-combination-1", "2025-09-06", "braddan-comb", 2, 2, "union-mills-comb"],
  ["iom-combination-1", "2025-09-06", "dhsob-comb", 2, 1, "ayre-united-comb"],
  ["iom-combination-1", "2025-09-06", "foxdale-comb", 0, 9, "corinthians-comb"],
  ["iom-combination-1", "2025-09-06", "laxey-comb", 2, 2, "ramsey-comb"],
  ["iom-combination-1", "2025-09-06", "onchan-comb", 3, 3, "st-marys-comb"],
  ["iom-combination-1", "2025-09-06", "peel-comb", 2, 2, "rushen-united-comb"],
  ["iom-combination-1", "2025-09-13", "ayre-united-comb", 2, 0, "laxey-comb"],
  ["iom-combination-1", "2025-09-13", "corinthians-comb", 3, 5, "peel-comb"],
  ["iom-combination-1", "2025-09-13", "ramsey-comb", 4, 2, "onchan-comb"],
  ["iom-combination-1", "2025-09-13", "rushen-united-comb", 7, 2, "dhsob-comb"],
  ["iom-combination-1", "2025-09-13", "union-mills-comb", 7, 0, "foxdale-comb"],
  ["iom-combination-1", "2025-09-13", "st-marys-comb", 0, 3, "st-johns-united-comb"], // AW = away win
  ["iom-combination-1", "2025-09-20", "foxdale-comb", 1, 6, "braddan-comb"],
  ["iom-combination-1", "2025-09-20", "laxey-comb", 1, 1, "rushen-united-comb"],
  ["iom-combination-1", "2025-09-20", "st-johns-united-comb", 0, 6, "ramsey-comb"],
  ["iom-combination-1", "2025-09-27", "ayre-united-comb", 2, 8, "st-johns-united-comb"],
  ["iom-combination-1", "2025-09-27", "corinthians-comb", 5, 6, "laxey-comb"],
  ["iom-combination-1", "2025-09-27", "ramsey-comb", 8, 1, "st-marys-comb"],
  ["iom-combination-1", "2025-09-27", "rushen-united-comb", 4, 0, "onchan-comb"],
  ["iom-combination-1", "2025-09-27", "union-mills-comb", 3, 10, "dhsob-comb"],
  ["iom-combination-1", "2025-10-04", "dhsob-comb", 4, 4, "braddan-comb"],
  ["iom-combination-1", "2025-10-04", "laxey-comb", 5, 3, "union-mills-comb"],
  ["iom-combination-1", "2025-10-04", "peel-comb", 2, 3, "foxdale-comb"],
  ["iom-combination-1", "2025-10-04", "st-marys-comb", 6, 4, "ayre-united-comb"],
  ["iom-combination-1", "2025-10-11", "ayre-united-comb", 0, 4, "ramsey-comb"],
  ["iom-combination-1", "2025-10-11", "braddan-comb", 1, 3, "laxey-comb"],
  ["iom-combination-1", "2025-10-11", "corinthians-comb", 8, 2, "st-johns-united-comb"],
  ["iom-combination-1", "2025-10-11", "foxdale-comb", 0, 10, "dhsob-comb"],
  ["iom-combination-1", "2025-10-11", "rushen-united-comb", 3, 1, "st-marys-comb"],
  ["iom-combination-1", "2025-10-11", "union-mills-comb", 1, 6, "onchan-comb"],
  ["iom-combination-1", "2025-10-18", "dhsob-comb", 1, 12, "peel-comb"],
  ["iom-combination-1", "2025-10-18", "laxey-comb", 3, 0, "foxdale-comb"], // HW = home win
  ["iom-combination-1", "2025-10-18", "onchan-comb", 6, 0, "braddan-comb"],
  ["iom-combination-1", "2025-10-18", "ramsey-comb", 2, 1, "rushen-united-comb"],
  ["iom-combination-1", "2025-10-18", "st-johns-united-comb", 5, 3, "union-mills-comb"],
  ["iom-combination-1", "2025-10-18", "st-marys-comb", 0, 6, "corinthians-comb"],
  ["iom-combination-1", "2025-10-25", "braddan-comb", 3, 4, "st-johns-united-comb"],
  ["iom-combination-1", "2025-10-25", "foxdale-comb", 2, 23, "onchan-comb"],
  ["iom-combination-1", "2025-10-25", "peel-comb", 6, 3, "laxey-comb"],
  ["iom-combination-1", "2025-10-25", "rushen-united-comb", 3, 0, "ayre-united-comb"], // HW = home win
  ["iom-combination-1", "2025-10-25", "union-mills-comb", 2, 7, "st-marys-comb"],
  ["iom-combination-1", "2025-11-01", "ayre-united-comb", 2, 10, "corinthians-comb"],
  ["iom-combination-1", "2025-11-01", "laxey-comb", 5, 1, "dhsob-comb"],
  ["iom-combination-1", "2025-11-01", "onchan-comb", 3, 2, "peel-comb"],
  ["iom-combination-1", "2025-11-01", "st-johns-united-comb", 8, 2, "foxdale-comb"],
  ["iom-combination-1", "2025-11-01", "st-marys-comb", 3, 2, "braddan-comb"],
  ["iom-combination-1", "2025-11-08", "braddan-comb", 0, 3, "ramsey-comb"],
  ["iom-combination-1", "2025-11-08", "corinthians-comb", 4, 3, "rushen-united-comb"],
  ["iom-combination-1", "2025-11-08", "dhsob-comb", 3, 3, "onchan-comb"],
  ["iom-combination-1", "2025-11-08", "peel-comb", 3, 0, "st-johns-united-comb"],
  ["iom-combination-1", "2025-11-15", "ayre-united-comb", 4, 3, "braddan-comb"],
  ["iom-combination-1", "2025-11-15", "ramsey-comb", 8, 0, "foxdale-comb"],
  ["iom-combination-1", "2025-11-15", "st-marys-comb", 2, 3, "peel-comb"],
  ["iom-combination-1", "2025-11-22", "ayre-united-comb", 4, 0, "foxdale-comb"],
  ["iom-combination-1", "2025-11-22", "corinthians-comb", 8, 1, "union-mills-comb"],
  ["iom-combination-1", "2025-11-22", "st-johns-united-comb", 1, 5, "laxey-comb"],
  ["iom-combination-1", "2025-11-22", "st-marys-comb", 2, 7, "dhsob-comb"],
  ["iom-combination-1", "2025-11-29", "foxdale-comb", 0, 7, "rushen-united-comb"],
  ["iom-combination-1", "2025-11-29", "peel-comb", 10, 1, "ayre-united-comb"],
  ["iom-combination-1", "2025-12-06", "st-marys-comb", 3, 2, "onchan-comb"],
  ["iom-combination-1", "2025-12-13", "dhsob-comb", 4, 2, "rushen-united-comb"],
  ["iom-combination-1", "2025-12-13", "laxey-comb", 3, 0, "ayre-united-comb"], // HW = home win
  ["iom-combination-1", "2025-12-13", "onchan-comb", 1, 1, "ramsey-comb"],
  ["iom-combination-1", "2025-12-13", "peel-comb", 5, 7, "corinthians-comb"],
  ["iom-combination-1", "2025-12-13", "st-johns-united-comb", 3, 0, "st-marys-comb"], // HW = home win
  ["iom-combination-1", "2026-01-03", "corinthians-comb", 1, 1, "ramsey-comb"],
  ["iom-combination-1", "2026-01-03", "peel-comb", 16, 0, "union-mills-comb"],
  ["iom-combination-1", "2026-01-03", "rushen-united-comb", 4, 1, "braddan-comb"],
  ["iom-combination-1", "2026-01-10", "braddan-comb", 8, 0, "foxdale-comb"],
  ["iom-combination-1", "2026-01-10", "corinthians-comb", 3, 3, "dhsob-comb"],
  ["iom-combination-1", "2026-01-10", "ramsey-comb", 9, 0, "st-johns-united-comb"],
  ["iom-combination-1", "2026-01-17", "dhsob-comb", 3, 0, "union-mills-comb"],
  ["iom-combination-1", "2026-01-17", "laxey-comb", 3, 4, "corinthians-comb"],
  ["iom-combination-1", "2026-01-17", "onchan-comb", 5, 2, "rushen-united-comb"],
  ["iom-combination-1", "2026-01-17", "peel-comb", 14, 0, "braddan-comb"],
  ["iom-combination-1", "2026-01-17", "st-johns-united-comb", 1, 2, "ayre-united-comb"],
  ["iom-combination-1", "2026-01-17", "st-marys-comb", 6, 2, "ramsey-comb"],
  ["iom-combination-1", "2026-01-24", "ayre-united-comb", 0, 3, "st-marys-comb"], // AW = away win
  ["iom-combination-1", "2026-01-24", "corinthians-comb", 0, 5, "onchan-comb"],
  ["iom-combination-1", "2026-01-24", "rushen-united-comb", 5, 2, "st-johns-united-comb"],
  ["iom-combination-1", "2026-01-24", "union-mills-comb", 2, 9, "laxey-comb"],
  ["iom-combination-1", "2026-01-31", "corinthians-comb", 10, 0, "foxdale-comb"],
  ["iom-combination-1", "2026-01-31", "laxey-comb", 4, 2, "st-marys-comb"],
  ["iom-combination-1", "2026-01-31", "onchan-comb", 3, 0, "ayre-united-comb"], // HW = home win
  ["iom-combination-1", "2026-01-31", "rushen-united-comb", 3, 0, "union-mills-comb"], // HW = home win
  ["iom-combination-1", "2026-02-14", "st-marys-comb", 5, 2, "rushen-united-comb"],
  ["iom-combination-1", "2026-02-21", "peel-comb", 5, 0, "dhsob-comb"],
  ["iom-combination-1", "2026-02-28", "ayre-united-comb", 2, 3, "rushen-united-comb"],
  ["iom-combination-1", "2026-02-28", "laxey-comb", 2, 6, "peel-comb"],
  ["iom-combination-1", "2026-02-28", "onchan-comb", 4, 1, "foxdale-comb"],
  ["iom-combination-1", "2026-02-28", "ramsey-comb", 8, 0, "corinthians-comb"],
  ["iom-combination-1", "2026-02-28", "st-marys-comb", 8, 4, "union-mills-comb"],
  ["iom-combination-1", "2026-03-07", "braddan-comb", 0, 3, "corinthians-comb"], // AW = away win
  ["iom-combination-1", "2026-03-07", "foxdale-comb", 0, 3, "st-marys-comb"], // AW = away win
  ["iom-combination-1", "2026-03-07", "onchan-comb", 3, 2, "laxey-comb"],
  ["iom-combination-1", "2026-03-07", "ramsey-comb", 3, 1, "peel-comb"],
  ["iom-combination-1", "2026-03-07", "st-johns-united-comb", 0, 3, "dhsob-comb"], // AW = away win

  // ── Combination 2 ───────────────────────────────────────────────────────────
  ["iom-combination-2", "2025-09-03", "castletown-comb", 7, 0, "douglas-district-comb"],
  ["iom-combination-2", "2025-09-03", "colby-comb", 2, 2, "governors-athletic-comb"],
  ["iom-combination-2", "2025-09-03", "douglas-athletic-comb", 3, 1, "marown-comb"],
  ["iom-combination-2", "2025-09-03", "gymnasium-comb", 5, 6, "rycob-comb"],
  ["iom-combination-2", "2025-09-03", "pulrose-united-comb", 5, 0, "douglas-royal-comb"],
  ["iom-combination-2", "2025-09-03", "st-georges-comb", 5, 2, "michael-united-comb"],
  ["iom-combination-2", "2025-09-06", "douglas-district-comb", 2, 2, "colby-comb"],
  ["iom-combination-2", "2025-09-06", "douglas-royal-comb", 3, 4, "castletown-comb"],
  ["iom-combination-2", "2025-09-06", "marown-comb", 5, 4, "st-georges-comb"],
  ["iom-combination-2", "2025-09-06", "michael-united-comb", 1, 3, "pulrose-united-comb"],
  ["iom-combination-2", "2025-09-06", "rycob-comb", 3, 0, "malew-comb"], // HW = home win
  ["iom-combination-2", "2025-09-06", "governors-athletic-comb", 2, 2, "gymnasium-comb"],
  ["iom-combination-2", "2025-09-13", "colby-comb", 4, 2, "douglas-royal-comb"],
  ["iom-combination-2", "2025-09-13", "gymnasium-comb", 8, 2, "douglas-district-comb"],
  ["iom-combination-2", "2025-09-13", "malew-comb", 0, 3, "governors-athletic-comb"], // AW = away win
  ["iom-combination-2", "2025-09-13", "pulrose-united-comb", 2, 1, "marown-comb"],
  ["iom-combination-2", "2025-09-13", "st-georges-comb", 2, 6, "douglas-athletic-comb"],
  ["iom-combination-2", "2025-09-20", "douglas-district-comb", 3, 0, "malew-comb"], // HW = home win
  ["iom-combination-2", "2025-09-20", "douglas-athletic-comb", 0, 3, "pulrose-united-comb"], // AW = away win
  ["iom-combination-2", "2025-09-20", "douglas-royal-comb", 0, 6, "gymnasium-comb"],
  ["iom-combination-2", "2025-09-20", "marown-comb", 3, 2, "castletown-comb"],
  ["iom-combination-2", "2025-09-20", "michael-united-comb", 3, 2, "colby-comb"],
  ["iom-combination-2", "2025-09-27", "castletown-comb", 2, 8, "douglas-athletic-comb"],
  ["iom-combination-2", "2025-09-27", "colby-comb", 3, 4, "marown-comb"],
  ["iom-combination-2", "2025-09-27", "gymnasium-comb", 8, 3, "michael-united-comb"],
  ["iom-combination-2", "2025-09-27", "malew-comb", 2, 12, "douglas-royal-comb"],
  ["iom-combination-2", "2025-09-27", "pulrose-united-comb", 3, 0, "st-georges-comb"], // HW = home win
  ["iom-combination-2", "2025-09-27", "rycob-comb", 11, 1, "douglas-district-comb"],
  ["iom-combination-2", "2025-10-04", "douglas-district-comb", 0, 7, "governors-athletic-comb"],
  ["iom-combination-2", "2025-10-04", "douglas-royal-comb", 2, 9, "rycob-comb"],
  ["iom-combination-2", "2025-10-04", "marown-comb", 2, 2, "gymnasium-comb"],
  ["iom-combination-2", "2025-10-11", "castletown-comb", 2, 3, "pulrose-united-comb"],
  ["iom-combination-2", "2025-10-11", "colby-comb", 7, 2, "st-georges-comb"],
  ["iom-combination-2", "2025-10-11", "gymnasium-comb", 0, 9, "douglas-athletic-comb"],
  ["iom-combination-2", "2025-10-11", "malew-comb", 1, 11, "marown-comb"],
  ["iom-combination-2", "2025-10-11", "rycob-comb", 8, 2, "michael-united-comb"],
  ["iom-combination-2", "2025-10-11", "governors-athletic-comb", 3, 5, "douglas-royal-comb"],
  ["iom-combination-2", "2025-10-18", "douglas-athletic-comb", 4, 1, "malew-comb"],
  ["iom-combination-2", "2025-10-18", "douglas-royal-comb", 5, 2, "douglas-district-comb"],
  ["iom-combination-2", "2025-10-18", "marown-comb", 0, 10, "rycob-comb"],
  ["iom-combination-2", "2025-10-18", "michael-united-comb", 2, 4, "governors-athletic-comb"],
  ["iom-combination-2", "2025-10-18", "pulrose-united-comb", 6, 3, "colby-comb"],
  ["iom-combination-2", "2025-10-18", "st-georges-comb", 1, 5, "gymnasium-comb"],
  ["iom-combination-2", "2025-10-25", "colby-comb", 9, 1, "castletown-comb"],
  ["iom-combination-2", "2025-10-25", "douglas-district-comb", 0, 10, "michael-united-comb"],
  ["iom-combination-2", "2025-10-25", "gymnasium-comb", 2, 6, "pulrose-united-comb"],
  ["iom-combination-2", "2025-10-25", "malew-comb", 7, 3, "st-georges-comb"],
  ["iom-combination-2", "2025-10-25", "rycob-comb", 3, 3, "douglas-athletic-comb"],
  ["iom-combination-2", "2025-10-25", "governors-athletic-comb", 1, 6, "marown-comb"],
  ["iom-combination-2", "2025-11-01", "castletown-comb", 2, 1, "gymnasium-comb"],
  ["iom-combination-2", "2025-11-01", "douglas-athletic-comb", 13, 0, "governors-athletic-comb"],
  ["iom-combination-2", "2025-11-01", "marown-comb", 9, 0, "douglas-district-comb"],
  ["iom-combination-2", "2025-11-01", "michael-united-comb", 5, 4, "douglas-royal-comb"],
  ["iom-combination-2", "2025-11-01", "pulrose-united-comb", 7, 1, "malew-comb"],
  ["iom-combination-2", "2025-11-08", "douglas-district-comb", 2, 15, "douglas-athletic-comb"],
  ["iom-combination-2", "2025-11-08", "governors-athletic-comb", 3, 0, "st-georges-comb"], // HW = home win
  ["iom-combination-2", "2025-11-08", "gymnasium-comb", 2, 3, "colby-comb"],
  ["iom-combination-2", "2025-11-15", "castletown-comb", 2, 4, "rycob-comb"],
  ["iom-combination-2", "2025-11-15", "colby-comb", 1, 1, "malew-comb"],
  ["iom-combination-2", "2025-11-15", "marown-comb", 2, 3, "michael-united-comb"],
  ["iom-combination-2", "2025-11-15", "pulrose-united-comb", 4, 2, "governors-athletic-comb"],
  ["iom-combination-2", "2025-11-15", "st-georges-comb", 2, 1, "douglas-district-comb"],
  ["iom-combination-2", "2025-11-22", "castletown-comb", 1, 0, "governors-athletic-comb"],
  ["iom-combination-2", "2025-11-22", "colby-comb", 0, 4, "rycob-comb"],
  ["iom-combination-2", "2025-11-22", "douglas-athletic-comb", 8, 3, "michael-united-comb"],
  ["iom-combination-2", "2025-11-22", "gymnasium-comb", 7, 6, "malew-comb"],
  ["iom-combination-2", "2025-11-22", "pulrose-united-comb", 7, 0, "douglas-district-comb"],
  ["iom-combination-2", "2025-11-22", "st-georges-comb", 0, 3, "douglas-royal-comb"], // AW = away win
  ["iom-combination-2", "2025-11-29", "douglas-district-comb", 2, 3, "castletown-comb"],
  ["iom-combination-2", "2025-11-29", "douglas-royal-comb", 2, 7, "pulrose-united-comb"],
  ["iom-combination-2", "2025-11-29", "marown-comb", 3, 4, "douglas-athletic-comb"],
  ["iom-combination-2", "2025-11-29", "michael-united-comb", 3, 0, "st-georges-comb"], // HW = home win
  ["iom-combination-2", "2025-11-29", "rycob-comb", 7, 3, "gymnasium-comb"],
  ["iom-combination-2", "2025-12-06", "castletown-comb", 3, 3, "douglas-royal-comb"],
  ["iom-combination-2", "2025-12-13", "douglas-district-comb", 0, 5, "gymnasium-comb"],
  ["iom-combination-2", "2025-12-13", "douglas-athletic-comb", 3, 0, "st-georges-comb"], // HW = home win
  ["iom-combination-2", "2025-12-13", "douglas-royal-comb", 2, 4, "colby-comb"],
  ["iom-combination-2", "2025-12-13", "marown-comb", 3, 4, "pulrose-united-comb"],
  ["iom-combination-2", "2025-12-13", "michael-united-comb", 2, 4, "castletown-comb"],
  ["iom-combination-2", "2026-01-03", "douglas-athletic-comb", 4, 5, "colby-comb"],
  ["iom-combination-2", "2026-01-03", "governors-athletic-comb", 1, 6, "rycob-comb"],
  ["iom-combination-2", "2026-01-10", "castletown-comb", 2, 2, "marown-comb"],
  ["iom-combination-2", "2026-01-10", "colby-comb", 4, 2, "michael-united-comb"],
  ["iom-combination-2", "2026-01-10", "gymnasium-comb", 8, 3, "douglas-royal-comb"],
  ["iom-combination-2", "2026-01-10", "pulrose-united-comb", 2, 4, "douglas-athletic-comb"],
  ["iom-combination-2", "2026-01-10", "rycob-comb", 9, 0, "governors-athletic-comb"],
  ["iom-combination-2", "2026-01-17", "douglas-district-comb", 0, 11, "rycob-comb"],
  ["iom-combination-2", "2026-01-17", "douglas-athletic-comb", 6, 3, "castletown-comb"],
  ["iom-combination-2", "2026-01-17", "douglas-royal-comb", 3, 3, "malew-comb"],
  ["iom-combination-2", "2026-01-17", "michael-united-comb", 2, 4, "gymnasium-comb"],
  ["iom-combination-2", "2026-01-24", "castletown-comb", 1, 2, "st-georges-comb"],
  ["iom-combination-2", "2026-01-24", "governors-athletic-comb", 3, 1, "douglas-district-comb"],
  ["iom-combination-2", "2026-01-24", "gymnasium-comb", 2, 5, "marown-comb"],
  ["iom-combination-2", "2026-01-24", "malew-comb", 9, 3, "michael-united-comb"],
  ["iom-combination-2", "2026-01-31", "colby-comb", 8, 2, "douglas-district-comb"],
  ["iom-combination-2", "2026-01-31", "douglas-royal-comb", 0, 5, "marown-comb"],
  ["iom-combination-2", "2026-01-31", "gymnasium-comb", 6, 0, "governors-athletic-comb"],
  ["iom-combination-2", "2026-01-31", "rycob-comb", 2, 3, "pulrose-united-comb"],
  ["iom-combination-2", "2026-02-14", "st-georges-comb", 3, 5, "colby-comb"],
  ["iom-combination-2", "2026-02-28", "castletown-comb", 1, 2, "colby-comb"],
  ["iom-combination-2", "2026-02-28", "marown-comb", 3, 0, "governors-athletic-comb"], // HW = home win
  ["iom-combination-2", "2026-02-28", "michael-united-comb", 2, 2, "douglas-district-comb"],
  ["iom-combination-2", "2026-02-28", "pulrose-united-comb", 2, 0, "gymnasium-comb"],
  ["iom-combination-2", "2026-02-28", "st-georges-comb", 3, 0, "malew-comb"], // HW = home win
  ["iom-combination-2", "2026-03-07", "castletown-comb", 5, 3, "michael-united-comb"],
  ["iom-combination-2", "2026-03-07", "colby-comb", 1, 1, "pulrose-united-comb"],
  ["iom-combination-2", "2026-03-07", "rycob-comb", 6, 1, "douglas-royal-comb"],
  ["iom-combination-2", "2026-03-07", "st-georges-comb", 0, 3, "marown-comb"], // AW = away win
];

// ── Upcoming fixtures ────────────────────────────────────────────────────────
// Format: [leagueSlug, date, homeTeamSlug, awayTeamSlug, venue]

const FIXTURES = [
  // Division 2
  ["iom-division-2", "2026-03-14T14:30:00", "marown", "douglas-district", "Marown Memorial Playing Fields"],
  ["iom-division-2", "2026-03-14T14:30:00", "pulrose-united", "malew", "Pulrose United F.C."],
  ["iom-division-2", "2026-03-14T14:30:00", "st-georges", "rycob", "St Georges F.C."],
  ["iom-division-2", "2026-03-28T14:30:00", "douglas-royal", "marown", "Ballafletcher Sports Centre"],
  ["iom-division-2", "2026-03-28T14:30:00", "governors-athletic", "st-georges", "Colby AFC"],
  // Combination 2
  ["iom-combination-2", "2026-03-14T14:30:00", "douglas-district-comb", "marown-comb", "Groves Road"],
];

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🏈 Seeding IOMFA 2025/26 football data...\n");

  // 1. Fetch league IDs
  console.log("📋 Fetching leagues...");
  const { data: leagues, error: leagueErr } = await db
    .from("sports_leagues")
    .select("id, slug")
    .eq("sport_code", "football");

  if (leagueErr || !leagues?.length) {
    console.error("❌ Failed to fetch leagues:", leagueErr?.message);
    process.exit(1);
  }

  const leagueIdBySlug = Object.fromEntries(leagues.map((l) => [l.slug, l.id]));
  console.log("  Found leagues:", Object.keys(leagueIdBySlug).join(", "));

  // 2. Insert teams
  console.log("\n👥 Inserting teams...");
  let totalTeams = 0;
  for (const [leagueSlug, teams] of Object.entries(TEAMS)) {
    const leagueId = leagueIdBySlug[leagueSlug];
    if (!leagueId) {
      console.warn(`  ⚠️  League not found: ${leagueSlug}`);
      continue;
    }
    const rows = teams.map((t) => ({ ...t, league_id: leagueId }));
    const { error } = await db
      .from("sports_teams")
      .upsert(rows, { onConflict: "league_id,slug" });
    if (error) {
      console.error(`  ❌ Failed inserting teams for ${leagueSlug}:`, error.message);
    } else {
      console.log(`  ✅ ${leagueSlug}: ${teams.length} teams`);
      totalTeams += teams.length;
    }
  }
  console.log(`  Total: ${totalTeams} teams inserted`);

  // 3. Fetch all teams to build slug→id map
  console.log("\n🗺️  Building team ID map...");
  const { data: allTeams } = await db
    .from("sports_teams")
    .select("id, league_id, slug");

  // Map: "leagueSlug:teamSlug" → teamId
  const teamIdMap = new Map();
  for (const t of allTeams ?? []) {
    // Find league slug for this team
    const ls = Object.entries(leagueIdBySlug).find(([, id]) => id === t.league_id)?.[0];
    if (ls) teamIdMap.set(`${ls}:${t.slug}`, t.id);
  }
  console.log(`  Mapped ${teamIdMap.size} team slots`);

  // 4. Insert results
  console.log("\n⚽ Inserting results...");
  let resultCount = 0;
  let resultErrors = 0;
  const resultRows = [];

  for (const [leagueSlug, date, homeSlug, homeGoals, awayGoals, awaySlug] of RESULTS) {
    const leagueId = leagueIdBySlug[leagueSlug];
    const homeId = teamIdMap.get(`${leagueSlug}:${homeSlug}`);
    const awayId = teamIdMap.get(`${leagueSlug}:${awaySlug}`);

    if (!leagueId || !homeId || !awayId) {
      console.warn(`  ⚠️  Missing IDs for: ${leagueSlug} ${date} ${homeSlug} vs ${awaySlug}`);
      resultErrors++;
      continue;
    }

    resultRows.push({
      league_id: leagueId,
      home_team_id: homeId,
      away_team_id: awayId,
      home_goals: homeGoals,
      away_goals: awayGoals,
      played_at: new Date(date).toISOString(),
    });
  }

  // Insert in batches of 50
  for (let i = 0; i < resultRows.length; i += 50) {
    const batch = resultRows.slice(i, i + 50);
    const { error } = await db.from("sports_match_results").insert(batch);
    if (error) {
      console.error(`  ❌ Batch ${i / 50 + 1} error:`, error.message);
      resultErrors += batch.length;
    } else {
      resultCount += batch.length;
    }
  }
  console.log(`  ✅ ${resultCount} results inserted (${resultErrors} errors)`);

  // 5. Insert fixtures
  console.log("\n📅 Inserting fixtures...");
  let fixtureCount = 0;
  for (const [leagueSlug, date, homeSlug, awaySlug, venue] of FIXTURES) {
    const leagueId = leagueIdBySlug[leagueSlug];
    const homeId = teamIdMap.get(`${leagueSlug}:${homeSlug}`);
    const awayId = teamIdMap.get(`${leagueSlug}:${awaySlug}`);

    if (!leagueId || !homeId || !awayId) {
      console.warn(`  ⚠️  Missing IDs for fixture: ${leagueSlug} ${date} ${homeSlug} vs ${awaySlug}`);
      continue;
    }

    const { error } = await db.from("sports_match_fixtures").insert({
      league_id: leagueId,
      home_team_id: homeId,
      away_team_id: awayId,
      starts_at: new Date(date).toISOString(),
      venue: venue ?? null,
      status: "scheduled",
    });
    if (error) {
      console.error(`  ❌ Fixture error:`, error.message);
    } else {
      fixtureCount++;
    }
  }
  console.log(`  ✅ ${fixtureCount} fixtures inserted`);

  // 6. Recalculate all league tables
  console.log("\n📊 Recalculating league tables...");
  for (const [leagueSlug, leagueId] of Object.entries(leagueIdBySlug)) {
    await recalcLeague(leagueId, leagueSlug);
  }

  console.log("\n✅ Done! All IOMFA 2025/26 data seeded.");
}

async function recalcLeague(leagueId, leagueSlug) {
  const { data: teams } = await db
    .from("sports_teams")
    .select("id")
    .eq("league_id", leagueId);

  if (!teams?.length) return;

  const { data: results } = await db
    .from("sports_match_results")
    .select("home_team_id, away_team_id, home_goals, away_goals")
    .eq("league_id", leagueId);

  const stats = {};
  for (const t of teams) {
    stats[t.id] = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 };
  }

  for (const r of results ?? []) {
    const h = stats[r.home_team_id];
    const a = stats[r.away_team_id];
    if (!h || !a) continue;
    h.played++; a.played++;
    h.gf += r.home_goals; h.ga += r.away_goals;
    a.gf += r.away_goals; a.ga += r.home_goals;
    if (r.home_goals > r.away_goals) { h.won++; a.lost++; h.points += 3; }
    else if (r.home_goals < r.away_goals) { a.won++; h.lost++; a.points += 3; }
    else { h.drawn++; a.drawn++; h.points++; a.points++; }
  }

  const sorted = Object.entries(stats)
    .map(([teamId, s]) => ({ teamId: Number(teamId), ...s, gd: s.gf - s.ga }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return a.teamId - b.teamId;
    });

  const upsertRows = sorted.map((s, i) => ({
    league_id: leagueId,
    team_id: s.teamId,
    played: s.played,
    won: s.won,
    drawn: s.drawn,
    lost: s.lost,
    gf: s.gf,
    ga: s.ga,
    gd: s.gd,
    points: s.points,
    pos: i + 1,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await db
    .from("sports_league_tables")
    .upsert(upsertRows, { onConflict: "league_id,team_id" });

  if (error) {
    console.error(`  ❌ Table recalc failed for ${leagueSlug}:`, error.message);
  } else {
    console.log(`  ✅ ${leagueSlug}: table recalculated (${sorted.length} teams)`);
  }
}

main().catch(console.error);
