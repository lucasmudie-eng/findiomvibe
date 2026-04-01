-- Heritage places — specific parking info per site
-- Run in Supabase SQL editor

UPDATE public.heritage_places SET parking_info = 'Metered parking on Harris Promenade and nearby side streets. Regent Street multi-storey car park is a 5-minute walk. Chester Street and Lord Street car parks are convenient for evening performances.' WHERE slug = 'gaiety-theatre';

UPDATE public.heritage_places SET parking_info = 'Nearest public car park is Kingswood Grove (free, 5-minute walk). Metered on-street parking on Crellin''s Hill directly outside.' WHERE slug = 'manx-museum';

UPDATE public.heritage_places SET parking_info = 'The tower is best viewed from the promenade — no vehicle access to the rock. Park on Douglas Promenade (metered) or at Lord Street / Chester Street car parks nearby.' WHERE slug = 'tower-of-refuge';

UPDATE public.heritage_places SET parking_info = 'Free parking on site within The Nunnery estate, accessed off Old Castletown Road on the southern outskirts of Douglas.' WHERE slug = 'the-nunnery';

UPDATE public.heritage_places SET parking_info = 'Free parking on Castletown Market Square (2-hour limit) and at Farrant''s Lane car park a short walk away. Also accessible by Manx Electric Railway.' WHERE slug = 'castle-rushen';

UPDATE public.heritage_places SET parking_info = 'Castletown Market Square and Farrant''s Lane car park serve this site — both within 2 minutes walk. Conveniently combined with a visit to Castle Rushen across the square.' WHERE slug = 'old-house-of-keys';

UPDATE public.heritage_places SET parking_info = 'Free parking directly adjacent to the museum, on the airport approach road between Ronaldsway Airport terminal and Castletown.' WHERE slug = 'manx-aviation-military-museum';

UPDATE public.heritage_places SET parking_info = 'Shore Road car park, Peel (pay & display). From here it is a 5-minute walk across the causeway to St Patrick''s Isle and the castle entrance.' WHERE slug = 'peel-castle';

UPDATE public.heritage_places SET parking_info = 'East Quay car park, Peel — directly adjacent to the museum entrance. Additional pay & display parking on Shore Road a short walk away.' WHERE slug = 'house-of-manannan';

UPDATE public.heritage_places SET parking_info = 'East Quay car park, Peel (immediately adjacent). Town centre parking also available on Michael Street. The museum is a short walk from either.' WHERE slug = 'leece-museum';

UPDATE public.heritage_places SET parking_info = 'Free dedicated car park at the abbey entrance on Malew Street, Ballasalla. Signposted from the main Castletown road.' WHERE slug = 'rushen-abbey';

UPDATE public.heritage_places SET parking_info = 'Limited roadside parking near the church gate on Malew Road. Considerate parking advised — the verges are narrow. Best combined with a visit to Rushen Abbey nearby.' WHERE slug = 'kirk-malew-church';

UPDATE public.heritage_places SET parking_info = 'Free dedicated car park on Mines Road, Laxey — well signposted from the village centre. Also accessible via the Manx Electric Railway (Laxey station, 10-minute walk up the glen).' WHERE slug = 'laxey-wheel';

UPDATE public.heritage_places SET parking_info = 'Free car park at the Cregneash village entrance on Cregneash Road, just past the crossroads at the top of the hill. Also accessible by bus from Port Erin.' WHERE slug = 'cregneash-village';

UPDATE public.heritage_places SET parking_info = 'Park at Derbyhaven village (free, limited spaces on the road by the shore). The Herring Tower is reached on foot along the Langness coastal path — approximately 25 minutes each way.' WHERE slug = 'herring-tower-langness';

UPDATE public.heritage_places SET parking_info = 'Pay & display car park at Port Erin Beach on Beach Road. The Bradda Glen lower entrance also has limited parking. Port Erin Steam Railway station is a 10-minute walk.' WHERE slug = 'milners-tower';

UPDATE public.heritage_places SET parking_info = 'No dedicated car park. Very limited roadside parking at the top of Lhergy Frissell Road. Most visitors park in Ramsey town centre and walk up (approximately 30 minutes). The effort is well rewarded.' WHERE slug = 'albert-tower';

UPDATE public.heritage_places SET parking_info = 'Free dedicated car park at Tynwald National Park & Arboretum, St John''s — clearly signposted from the A1 Douglas to Peel road. Level access from the car park to the hill.' WHERE slug = 'tynwald-hill';

UPDATE public.heritage_places SET parking_info = 'Small lay-by directly adjacent to the site on the A1 Douglas to Peel road. Very limited spaces — arrive early or combine with a cycle along the Peel Road route.' WHERE slug = 'st-trinians-church';

UPDATE public.heritage_places SET parking_info = 'Roadside parking on Balladoole Lane near Ballabeg village (free). Walk up the lane to the hilltop site takes approximately 10 minutes. No facilities at the site itself.' WHERE slug = 'balladoole';
