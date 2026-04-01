import fs from "node:fs/promises";
import path from "node:path";
import {
  WALKS,
  HERITAGE_PLACES,
  HERITAGE_LINKS,
  WALK_IMAGE_POOL,
  HERITAGE_IMAGE_POOL,
} from "./heritage-seed-data.mjs";

let MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

async function loadEnvLocal() {
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    const content = await fs.readFile(envPath, "utf8");
    const lines = content.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      let value = trimmed.slice(idx + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch (err) {
    // Ignore if .env.local doesn't exist; we'll rely on env vars.
  }
}

const OUTPUT_DIR = path.join(process.cwd(), "supabase", "seed");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "heritage_seed.sql");

const CENTER = "-4.5,54.2"; // Isle of Man approximate center

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sqlEscape(value) {
  return String(value).replace(/'/g, "''");
}

function sqlValue(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  return `'${sqlEscape(value)}'`;
}

function sqlArray(values) {
  if (!values || !values.length) return "NULL";
  const escaped = values.map((v) => `'${sqlEscape(v)}'`).join(", ");
  return `ARRAY[${escaped}]::text[]`;
}

function pickImage(pool, index) {
  return pool[index % pool.length];
}

function buildWalkFacilities(tags) {
  const set = new Set();
  if (tags?.includes("glen") || tags?.includes("woodland")) {
    set.add("Woodland trails");
  }
  if (tags?.includes("coastal") || tags?.includes("clifftop")) {
    set.add("Coastal paths");
  }
  if (tags?.includes("summit") || tags?.includes("ridge") || tags?.includes("moorland")) {
    set.add("Summit viewpoints");
  }
  if (tags?.includes("family-friendly")) {
    set.add("Family friendly");
  }
  if (!set.size) set.add("Marked footpaths");
  return Array.from(set);
}

function buildWalkParking(area) {
  if (!area) return "Parking available at nearby public areas.";
  return `Parking available around ${area}.`;
}

function buildWalkTips(difficulty) {
  if (difficulty === "Challenging") return "Check the forecast and bring extra layers.";
  if (difficulty === "Moderate") return "Wear sturdy shoes and allow extra time for views.";
  return "Ideal for a relaxed walk — take your time and enjoy the scenery.";
}

function buildPlaceFacilities(type) {
  if (type === "heritage") return ["Visitor information", "Photo spots"];
  if (type === "viewpoint") return ["Viewpoint access"];
  return ["Local heritage stop"];
}

function buildPlaceParking(area) {
  if (!area) return "Parking available nearby.";
  return `Parking available in ${area}.`;
}

async function geocode(name, area) {
  const query = `${name}, ${area ? `${area}, ` : ""}Isle of Man`;
  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json`
  );
  url.searchParams.set("access_token", MAPBOX_TOKEN);
  url.searchParams.set("limit", "1");
  url.searchParams.set("proximity", CENTER);
  url.searchParams.set("country", "IM");

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Mapbox geocode failed for ${name}`);
  }
  const data = await res.json();
  if (!data.features || !data.features.length) {
    return { latitude: null, longitude: null };
  }
  const [lng, lat] = data.features[0].center;
  return { latitude: lat, longitude: lng };
}

async function main() {
  await loadEnvLocal();

  MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!MAPBOX_TOKEN) {
    console.error("Missing NEXT_PUBLIC_MAPBOX_TOKEN in environment.");
    process.exit(1);
  }
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const walkRows = [];
  const placeRows = [];

  for (let i = 0; i < WALKS.length; i += 1) {
    const walk = WALKS[i];
    const coords = await geocode(walk.name, walk.area);

    walkRows.push({
      ...walk,
      hero_image_url: pickImage(WALK_IMAGE_POOL, i),
      description:
        walk.description ||
        `${walk.summary} This route showcases ${walk.area || "local"} scenery and is ideal for ${walk.best_for?.[0] || "a scenic outing"}.`,
      gallery_images: null,
      facilities: walk.facilities || buildWalkFacilities(walk.tags),
      parking_info: walk.parking_info || buildWalkParking(walk.area),
      tips: walk.tips || buildWalkTips(walk.difficulty),
      external_url: walk.external_url || null,
      map_embed_url: null,
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
    await sleep(120);
  }

  for (let i = 0; i < HERITAGE_PLACES.length; i += 1) {
    const place = HERITAGE_PLACES[i];
    const coords = await geocode(place.name, place.area);

    placeRows.push({
      ...place,
      hero_image_url: pickImage(HERITAGE_IMAGE_POOL, i),
      description:
        place.description ||
        `${place.summary} A standout stop for ${place.best_for?.[0] || "heritage explorers"} in ${place.area || "the Isle of Man"}.`,
      gallery_images: null,
      facilities: place.facilities || buildPlaceFacilities(place.type),
      parking_info: place.parking_info || buildPlaceParking(place.area),
      tips: place.tips || "Allow time to explore the surroundings.",
      external_url: place.external_url || null,
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
    await sleep(120);
  }

  const walkValues = walkRows
    .map((walk) =>
      `(${[
        sqlValue(walk.slug),
        sqlValue(walk.name),
        sqlValue(walk.area),
        sqlValue(walk.summary),
        sqlValue(walk.difficulty),
        sqlValue(walk.duration_mins),
        sqlValue(walk.distance_km),
        sqlValue(walk.hero_image_url),
        sqlValue(walk.description),
        sqlArray(walk.tags),
        sqlArray(walk.gallery_images),
        sqlValue(walk.parking_info),
        sqlArray(walk.facilities),
        sqlArray(walk.best_for),
        sqlValue(walk.tips),
        sqlValue(walk.external_url),
        sqlValue(walk.map_embed_url),
        sqlValue(walk.latitude),
        sqlValue(walk.longitude),
      ].join(", ")})`
    )
    .join(",\n");

  const placeValues = placeRows
    .map((place) =>
      `(${[
        sqlValue(place.slug),
        sqlValue(place.name),
        sqlValue(place.area),
        sqlValue(place.summary),
        sqlValue(place.description),
        sqlValue(place.type),
        sqlValue(place.difficulty),
        sqlValue(place.duration_mins),
        sqlValue(place.distance_km),
        sqlArray(place.tags),
        sqlValue(place.hero_image_url),
        sqlArray(place.gallery_images),
        sqlValue(place.parking_info),
        sqlArray(place.facilities),
        sqlArray(place.best_for),
        sqlValue(place.tips),
        sqlValue(place.external_url),
        sqlValue(place.latitude),
        sqlValue(place.longitude),
      ].join(", ")})`
    )
    .join(",\n");

  const linkStatements = Object.entries(HERITAGE_LINKS)
    .flatMap(([heritageSlug, walkSlugs]) =>
      walkSlugs.map(
        (walkSlug, idx) => `INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, ${idx + 1}
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = '${sqlEscape(walkSlug)}'
WHERE hp.slug = '${sqlEscape(heritageSlug)}'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;`
      )
    )
    .join("\n");

  const sql = `BEGIN;

INSERT INTO public.heritage_walks (
  slug,
  name,
  area,
  summary,
  difficulty,
  duration_mins,
  distance_km,
  hero_image_url,
  description,
  tags,
  gallery_images,
  parking_info,
  facilities,
  best_for,
  tips,
  external_url,
  map_embed_url,
  latitude,
  longitude
) VALUES
${walkValues}
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  area = EXCLUDED.area,
  summary = EXCLUDED.summary,
  difficulty = EXCLUDED.difficulty,
  duration_mins = EXCLUDED.duration_mins,
  distance_km = EXCLUDED.distance_km,
  hero_image_url = EXCLUDED.hero_image_url,
  description = EXCLUDED.description,
  tags = EXCLUDED.tags,
  gallery_images = EXCLUDED.gallery_images,
  parking_info = EXCLUDED.parking_info,
  facilities = EXCLUDED.facilities,
  best_for = EXCLUDED.best_for,
  tips = EXCLUDED.tips,
  external_url = EXCLUDED.external_url,
  map_embed_url = EXCLUDED.map_embed_url,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude;

INSERT INTO public.heritage_places (
  slug,
  name,
  area,
  summary,
  description,
  type,
  difficulty,
  duration_mins,
  distance_km,
  tags,
  hero_image_url,
  gallery_images,
  parking_info,
  facilities,
  best_for,
  tips,
  external_url,
  latitude,
  longitude
) VALUES
${placeValues}
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  area = EXCLUDED.area,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  difficulty = EXCLUDED.difficulty,
  duration_mins = EXCLUDED.duration_mins,
  distance_km = EXCLUDED.distance_km,
  tags = EXCLUDED.tags,
  hero_image_url = EXCLUDED.hero_image_url,
  gallery_images = EXCLUDED.gallery_images,
  parking_info = EXCLUDED.parking_info,
  facilities = EXCLUDED.facilities,
  best_for = EXCLUDED.best_for,
  tips = EXCLUDED.tips,
  external_url = EXCLUDED.external_url,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude;

${linkStatements}

COMMIT;
`;

  await fs.writeFile(OUTPUT_FILE, sql, "utf8");
  console.log(`Seed SQL written to ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
