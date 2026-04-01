"use client";

import { useEffect, useRef } from "react";

type EventAnalyticsTrackerProps = {
  eventId: string;
  submittedBy?: string | null;
};

export default function EventAnalyticsTracker({
  eventId,
  submittedBy,
}: EventAnalyticsTrackerProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (!eventId || firedRef.current) return;
    firedRef.current = true;

    fetch("/api/track-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "event_view",
        eventId,
        submittedBy: submittedBy ?? null,
        source: "event_detail",
      }),
    }).catch(() => {
      // ignore
    });
  }, [eventId, submittedBy]);

  return null;
}
