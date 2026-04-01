"use client";

type EventTicketButtonProps = {
  href: string;
  eventId: string;
  submittedBy?: string | null;
  children: React.ReactNode;
  className?: string;
};

export default function EventTicketButton({
  href,
  eventId,
  submittedBy,
  children,
  className,
}: EventTicketButtonProps) {
  const trackClick = () => {
    if (!eventId) return;
    fetch("/api/track-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "event_ticket_click",
        eventId,
        submittedBy: submittedBy ?? null,
        source: "event_detail",
      }),
    }).catch(() => {
      // ignore
    });
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={trackClick}
      className={className}
    >
      {children}
    </a>
  );
}
