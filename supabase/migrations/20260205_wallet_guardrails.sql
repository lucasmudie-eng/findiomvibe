-- ManxHive wallet/billing guardrails
-- Apply with Supabase migration tooling before production rollout.

-- 1) Stronger idempotency for PayPal order processing
create unique index if not exists billing_transactions_paypal_order_id_uq
  on public.billing_transactions (paypal_order_id)
  where paypal_order_id is not null;

-- 2) Enable RLS on wallet/billing tables used by client-visible features
alter table if exists public.user_wallets enable row level security;
alter table if exists public.wallet_transactions enable row level security;
alter table if exists public.billing_transactions enable row level security;

-- Read own wallet only
drop policy if exists "wallet_select_own" on public.user_wallets;
create policy "wallet_select_own"
  on public.user_wallets
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Allow users to insert or update only their own wallet rows (non-service flows)
drop policy if exists "wallet_insert_own" on public.user_wallets;
create policy "wallet_insert_own"
  on public.user_wallets
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "wallet_update_own" on public.user_wallets;
create policy "wallet_update_own"
  on public.user_wallets
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Read your own ledger rows
drop policy if exists "wallet_txn_select_own" on public.wallet_transactions;
create policy "wallet_txn_select_own"
  on public.wallet_transactions
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Read your own billing rows
drop policy if exists "billing_txn_select_own" on public.billing_transactions;
create policy "billing_txn_select_own"
  on public.billing_transactions
  for select
  to authenticated
  using (auth.uid() = user_id);

-- 3) Atomic wallet credit mutation helper
create or replace function public.wallet_apply_credit_delta(
  p_user_id uuid,
  p_amount integer,
  p_type text,
  p_source text default 'system',
  p_ref_type text default null,
  p_ref_id text default null,
  p_price_paid_pence integer default null,
  p_meta jsonb default '{}'::jsonb
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
  v_new_balance integer;
begin
  select credits
    into v_balance
  from public.user_wallets
  where user_id = p_user_id
  for update;

  if not found then
    insert into public.user_wallets (user_id, tier, credits)
    values (p_user_id, 'free', 0)
    on conflict (user_id) do nothing;

    select credits
      into v_balance
    from public.user_wallets
    where user_id = p_user_id
    for update;
  end if;

  v_balance := coalesce(v_balance, 0);
  v_new_balance := v_balance + p_amount;

  if v_new_balance < 0 then
    raise exception 'Insufficient credits';
  end if;

  update public.user_wallets
  set credits = v_new_balance
  where user_id = p_user_id;

  insert into public.wallet_transactions (
    user_id,
    type,
    amount,
    balance_after,
    source,
    ref_type,
    ref_id,
    price_paid_pence,
    meta
  )
  values (
    p_user_id,
    p_type,
    p_amount,
    v_new_balance,
    coalesce(p_source, 'system'),
    p_ref_type,
    p_ref_id,
    p_price_paid_pence,
    coalesce(p_meta, '{}'::jsonb)
  );

  return v_new_balance;
end;
$$;

revoke all on function public.wallet_apply_credit_delta(
  uuid,
  integer,
  text,
  text,
  text,
  text,
  integer,
  jsonb
) from public;
grant execute on function public.wallet_apply_credit_delta(
  uuid,
  integer,
  text,
  text,
  text,
  text,
  integer,
  jsonb
) to service_role;
