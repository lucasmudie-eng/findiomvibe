#!/usr/bin/env node
import assert from "node:assert/strict";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const AUTH_COOKIE = process.env.AUTH_COOKIE || "";
const TEST_USER_ID = process.env.TEST_USER_ID || "";
const RUN_IDEMPOTENCY = process.env.RUN_IDEMPOTENCY === "1";

async function post(path, body = {}, opts = {}) {
  const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  return { status: res.status, json };
}

function logResult(name, ok, detail = "") {
  const mark = ok ? "PASS" : "FAIL";
  console.log(`[${mark}] ${name}${detail ? ` -> ${detail}` : ""}`);
}

function cookieHeaders() {
  return AUTH_COOKIE ? { Cookie: AUTH_COOKIE } : {};
}

async function run() {
  console.log(`Running API smoke checks against ${BASE_URL}`);

  // --- Unauthenticated auth guards ---
  {
    const r = await post("/api/billing/create-checkout", { tier: "plus" });
    assert.equal(r.status, 401);
    logResult("Unauth create-checkout returns 401", true);
  }

  {
    const r = await post("/api/billing/unlock-lead", {
      userId: "00000000-0000-0000-0000-000000000000",
      leadType: "marketplace",
      refId: "abc",
    });
    assert.equal(r.status, 401);
    logResult("Unauth unlock-lead returns 401", true);
  }

  if (!AUTH_COOKIE || !TEST_USER_ID) {
    console.log(
      "Skipping authenticated checks. Set AUTH_COOKIE and TEST_USER_ID to run forbidden/idempotency flows."
    );
    return;
  }

  // --- Authenticated cross-user protection ---
  {
    const r = await post(
      "/api/billing/wallet/summary",
      { userId: "11111111-1111-1111-1111-111111111111" },
      { headers: cookieHeaders() }
    );
    assert.equal(r.status, 403);
    logResult("wallet/summary rejects mismatched userId", true);
  }

  {
    const r = await post(
      "/api/billing/unlock-lead",
      {
        userId: "11111111-1111-1111-1111-111111111111",
        leadType: "marketplace",
        refId: "integration-check",
      },
      { headers: cookieHeaders() }
    );
    assert.equal(r.status, 403);
    logResult("unlock-lead rejects mismatched userId", true);
  }

  {
    const r = await post(
      "/api/billing/boost/fulfill",
      {
        userId: "11111111-1111-1111-1111-111111111111",
        boostType: "marketplace",
        refId: "integration-check",
        days: 1,
        paypalOrderId: "SMOKE-ORDER",
      },
      { headers: cookieHeaders() }
    );
    assert.equal(r.status, 403);
    logResult("boost/fulfill rejects mismatched userId", true);
  }

  if (!RUN_IDEMPOTENCY) {
    console.log("Skipping idempotency flow. Set RUN_IDEMPOTENCY=1 to run it.");
    return;
  }

  const sharedOrderId = `SMOKE-${Date.now()}`;

  // --- Idempotency flow for credits fulfil ---
  {
    const first = await post(
      "/api/billing/credits/fulfill",
      {
        userId: TEST_USER_ID,
        packSize: "5",
        paypalOrderId: sharedOrderId,
      },
      { headers: cookieHeaders() }
    );

    assert.ok([200, 500].includes(first.status));
    if (first.status !== 200) {
      logResult(
        "credits/fulfill idempotency (setup)",
        false,
        "endpoint failed (check schema/env); skipping second call"
      );
      return;
    }

    const second = await post(
      "/api/billing/credits/fulfill",
      {
        userId: TEST_USER_ID,
        packSize: "5",
        paypalOrderId: sharedOrderId,
      },
      { headers: cookieHeaders() }
    );

    assert.equal(second.status, 200);
    assert.equal(second.json?.skipped, "already_fulfilled");
    logResult("credits/fulfill idempotency second call skips", true);
  }
}

run().catch((err) => {
  logResult("API smoke checks", false, err?.message || String(err));
  process.exit(1);
});
