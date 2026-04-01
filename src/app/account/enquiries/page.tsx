"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import {
  Loader2,
  MessageCircle,
  Mail,
  Calendar,
  CheckCircle2,
  Archive,
  Copy,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Inbox,
  ArrowLeft,
  Filter,
} from "lucide-react";

type Enquiry = {
  id: string;
  listing_id: string | null;
  buyer_name: string | null;
  buyer_email: string | null;
  message: string | null;
  status: string | null;
  created_at: string | null;
  listing_title?: string | null;
};

type FilterKey = "all" | "new" | "replied" | "archived";

function statusConfig(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "open" || s === "new")
    return { label: "New", dot: "bg-rose-500", pill: "bg-rose-50 text-rose-700 ring-rose-200/60" };
  if (s === "replied")
    return { label: "Replied", dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-700 ring-emerald-200/60" };
  if (s === "archived" || s === "closed")
    return { label: "Archived", dot: "bg-slate-400", pill: "bg-slate-100 text-slate-500 ring-slate-200/60" };
  return { label: status, dot: "bg-slate-400", pill: "bg-slate-100 text-slate-500 ring-slate-200/60" };
}

function StatusPill({ status }: { status: string }) {
  const { label, dot, pill } = statusConfig(status);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${pill}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AccountEnquiriesPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);

      const { data: { user }, error: authErr } = await supabase.auth.getUser();

      if (authErr) {
        setError("Could not verify your session.");
        setLoading(false);
        return;
      }
      if (!user) {
        router.replace(`/login?next=${encodeURIComponent("/account/enquiries")}`);
        return;
      }

      const { data, error: eErr } = await supabase
        .from("marketplace_enquiries")
        .select(`id, listing_id, buyer_name, buyer_email, message, status, created_at, listing:marketplace_listings(title)`)
        .eq("seller_user_id", user.id)
        .order("created_at", { ascending: false });

      if (eErr) {
        setError("Could not load enquiries.");
        setLoading(false);
        return;
      }

      setEnquiries(
        (data ?? []).map((row: any) => ({
          id: row.id,
          listing_id: row.listing_id,
          buyer_name: row.buyer_name ?? null,
          buyer_email: row.buyer_email ?? null,
          message: row.message ?? null,
          status: row.status ?? "new",
          created_at: row.created_at ?? null,
          listing_title: row.listing?.title ?? null,
        }))
      );
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = enquiries.length;
  const newCount = enquiries.filter((e) => ["open", "new"].includes((e.status || "").toLowerCase())).length;
  const replied = enquiries.filter((e) => (e.status || "").toLowerCase() === "replied").length;
  const archived = enquiries.filter((e) => ["archived", "closed"].includes((e.status || "").toLowerCase())).length;

  const filtered = filter === "all" ? enquiries : enquiries.filter((e) => {
    const s = (e.status || "").toLowerCase();
    if (filter === "new") return s === "new" || s === "open";
    if (filter === "replied") return s === "replied";
    return s === "archived" || s === "closed";
  });

  function buildReplyTemplate(e: Enquiry) {
    const name = e.buyer_name ? `Hi ${e.buyer_name},` : "Hi there,";
    const listing = e.listing_title || "your enquiry";
    return `${name}\n\nThanks for getting in touch about ${listing}. I'm happy to help.\n\nCould you share any extra details (timing, budget, preferred contact time)?\n\nBest regards,`;
  }

  function buildGmailUrl(e: Enquiry) {
    const subject = encodeURIComponent(`Re: ${e.listing_title || "Your enquiry"}`);
    const body = encodeURIComponent(buildReplyTemplate(e));
    const email = encodeURIComponent(e.buyer_email || "");
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
  }

  async function markStatus(id: string, status: string) {
    setSaving(id);
    const { error: upErr } = await supabase
      .from("marketplace_enquiries")
      .update({ status })
      .eq("id", id);
    if (!upErr) {
      setEnquiries((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
      showToast(status === "replied" ? "Marked as replied" : "Archived");
    }
    setSaving(null);
  }

  async function bulkMark(status: string) {
    setBulkSaving(true);
    const ids = filtered.map((e) => e.id);
    const { error: upErr } = await supabase
      .from("marketplace_enquiries")
      .update({ status })
      .in("id", ids);
    if (!upErr) {
      setEnquiries((prev) => prev.map((r) => ids.includes(r.id) ? { ...r, status } : r));
      showToast(`${ids.length} enquiries updated`);
    }
    setBulkSaving(false);
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading enquiries…
        </div>
      </main>
    );
  }

  const filters: { key: FilterKey; label: string; count: number }[] = [
    { key: "all", label: "All", count: total },
    { key: "new", label: "New", count: newCount },
    { key: "replied", label: "Replied", count: replied },
    { key: "archived", label: "Archived", count: archived },
  ];

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-7 py-8 text-white shadow-md">
        <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[#D90429]/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-32 w-32 rounded-full bg-slate-700/30 blur-2xl" />
        <div className="relative">
          <Link
            href="/account"
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to account
          </Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                ManxHive
              </p>
              <h1 className="mt-1 font-playfair text-3xl font-bold">
                Enquiries<span className="text-[#D90429]">.</span>
              </h1>
              <p className="mt-1.5 text-sm text-slate-300">
                Messages from customers who contacted your listings.
              </p>
            </div>

            {/* Stats in hero */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Total", value: total, cls: "bg-white/10 text-white" },
                { label: "New", value: newCount, cls: newCount > 0 ? "bg-[#D90429]/80 text-white" : "bg-white/10 text-white" },
                { label: "Replied", value: replied, cls: "bg-emerald-500/20 text-emerald-300" },
                { label: "Archived", value: archived, cls: "bg-white/10 text-slate-300" },
              ].map((s) => (
                <div key={s.label} className={`rounded-2xl px-4 py-2 text-center ${s.cls}`}>
                  <div className="text-lg font-bold leading-none">{s.value}</div>
                  <div className="mt-0.5 text-[10px] font-medium opacity-80">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      {/* Filter tabs + bulk actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <div className="flex gap-1.5">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  filter === f.key
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300"
                }`}
              >
                {f.label}
                {f.count > 0 && (
                  <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    filter === f.key ? "bg-white/20" : "bg-slate-100"
                  }`}>
                    {f.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {filtered.length > 0 && filter !== "archived" && (
          <div className="flex gap-2">
            <button
              onClick={() => bulkMark("replied")}
              disabled={bulkSaving}
              className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:ring-slate-300 disabled:opacity-60"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Mark all replied
            </button>
            <button
              onClick={() => bulkMark("archived")}
              disabled={bulkSaving}
              className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:ring-slate-300 disabled:opacity-60"
            >
              <Archive className="h-3.5 w-3.5 text-slate-400" />
              Archive all
            </button>
          </div>
        )}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
          <Inbox className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-semibold text-slate-700">
            {filter === "all" ? "No enquiries yet" : `No ${filter} enquiries`}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {filter === "all"
              ? "When customers contact you through your listings, their messages will appear here."
              : "Try switching to a different filter above."}
          </p>
          {filter !== "all" && (
            <button
              onClick={() => setFilter("all")}
              className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black"
            >
              Show all enquiries
            </button>
          )}
        </div>
      )}

      {/* Enquiry cards */}
      {filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((e) => {
            const isExpanded = expandedId === e.id;
            const isArchived = ["archived", "closed"].includes((e.status || "").toLowerCase());
            const isReplied = (e.status || "").toLowerCase() === "replied";
            const isNew = ["new", "open"].includes((e.status || "").toLowerCase());

            return (
              <div
                key={e.id}
                className={`rounded-2xl border bg-white shadow-sm transition ${
                  isNew ? "border-rose-100 ring-1 ring-rose-100" : "border-slate-200"
                } ${isArchived ? "opacity-70" : ""}`}
              >
                {/* Card header — always visible */}
                <button
                  className="w-full text-left px-5 py-4"
                  onClick={() => setExpandedId(isExpanded ? null : e.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      {/* Avatar */}
                      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        isNew ? "bg-[#D90429]/10 text-[#D90429]" : "bg-slate-100 text-slate-500"
                      }`}>
                        {(e.buyer_name || e.buyer_email || "?")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">
                            {e.buyer_name || e.buyer_email || "Enquiry"}
                          </span>
                          <StatusPill status={e.status || "new"} />
                        </div>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {e.listing_title ? (
                            <span>Re: <span className="font-medium text-slate-700">{e.listing_title}</span></span>
                          ) : (
                            "No listing linked"
                          )}
                        </p>
                        {e.message && !isExpanded && (
                          <p className="mt-1 line-clamp-1 text-xs text-slate-400">
                            {e.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Calendar className="h-3 w-3" />
                        {formatDate(e.created_at)}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded body */}
                {isExpanded && (
                  <div className="border-t border-slate-100 px-5 pb-5 pt-4">
                    {/* Contact info */}
                    {(e.buyer_name || e.buyer_email) && (
                      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500">
                        {e.buyer_name && (
                          <span><span className="font-medium text-slate-700">Name:</span> {e.buyer_name}</span>
                        )}
                        {e.buyer_email && (
                          <span><span className="font-medium text-slate-700">Email:</span> {e.buyer_email}</span>
                        )}
                        {e.created_at && (
                          <span><span className="font-medium text-slate-700">Received:</span> {new Date(e.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</span>
                        )}
                      </div>
                    )}

                    {/* Message */}
                    {e.message && (
                      <div className="rounded-xl bg-slate-50 px-4 py-3.5 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {e.message}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {e.buyer_email && (
                        <a
                          href={buildGmailUrl(e)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#D90429] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#b50322]"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          Reply in Gmail
                          <ExternalLink className="h-3 w-3 opacity-70" />
                        </a>
                      )}
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(buildReplyTemplate(e));
                            setCopiedId(e.id);
                            setTimeout(() => setCopiedId(null), 1500);
                            showToast("Reply template copied");
                          } catch { /* ignore */ }
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        {copiedId === e.id ? "Copied!" : "Copy template"}
                      </button>
                      {e.listing_id && (
                        <Link
                          href={`/marketplace/item/${e.listing_id}`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          View listing
                        </Link>
                      )}
                      {!isReplied && !isArchived && (
                        <button
                          onClick={() => markStatus(e.id, "replied")}
                          disabled={saving === e.id}
                          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {saving === e.id ? "Saving…" : "Mark replied"}
                        </button>
                      )}
                      {!isArchived && (
                        <button
                          onClick={() => markStatus(e.id, "archived")}
                          disabled={saving === e.id}
                          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-60"
                        >
                          <Archive className="h-3.5 w-3.5" />
                          Archive
                        </button>
                      )}
                      {isArchived && (
                        <button
                          onClick={() => markStatus(e.id, "new")}
                          disabled={saving === e.id}
                          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-60"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
