alter table if exists public.heritage_places
  add column if not exists latitude double precision null,
  add column if not exists longitude double precision null;

create index if not exists idx_heritage_places_latitude_longitude
  on public.heritage_places (latitude, longitude);

create index if not exists idx_heritage_walks_latitude_longitude
  on public.heritage_walks (latitude, longitude);
