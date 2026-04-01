// src/lib/paypal/server.ts
import "server-only";

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET!;
const PAYPAL_ENV = process.env.PAYPAL_ENV || "sandbox";

const BASE =
  PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
  throw new Error("Missing PAYPAL_CLIENT_ID or PAYPAL_SECRET");
}

export function paypalBase() {
  return BASE;
}

export async function getAccessToken() {
  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`,
    "utf8"
  ).toString("base64");

  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal token error: ${res.status} ${text}`);
  }

  const json = await res.json();
  return json.access_token as string;
}

export async function paypalFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  const text = await res.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    throw new Error(
      `PayPal API error ${res.status} on ${path}: ${JSON.stringify(data)}`
    );
  }

  return data as T;
}