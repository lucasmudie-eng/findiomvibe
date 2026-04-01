// src/app/providers/components/BusinessProfileTracker.tsx
"use client";

import { useEffect } from "react";

type Props = {
  providerId: string;
  businessId: string;
};

export async function sendBusinessEvent(
  event: "business_impression" | "business_click",
  providerId: string,
  businessId: string,
  meta: Record<string, any> = {}
) {
  if (!providerId || !businessId) {
    console.warn("[BusinessProfileTracker] missing ids", {
      event,
      providerId,
      businessId,
    });
    return;
  }

  const body = JSON.stringify({
    event,
    providerId,
    businessId,
    meta,
  });

  try {
    const res = await fetch("/api/track-business", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn(
        "[BusinessProfileTracker] tracking failed",
        res.status,
        text
      );
    }
  } catch (err) {
    console.error("[BusinessProfileTracker] fetch error", err);
  }
}

export default function BusinessProfileTracker({
  providerId,
  businessId,
}: Props) {
  useEffect(() => {
    // fire once per mount
    if (!providerId || !businessId) return;
    sendBusinessEvent("business_impression", providerId, businessId);
  }, [providerId, businessId]);

  return null;
}