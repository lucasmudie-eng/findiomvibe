-- marketplace_enquiries table
-- Only run this if the table does not already exist in your Supabase project

create table if not exists marketplace_enquiries (
  id            uuid primary key default gen_random_uuid(),
  listing_id    uuid references marketplace_listings(id) on delete set null,
  seller_user_id uuid not null,
  buyer_name    text,
  buyer_email   text,
  message       text,
  status        text not null default 'open',  -- open | replied | archived
  created_at    timestamptz not null default now()
);

-- RLS: sellers can only see enquiries for their own listings
alter table marketplace_enquiries enable row level security;

create policy "sellers_read_own_enquiries"
  on marketplace_enquiries for select
  using (seller_user_id = auth.uid());

create policy "anyone_insert_enquiry"
  on marketplace_enquiries for insert
  with check (true);

create policy "sellers_update_own_enquiries"
  on marketplace_enquiries for update
  using (seller_user_id = auth.uid());
