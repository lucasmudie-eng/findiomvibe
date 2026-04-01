create table if not exists public.sports_leagues (
  id bigserial primary key,
  sport_code text not null,
  slug text not null unique,
  name text not null,
  description text null,
  season text null,
  area text null,
  status text not null default 'active',
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_sports_leagues_sport_code on public.sports_leagues (sport_code);

create table if not exists public.sports_teams (
  id bigserial primary key,
  league_id bigint not null references public.sports_leagues (id) on delete cascade,
  slug text not null,
  name text not null,
  short_name text null,
  crest_url text null,
  created_at timestamp with time zone not null default now(),
  constraint sports_teams_league_slug_unique unique (league_id, slug)
);

create index if not exists idx_sports_teams_league_id on public.sports_teams (league_id);

create table if not exists public.sports_match_fixtures (
  id bigserial primary key,
  league_id bigint not null references public.sports_leagues (id) on delete cascade,
  home_team_id bigint not null references public.sports_teams (id) on delete cascade,
  away_team_id bigint not null references public.sports_teams (id) on delete cascade,
  starts_at timestamp with time zone null,
  venue text null,
  status text not null default 'scheduled',
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_sports_fixtures_league_id on public.sports_match_fixtures (league_id);
create index if not exists idx_sports_fixtures_starts_at on public.sports_match_fixtures (starts_at);

create table if not exists public.sports_match_results (
  id bigserial primary key,
  league_id bigint not null references public.sports_leagues (id) on delete cascade,
  home_team_id bigint not null references public.sports_teams (id) on delete cascade,
  away_team_id bigint not null references public.sports_teams (id) on delete cascade,
  home_goals integer null,
  away_goals integer null,
  played_at timestamp with time zone null,
  venue text null,
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_sports_results_league_id on public.sports_match_results (league_id);
create index if not exists idx_sports_results_played_at on public.sports_match_results (played_at);

create table if not exists public.sports_league_tables (
  id bigserial primary key,
  league_id bigint not null references public.sports_leagues (id) on delete cascade,
  team_id bigint not null references public.sports_teams (id) on delete cascade,
  played integer not null default 0,
  won integer not null default 0,
  drawn integer not null default 0,
  lost integer not null default 0,
  gf integer not null default 0,
  ga integer not null default 0,
  gd integer not null default 0,
  points integer not null default 0,
  pos integer not null default 0,
  updated_at timestamp with time zone not null default now(),
  constraint sports_league_tables_unique unique (league_id, team_id)
);

create index if not exists idx_sports_tables_league_id on public.sports_league_tables (league_id);
