"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

type Listing = {
  id: string;
  seller_user_id: string;
  title: string;
  category: CategorySlug;
  price_pence: number;
  negotiable: boolean;
  condition: ItemCondition;
  area: string | null;
  description: string;
  images: string[] | null;
  approved: boolean;
};

export default function EditListingPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CategorySlug>("electronics");
  const [price, setPrice] = useState("");
  const [negotiable, setNegotiable] = useState(false);
  const [condition, setCondition] =
    useState<ItemCondition>("Lightly Used");
  const [area, setArea] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);

      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();

      if (userErr) {
        console.error(userErr);
        setError("Could not verify your session.");
        setLoading(false);
        return;
      }

      if (!user) {
        const next = encodeURIComponent(`/marketplace/item/${id}/edit`);
        router.replace(`/login?next=${next}`);
        return;
      }

      setAuthUserId(user.id);

      const { data, error: lErr } = await supabase
        .from("marketplace_listings")
        .select(
          "id, seller_user_id, title, category, price_pence, negotiable, condition, area, description, images, approved"
        )
        .eq("id", id)
        .maybeSingle<Listing>();

      if (lErr || !data) {
        console.error(lErr);
        setError("Listing not found.");
        setLoading(false);
        return;
      }

      if (data.seller_user_id !== user.id) {
        setError("You do not have permission to edit this listing.");
        setLoading(false);
        return;
      }

      setListing(data);

      setTitle(data.title);
      setCategory(data.category);
      setPrice((data.price_pence / 100).toString());
      setNegotiable(data.negotiable);
      setCondition(data.condition);
      setArea(data.area || "");
      setDescription(data.description);
      setImageUrls((data.images || []).join("\n"));

      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!listing || !authUserId) return;

    setSubmitting(true);
    setError(null);
    setOk(null);

    const numericPrice = Number(price);
    if (!numericPrice || numericPrice <= 0) {
      setError("Please enter a valid price.");
      setSubmitting(false);
      return;
    }

    const price_pence = Math.round(numericPrice * 100);
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

    const { error: uErr } = await supabase
      .from("marketplace_listings")
      .update({
        title: title.trim(),
        category,
        area: area.trim() || null,
        price_pence,
        negotiable,
        condition,
        description: trimmedDesc,
        images: urls.length ? urls : null,
        approved: false, // require re-approval on edit
      })
      .eq("id", listing.id)
      .eq("seller_user_id", authUserId);

    if (uErr) {
      console.error(uErr);
      setError("Could not update listing. Please try again.");
      setSubmitting(false);
      return;
    }

    setOk("Listing updated and sent for approval.");
    setSubmitting(false);

    setTimeout(() => {
      router.push("/account");
    }, 800);
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-sm text-gray-600">Loading listing…</p>
      </main>
    );
  }

  if (error || !listing) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 space-y-3">
        <h1 className="text-xl font-semibold text-gray-900">
          Edit listing
        </h1>
        <p className="text-sm text-red-600">
          {error || "Listing not found."}
        </p>
        <Link
          href="/account"
          className="inline-flex items-center rounded-lg bg-[#D90429] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b50322]"
        >
          Back to account
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-xl font-semibold text-gray-900">
        Edit listing
      </h1>
      <p className="mb-6 text-sm text-gray-600">
        Update your listing details. Changes may require re-approval before
        appearing publicly.
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
              onChange={(e) =>
                setCategory(e.target.value as CategorySlug)
              }
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
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Douglas, Peel, Ramsey"
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
            onChange={(e) =>
              setCondition(e.target.value as ItemCondition)
            }
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Images */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">
            Image URLs
          </label>
          <textarea
            className="min-h-[80px] w-full rounded-lg border px-3 py-2 text-xs"
            value={imageUrls}
            onChange={(e) => setImageUrls(e.target.value)}
            placeholder={"One image URL per line (max 5)."}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        {ok && (
          <p className="text-sm text-emerald-600">{ok}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-[#D90429] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b50322] disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Save changes"}
        </button>
      </form>
    </main>
  );
}