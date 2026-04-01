BEGIN;

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
('baldwin-bluebell-walk', 'Baldwin Bluebell Walk', 'Baldwin', 'Short circular woodland walk near Baldwin with spring bluebells.', 'Easy', NULL, 5.63, 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/walks/baldwin-bluebell-walk.jpg', 'Starting near Baldwin village, this gentle loop follows woodland and a riverside path before returning on the old railway line. Best in late spring when the bluebells are out.', ARRAY['woodland', 'family-friendly', 'seasonal']::text[], NULL, 'Parking available around Baldwin.', ARRAY['Woodland trails', 'Family friendly']::text[], ARRAY['Spring bluebells', 'Easy woodland loop']::text[], 'Ideal for a relaxed walk — take your time and enjoy the scenery.', 'https://www.visitisleofman.com/see-and-do/active-and-adventure/walking-and-hiking/self-guided-walks', NULL, 54.167982, -4.484891),
('railway-ramble-castletown-derbyhaven-langness-st-michaels-island', 'Railway Ramble: Castletown, Derbyhaven, Langness, St Michael''s Island', 'Castletown', 'Leisurely railway-ramble loop around Castletown''s harbour, Derbyhaven and Langness.', 'Easy', NULL, 7.1, 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80', 'A relaxed coastal circuit from Castletown taking in the shelter of Derbyhaven, the Langness peninsula and views toward St Michael''s Island. Mix of shoreline paths and quiet lanes.', ARRAY['railway-ramble', 'coastal', 'heritage']::text[], NULL, 'Parking available around Castletown.', ARRAY['Coastal paths']::text[], ARRAY['Harbour views', 'Historic coastline']::text[], 'Ideal for a relaxed walk — take your time and enjoy the scenery.', 'https://www.visitisleofman.com/see-and-do/active-and-adventure/walking-and-hiking/self-guided-walks', NULL, 54.073704, -4.651959),
('railway-ramble-ballasalla-rushen-abbey-silverdale-glen-grenaby', 'Railway Ramble: Ballasalla, Rushen Abbey, Silverdale Glen, Grenaby', 'Ballasalla', 'Easy railway-ramble linking Ballasalla, Rushen Abbey and Silverdale Glen.', 'Easy', NULL, 10.48, 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/walks/railway-ramble-ballasalla-rushen-abbey-silverdale-glen-grenaby.jpg', 'From Ballasalla the route visits Rushen Abbey, then drops into the wooded valley of Silverdale Glen before looping via Grenaby. A calm mix of heritage and glen scenery.', ARRAY['railway-ramble', 'heritage', 'glen']::text[], NULL, 'Parking available around Ballasalla.', ARRAY['Woodland trails']::text[], ARRAY['Heritage stops', 'Glen scenery']::text[], 'Ideal for a relaxed walk — take your time and enjoy the scenery.', 'https://www.visitisleofman.com/see-and-do/active-and-adventure/walking-and-hiking/self-guided-walks', NULL, 54.126119, -4.608169),
('railway-ramble-ballure-reservoir-albert-tower-ramsey', 'Railway Ramble: Ballure Reservoir and Plantation, Albert Tower, Ramsey Town', 'Ramsey', 'Gentle walk through Ballure woodland to Albert Tower with views above Ramsey.', 'Easy', NULL, 8.09, 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/walks/railway-ramble-ballure-reservoir-albert-tower-ramsey.jpg', 'A mellow railway-ramble route around Ballure Reservoir and plantation, then up to Albert Tower for wide views before returning to Ramsey.', ARRAY['railway-ramble', 'woodland', 'viewpoint']::text[], NULL, 'Parking available around Ramsey.', ARRAY['Woodland trails']::text[], ARRAY['Woodland walk', 'Viewpoints']::text[], 'Ideal for a relaxed walk — take your time and enjoy the scenery.', 'https://www.visitisleofman.com/see-and-do/active-and-adventure/walking-and-hiking/self-guided-walks', NULL, 54.314617, -4.373727),
('archibald-knox-trail', 'Archibald Knox Trail', 'Braddan', 'Moderate heritage trail around Braddan exploring the work of Archibald Knox.', 'Moderate', NULL, 7.5, 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/walks/archibald-knox-trail.jpg', 'Explore sites connected to designer Archibald Knox, including Old St Luke''s and local landmarks around Braddan. A cultural stroll with a few gentle climbs.', ARRAY['heritage', 'town']::text[], NULL, 'Parking available around Braddan.', ARRAY['Marked footpaths']::text[], ARRAY['Design history', 'Local heritage']::text[], 'Wear sturdy shoes and allow extra time for views.', 'https://www.visitisleofman.com/see-and-do/active-and-adventure/walking-and-hiking/self-guided-walks', NULL, 54.15549, -4.529166),
('walk-around-castletown', 'A Walk Around Castletown', 'Castletown', 'Compact heritage loop covering Castletown''s key historic sites.', 'Easy', NULL, 3.99, 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1400&q=80', 'A short town walk taking in Castle Rushen, the Old House of Keys and the harbourfront streets. Ideal for a slow, story-rich stroll.', ARRAY['heritage', 'town']::text[], NULL, 'Parking available around Castletown.', ARRAY['Marked footpaths']::text[], ARRAY['Historic town', 'Quick stroll']::text[], 'Ideal for a relaxed walk — take your time and enjoy the scenery.', 'https://www.visitisleofman.com/see-and-do/active-and-adventure/walking-and-hiking/self-guided-walks', NULL, 54.073704, -4.651959),
('3-central-east-summits', '3 - Central East Summits', 'Bungalow', 'Challenging summit hike from the Bungalow to Snaefell and Clagh Ouyr.', 'Hard', 270, 12, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80', 'This high-level route climbs to the island''s highest point at Snaefell, continues over Clagh Ouyr, and returns to the Bungalow. Expect exposed terrain and big views.', ARRAY['summit', 'mountain']::text[], NULL, 'Parking available around Bungalow.', ARRAY['Summit viewpoints']::text[], ARRAY['Summit challenge', 'Big views']::text[], 'Ideal for a relaxed walk — take your time and enjoy the scenery.', 'https://www.visitisleofman.com/see-and-do/active-and-adventure/walking-and-hiking/self-guided-walks', NULL, 54.17078, -4.453),
('railway-ramble-glen-mona-maughold-brooghs-ramsey', 'Railway Ramble: Glen Mona, Maughold Village and Brooghs, Ramsey', 'Maughold', 'Coastal railway-ramble from Glen Mona to Maughold and back to Ramsey.', 'Moderate', NULL, 11.62, 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/walks/railway-ramble-glen-mona-maughold-brooghs-ramsey.jpg', 'A scenic east-coast route linking Glen Mona with Maughold''s historic village and headland views, finishing in Ramsey.', ARRAY['railway-ramble', 'coastal', 'heritage']::text[], NULL, 'Parking available around Maughold.', ARRAY['Coastal paths']::text[], ARRAY['Coastal views', 'Village heritage']::text[], 'Wear sturdy shoes and allow extra time for views.', 'https://www.visitisleofman.com/see-and-do/active-and-adventure/walking-and-hiking/self-guided-walks', NULL, 54.32238, -4.382391),
('railway-ramble-colby-station-colby-glen-cronk-e-dhooney', 'Railway Ramble: Colby Station, Colby Glen, Cronk-e-Dhooney to Colby Level Halt', 'Colby', 'Southern railway-ramble through Colby Glen and open countryside.', 'Moderate', NULL, 11.35, 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/walks/railway-ramble-colby-station-colby-glen-cronk-e-dhooney.jpg', 'From Colby Station the route threads through Colby Glen and farmland tracks before returning via the old railway line. A good half-day walk with a glen highlight.', ARRAY['railway-ramble', 'glen', 'countryside']::text[], NULL, 'Parking available around Colby.', ARRAY['Woodland trails']::text[], ARRAY['Glen walk', 'Rural scenery']::text[], 'Wear sturdy shoes and allow extra time for views.', 'https://www.visitisleofman.com/see-and-do/active-and-adventure/walking-and-hiking/self-guided-walks', NULL, 54.104042, -4.703989),
('5-north-west-summits', '5 - North West Summits', 'Snaefell', 'Tough ridge route from Snaefell toward North Barrule ending in Ramsey.', 'Hard', 300, 14.1, 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80', 'A demanding traverse of northern summits with long climbs and wide coastal views. Best for confident hill-walkers looking for a full-day outing.', ARRAY['summit', 'ridge']::text[], NULL, 'Parking available around Snaefell.', ARRAY['Summit viewpoints']::text[], ARRAY['Ridge trek', 'Long hike']::text[], 'Ideal for a relaxed walk — take your time and enjoy the scenery.', 'https://www.visitisleofman.com/see-and-do/active-and-adventure/walking-and-hiking/self-guided-walks', NULL, 54.219373, -4.695789),
('railway-ramble-glen-mona-snaefell-mines-laxey-valley', 'Railway Ramble: Glen Mona, Snaefell Mines, Laxey Valley, Agneash, Laxey Village', 'Glen Mona', 'Strenuous railway-ramble climbing from Glen Mona to Snaefell Mines and down through Laxey Valley.', 'Hard', 240, 9, 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/walks/railway-ramble-glen-mona-snaefell-mines-laxey-valley.jpg', 'A tough but rewarding route with upland tracks, mining heritage and valley views, finishing via Agneash into Laxey.', ARRAY['railway-ramble', 'mountain', 'heritage']::text[], NULL, 'Parking available around Glen Mona.', ARRAY['Marked footpaths']::text[], ARRAY['Mining heritage', 'Highland views']::text[], 'Ideal for a relaxed walk — take your time and enjoy the scenery.', 'https://www.visitisleofman.com/see-and-do/active-and-adventure/walking-and-hiking/self-guided-walks', NULL, 54.173154, -4.482049),
('glen-mooar-and-glen-wyllin', 'Glen Mooar and Glen Wyllin', 'Glen Mooar', 'Easy glen walk linking Glen Wyllin and Glen Mooar.', 'Easy', NULL, 4.39, 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/walks/glen-mooar-and-glen-wyllin.jpg', 'A gentle woodland-and-stream outing through two classic western glens, ideal for a relaxed day outdoors.', ARRAY['glen', 'woodland', 'family-friendly']::text[], NULL, 'Parking available around Glen Mooar.', ARRAY['Woodland trails', 'Family friendly']::text[], ARRAY['Family stroll', 'Glen scenery']::text[], 'Ideal for a relaxed walk — take your time and enjoy the scenery.', 'https://www.visitisleofman.com/see-and-do/active-and-adventure/walking-and-hiking/self-guided-walks', NULL, 54.23477, -4.405773),
('derbyhaven-and-langness-nature-walk', 'Derbyhaven and Langness Nature Walk', 'Ballasalla', 'Open-coast walk around Derbyhaven and the Langness peninsula.', 'Moderate', NULL, 7.35, 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/walks/derbyhaven-and-langness-nature-walk.jpg', 'Mostly on public footpaths across open fields and rocky shoreline, with sweeping sea views across the bay.', ARRAY['coastal', 'peninsula']::text[], NULL, 'Parking available around Ballasalla.', ARRAY['Coastal paths']::text[], ARRAY['Coastal wildlife', 'Sea views']::text[], 'Wear sturdy shoes and allow extra time for views.', 'https://www.visitisleofman.com/see-and-do/active-and-adventure/walking-and-hiking/self-guided-walks', NULL, 54.126119, -4.608169),
('douglas-heritage-and-nature-walk', 'Douglas Heritage and Nature Walk', 'Douglas', 'Heritage walk combining Douglas landmarks with nearby green spaces.', 'Moderate', NULL, 5, 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/walks/douglas-heritage-and-nature-walk.jpg', 'A mixed urban-and-nature route taking in the Manx Museum, Douglas Head and glen scenery on the outskirts.', ARRAY['heritage', 'town', 'glen']::text[], NULL, 'Parking available around Douglas.', ARRAY['Woodland trails']::text[], ARRAY['City heritage', 'Mixed terrain']::text[], 'Wear sturdy shoes and allow extra time for views.', 'https://www.visitisleofman.com/see-and-do/active-and-adventure/walking-and-hiking/self-guided-walks', NULL, 54.149303, -4.478579),
('railway-ramble-port-st-mary-the-chasms-cregneash-port-erin', 'Railway Ramble: Port St Mary, The Chasms, Cregneash, Port Erin', 'Port St Mary', 'South-coast railway-ramble linking Port St Mary, The Chasms and Cregneash.', 'Moderate', NULL, 8.69, 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/walks/railway-ramble-port-st-mary-the-chasms-cregneash-port-erin.jpg', 'A scenic walk along the south with dramatic coastal geology and a rural stretch through Cregneash before finishing in Port Erin.', ARRAY['railway-ramble', 'coastal', 'heritage']::text[], NULL, 'Parking available around Port St Mary.', ARRAY['Coastal paths']::text[], ARRAY['Coastal drama', 'Rural culture']::text[], 'Wear sturdy shoes and allow extra time for views.', 'https://www.visitisleofman.com/see-and-do/active-and-adventure/walking-and-hiking/self-guided-walks', NULL, 54.082269, -4.761095),
('bayr-ny-skeddan-the-herring-road', 'Bayr Ny Skeddan ''The Herring Road''', 'Peel', 'Easy Peel heritage loop celebrating the island''s fishing history.', 'Easy', NULL, 4.83, 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80', 'A short walk around Peel''s harbour area, visiting sites tied to the herring industry and the House of Manannan.', ARRAY['heritage', 'town']::text[], NULL, 'Parking available around Peel.', ARRAY['Marked footpaths']::text[], ARRAY['Local history', 'Short stroll']::text[], 'Ideal for a relaxed walk — take your time and enjoy the scenery.', 'https://www.visitisleofman.com/see-and-do/active-and-adventure/walking-and-hiking/self-guided-walks', NULL, 54.222904, -4.695759),
('maugholds-coast-coves-and-viking-crosses', 'Maughold''s Coast, Coves and Viking Crosses', 'Maughold', 'Coastal circuit around Maughold with coves and Norse heritage.', 'Moderate', NULL, 8.37, 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80', 'This route combines rugged shoreline paths with historic crosses and the ancient churchyard at Maughold.', ARRAY['coastal', 'heritage']::text[], NULL, 'Parking available around Maughold.', ARRAY['Coastal paths']::text[], ARRAY['Viking heritage', 'Coastal coves']::text[], 'Wear sturdy shoes and allow extra time for views.', 'https://www.visitisleofman.com/see-and-do/active-and-adventure/walking-and-hiking/self-guided-walks', NULL, 54.172518, -4.483719),
('silverdale-glen-and-castletown-stroll', 'Silverdale Glen and Castletown Stroll', 'Castletown', 'Gentle Castletown town walk with a detour into Silverdale Glen.', 'Easy', NULL, 5.63, 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/walks/silverdale-glen-and-castletown-stroll.jpg', 'A relaxed loop combining historic streets in Castletown with the shaded paths of Silverdale Glen.', ARRAY['heritage', 'glen']::text[], NULL, 'Parking available around Castletown.', ARRAY['Woodland trails']::text[], ARRAY['Easy heritage loop', 'Glen paths']::text[], 'Ideal for a relaxed walk — take your time and enjoy the scenery.', 'https://www.visitisleofman.com/see-and-do/active-and-adventure/walking-and-hiking/self-guided-walks', NULL, 54.073704, -4.651959),
('millennium-way', 'Millennium Way', 'St John''s', 'Long but gentle linear route from St John''s to Peel.', 'Easy', NULL, 12.87, 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80', 'Follows the historic Tynwald Day procession route across fields and lanes to Peel''s coast. Ideal for a steady, low-gradient trek.', ARRAY['countryside', 'heritage', 'long-distance']::text[], NULL, 'Parking available around St John''s.', ARRAY['Marked footpaths']::text[], ARRAY['Historic route', 'Long easy walk']::text[], 'Ideal for a relaxed walk — take your time and enjoy the scenery.', 'https://www.visitisleofman.com/see-and-do/active-and-adventure/walking-and-hiking/self-guided-walks', NULL, 54.169373, -4.517951),
('railway-ramble-ballasalla-castletown-derbyhaven-port-grenaugh', 'Railway Ramble: Ballasalla, Castletown, Derbyhaven, Port Grenaugh', 'Ballasalla', 'Leisurely railway-ramble linking Ballasalla, Castletown and the Derbyhaven coast.', 'Easy', NULL, 8.85, 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/walks/railway-ramble-ballasalla-castletown-derbyhaven-port-grenaugh.jpg', 'A relaxed southern loop mixing town heritage with sheltered bays and coastal views around Port Grenaugh.', ARRAY['railway-ramble', 'coastal', 'heritage']::text[], NULL, 'Parking available around Ballasalla.', ARRAY['Coastal paths']::text[], ARRAY['Harbour views', 'Easy miles']::text[], 'Ideal for a relaxed walk — take your time and enjoy the scenery.', 'https://www.visitisleofman.com/see-and-do/active-and-adventure/walking-and-hiking/self-guided-walks', NULL, 54.073704, -4.651959),
('7-south-west-summits-niarbyl-coast', '7 - South West Summits and Niarbyl Coast', 'St John''s', 'Full-day hike over Slieau Whallian and Slieau Dhoo with a Niarbyl coastal finish.', 'Hard', 360, 16.5, 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=80', 'A demanding route that blends hill summits with dramatic west-coast cliffs. Best for confident hikers with good fitness.', ARRAY['summit', 'coastal']::text[], NULL, 'Parking available around St John''s.', ARRAY['Coastal paths', 'Summit viewpoints']::text[], ARRAY['Summit challenge', 'Clifftop views']::text[], 'Ideal for a relaxed walk — take your time and enjoy the scenery.', 'https://www.visitisleofman.com/see-and-do/active-and-adventure/walking-and-hiking/self-guided-walks', NULL, 54.25373, -4.631244),
('laxey-agneash-king-orrys-grave', 'Laxey, Agneash and King Orry''s Grave', 'Laxey', 'Moderate loop around Laxey and Agneash with a stop at King Orry''s Grave.', 'Moderate', NULL, 6.92, 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1400&q=80', 'A scenic walk through Laxey''s valleys and hillsides, weaving in local legends and heritage sites.', ARRAY['heritage', 'valley']::text[], NULL, 'Parking available around Laxey.', ARRAY['Marked footpaths']::text[], ARRAY['Local legends', 'Valley views']::text[], 'Wear sturdy shoes and allow extra time for views.', 'https://www.visitisleofman.com/see-and-do/active-and-adventure/walking-and-hiking/self-guided-walks', NULL, 54.179837, -4.546126),
('railway-ramble-baldrine-axnfell-glen-roy-laxey', 'Railway Ramble: Baldrine, Axnfell, Glen Roy, Laxey', 'Baldrine', 'East-coast railway-ramble loop via Axnfell and Glen Roy.', 'Moderate', NULL, 8.3, 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/walks/railway-ramble-baldrine-axnfell-glen-roy-laxey.jpg', 'Starts in Baldrine, climbs to Axnfell, drops through Glen Roy and finishes in Laxey with coastal outlooks.', ARRAY['railway-ramble', 'glen', 'hill']::text[], NULL, 'Parking available around Baldrine.', ARRAY['Woodland trails']::text[], ARRAY['Glen scenery', 'Coastal outlooks']::text[], 'Wear sturdy shoes and allow extra time for views.', 'https://www.visitisleofman.com/see-and-do/active-and-adventure/walking-and-hiking/self-guided-walks', NULL, 54.205426, -4.421344),
('2-north-east-summits-five-peaks', '2 - North East Summits Five Peaks Challenge', 'Ramsey', 'Challenging five-peak loop starting and ending in Ramsey.', 'Hard', 360, 16, 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80', 'A tough hill day taking in multiple peaks above the north-east coast before returning to town.', ARRAY['summit', 'ridge']::text[], NULL, 'Parking available around Ramsey.', ARRAY['Summit viewpoints']::text[], ARRAY['Peak bagging', 'All-day hike']::text[], 'Ideal for a relaxed walk — take your time and enjoy the scenery.', 'https://www.visitisleofman.com/see-and-do/active-and-adventure/walking-and-hiking/self-guided-walks', NULL, 54.32238, -4.382391),
('6-central-summits', '6 - Central Summits', 'Bungalow', 'High-level circuit from the Bungalow across North Barrule, Clagh Ouyr and Snaefell.', 'Hard', 300, 14.2, 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80', 'A demanding route across central summits with long climbs and open moorland.', ARRAY['summit', 'mountain']::text[], NULL, 'Parking available around Bungalow.', ARRAY['Summit viewpoints']::text[], ARRAY['Summit circuit', 'Highland views']::text[], 'Ideal for a relaxed walk — take your time and enjoy the scenery.', 'https://www.visitisleofman.com/see-and-do/active-and-adventure/walking-and-hiking/self-guided-walks', NULL, 54.17055, -4.45248),
('railway-ramble-castletown-scarlett-pooil-vaaish', 'Railway Ramble: Castletown, Scarlett, Pooil Vaaish', 'Castletown', 'Easy coastal walk from Castletown to Scarlett Point and Pooil Vaaish.', 'Easy', NULL, 7, 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/walks/railway-ramble-castletown-scarlett-pooil-vaaish.jpg', 'A relaxed shoreline route with geology, sea views and a return via quiet lanes.', ARRAY['railway-ramble', 'coastal']::text[], NULL, 'Parking available around Castletown.', ARRAY['Coastal paths']::text[], ARRAY['Coastal geology', 'Easy stroll']::text[], 'Ideal for a relaxed walk — take your time and enjoy the scenery.', 'https://www.visitisleofman.com/see-and-do/active-and-adventure/walking-and-hiking/self-guided-walks', NULL, 54.072058, -4.657029),
('city-of-peel-heritage-strolls', 'City of Peel - Heritage Strolls', 'Peel', 'Short heritage stroll through the key sights of Peel.', 'Easy', NULL, 1.61, 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/walks/city-of-peel-heritage-strolls.jpg', 'A compact town walk linking the harbour, House of Manannan and views toward Peel Castle.', ARRAY['heritage', 'town']::text[], NULL, 'Parking available around Peel.', ARRAY['Marked footpaths']::text[], ARRAY['Quick heritage walk', 'Harbour views']::text[], 'Ideal for a relaxed walk — take your time and enjoy the scenery.', 'https://www.visitisleofman.com/see-and-do/active-and-adventure/walking-and-hiking/self-guided-walks', NULL, 54.222904, -4.695759),
('railway-ramble-ballaglass-glen-port-cornaa-glen-mona', 'Railway Ramble: Ballaglass Glen, Port Cornaa, Glen Mona', 'Ballaglass Glen', 'Coastal railway-ramble from Ballaglass Glen to Port Cornaa and Glen Mona.', 'Moderate', NULL, 10.78, 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/walks/railway-ramble-ballaglass-glen-port-cornaa-glen-mona.jpg', 'A scenic route linking wooded glen paths with east-coast views and quiet bays.', ARRAY['railway-ramble', 'glen', 'coastal']::text[], NULL, 'Parking available around Ballaglass Glen.', ARRAY['Woodland trails', 'Coastal paths']::text[], ARRAY['Glen + coast', 'Half-day walk']::text[], 'Wear sturdy shoes and allow extra time for views.', 'https://www.visitisleofman.com/see-and-do/active-and-adventure/walking-and-hiking/self-guided-walks', NULL, 54.269492, -4.359956),
('railway-ramble-port-st-mary-the-sound-port-erin', 'Railway Ramble: Port St Mary, The Sound, Port Erin', 'Port St Mary / Port Erin', 'South-coast walk from Port St Mary over the hills to the Sound and on to Port Erin.', 'Moderate', NULL, 8, 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/walks/railway-ramble-port-st-mary-the-sound-port-erin.jpg', 'A medium-length route with far-reaching views of the Calf of Man and open hill sections before dropping to Port Erin.', ARRAY['railway-ramble', 'coastal']::text[], NULL, 'Parking available around Port St Mary / Port Erin.', ARRAY['Coastal paths']::text[], ARRAY['Sea views', 'South coast']::text[], 'Wear sturdy shoes and allow extra time for views.', 'https://www.visitisleofman.com/see-and-do/active-and-adventure/walking-and-hiking/self-guided-walks', NULL, 54.082269, -4.761095),
('railway-ramble-port-erin-bradda-head-the-sloc', 'Railway Ramble: Port Erin, Bradda Glen, Bradda Head, The Sloc', 'Port Erin', 'Strenuous coastal circuit from Port Erin over Bradda Head and up to the Sloc.', 'Hard', NULL, 8.7, 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/walks/railway-ramble-port-erin-bradda-head-the-sloc.jpg', 'A full-day south-coast hike with rugged cliffs, big climbs and sunset-ready viewpoints.', ARRAY['railway-ramble', 'coastal', 'summit']::text[], NULL, 'Parking available around Port Erin.', ARRAY['Coastal paths', 'Summit viewpoints']::text[], ARRAY['Rugged coastline', 'Big climbs']::text[], 'Ideal for a relaxed walk — take your time and enjoy the scenery.', 'https://www.visitisleofman.com/see-and-do/active-and-adventure/walking-and-hiking/self-guided-walks', NULL, 54.091979, -4.763319),
('railway-ramble-port-erin-bradda-head-fleshwick-bay', 'Railway Ramble: Port Erin, Bradda Glen, Bradda Head, Fleshwick Bay', 'Port Erin', 'Long coastal walk from Port Erin to Bradda Head and on to Fleshwick Bay.', 'Moderate', NULL, 12.3, 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/walks/railway-ramble-port-erin-bradda-head-fleshwick-bay.jpg', 'A rewarding south-coast route with cliffs, headland views and the wild bay of Fleshwick before returning.', ARRAY['railway-ramble', 'coastal']::text[], NULL, 'Parking available around Port Erin.', ARRAY['Coastal paths']::text[], ARRAY['Coastal adventure', 'Wild bay']::text[], 'Wear sturdy shoes and allow extra time for views.', 'https://www.visitisleofman.com/see-and-do/active-and-adventure/walking-and-hiking/self-guided-walks', NULL, 54.091979, -4.763319),
('raad-ny-foillan-coastal-path', 'Raad ny Foillan Coastal Path', 'Island-wide / Douglas', 'Island-circling coastal long-distance trail starting and finishing in Douglas.', 'Moderate', NULL, 160, 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/walks/raad-ny-foillan-coastal-path.jpg', 'A 160 km waymarked path that traces the entire coastline of the Isle of Man. Ideal for multi-day sections or an epic round-island challenge.', ARRAY['coastal', 'long-distance']::text[], NULL, 'Parking available around Island-wide / Douglas.', ARRAY['Coastal paths']::text[], ARRAY['Long-distance trail', 'Coastal exploration']::text[], 'Wear sturdy shoes and allow extra time for views.', 'https://www.visitisleofman.com/see-and-do/active-and-adventure/walking-and-hiking/self-guided-walks', NULL, 54.170068, -4.443631),
('1-east-summits', '1 - East Summits', 'Bungalow / Ramsey', 'Long summit traverse from the Bungalow to Ramsey over the eastern peaks.', 'Hard', 360, 17, 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80', 'A tough ridge-and-summit day with extended climbs and a long descent to Ramsey.', ARRAY['summit', 'ridge']::text[], NULL, 'Parking available around Bungalow / Ramsey.', ARRAY['Summit viewpoints']::text[], ARRAY['Summit challenge', 'Long hike']::text[], 'Ideal for a relaxed walk — take your time and enjoy the scenery.', 'https://www.visitisleofman.com/see-and-do/active-and-adventure/walking-and-hiking/self-guided-walks', NULL, 54.32238, -4.382391),
('4-central-north-summit-sulby-valley', '4 - Central North Summit and Sulby Valley', 'Sulby', 'Big hill circuit from Sulby Claddagh combining the central summit with Sulby Valley.', 'Hard', 390, 20, 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80', 'A demanding loop with high ground and a long valley return, suited to experienced walkers.', ARRAY['summit', 'valley']::text[], NULL, 'Parking available around Sulby.', ARRAY['Summit viewpoints']::text[], ARRAY['Remote hills', 'All-day trek']::text[], 'Ideal for a relaxed walk — take your time and enjoy the scenery.', 'https://www.visitisleofman.com/see-and-do/active-and-adventure/walking-and-hiking/self-guided-walks', NULL, 54.17069, -4.4528),
('8-west-summit', '8 - West Summit', 'St John''s', 'West-coast summit walk starting from Slieau Whallian Road near St John''s.', 'Hard', 240, 10, 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80', 'A challenging route to western high ground with open views across the island.', ARRAY['summit', 'moorland']::text[], NULL, 'Parking available around St John''s.', ARRAY['Summit viewpoints']::text[], ARRAY['West coast views', 'Hill training']::text[], 'Ideal for a relaxed walk — take your time and enjoy the scenery.', 'https://www.visitisleofman.com/see-and-do/active-and-adventure/walking-and-hiking/self-guided-walks', NULL, 54.32248, -4.38585)
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
('castle-rushen', 'Castle Rushen', 'Castletown / South', 'Historic castle complex in the heart of Castletown.', 'Historic castle complex in the heart of Castletown. A standout stop for Heritage day out in Castletown / South.', 'heritage', NULL, NULL, NULL, ARRAY['castle', 'history']::text[], 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/heritage/castle-rushen.jpg', NULL, 'Parking available in Castletown / South.', ARRAY['Visitor information', 'Photo spots']::text[], ARRAY['Heritage day out', 'Family visit']::text[], 'Leave time to explore the market square nearby.', NULL, 54.073144, -4.658971),
('peel-castle', 'Peel Castle', 'Peel / West', 'Ruined fortress and cathedral setting on St Patrick''s Isle.', 'Ruined fortress and cathedral setting on St Patrick''s Isle. A standout stop for Coastal history in Peel / West.', 'heritage', NULL, NULL, NULL, ARRAY['castle', 'history']::text[], 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/heritage/peel-castle.jpg', NULL, 'Parking available in Peel / West.', ARRAY['Visitor information', 'Photo spots']::text[], ARRAY['Coastal history', 'Photography']::text[], 'Great views back over Peel harbour.', NULL, 54.222904, -4.695759),
('house-of-manannan', 'House of Manannan', 'Peel / West', 'Museum with immersive exhibitions on island history.', 'Museum with immersive exhibitions on island history. A standout stop for Rainy day in Peel / West.', 'heritage', NULL, NULL, NULL, ARRAY['museum', 'history']::text[], 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/heritage/house-of-manannan.jpg', NULL, 'Parking available in Peel / West.', ARRAY['Visitor information', 'Photo spots']::text[], ARRAY['Rainy day', 'Families']::text[], 'Combine with Peel Castle for a full day in Peel.', NULL, 54.222904, -4.695759),
('manx-museum', 'Manx Museum', 'Douglas / East', 'National museum covering the island''s story through the ages.', 'National museum covering the island''s story through the ages. A standout stop for City stop in Douglas / East.', 'heritage', NULL, NULL, NULL, ARRAY['museum', 'history']::text[], 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/heritage/manx-museum.jpg', NULL, 'Parking available in Douglas / East.', ARRAY['Visitor information', 'Photo spots']::text[], ARRAY['City stop', 'Indoor visit']::text[], 'Plan at least 1-2 hours for the galleries.', NULL, 54.149303, -4.478579),
('laxey-wheel', 'Laxey Wheel', 'Laxey / East', 'Iconic industrial heritage site with a giant waterwheel.', 'Iconic industrial heritage site with a giant waterwheel. A standout stop for Engineering history in Laxey / East.', 'heritage', NULL, NULL, NULL, ARRAY['industrial', 'landmark']::text[], 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/heritage/laxey-wheel.jpg', NULL, 'Parking available in Laxey / East.', ARRAY['Visitor information', 'Photo spots']::text[], ARRAY['Engineering history', 'Family visit']::text[], 'Pair with a walk in Laxey Glen.', NULL, 54.171608, -4.484848),
('old-house-of-keys', 'Old House of Keys', 'Castletown / South', 'Former parliament building with living history displays.', 'Former parliament building with living history displays. A standout stop for Heritage trail in Castletown / South.', 'heritage', NULL, NULL, NULL, ARRAY['history', 'architecture']::text[], 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/heritage/old-house-of-keys.jpg', NULL, 'Parking available in Castletown / South.', ARRAY['Visitor information', 'Photo spots']::text[], ARRAY['Heritage trail', 'Rainy day']::text[], 'Easy walk from Castle Rushen.', NULL, 54.073704, -4.651959),
('tynwald-hill', 'Tynwald Hill', 'St Johns / Central', 'Ceremonial mound at the heart of Manx governance.', 'Ceremonial mound at the heart of Manx governance. A standout stop for Historic stop in St Johns / Central.', 'heritage', NULL, NULL, NULL, ARRAY['history', 'landmark']::text[], 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/heritage/tynwald-hill.jpg', NULL, 'Parking available in St Johns / Central.', ARRAY['Visitor information', 'Photo spots']::text[], ARRAY['Historic stop', 'Open-air visit']::text[], 'Visit on a clear day for views across the valley.', NULL, 54.150319, -4.482057),
('rushen-abbey', 'Rushen Abbey', 'Ballasalla / South', 'Historic abbey ruins and gardens near Ballasalla.', 'Historic abbey ruins and gardens near Ballasalla. A standout stop for Quiet visit in Ballasalla / South.', 'heritage', NULL, NULL, NULL, ARRAY['abbey', 'history']::text[], 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/heritage/rushen-abbey.jpg', NULL, 'Parking available in Ballasalla / South.', ARRAY['Visitor information', 'Photo spots']::text[], ARRAY['Quiet visit', 'Gardens']::text[], 'Great short stop on the way to the south.', NULL, 54.126119, -4.608169),
('cregneash-village', 'Cregneash Village', 'Cregneash / South', 'Traditional crofting village showcasing Manx life.', 'Traditional crofting village showcasing Manx life. A standout stop for Families in Cregneash / South.', 'heritage', NULL, NULL, NULL, ARRAY['living-history', 'heritage']::text[], 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/heritage/cregneash-village.jpg', NULL, 'Parking available in Cregneash / South.', ARRAY['Visitor information', 'Photo spots']::text[], ARRAY['Families', 'Culture']::text[], 'Combine with a Mull Hill walk.', NULL, 54.072787, -4.76184),
('tower-of-refuge', 'Tower of Refuge', 'Douglas / East', 'Coastal landmark in Douglas Bay built as a refuge for sailors.', 'Coastal landmark in Douglas Bay built as a refuge for sailors. A standout stop for Seafront views in Douglas / East.', 'heritage', NULL, NULL, NULL, ARRAY['landmark', 'coastal']::text[], 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/heritage/tower-of-refuge.jpg', NULL, 'Parking available in Douglas / East.', ARRAY['Visitor information', 'Photo spots']::text[], ARRAY['Seafront views', 'City walk']::text[], 'Best viewed from Douglas promenade.', NULL, 54.149303, -4.478579),
('herring-tower-langness', 'Herring Tower, Langness', 'Langness / South', 'Historic daymark tower on the Langness peninsula.', 'Historic daymark tower on the Langness peninsula. A standout stop for Coastal history in Langness / South.', 'heritage', NULL, NULL, NULL, ARRAY['tower', 'coastal']::text[], 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/heritage/herring-tower-langness.jpg', NULL, 'Parking available in Langness / South.', ARRAY['Visitor information', 'Photo spots']::text[], ARRAY['Coastal history', 'Photo stop']::text[], 'Ideal stop on the Langness peninsula circuit.', NULL, 54.067087, -4.619536),
('milners-tower', 'Milner''s Tower', 'Port Erin / South', 'Distinctive landmark tower above Port Erin.', 'Distinctive landmark tower above Port Erin. A standout stop for Short hike in Port Erin / South.', 'heritage', NULL, NULL, NULL, ARRAY['tower', 'landmark']::text[], 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/heritage/milners-tower.jpg', NULL, 'Parking available in Port Erin / South.', ARRAY['Visitor information', 'Photo spots']::text[], ARRAY['Short hike', 'Sunset']::text[], 'Combine with Bradda Head walks.', NULL, 54.093704, -4.765796),
('albert-tower', 'Albert Tower', 'Maughold / North East', 'Historic monument overlooking Ramsey from the hills.', 'Historic monument overlooking Ramsey from the hills. A standout stop for Viewpoint in Maughold / North East.', 'heritage', NULL, NULL, NULL, ARRAY['monument', 'landmark']::text[], 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/heritage/albert-tower.jpg', NULL, 'Parking available in Maughold / North East.', ARRAY['Visitor information', 'Photo spots']::text[], ARRAY['Viewpoint', 'History']::text[], 'Great stop on a North Barrule day.', NULL, 54.320084, -4.382255),
('manx-aviation-military-museum', 'Manx Aviation and Military Museum', 'Castletown / South', 'Volunteer-run museum focused on aviation and military history.', 'Volunteer-run museum focused on aviation and military history. A standout stop for Indoor visit in Castletown / South.', 'heritage', NULL, NULL, NULL, ARRAY['museum', 'aviation']::text[], 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/heritage/manx-aviation-military-museum.jpg', NULL, 'Parking available in Castletown / South.', ARRAY['Visitor information', 'Photo spots']::text[], ARRAY['Indoor visit', 'History buffs']::text[], 'Good rainy-day option near the airport.', NULL, 54.073704, -4.651959),
('leece-museum', 'Leece Museum', 'Peel / West', 'Local museum exploring Peel''s maritime and social history.', 'Local museum exploring Peel''s maritime and social history. A standout stop for Local history in Peel / West.', 'heritage', NULL, NULL, NULL, ARRAY['museum', 'local-history']::text[], 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/heritage/leece-museum.jpg', NULL, 'Parking available in Peel / West.', ARRAY['Visitor information', 'Photo spots']::text[], ARRAY['Local history', 'Peel day out']::text[], 'Pair with Peel Castle and the harbour.', NULL, 54.222904, -4.695759),
('gaiety-theatre', 'Gaiety Theatre', 'Douglas / East', 'Historic theatre and cultural venue on Douglas promenade.', 'Historic theatre and cultural venue on Douglas promenade. A standout stop for Evening out in Douglas / East.', 'heritage', NULL, NULL, NULL, ARRAY['theatre', 'architecture']::text[], 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/heritage/gaiety-theatre.jpg', NULL, 'Parking available in Douglas / East.', ARRAY['Visitor information', 'Photo spots']::text[], ARRAY['Evening out', 'Architecture']::text[], 'Check the schedule for live events.', NULL, 54.149303, -4.478579),
('the-nunnery', 'The Nunnery', 'Douglas / East', 'Historic estate and heritage setting on the outskirts of Douglas.', 'Historic estate and heritage setting on the outskirts of Douglas. A standout stop for Quiet visit in Douglas / East.', 'heritage', NULL, NULL, NULL, ARRAY['historic-estate', 'landmark']::text[], 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/heritage/the-nunnery.jpg', NULL, 'Parking available in Douglas / East.', ARRAY['Visitor information', 'Photo spots']::text[], ARRAY['Quiet visit', 'History']::text[], 'Short detour from Douglas for a calmer stop.', NULL, 54.149303, -4.478579),
('st-trinians-church', 'St Trinian''s Church (Ruins)', 'Marown / Central', 'Atmospheric church ruins near Douglas.', 'Atmospheric church ruins near Douglas. A standout stop for Photo stop in Marown / Central.', 'heritage', NULL, NULL, NULL, ARRAY['ruins', 'landmark']::text[], 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/heritage/st-trinians-church.jpg', NULL, 'Parking available in Marown / Central.', ARRAY['Visitor information', 'Photo spots']::text[], ARRAY['Photo stop', 'Short visit']::text[], 'Good quick stop on a central island loop.', NULL, 54.177586, -4.549192),
('balladoole', 'Balladoole', 'Arbory / South', 'Ancient monument site with layered island history.', 'Ancient monument site with layered island history. A standout stop for History fans in Arbory / South.', 'heritage', NULL, NULL, NULL, ARRAY['ancient', 'archaeology']::text[], 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/heritage/balladoole.jpg', NULL, 'Parking available in Arbory / South.', ARRAY['Visitor information', 'Photo spots']::text[], ARRAY['History fans', 'Short visit']::text[], 'Combine with a south island heritage circuit.', NULL, 54.096073, -4.706226),
('kirk-malew-church', 'Kirk Malew Church', 'Ballasalla / South', 'Historic Manx church with memorials and heritage features.', 'Historic Manx church with memorials and heritage features. A standout stop for Quiet stop in Ballasalla / South.', 'heritage', NULL, NULL, NULL, ARRAY['church', 'history']::text[], 'https://loilmtqszazyhnzgbudz.supabase.co/storage/v1/object/public/images/heritage/kirk-malew-church.jpg', NULL, 'Parking available in Ballasalla / South.', ARRAY['Visitor information', 'Photo spots']::text[], ARRAY['Quiet stop', 'Architecture']::text[], 'Ideal short stop near Ballasalla.', NULL, 54.126119, -4.608169)
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

INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 1
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'langness-peninsula-circuit'
WHERE hp.slug = 'castle-rushen'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 2
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'mull-hill-southern-loop'
WHERE hp.slug = 'castle-rushen'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 1
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'peel-hill-harbour-walk'
WHERE hp.slug = 'peel-castle'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 2
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'glen-maye'
WHERE hp.slug = 'peel-castle'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 1
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'peel-hill-harbour-walk'
WHERE hp.slug = 'house-of-manannan'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 2
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'glen-maye'
WHERE hp.slug = 'house-of-manannan'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 1
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'douglas-head-marine-drive'
WHERE hp.slug = 'manx-museum'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 2
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'port-soderick-glen'
WHERE hp.slug = 'manx-museum'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 1
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'laxey-glen'
WHERE hp.slug = 'laxey-wheel'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 2
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'slieau-lhean-ridge'
WHERE hp.slug = 'laxey-wheel'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 1
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'langness-peninsula-circuit'
WHERE hp.slug = 'old-house-of-keys'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 2
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'silverdale-glen'
WHERE hp.slug = 'old-house-of-keys'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 1
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'glen-helen'
WHERE hp.slug = 'tynwald-hill'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 2
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'colden-summit'
WHERE hp.slug = 'tynwald-hill'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 1
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'silverdale-glen'
WHERE hp.slug = 'rushen-abbey'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 2
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'mull-hill-southern-loop'
WHERE hp.slug = 'rushen-abbey'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 1
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'mull-hill-southern-loop'
WHERE hp.slug = 'cregneash-village'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 2
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'spanish-head-coastal-circuit'
WHERE hp.slug = 'cregneash-village'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 1
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'douglas-head-marine-drive'
WHERE hp.slug = 'tower-of-refuge'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 2
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'port-soderick-glen'
WHERE hp.slug = 'tower-of-refuge'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 1
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'langness-peninsula-circuit'
WHERE hp.slug = 'herring-tower-langness'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 2
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'peel-hill-harbour-walk'
WHERE hp.slug = 'herring-tower-langness'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 1
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'bradda-hill-coastal-loop'
WHERE hp.slug = 'milners-tower'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 2
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'bradda-glen-headland'
WHERE hp.slug = 'milners-tower'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 1
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'north-barrule-ridge'
WHERE hp.slug = 'albert-tower'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 2
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'ballaglass-glen'
WHERE hp.slug = 'albert-tower'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 1
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'langness-peninsula-circuit'
WHERE hp.slug = 'manx-aviation-military-museum'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 2
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'silverdale-glen'
WHERE hp.slug = 'manx-aviation-military-museum'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 1
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'peel-hill-harbour-walk'
WHERE hp.slug = 'leece-museum'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 2
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'glen-maye'
WHERE hp.slug = 'leece-museum'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 1
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'douglas-head-marine-drive'
WHERE hp.slug = 'gaiety-theatre'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 2
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'port-soderick-glen'
WHERE hp.slug = 'gaiety-theatre'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 1
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'douglas-head-marine-drive'
WHERE hp.slug = 'the-nunnery'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 2
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'glen-helen'
WHERE hp.slug = 'the-nunnery'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 1
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'glen-helen'
WHERE hp.slug = 'st-trinians-church'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 2
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'colden-summit'
WHERE hp.slug = 'st-trinians-church'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 1
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'spanish-head-coastal-circuit'
WHERE hp.slug = 'balladoole'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 2
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'mull-hill-southern-loop'
WHERE hp.slug = 'balladoole'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 1
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'silverdale-glen'
WHERE hp.slug = 'kirk-malew-church'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;
INSERT INTO public.heritage_site_walks (heritage_id, walk_id, order_index)
SELECT hp.id, hw.id, 2
FROM public.heritage_places hp
JOIN public.heritage_walks hw ON hw.slug = 'mull-hill-southern-loop'
WHERE hp.slug = 'kirk-malew-church'
ON CONFLICT (heritage_id, walk_id) DO NOTHING;

COMMIT;
