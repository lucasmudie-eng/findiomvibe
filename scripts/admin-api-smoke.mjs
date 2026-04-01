#!/usr/bin/env node
import assert from "node:assert/strict";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const ADMIN_BASIC_USER = process.env.ADMIN_BASIC_USER || "";
const ADMIN_BASIC_PASS = process.env.ADMIN_BASIC_PASS || "";

function basicAuthHeader(user, pass) {
  const token = Buffer.from(`${user}:${pass}`, "utf8").toString("base64");
  return `Basic ${token}`;
}

async function request(path, init = {}) {
  const res = await fetch(`${BASE_URL}${path}`, init);
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

async function run() {
  console.log(`Running admin API smoke checks against ${BASE_URL}`);

  // Unauthenticated request should always challenge.
  const unauth = await request("/api/admin/businesses");
  assert.equal(unauth.status, 401);
  logResult("Unauthenticated /api/admin/businesses returns 401", true);

  // Wrong credentials should fail.
  const badAuth = await request("/api/admin/businesses", {
    headers: { Authorization: basicAuthHeader("wrong", "wrong") },
  });
  assert.equal(badAuth.status, 401);
  logResult("Invalid basic auth is rejected", true);

  if (!ADMIN_BASIC_USER || !ADMIN_BASIC_PASS) {
    console.log(
      "Skipping authenticated admin checks. Set ADMIN_BASIC_USER and ADMIN_BASIC_PASS to run them."
    );
    return;
  }

  const authHeader = {
    Authorization: basicAuthHeader(ADMIN_BASIC_USER, ADMIN_BASIC_PASS),
    "Content-Type": "application/json",
  };

  const authedGet = await request("/api/admin/businesses", {
    headers: authHeader,
  });
  assert.notEqual(authedGet.status, 401);
  logResult("Authenticated /api/admin/businesses is not rejected", true);

  const authedPostValidation = await request("/api/admin/businesses/approve", {
    method: "POST",
    headers: authHeader,
    body: JSON.stringify({}),
  });
  assert.equal(authedPostValidation.status, 400);
  logResult("Authenticated mutation reaches route validation", true);
}

run().catch((err) => {
  logResult("Admin API smoke checks", false, err?.message || String(err));
  process.exit(1);
});
