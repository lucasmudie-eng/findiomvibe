"use client";

import { useEffect, useRef } from "react";

type TrackItem = {
  id: string;
  submittedBy?: string | null;
};

export default function EventsListTracker({ events }: { events: TrackItem[] }) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current || !events.length) return;
    firedRef.current = true;

    const payloads = events
      .filter((ev) => ev.id && !String(ev.id).startsWith("mock-"))
      .slice(0, 12)
      .map((ev) => ({
        eventType: "event_impression",
        eventId: ev.id,
        submittedBy: ev.submittedBy ?? null,
        source: "events_list",
      }));

    if (!payloads.length) return;

    payloads.forEach((payload) => {
      fetch("/api/track-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {
        // ignore
      });
    });
  }, [events]);

  return null;
}
