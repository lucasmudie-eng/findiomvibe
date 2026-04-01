// src/app/providers/components/BusinessContactPanel.tsx
"use client";

import Link from "next/link";
import { sendBusinessEvent } from "./BusinessProfileTracker";

type Props = {
  providerId: string;
  businessId: string;
  businessName: string;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  contactHref: string;
};

export default function BusinessContactPanel({
  providerId,
  businessId,
  businessName,
  website,
  email,
  phone,
  address,
  contactHref,
}: Props) {
  const trackClick = (kind: string) => {
    if (!providerId || !businessId) return;
    sendBusinessEvent("business_click", providerId, businessId, {
      kind,
      businessName,
    });
  };

  return (
    <aside className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-900">
          Contact
        </h3>
        <div className="space-y-2 text-sm">
          {website && (
            <div>
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#D90429] hover:underline"
                onClick={() => trackClick("website")}
              >
                Visit website
              </a>
            </div>
          )}
          {email && (
            <div>
              <span className="text-slate-500">Email: </span>
              <a
                href={`mailto:${email}`}
                className="hover:underline"
                onClick={() => trackClick("email")}
              >
                {email}
              </a>
            </div>
          )}
          {phone && (
            <div>
              <span className="text-slate-500">Phone: </span>
              <a
                href={`tel:${phone}`}
                className="hover:underline"
                onClick={() => trackClick("phone")}
              >
                {phone}
              </a>
            </div>
          )}
          {address && (
            <div>
              <div className="text-slate-500">Address</div>
              <div className="text-slate-700">{address}</div>
            </div>
          )}
        </div>

        <div className="mt-4">
          <Link
            href={contactHref}
            className="inline-flex w-full items-center justify-center rounded-full bg-[#D90429] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b50322]"
            onClick={() => trackClick("mh_contact")}
          >
            Contact ManxHive about this business
          </Link>
        </div>
      </div>
    </aside>
  );
}