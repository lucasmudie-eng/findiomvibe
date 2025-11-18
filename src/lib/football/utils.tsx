// ---------- League display names ----------
export const LEAGUE_NAMES: Record<string, string> = {
  "iom-premier-league": "Canada Life Premier League",
  "iom-division-2": "DPS Ltd Division Two",
  "iom-combination-1": "Canada Life Combination One",
  "iom-combination-2": "DPS Ltd Combination Two",
};

export function leagueDisplayName(league: string) {
  return LEAGUE_NAMES[league] ?? league;
}

// ---------- Team name overrides + formatting ----------

// Exact overrides come first (force correct punctuation/case)
export const TEAM_NAME_OVERRIDES: Record<string, string> = {
  "st-georges": "St Georges",
  "st-georges-combi": "St Georges - Combi",
  "douglas-and-district": "Douglas & District",
  "douglas-and-district-combi": "Douglas & District - Combi",
  "rycob": "RYCOB",
  "rycob-combi": "RYCOB - Combi",
};

function cap(word: string) {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function formatBaseWords(parts: string[]) {
  // Word-level tweaks for nice title casing
  return parts
    .map((p) => {
      const w = p.toLowerCase();
      if (w === "and") return "&";
      if (w === "st") return "St";
      if (w === "rycob") return "RYCOB";
      // General title case otherwise
      return cap(w);
    })
    .join(" ");
}

/**
 * Format a team id (e.g. "castletown-combi") → "Castletown - Combi"
 * with overrides applied.
 */
export function formatTeamName(id: string): string {
  if (!id) return "";
  const forced = TEAM_NAME_OVERRIDES[id];
  if (forced) return forced;

  const parts = id.split("-");
  const isCombi = parts[parts.length - 1].toLowerCase() === "combi";

  if (isCombi) {
    const base = parts.slice(0, -1);
    return `${formatBaseWords(base)} - Combi`;
  }
  return formatBaseWords(parts);
}

/**
 * Build a compact label for results/fixtures with formatted team names.
 * Example:
 *   formatScoreLine("st-georges", "peel", 2, 1)
 *   => { left: "St Georges", score: "2 - 1", right: "Peel" }
 */
export function formatScoreLine(
  homeId: string,
  awayId: string,
  homeGoals?: number,
  awayGoals?: number
) {
  const left = formatTeamName(homeId);
  const right = formatTeamName(awayId);

  if (
    typeof homeGoals === "number" &&
    typeof awayGoals === "number"
  ) {
    return { left, score: `${homeGoals} - ${awayGoals}`, right };
  }

  return { left, score: "vs", right };
}

/**
 * Compatibility helper for TeamBadge and legacy components.
 * Just wraps formatTeamName.
 */
export function getTeamDisplayName(id: string): string {
  return formatTeamName(id);
}