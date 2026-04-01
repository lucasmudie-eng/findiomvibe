alter table public.events
add column if not exists submitted_by text;

alter table public.analytics_events
add column if not exists event_id text;

alter table public.analytics_events
add column if not exists submitted_by text;

create index if not exists idx_analytics_events_event_id on public.analytics_events (event_id);

create table if not exists public.analytics_events_daily (
  id bigserial primary key,
  day date not null,
  event_id text not null,
  submitted_by text null,
  impressions integer not null default 0,
  views integer not null default 0,
  clicks integer not null default 0,
  ticket_clicks integer not null default 0,
  created_at timestamp with time zone not null default now(),
  constraint analytics_events_daily_unique unique (day, event_id)
);

create index if not exists idx_analytics_events_daily_event_id on public.analytics_events_daily (event_id);
create index if not exists idx_analytics_events_daily_submitted_by on public.analytics_events_daily (submitted_by);
