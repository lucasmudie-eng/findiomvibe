// src/app/deals/[id]/page.tsx

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  DEAL_CATEGORY_LABELS,
  type DealCategory,
} from "@/lib/deals/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type Deal = {
  id: string;
  business_name: string | null;
  title: string;
  category: DealCategory | null;
  area: string | null;
  discount_label: string | null;
  description: string | null;
  image_url: string | null;
  boosted: boolean;
  starts_at: string | null;
  expires_at: string | null;
  redemption_url: string | null;
  approved: boolean;
};

function normalizeUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

async function fetchDeal(id: string):
  Promise<{ status: "ok"; deal: Deal } | { status: "not-found" } | { status: "error"; reason: string }> {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "[deals/[id]] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
    return { status: "error", reason: "Missing Supabase configuration." };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase
    .from("deals")
    .select(
      `
      id,
      business_name,
      title,
      category,
      area,
      discount_label,
      description,
      image_url,
      boosted,
      starts_at,
      expires_at,
      redemption_url,
      approved
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[deals/[id]] DB error:", error);
    return { status: "error", reason: "Could not load this deal." };
  }

  if (!data || !data.approved) {
    return { status: "not-found" };
  }

  return { status: "ok", deal: data as Deal };
}

export default async function DealPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await fetchDeal(params.id);

  if (result.status === "not-found") {
    notFound();
  }

  if (result.status === "error") {
    return (
      <main className="mx-auto max-w-xl px-4 py-10 space-y-4">
        <h1 className="text-xl font-semibold text-gray-900">
          Deal unavailable
        </h1>
        <p className="text-sm text-gray-600">
          We couldn&apos;t load this deal. It may have expired, been removed,
          or there&apos;s a configuration issue.
        </p>
        <p className="mt-4">
          <Link
            href="/deals"
            className="inline-flex items-center rounded-full bg-[#D90429] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#b50322]"
          >
            ← Back to Deals
          </Link>
        </p>
      </main>
    );
  }

  const deal = result.deal;
  const target = normalizeUrl(deal.redemption_url);

  // If redemption URL exists, track (best-effort) then redirect.
  if (target) {
    try {
      fetch("/api/track/deal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId: deal.id }),
        cache: "no-store",
      }).catch(() => {});
    } catch {
      // ignore tracking errors
    }

    redirect(target);
  }

  // No redemption URL → show a nice detail page.
  const label =
    deal.category && DEAL_CATEGORY_LABELS[deal.category]
      ? DEAL_CATEGORY_LABELS[deal.category]
      : deal.category || "Deal";

  return (
    <main className="mx-auto max-w-xl px-4 py-10 space-y-4">
      <nav className="mb-1 text-xs text-gray-500">
        <Link href="/deals" className="hover:underline">
          Deals
        </Link>{" "}
        / <span className="text-gray-800">Deal details</span>
      </nav>

      <h1 className="text-xl font-semibold text-gray-900">
        {deal.title}
      </h1>

      {deal.business_name && (
        <p className="text-sm text-gray-600">
          {deal.business_name}
        </p>
      )}

      <p className="text-xs text-gray-500">
        {label}
        {deal.area ? ` • ${deal.area}` : ""}
        {deal.discount_label ? ` • ${deal.discount_label}` : ""}
      </p>

      {deal.image_url && (
        <div className="mt-3 overflow-hidden rounded-2xl bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={deal.image_url}
            alt={deal.title}
            className="h-56 w-full object-cover"
          />
        </div>
      )}

      {deal.description && (
        <p className="mt-2 text-sm text-gray-700">
          {deal.description}
        </p>
      )}

      <div className="mt-3 space-y-1 text-xs text-gray-600">
        {deal.starts_at && (
          <p>
            From{" "}
            {new Date(deal.starts_at).toLocaleDateString("en-GB")}
          </p>
        )}
        {deal.expires_at && (
          <p>
            Until{" "}
            {new Date(deal.expires_at).toLocaleDateString("en-GB")}
          </p>
        )}
      </div>

      <p className="mt-4 text-xs text-gray-700">
        This deal doesn&apos;t have an online redemption link. Show this page
        or mention <span className="font-semibold">ManxHive</span> so the
        business can honour the offer.
      </p>

      <p className="text-[10px] text-gray-400">
        If something looks wrong with this deal, please let the ManxHive team
        know.
      </p>

      <p className="mt-4">
        <Link
          href="/deals"
          className="inline-flex items-center rounded-full bg-[#D90429] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#b50322]"
        >
          ← Back to Deals
        </Link>
      </p>
    </main>
  );
}