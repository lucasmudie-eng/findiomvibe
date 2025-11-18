// src/app/marketplace/create/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import {
  CATEGORY_LABELS,
  CategorySlug,
  ItemCondition,
} from "@/lib/marketplace/types";

const CATEGORY_ORDER: CategorySlug[] = [
  "electronics",
  "fashion",
  "home-garden",
  "health-beauty",
  "toys-games",
  "sports-outdoors",
  "media",
  "automotive",
  "pet-supplies",
];

const CONDITIONS: ItemCondition[] = [
  "New",
  "Like New",
  "Lightly Used",
  "Used",
  "For Parts",
];

export default function CreateListingPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();

  const [loadingUser, setLoadingUser] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CategorySlug>("electronics");
  const [price, setPrice] = useState("");
  const [negotiable, setNegotiable] = useState(false);
  const [condition, setCondition] = useState<ItemCondition>("Lightly Used");
  const [area, setArea] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState("");

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
        const next = encodeURIComponent("/marketplace/create");
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

    const numericPrice = Number(price);
    if (!numericPrice || numericPrice <= 0) {
      setError("Please enter a valid price.");
      setSubmitting(false);
      return;
    }

    const pricePence = Math.round(numericPrice * 100);
    const trimmedDesc = description.trim();

    if (trimmedDesc.length < 10) {
      setError("Please add a bit more detail to your description.");
      setSubmitting(false);
      return;
    }

    const urls = imageUrls
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean)
      .slice(0, 5);

    const { error: insertError, data } = await supabase
      .from("marketplace_listings")
      .insert({
        seller_user_id: userId,
        category,
        title: title.trim(),
        area: area.trim() || null,
        price_pence: pricePence,
        negotiable,
        condition,
        description: trimmedDesc,
        images: urls.length ? urls : null,
        approved: false,
        boosted: false,
        date_listed: new Date().toISOString(),
      })
      .select("id")
      .maybeSingle();

    if (insertError || !data) {
      setError(insertError?.message || "Could not create listing. Try again.");
      setSubmitting(false);
      return;
    }

    setOk(
      "Listing created and sent for approval. It will appear publicly once approved."
    );
    setSubmitting(false);

    setTimeout(() => {
      router.push("/account");
    }, 800);
  }

  if (loadingUser) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-sm text-gray-600">Checking your account...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-xl font-semibold text-gray-900">
        Create a marketplace listing
      </h1>
      <p className="mb-6 text-sm text-gray-600">
        Fill in the details below. Listings are reviewed before they appear
        publicly.
      </p>

      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-2xl border bg-white p-5 shadow-sm"
      >
        {/* Title */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">
            Title
          </label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="e.g. iPhone 13 Pro 256GB - Graphite"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Category + Area */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">
              Category
            </label>
            <select
              className="w-full rounded-lg border px-3 py-2 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value as CategorySlug)}
            >
              {CATEGORY_ORDER.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">
              Area
            </label>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="e.g. Douglas, Peel, Ramsey"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
          </div>
        </div>

        {/* Price + Negotiable */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">
              Price (£)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="e.g. 550"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="flex items-end gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-gray-800">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                checked={negotiable}
                onChange={(e) => setNegotiable(e.target.checked)}
              />
              Price negotiable
            </label>
          </div>
        </div>

        {/* Condition */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">
            Condition
          </label>
          <select
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={condition}
            onChange={(e) => setCondition(e.target.value as ItemCondition)}
          >
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">
            Description
          </label>
          <textarea
            className="min-h-[120px] w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Describe the item, condition, included accessories, and any important details."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Images */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">
            Image URLs (optional)
          </label>
          <textarea
            className="min-h-[80px] w-full rounded-lg border px-3 py-2 text-xs"
            placeholder={
              "One image URL per line (max 5).\nYou can add upload support later via Supabase Storage."
            }
            value={imageUrls}
            onChange={(e) => setImageUrls(e.target.value)}
          />
        </div>

        <p className="text-xs text-gray-500">
          Your listing will be submitted for approval. Once approved, it will
          appear on the public marketplace.
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {ok && <p className="text-sm text-emerald-600">{ok}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-[#D90429] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b50322] disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Create listing"}
        </button>
      </form>
    </main>
  );
}