alter table if exists public.heritage_places
  add column if not exists lat numeric(9,6),
  add column if not exists lng numeric(9,6);

alter table if exists public.heritage_walks
  add column if not exists lat numeric(9,6),
  add column if not exists lng numeric(9,6);

create index if not exists idx_heritage_places_lat_lng
  on public.heritage_places (lat, lng);

create index if not exists idx_heritage_walks_lat_lng
  on public.heritage_walks (lat, lng);
