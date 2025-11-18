// src/app/deals/create/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import {
  DEAL_CATEGORY_LABELS,
  type DealCategory,
} from "@/lib/deals/types";

const CATEGORY_ORDER: DealCategory[] = [
  "food-drink",
  "shopping",
  "activities",
  "beauty-wellness",
  "services",
  "other",
];

export default function CreateDealPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();

  const [loadingUser, setLoadingUser] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<DealCategory>("food-drink");
  const [area, setArea] = useState("");
  const [discountLabel, setDiscountLabel] = useState("");
  const [description, setDescription] = useState("");
  const [redemptionUrl, setRedemptionUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // Check auth
  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Simple redirect without useSearchParams
        const next = encodeURIComponent("/deals/create");
        router.replace(`/login?next=${next}`);
        return;
      }

      setUserId(user.id);
      setLoadingUser(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;

    setSubmitting(true);
    setError(null);
    setOk(null);

    if (!title.trim()) {
      setError("Please add a deal title.");
      setSubmitting(false);
      return;
    }

    if (!discountLabel.trim()) {
      setError("Please describe the offer (e.g. 20% off, Free dessert).");
      setSubmitting(false);
      return;
    }

    if (description.trim().length < 10) {
      setError("Please add a bit more detail to your deal.");
      setSubmitting(false);
      return;
    }

    const payload: any = {
      created_by: userId,
      business_name: businessName.trim() || null,
      title: title.trim(),
      category,
      area: area.trim() || null,
      discount_label: discountLabel.trim(),
      description: description.trim(),
      redemption_url: redemptionUrl.trim() || null,
      image_url: imageUrl.trim() || null,
      approved: false,
      boosted: false,
    };

    if (startsAt) payload.starts_at = new Date(startsAt).toISOString();
    if (expiresAt) payload.expires_at = new Date(expiresAt).toISOString();

    const { error: insertError } = await supabase.from("deals").insert(payload);

    if (insertError) {
      console.error(insertError);
      setError(insertError.message || "Could not submit deal. Try again.");
      setSubmitting(false);
      return;
    }

    setOk(
      "Deal submitted for review. Once approved, it will appear on the Deals page."
    );
    setSubmitting(false);

    setTimeout(() => {
      router.push("/account");
    }, 900);
  }

  if (loadingUser) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-sm text-gray-600">Checking your account…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-xl font-semibold text-gray-900">
        Submit a deal or offer
      </h1>
      <p className="mb-6 text-sm text-gray-600">
        Promote a genuine offer for Isle of Man customers. We lightly review all
        submissions before publishing.
      </p>

      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-2xl border bg-white p-5 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">
            Business / organisation name
          </label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="e.g. Laxey Bakehouse"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">
            Deal title
          </label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="e.g. 20% off coffee & pastries before 10am"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">
              Category
            </label>
            <select
              className="w-full rounded-lg border px-3 py-2 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value as DealCategory)}
            >
              {CATEGORY_ORDER.map((c) => (
                <option key={c} value={c}>
                  {DEAL_CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">
              Area (optional)
            </label>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="e.g. Douglas, Peel, Ramsey"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">
            Offer label
          </label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="e.g. 20% off, 2 for 1, Free drink with meal"
            value={discountLabel}
            onChange={(e) => setDiscountLabel(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">
            Description
          </label>
          <textarea
            className="min-h-[100px] w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Explain any conditions, times, or redemption details. Keep it clear and honest."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">
            Redemption URL (optional)
          </label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Link to booking page, code info, or your website"
            value={redemptionUrl}
            onChange={(e) => setRedemptionUrl(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">
            Image URL (optional)
          </label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Promo image or logo URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">
              Starts (optional)
            </label>
            <input
              type="date"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">
              Expires (optional)
            </label>
            <input
              type="date"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>
        </div>

        <p className="text-[10px] text-gray-500">
          All submissions are manually reviewed. No misleading or unavailable
          offers. Boosted (paid) placement will be available soon.
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {ok && <p className="text-sm text-emerald-600">{ok}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-[#D90429] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b50322] disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit deal"}
        </button>
      </form>
    </main>
  );
}