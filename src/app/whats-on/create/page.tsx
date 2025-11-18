// src/app/whats-on/create/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import {
  WHATS_ON_CATEGORY_LABELS,
  WhatsOnCategorySlug,
} from "@/lib/events/types";

const CATEGORY_ORDER: WhatsOnCategorySlug[] = [
  "family",
  "sports",
  "nightlife",
  "live-music",
  "community",
  "business",
  "arts-culture",
  "education",
];

export default function CreateEventPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();

  const [loadingUser, setLoadingUser] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<WhatsOnCategorySlug>("community");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [area, setArea] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [organiserName, setOrganiserName] = useState("");
  const [organiserEmail, setOrganiserEmail] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [priceFrom, setPriceFrom] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        const next = encodeURIComponent("/whats-on/create");
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

    if (!title.trim() || !description.trim()) {
      setError("Please add a title and description.");
      setSubmitting(false);
      return;
    }

    if (!startAt) {
      setError("Please select a start date/time.");
      setSubmitting(false);
      return;
    }

    const priceNumber = Number(priceFrom);
    const price_from_pence =
      !isFree && priceNumber > 0
        ? Math.round(priceNumber * 100)
        : null;

    const { data, error: insertError } = await supabase
      .from("whats_on_events")
      .insert({
        title: title.trim(),
        description: description.trim(),
        category,
        venue: venue.trim() || null,
        area: area.trim() || null,
        start_at: new Date(startAt).toISOString(),
        end_at: endAt ? new Date(endAt).toISOString() : null,
        image_url: imageUrl.trim() || null,
        organiser_name: organiserName.trim() || null,
        organiser_email: organiserEmail.trim() || null,
        external_url: externalUrl.trim() || null,
        is_free: isFree,
        price_from_pence,
        featured: false,
        approved: false,
        created_by: userId,
      })
      .select("id")
      .maybeSingle();

    if (insertError || !data) {
      console.error(insertError);
      setError(
        insertError?.message ||
          "Could not submit event. Please try again."
      );
      setSubmitting(false);
      return;
    }

    setOk(
      "Event submitted for review. It will appear in What’s On once approved."
    );
    setSubmitting(false);

    setTimeout(() => {
      router.push("/account");
    }, 900);
  }

  if (loadingUser) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-gray-600">Checking your account…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-xl font-semibold text-gray-900">
        List an event on What&apos;s On
      </h1>
      <p className="mb-6 text-sm text-gray-600">
        Share your fixture, gig, fundraiser, or community event. Submissions
        are reviewed by the ManxHive team before going live.
      </p>

      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-2xl border bg-white p-5 shadow-sm"
      >
        {/* Title */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">
            Event title
          </label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Peel FC Friday Night Lights"
            required
          />
        </div>

        {/* Category, venue, area */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label className="mb-1 block text-sm font-medium text-gray-900">
              Category
            </label>
            <select
              className="w-full rounded-lg border px-3 py-2 text-sm"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as WhatsOnCategorySlug)
              }
            >
              {CATEGORY_ORDER.map((c) => (
                <option key={c} value={c}>
                  {WHATS_ON_CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">
              Venue
            </label>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. NSC Main Hall"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">
              Area
            </label>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Douglas, Peel"
            />
          </div>
        </div>

        {/* Date/time */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">
              Starts
            </label>
            <input
              type="datetime-local"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">
              Ends (optional)
            </label>
            <input
              type="datetime-local"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
            />
          </div>
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
            placeholder="What’s happening, who it’s for, timings, key info."
            required
          />
        </div>

        {/* Image URL */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">
            Image URL (optional)
          </label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-xs"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Add a hero image URL for your event."
          />
        </div>

        {/* Organiser details */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">
              Organiser / club / venue
            </label>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm"
              value={organiserName}
              onChange={(e) => setOrganiserName(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">
              Contact email
            </label>
            <input
              type="email"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              value={organiserEmail}
              onChange={(e) => setOrganiserEmail(e.target.value)}
            />
          </div>
        </div>

        {/* External URL */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">
            Event / ticket link (optional)
          </label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="Link to more info or tickets."
          />
        </div>

        {/* Pricing */}
        <div className="flex flex-wrap items-center gap-4">
          <label className="inline-flex items-center gap-2 text-sm text-gray-800">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300"
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
            />
            Free event
          </label>
          {!isFree && (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-900">
                From price (£)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                className="w-32 rounded-lg border px-3 py-1.5 text-sm"
                value={priceFrom}
                onChange={(e) => setPriceFrom(e.target.value)}
              />
            </div>
          )}
        </div>

        <p className="text-[10px] text-gray-500">
          Submissions are reviewed to keep listings relevant, accurate, and
          island-focused. By submitting you confirm the details are correct.
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {ok && <p className="text-sm text-emerald-600">{ok}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-[#D90429] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b50322] disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit event for review"}
        </button>
      </form>
    </main>
  );
}