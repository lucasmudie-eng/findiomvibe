// src/lib/billing/paypal.ts
export const PAYPAL_ENV = (process.env.PAYPAL_ENV ?? "sandbox") as
  | "sandbox"
  | "live";

export const PAYPAL_BASE =
  PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

export const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
export const PAYPAL_SECRET = process.env.PAYPAL_SECRET!;

export const PAYPAL_PLAN_PLUS = process.env.PAYPAL_PLAN_PLUS!;
export const PAYPAL_PLAN_PRO = process.env.PAYPAL_PLAN_PRO!;

export function assertPaypalEnv() {
  const missing = [
    !PAYPAL_CLIENT_ID && "PAYPAL_CLIENT_ID",
    !PAYPAL_SECRET && "PAYPAL_SECRET",
    !PAYPAL_PLAN_PLUS && "PAYPAL_PLAN_PLUS",
    !PAYPAL_PLAN_PRO && "PAYPAL_PLAN_PRO",
  ].filter(Boolean);
  if (missing.length) {
    throw new Error(`Missing PayPal env vars: ${missing.join(", ")}`);
  }
}

export async function paypalAccessToken() {
  assertPaypalEnv();
  const basic = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`
  ).toString("base64");

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`PayPal token error: ${res.status} ${t}`);
  }

  const json = await res.json();
  return json.access_token as string;
}