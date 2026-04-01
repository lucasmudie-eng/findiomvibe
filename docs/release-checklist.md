# ManxHive Release Checklist

## 1) Environment

- `NEXT_PUBLIC_SUPABASE_URL` set
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
- `SUPABASE_SERVICE_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`) set
- `ADMIN_BASIC_USER` + `ADMIN_BASIC_PASS` set
- PayPal vars set for target environment:
  - `PAYPAL_CLIENT_ID`
  - `PAYPAL_SECRET`
  - `PAYPAL_ENV`
  - `PAYPAL_PLAN_PLUS`
  - `PAYPAL_PLAN_PRO`
  - `PAYPAL_WEBHOOK_ID`

## 2) Database Guardrails

- Apply migration: `supabase/migrations/20260205_wallet_guardrails.sql`
- Confirm function exists: `wallet_apply_credit_delta(...)`
- Confirm unique index exists on `billing_transactions(paypal_order_id)` (partial)
- Confirm RLS enabled for:
  - `user_wallets`
  - `wallet_transactions`
  - `billing_transactions`

## 3) Local Validation

- `npx tsc --noEmit`
- `npm run build`
- Run billing smoke checks:
  - `npm run test:api-smoke`
  - Optional authenticated/idempotency mode with env vars
- Run admin auth smoke checks:
  - `npm run test:api-admin-smoke`

## 4) Functional Spot Checks (Manual)

- Login/logout works
- `/control-room` requires basic auth
- `/api/admin/*` requires basic auth
- Upgrade flow creates PayPal approval URL for authenticated user
- Wallet summary endpoint ignores/mismatched `userId` values
- Duplicate webhook/order replay does not duplicate credit or tier fulfillment

## 5) Post-deploy

- Check server logs for:
  - webhook signature failures
  - missing env warnings
  - unexpected 401/403 spikes on billing routes
- Confirm one real/sandbox billing cycle updates wallet + profile as expected
