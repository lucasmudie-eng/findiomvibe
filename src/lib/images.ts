/**
 * Centralised image configuration for ManxHive.
 *
 * All hero carousel slides and walk fallback images are defined here.
 * When you upload real photos to Supabase Storage, replace the `image`
 * values with the Supabase public URL — nothing else needs changing.
 *
 * Supabase Storage public URL pattern:
 *   https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/{path}
 *
 * Recommended bucket structure:
 *   images/
 *     walks/         ← one file per walk, named {slug}.jpg
 *     hero/          ← homepage and heritage page hero slides
 *
 * Image sourcing (free, legal):
 *   - Geograph.org.uk  → CC BY-SA 2.0, excellent IoM coverage by location
 *   - Wikimedia Commons → various CC licences, good for landmarks
 *   - Unsplash.com      → free commercial use, limited IoM-specific shots
 *   - Visit Isle of Man press pack → ask visitisleofman.com for permission
 */

const STORAGE = "https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images";

/** Build a Supabase Storage URL for a given path inside the images bucket */
export function storageUrl(path: string): string {
  return `${STORAGE}/${path}`;
}

/** Build the expected walk hero image URL from a walk slug.
 *  Upload walks/{slug}.jpg to Supabase Storage to make this resolve. */
export function walkImageUrl(slug: string): string {
  return storageUrl(`walks/${slug}.jpg`);
}

// ─── Homepage hero carousel ────────────────────────────────────────────────────
// Replace `image` values with storageUrl("hero/home-1-niarbyl.jpg") etc.
// once photos are uploaded. Labels (name/area) are already correct.

export const HOME_HERO_SLIDES = [
  {
    image: storageUrl("hero/home-1-niarbyl-bay.jpg"),
    name: "Niarbyl Bay",
    area: "West Coast",
  },
  {
    image: storageUrl("hero/home-2-castle-rushen.jpg"),
    name: "Castle Rushen",
    area: "Castletown",
  },
  {
    image: storageUrl("hero/home-3-dhoon-glen.jpg"),
    name: "Dhoon Glen",
    area: "East Coast",
  },
  {
    image: storageUrl("hero/home-4-snaefell-summit.jpg"),
    name: "Snaefell Summit",
    area: "Central Highlands",
  },
  {
    image: storageUrl("hero/home-5-peel-castle.jpg"),
    name: "Peel Castle",
    area: "Peel",
  },
] as const;

// ─── Heritage & Walks page hero carousel ──────────────────────────────────────

export const HERITAGE_HERO_SLIDES = [
  {
    image: storageUrl("hero/heritage-1-peel-hill.jpg"),
    name: "Peel Hill & Corrin's Folly",
    area: "Peel",
    category: "Walk" as const,
  },
  {
    image: storageUrl("hero/heritage-2-castle-rushen.jpg"),
    name: "Castle Rushen",
    area: "Castletown",
    category: "Heritage" as const,
  },
  {
    image: storageUrl("hero/heritage-3-niarbyl.jpg"),
    name: "Niarbyl Bay",
    area: "West",
    category: "Viewpoint" as const,
  },
  {
    image: storageUrl("hero/heritage-4-dhoon-glen.jpg"),
    name: "Dhoon Glen & Waterfall",
    area: "East Coast",
    category: "Walk" as const,
  },
  {
    image: storageUrl("hero/heritage-5-south-barrule.jpg"),
    name: "South Barrule Summit",
    area: "South",
    category: "Walk" as const,
  },
] as const;

// ─── Walk hero image map ───────────────────────────────────────────────────────
// Fallback used when a walk's hero_image_url is null in the database.
// Keys match the walk slug exactly.

export const WALK_IMAGES: Record<string, string> = {
  // ── Original seeded walks ──────────────────────────────────────────────────
  "baldwin-bluebell-walk":                                    walkImageUrl("baldwin-bluebell-walk"),
  "railway-ramble-castletown-derbyhaven-langness-st-michaels-island": walkImageUrl("railway-ramble-castletown-derbyhaven-langness-st-michaels-island"),
  "railway-ramble-ballasalla-rushen-abbey-silverdale-glen-grenaby":   walkImageUrl("railway-ramble-ballasalla-rushen-abbey-silverdale-glen-grenaby"),
  "railway-ramble-ballure-reservoir-albert-tower-ramsey":             walkImageUrl("railway-ramble-ballure-reservoir-albert-tower-ramsey"),
  "archibald-knox-trail":                                     walkImageUrl("archibald-knox-trail"),
  "walk-around-castletown":                                   walkImageUrl("walk-around-castletown"),
  "railway-ramble-glen-mona-maughold-brooghs-ramsey":         walkImageUrl("railway-ramble-glen-mona-maughold-brooghs-ramsey"),
  "railway-ramble-colby-station-colby-glen-cronk-e-dhooney":  walkImageUrl("railway-ramble-colby-station-colby-glen-cronk-e-dhooney"),
  "railway-ramble-glen-mona-snaefell-mines-laxey-valley":     walkImageUrl("railway-ramble-glen-mona-snaefell-mines-laxey-valley"),
  "glen-mooar-and-glen-wyllin":                               walkImageUrl("glen-mooar-and-glen-wyllin"),
  "derbyhaven-and-langness-nature-walk":                      walkImageUrl("derbyhaven-and-langness-nature-walk"),
  "douglas-heritage-and-nature-walk":                         walkImageUrl("douglas-heritage-and-nature-walk"),
  "railway-ramble-port-st-mary-the-chasms-cregneash-port-erin": walkImageUrl("railway-ramble-port-st-mary-the-chasms-cregneash-port-erin"),
  "bayr-ny-skeddan-the-herring-road":                         walkImageUrl("bayr-ny-skeddan-the-herring-road"),
  "maugholds-coast-coves-and-viking-crosses":                 walkImageUrl("maugholds-coast-coves-and-viking-crosses"),
  "silverdale-glen-and-castletown-stroll":                    walkImageUrl("silverdale-glen-and-castletown-stroll"),
  "millennium-way":                                           walkImageUrl("millennium-way"),
  "railway-ramble-ballasalla-castletown-derbyhaven-port-grenaugh": walkImageUrl("railway-ramble-ballasalla-castletown-derbyhaven-port-grenaugh"),
  "laxey-agneash-king-orrys-grave":                           walkImageUrl("laxey-agneash-king-orrys-grave"),
  "railway-ramble-baldrine-axnfell-glen-roy-laxey":           walkImageUrl("railway-ramble-baldrine-axnfell-glen-roy-laxey"),
  "railway-ramble-castletown-scarlett-pooil-vaaish":          walkImageUrl("railway-ramble-castletown-scarlett-pooil-vaaish"),
  "city-of-peel-heritage-strolls":                            walkImageUrl("city-of-peel-heritage-strolls"),
  "railway-ramble-ballaglass-glen-port-cornaa-glen-mona":     walkImageUrl("railway-ramble-ballaglass-glen-port-cornaa-glen-mona"),
  "railway-ramble-port-st-mary-the-sound-port-erin":          walkImageUrl("railway-ramble-port-st-mary-the-sound-port-erin"),
  "railway-ramble-port-erin-bradda-head-the-sloc":            walkImageUrl("railway-ramble-port-erin-bradda-head-the-sloc"),
  "railway-ramble-port-erin-bradda-head-fleshwick-bay":       walkImageUrl("railway-ramble-port-erin-bradda-head-fleshwick-bay"),
  "raad-ny-foillan-coastal-path":                             walkImageUrl("raad-ny-foillan-coastal-path"),
  // ── AllTrails additions ────────────────────────────────────────────────────
  "port-erin-and-cregneash":                                  walkImageUrl("port-erin-and-cregneash"),
  "bradda-glen-and-fleshwick-bay":                            walkImageUrl("bradda-glen-and-fleshwick-bay"),
  "peel-castle-and-corrins-hill-circular":                    walkImageUrl("peel-castle-and-corrins-hill-circular"),
  "snaefell-summit":                                          walkImageUrl("snaefell-summit"),
  "groudle-glen":                                             walkImageUrl("groudle-glen"),
  "isle-of-man-bottom-to-top":                                walkImageUrl("isle-of-man-bottom-to-top"),
  "triskelion-way":                                           walkImageUrl("triskelion-way"),
  "point-of-ayre-to-ramsey":                                  walkImageUrl("point-of-ayre-to-ramsey"),
  "dhoon-glen":                                               walkImageUrl("dhoon-glen"),
  "point-of-ayre-and-jurby":                                  walkImageUrl("point-of-ayre-and-jurby"),
  "maughold-along-the-sea":                                   walkImageUrl("maughold-along-the-sea"),
  "niarbyl-and-cronk-ny-arrey-laa":                           walkImageUrl("niarbyl-and-cronk-ny-arrey-laa"),
  "barrule-from-ramsey":                                      walkImageUrl("barrule-from-ramsey"),
};

/** Generic fallback used when no walk-specific image exists */
export const WALK_IMAGE_FALLBACK = storageUrl("hero/heritage-4-dhoon-glen.jpg");

/** Generic fallback for heritage places */
export const HERITAGE_IMAGE_FALLBACK = storageUrl("hero/heritage-2-castle-rushen.jpg");
