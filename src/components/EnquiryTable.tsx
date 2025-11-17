"use client";

import { Mail, Eye, Archive, Reply } from "lucide-react";

export type EnquiryStatus = "new" | "replied" | "archived";

export type Enquiry = {
  id: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  messagePreview: string;
  status: EnquiryStatus;
  createdAt: string; // ISO
  relatedTo?: string; // e.g. "Manx Plumbing Co."
};

function StatusPill({ status }: { status: EnquiryStatus }) {
  const base =
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium border";

  switch (status) {
    case "new":
      return (
        <span className={`${base} bg-emerald-50 text-emerald-700 border-emerald-100`}>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          New
        </span>
      );
    case "replied":
      return (
        <span className={`${base} bg-blue-50 text-blue-700 border-blue-100`}>
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          Replied
        </span>
      );
    case "archived":
    default:
      return (
        <span className={`${base} bg-gray-50 text-gray-600 border-gray-200`}>
          <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
          Archived
        </span>
      );
  }
}

export default function EnquiryTable({ enquiries }: { enquiries: Enquiry[] }) {
  if (!enquiries.length) {
    return (
      <div className="rounded-2xl border bg-white p-4 text-xs text-gray-500">
        No enquiries yet. When someone contacts you via ManxHive, they&apos;ll
        appear here.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Recent enquiries</h2>
          <p className="text-[10px] text-gray-500">
            These are sample entries for UI only. Hook into your data later.
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-1 text-xs">
          <thead>
            <tr className="text-[10px] text-gray-500">
              <th className="px-2 py-1 text-left">From</th>
              <th className="px-2 py-1 text-left">Subject</th>
              <th className="px-2 py-1 text-left">Related to</th>
              <th className="px-2 py-1 text-left">Status</th>
              <th className="px-2 py-1 text-right">Received</th>
              <th className="px-2 py-1 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {enquiries.map((e) => (
              <tr key={e.id} className="bg-gray-50/60">
                <td className="px-2 py-1 align-top">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                      {e.fromName}
                    </span>
                    <span className="text-[9px] text-gray-500">
                      {e.fromEmail}
                    </span>
                  </div>
                </td>
                <td className="px-2 py-1 align-top">
                  <div className="line-clamp-2 text-[10px] text-gray-700">
                    <span className="font-semibold">{e.subject}</span>
                    {": "}
                    {e.messagePreview}
                  </div>
                </td>
                <td className="px-2 py-1 align-top text-[10px] text-gray-600">
                  {e.relatedTo || "—"}
                </td>
                <td className="px-2 py-1 align-top">
                  <StatusPill status={e.status} />
                </td>
                <td className="px-2 py-1 align-top text-right text-[9px] text-gray-500">
                  {new Date(e.createdAt).toLocaleDateString()}
                </td>
                <td className="px-2 py-1 align-top">
                  <div className="flex justify-end gap-1.5 text-gray-400">
                    <button
                      type="button"
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-200/70"
                      aria-label="View"
                    >
                      <Eye className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-200/70"
                      aria-label="Reply"
                    >
                      <Reply className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-200/70"
                      aria-label="Archive"
                    >
                      <Archive className="h-3 w-3" />
                    </button>
                    <Mail className="ml-1 h-3 w-3 text-[#D90429]" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}