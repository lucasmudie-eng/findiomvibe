-- newsletter_subscribers table
-- Run this if the table does not already exist in your Supabase project.

create table if not exists newsletter_subscribers (
  id         bigint generated always as identity primary key,
  email      text not null unique,
  source     text not null default 'site',
  status     text not null default 'active',  -- active | unsubscribed
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-update updated_at on upsert
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger newsletter_subscribers_updated_at
  before update on newsletter_subscribers
  for each row execute procedure update_updated_at();

-- No RLS needed — this table is only written via service role API
-- (the newsletter subscribe route uses supabaseServer which has service role key)
