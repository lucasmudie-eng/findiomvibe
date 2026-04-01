-- ─────────────────────────────────────────────────────────────────────────────
-- AllTrails Isle of Man — seed update
-- Compares against https://www.alltrails.com/isle-of-man
--
-- Changes:
--   1. UPDATE  millennium-way          (partial route → full route, Easy → Hard)
--   2. INSERT  13 walks present on AllTrails but missing from heritage_walks
-- ─────────────────────────────────────────────────────────────────────────────

BEGIN;

-- ─── 1. CORRECTIONS ──────────────────────────────────────────────────────────

-- Millennium Way was seeded as a partial section (St John's → Peel, 12.87 km).
-- AllTrails lists the full Castletown → Ramsey route as 37.4 km / Hard.
UPDATE public.heritage_walks
SET
  area            = 'Castletown to Ramsey',
  summary         = 'The full island-crossing trail from Castletown in the south to Ramsey in the north.',
  difficulty      = 'Hard',
  distance_km     = 37.4,
  duration_mins   = 780,   -- ~13 hours for the full route
  description     = 'The Millennium Way stretches 37 km from Castletown in the south to Ramsey in the north, traversing the length of the Isle of Man. The route passes through agricultural land, open moorland, ancient glens and historic villages, taking in landmarks like Slieau Whallian, South Barrule, Greeba Mountain, Beinn-y-Phott and Snaefell on its way north. It is a challenging multi-day or very long day route best split across two days.',
  tags            = ARRAY['long-distance', 'moorland', 'point-to-point', 'multi-day']::text[],
  best_for        = ARRAY['Long-distance hikers', 'Multi-day adventures', 'Island exploration']::text[],
  tips            = 'Most walkers split this over two days, staying overnight in Sulby or Ramsey. Start early if attempting in a single day. Download the OS map in advance.',
  external_url    = 'https://www.alltrails.com/trail/isle-of-man/isle-of-man/millennium-way',
  latitude        = 54.0702,
  longitude       = -4.6239
WHERE slug = 'millennium-way';


-- ─── 2. NEW WALKS FROM ALLTRAILS ─────────────────────────────────────────────

INSERT INTO public.heritage_walks (
  slug, name, area, summary, difficulty,
  duration_mins, distance_km,
  hero_image_url, description,
  tags, parking_info, facilities, best_for, tips,
  external_url, latitude, longitude
) VALUES

-- ── Port Erin and Cregneash ───────────────────────────────────────────────────
(
  'port-erin-and-cregneash',
  'Port Erin and Cregneash',
  'Port Erin / Rushen',
  'Dramatic circular coastal walk from Port Erin passing steep cliffs and the living museum village of Cregneash.',
  'Hard',
  225,  -- ~3.5–4 hours
  10.5,
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1400&q=80',
  'Starting from Port Erin beach, this circular route climbs onto the Meayll Peninsula and follows dramatic cliff-top paths past the Chasms sea fissures before reaching the National Folk Museum village of Cregneash. The return drops back down through pastoral land into Port Erin. Several steep climbs and descents make this the most popular hard walk on the island. Note: dogs are not permitted on the Cregneash section under Manx authority regulations.',
  ARRAY['coastal', 'clifftop', 'heritage', 'loop']::text[],
  'Car parks at Port Erin promenade. Train station nearby on the Isle of Man Steam Railway.',
  ARRAY['Toilets at Port Erin', 'Café and pubs in Port Erin', 'National Folk Museum at Cregneash']::text[],
  ARRAY['Coastal scenery', 'Heritage sites', 'Photography', 'Experienced walkers']::text[],
  'Wear sturdy footwear — cliff paths can be muddy. No dogs allowed on this route. The café in Cregneash is only open in peak season.',
  'https://www.alltrails.com/trail/isle-of-man/rushen/port-erin-and-cregneash',
  54.0764,
  -4.7611
),

-- ── Bradda Glen and Fleshwick Bay ─────────────────────────────────────────────
(
  'bradda-glen-and-fleshwick-bay',
  'Bradda Glen and Fleshwick Bay',
  'Port Erin / Rushen',
  'Moderate coastal walk from Port Erin climbing to Milner''s Tower on Bradda Head, with views to Northern Ireland.',
  'Moderate',
  165,  -- ~2.5–3 hours
  6.6,
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80',
  'Beginning in Port Erin, the route climbs steeply through Bradda Glen woodland before emerging onto the open headland below Milner''s Tower. From the summit of Bradda Head the views extend north along the western coast and on clear days reach as far as Northern Ireland and the Mourne Mountains. The trail descends into secluded Fleshwick Bay — one of the island''s finest pebbly coves — before looping back to Port Erin. Elevation gain of approximately 330 m.',
  ARRAY['coastal', 'clifftop', 'woodland', 'loop']::text[],
  'Park at Port Erin promenade or the upper village car park.',
  ARRAY['Pubs and cafés in Port Erin', 'Toilets at Port Erin promenade']::text[],
  ARRAY['Coastal views', 'Photography', 'Moderate walkers', 'Sunset walks']::text[],
  'The descent to Fleshwick Bay is steep and can be slippery in wet weather. The bay has no facilities — bring water and snacks.',
  'https://www.alltrails.com/trail/isle-of-man/rushen/bradda-glen-and-fleshwick-bay',
  54.0833,
  -4.7667
),

-- ── Peel Castle and Corrins Hill Circular ─────────────────────────────────────
(
  'peel-castle-and-corrins-hill-circular',
  'Peel Castle and Corrins Hill Circular',
  'Peel',
  'Easy circular walk taking in Peel Castle on St Patrick''s Isle and the panoramic viewpoint of Corrins Hill.',
  'Easy',
  102,  -- ~1h 42m
  6.1,
  'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&w=1400&q=80',
  'This popular circular walk starts near Peel harbour and crosses the causeway to St Patrick''s Isle, where the dramatic ruins of Peel Castle and the Cathedral of St German stand. After exploring the castle headland, the route climbs the hill behind Peel to Corrins Tower — a small round tower — for sweeping views over the town, the Peel plain and the Irish Sea. The descent back into Peel passes through pleasant residential streets and coastal paths. One of the most consistently highly-rated walks on the island (4.7 stars, 65+ reviews on AllTrails).',
  ARRAY['castle', 'heritage', 'coastal', 'loop', 'views']::text[],
  'Several car parks in Peel town centre and near the harbour.',
  ARRAY['Toilets in Peel town', 'Cafés and pubs in Peel', 'House of Manannan museum nearby']::text[],
  ARRAY['Families', 'Heritage lovers', 'Photography', 'Sunset walks']::text[],
  'The castle is managed by Manx National Heritage and has an entry fee in season. Corrins Tower can be visited at any time for free.',
  'https://www.alltrails.com/trail/isle-of-man/glenfaba/peel-castle-and-corrins-hill-circular',
  54.2244,
  -4.6967
),

-- ── Snaefell ──────────────────────────────────────────────────────────────────
(
  'snaefell-summit',
  'Snaefell Summit Walk',
  'Bungalow / Laxey',
  'Short but steep ascent to the highest point on the Isle of Man, with views into four kingdoms on a clear day.',
  'Moderate',
  75,   -- ~1–1.5 hours
  2.7,
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1400&q=80',
  'Starting from the Bungalow tram station on the TT Mountain Course, a clear path leads straight up the grassy and rocky slopes of Snaefell (621 m), the island''s only mountain. From the summit café (open seasonally) you can see England, Scotland, Ireland and Wales on a clear day — the four kingdoms of legend. The Snaefell Mountain Railway also reaches the summit, so you can walk up and ride down (or vice versa). Some steep, grassy sections require care in wet weather.',
  ARRAY['summit', 'moorland', 'mountain', 'views']::text[],
  'Limited parking at the Bungalow on the Mountain Road (A18). The Snaefell Mountain Railway runs from Laxey.',
  ARRAY['Summit café (seasonal)', 'Mountain Railway access', 'Toilets at summit (seasonal)']::text[],
  ARRAY['Summit baggers', 'Clear day views', 'Mountain Railway riders', 'Families (short route)']::text[],
  'Check weather forecasts carefully — the summit can be in low cloud even when it''s clear at sea level. Bring an extra layer; it''s significantly colder at the top.',
  'https://www.alltrails.com/trail/isle-of-man/garff/snaefell',
  54.2615,
  -4.4621
),

-- ── Groudle Glen ──────────────────────────────────────────────────────────────
(
  'groudle-glen',
  'Groudle Glen',
  'Onchan',
  'Enchanting easy woodland walk through a narrow coastal glen just north of Douglas, with a narrow-gauge railway and waterfalls.',
  'Easy',
  75,   -- ~1–1.5 hours
  3.7,
  'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1400&q=80',
  'Groudle Glen is one of the most magical short walks on the island. The path winds along a wooded gorge beside a rushing stream, past carved wooden sculptures, cascading waterfalls and lush ferns. At the glen mouth, the narrow-gauge Groudle Glen Railway — a restored Victorian miniature railway — runs along the clifftop to Sea Lion Rocks. The glen can be accessed from the Onchan end or from the coast near Groudle Beach.',
  ARRAY['woodland', 'glen', 'family-friendly', 'waterfall', 'railway']::text[],
  'Roadside parking near the glen entrance at Onchan or at Groudle Beach.',
  ARRAY['Groudle Glen Railway (seasonal)', 'Woodland paths', 'Stream crossing']::text[],
  ARRAY['Families', 'Dog walkers', 'Nature lovers', 'All abilities (lower section)']::text[],
  'The Groudle Glen Railway operates on summer weekends and bank holidays — well worth timing your visit to coincide. The lower section is suitable for younger children; the upper glen is rougher.',
  'https://www.alltrails.com/trail/isle-of-man/isle-of-man/groudle-glen',
  54.1833,
  -4.4500
),

-- ── Isle of Man Bottom to Top ──────────────────────────────────────────────────
(
  'isle-of-man-bottom-to-top',
  'Isle of Man Bottom to Top',
  'Laxey / Snaefell',
  'Challenging ridge hike from Laxey up to the summit of Snaefell via the eastern ridge, descending into Ramsey.',
  'Hard',
  225,  -- ~3.5–4 hours
  9.7,
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80',
  'A point-to-point mountain route that climbs from Laxey (virtually sea level) to the summit of Snaefell (621 m) via the eastern ridge, then descends steeply into the Sulby Valley or Ramsey. The name refers to going from the island''s bottom (coast) to its top (highest point). With 688 m of total elevation gain, this is one of the most physically demanding day walks on the island, rewarding fit walkers with magnificent views across the mountain heartland.',
  ARRAY['mountain', 'summit', 'moorland', 'point-to-point', 'views']::text[],
  'Start at Laxey village car park. Return to start via the Snaefell Mountain Railway or arrange a shuttle.',
  ARRAY['Cafés and shops in Laxey', 'Snaefell summit café (seasonal)', 'Mountain Railway return option']::text[],
  ARRAY['Experienced hikers', 'Summit baggers', 'Fitness challenge']::text[],
  'This is a point-to-point walk — arrange transport back or use the Mountain Railway from the summit. The descent off the ridge can be boggy. Conditions change quickly above 400 m.',
  'https://www.alltrails.com/trail/isle-of-man/garff/isle-of-man-bottom-to-top',
  54.2333,
  -4.3917
),

-- ── Triskelion Way ────────────────────────────────────────────────────────────
(
  'triskelion-way',
  'Triskelion Way',
  'Island-wide / Rushen to Maughold',
  'Epic 60 km long-distance pilgrimage trail crossing the island from Rushen Abbey to Maughold Church via Peel Cathedral.',
  'Hard',
  1140, -- ~19 hours (typically 3 days)
  60.2,
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
  'The Triskelion Way is a 60 km long-distance route taking in the full length and spiritual heritage of the Isle of Man. The trail links three of the island''s most significant religious sites: Rushen Abbey (Ballasalla), St German''s Cathedral in Peel, and the ancient Church and Headland at Maughold. Passing through farmland, moorland, woodland and coast, the route accumulates 1,908 m of total ascent and is typically completed over three days. A truly immersive way to experience the island''s landscape and history.',
  ARRAY['long-distance', 'heritage', 'pilgrimage', 'multi-day', 'moorland', 'coastal']::text[],
  'Start at Ballasalla (near Rushen Abbey). Finish at Maughold.',
  ARRAY['Accommodation in Peel (Day 1–2 stop)', 'Cafés along the route', 'Public transport access at start and finish']::text[],
  ARRAY['Multi-day hikers', 'Heritage enthusiasts', 'Long-distance walkers', 'Island exploration']::text[],
  'Plan accommodation in advance as options are limited mid-route. The most demanding section is Day 2 across the central hills. Download OS maps before setting out.',
  'https://www.alltrails.com/trail/isle-of-man/isle-of-man/triskelion-way',
  54.0702,
  -4.6239
),

-- ── Point of Ayre to Ramsey ────────────────────────────────────────────────────
(
  'point-of-ayre-to-ramsey',
  'Point of Ayre to Ramsey',
  'Bride / Point of Ayre',
  'Flat, remote coastal walk from the northernmost tip of the island along wild shores to Ramsey.',
  'Easy',
  135, -- ~2–2.5 hours
  11.1,
  'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1400&q=80',
  'Starting at the Point of Ayre Lighthouse — the most northerly point of the Isle of Man — this easy coastal walk follows the shoreline south to Ramsey along a remote and largely undeveloped stretch of coast. The landscape is flat and open, with gravel beaches, dune grassland, and wide views across to Scotland and the Mourne Mountains. A popular spot for birdwatching (Ayres National Nature Reserve) and beachcombing. Only 32 m of total elevation gain.',
  ARRAY['coastal', 'flat', 'nature-reserve', 'birdwatching', 'point-to-point']::text[],
  'Car park at Point of Ayre Lighthouse (northernmost tip of the island).',
  ARRAY['Lighthouse at Point of Ayre', 'Cafés and shops in Ramsey']::text[],
  ARRAY['Birdwatchers', 'Families', 'Beachcombers', 'Easy walkers']::text[],
  'This is a point-to-point walk — arrange transport back from Ramsey. The beach can be stony in places. Look out for seals resting on the shore near the lighthouse.',
  'https://www.alltrails.com/trail/isle-of-man/isle-of-man/point-of-ayre-to-ramsey',
  54.4167,
  -4.3667
),

-- ── Dhoon Glen ────────────────────────────────────────────────────────────────
(
  'dhoon-glen',
  'Dhoon Glen',
  'Garff / East Coast',
  'Short but steep loop in one of the island''s finest glens, featuring two waterfalls and lush woodland.',
  'Moderate',
  80,  -- ~1.25–1.5 hours
  2.7,
  'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1400&q=80',
  'Dhoon Glen is arguably the most dramatic of the Manx glens. The loop descends steeply into the glen on stone steps, passing two impressive waterfalls — the lower one dropping some 20 m — before reaching a small shingle beach at the glen mouth. The return climbs back up through dense mixed woodland. Despite its short length, the 160 m of elevation change and steep terrain mean this walk demands more respect than its distance suggests. A classic Isle of Man gem.',
  ARRAY['glen', 'waterfall', 'woodland', 'loop', 'coastal']::text[],
  'Small car park at the top of Dhoon Glen on the A2 coast road between Laxey and Ramsey.',
  ARRAY['Woodland paths', 'Waterfall viewpoints', 'Beach at glen mouth']::text[],
  ARRAY['Waterfall enthusiasts', 'Nature lovers', 'Photographers', 'Dog walkers']::text[],
  'The steps into the glen can be very slippery in wet weather — poles are helpful. The beach at the bottom is accessible only at low tide. Not suitable for pushchairs.',
  'https://www.alltrails.com/trail/isle-of-man/garff/dhoon-glen',
  54.2583,
  -4.3833
),

-- ── Point of Ayre and Jurby ────────────────────────────────────────────────────
(
  'point-of-ayre-and-jurby',
  'Point of Ayre and Jurby Coastal Walk',
  'Point of Ayre / Jurby',
  'Long moderate walk along the wild and largely unspoiled northern and western coasts from Point of Ayre to Jurby.',
  'Moderate',
  390, -- ~6–6.5 hours
  27.5,
  'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1400&q=80',
  'A long but low-level coastal walk connecting Point of Ayre (northernmost tip) with the dunes and beaches of Jurby on the west coast. The route passes through the Ayres National Nature Reserve, with its lichen heathland, and continues along undeveloped beaches with views across to Scotland and the Mourne Mountains. The terrain is flat and often remote, making navigation straightforward. With only 251 m of total elevation gain, the challenge here is distance rather than gradient. Best walked with a packed lunch as facilities are sparse along the route.',
  ARRAY['coastal', 'nature-reserve', 'flat', 'birdwatching', 'point-to-point', 'long-distance']::text[],
  'Start at Point of Ayre Lighthouse car park. Finish near Jurby.',
  ARRAY['Lighthouse at Point of Ayre', 'Limited facilities en route']::text[],
  ARRAY['Birdwatchers', 'Long-distance walkers', 'Coastal scenery', 'Solitude seekers']::text[],
  'Very little shade or shelter along this route — check weather carefully. Bring plenty of water and food. Arrange transport at the Jurby end.',
  'https://www.alltrails.com/trail/isle-of-man/isle-of-man/point-of-ayre-and-jurby',
  54.4167,
  -4.3667
),

-- ── Maughold Along the Sea (Belle Vue to Glen Mona) ───────────────────────────
(
  'maughold-along-the-sea',
  'Maughold Along the Sea (Belle Vue to Glen Mona)',
  'Maughold / Garff',
  'Challenging clifftop and coastal walk along the dramatic east coast from Belle Vue to Glen Mona via Maughold Head.',
  'Hard',
  231, -- ~3h 51m
  14.5,
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1400&q=80',
  'This point-to-point coastal route follows the wild eastern cliffs from Belle Vue down through Maughold village — home to one of the finest collections of Celtic and Norse crosses in the British Isles — continuing past the lighthouse on Maughold Head and along the rugged shoreline to Glen Mona. Expect dramatic sea views, abundant wildlife, and the sense of being on the remoter side of the island. The route involves multiple steep ascents and descents along the cliff edges.',
  ARRAY['coastal', 'clifftop', 'heritage', 'point-to-point', 'views']::text[],
  'Start at Belle Vue on the A2. Finish near Glen Mona. Limited roadside parking at both ends.',
  ARRAY['Maughold Church (Celtic crosses)', 'Maughold Lighthouse', 'Café in Ramsey (nearby)']::text[],
  ARRAY['Experienced walkers', 'Heritage lovers', 'Coastal scenery', 'Wildlife spotters']::text[],
  'This is a demanding point-to-point walk — arrange a shuttle car or use bus services. The cliff edge paths require care in windy conditions.',
  'https://www.alltrails.com/trail/isle-of-man/garff/maughold-along-the-sea-belle-vue-to-glen-mona',
  54.3000,
  -4.3667
),

-- ── Niarbyl and Cronk ny Arrey Laa Loop ───────────────────────────────────────
(
  'niarbyl-and-cronk-ny-arrey-laa',
  'Niarbyl and Cronk ny Arrey Laa Loop',
  'Dalby / Patrick',
  'Moderate circular walk combining the picturesque fishing hamlet of Niarbyl with the ancient coastal beacon hill of Cronk ny Arrey Laa.',
  'Moderate',
  226, -- ~3h 46m
  10.0,
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80',
  'This circular route on the mid-west coast links two of the island''s most scenic spots. Niarbyl Bay — the setting for the movie Waking Ned — is one of the prettiest corners of the island, with a rocky tidal causeway and a small café. From here the route climbs steeply to Cronk ny Arrey Laa (Height of the Day Watch), an ancient coastal hilltop used as a fire-beacon site. At 453 m, it offers spectacular views south towards the Calf of Man and north along the entire west coast. Total elevation gain of approximately 571 m.',
  ARRAY['coastal', 'hilltop', 'loop', 'views', 'heritage']::text[],
  'Car park at Niarbyl Visitors Centre (seasonal). Also accessible from Dalby village.',
  ARRAY['Niarbyl café (seasonal)', 'Visitors centre at Niarbyl']::text[],
  ARRAY['Views seekers', 'Moderate walkers', 'Photographers', 'Film location enthusiasts']::text[],
  'Niarbyl is famous as a filming location. The café is seasonal — check before visiting. The ascent to Cronk ny Arrey Laa is relentless but the summit view is among the best on the island.',
  'https://www.alltrails.com/trail/isle-of-man/isle-of-man/niarbyl-and-cronk-ny-arrey-laa-loop',
  54.1500,
  -4.7833
),

-- ── Barrule from Ramsey ────────────────────────────────────────────────────────
(
  'barrule-from-ramsey',
  'North Barrule from Ramsey',
  'Ramsey',
  'Moderate ridge walk from Ramsey to the summit of North Barrule, with sweeping views over Ramsey Bay and the Scottish coast.',
  'Moderate',
  213, -- ~3h 33m
  8.2,
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1400&q=80',
  'North Barrule (565 m) is the second highest point on the Isle of Man and commands extraordinary views northward over Ramsey Bay to the Scottish coast and south across the central mountain range. This route climbs from Ramsey through agricultural land onto the open moorland ridge, following a clear path to the rocky summit. The return retraces the same line or can be varied through the Sulby Reservoir area for a longer circular option.',
  ARRAY['summit', 'moorland', 'views', 'out-and-back']::text[],
  'Start from Ramsey town centre or the upper residential roads heading towards the mountain.',
  ARRAY['Shops and cafés in Ramsey']::text[],
  ARRAY['Summit baggers', 'Views seekers', 'Hill walkers', 'Photography']::text[],
  'The path can be boggy on the upper ridge after rain. Combine with Snaefell for a full northern ridge day. The summit trig point and small cairn mark the highest point.',
  'https://www.alltrails.com/isle-of-man/garff/ramsey',
  54.3220,
  -4.3820
)

ON CONFLICT (slug) DO NOTHING;

COMMIT;
