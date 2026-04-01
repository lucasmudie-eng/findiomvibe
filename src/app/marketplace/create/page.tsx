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
  const [listingType, setListingType] = useState<"general" | "car">("general");
  const [price, setPrice] = useState("");
  const [negotiable, setNegotiable] = useState(false);
  const [condition, setCondition] = useState<ItemCondition>("Lightly Used");
  const [area, setArea] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState("");
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const [carMake, setCarMake] = useState("");
  const [carModel, setCarModel] = useState("");
  const [carYear, setCarYear] = useState("");
  const [carMileage, setCarMileage] = useState("");
  const [carFuel, setCarFuel] = useState("");
  const [carTransmission, setCarTransmission] = useState("");
  const [carEngine, setCarEngine] = useState("");
  const [carColour, setCarColour] = useState("");
  const [carDoors, setCarDoors] = useState("");
  const [carOwners, setCarOwners] = useState("");
  const [carTaxedUntil, setCarTaxedUntil] = useState("");
  const [carServiceHistory, setCarServiceHistory] = useState("");
  const [carFeatures, setCarFeatures] = useState("");

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

  useEffect(() => {
    if (category === "automotive") {
      setListingType("car");
    } else if (listingType === "car") {
      setListingType("general");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (!supabase || !userId) return;

    const maxAllowed = Math.max(0, 5 - uploadedUrls.length);
    const list = Array.from(files).slice(0, maxAllowed);
    if (!list.length) {
      setError("You can upload a maximum of 5 images.");
      return;
    }

    setUploading(true);
    setError(null);

    const newUrls: string[] = [];
    for (const file of list) {
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${fileExt}`;
      const filePath = `marketplace/${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("marketplace")
        .upload(filePath, file, { upsert: false });

      if (uploadError) {
        console.error(uploadError);
        setError("Upload failed. Please try again.");
        setUploading(false);
        return;
      }

      const { data } = supabase.storage
        .from("marketplace")
        .getPublicUrl(filePath);
      if (data?.publicUrl) newUrls.push(data.publicUrl);
    }

    setUploadedUrls((prev) => [...prev, ...newUrls].slice(0, 5));
    setUploading(false);
  }

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

    if (listingType === "car") {
      if (!carMake.trim() || !carModel.trim() || !carYear.trim()) {
        setError("Please add make, model and year for vehicle listings.");
        setSubmitting(false);
        return;
      }
    }

    const urls = [
      ...uploadedUrls,
      ...imageUrls
        .split(/[\n,]+/g)
        .map((u) => u.trim())
        .filter(Boolean),
    ]
      .filter(Boolean)
      .slice(0, 5);

    const attrs =
      listingType === "car"
        ? {
            make: carMake.trim() || null,
            model: carModel.trim() || null,
            year: Number(carYear) || null,
            mileage: Number(carMileage) || null,
            fuel: carFuel.trim() || null,
            transmission: carTransmission.trim() || null,
            engine: carEngine.trim() || null,
            colour: carColour.trim() || null,
            doors: Number(carDoors) || null,
            owners: Number(carOwners) || null,
            taxed_until: carTaxedUntil.trim() || null,
            service_history: carServiceHistory.trim() || null,
            features: carFeatures
              .split(/[,\\n]+/g)
              .map((f) => f.trim())
              .filter(Boolean),
          }
        : null;

    const payload = {
      // ownership / audit
      seller_user_id: userId,
      user_id: userId,
      submitted_by: userId,

      // moderation-required by RLS
      status: "pending",
      approved: false,

      // main fields
      category,
      title: title.trim(),
      area: area.trim() || null,
      price_pence: pricePence,
      negotiable,
      condition,
      description: trimmedDesc,
      images: urls.length ? urls : null,
      type: listingType,
      attrs,

      // keep explicit (optional)
      boosted: false,
      date_listed: new Date().toISOString(),
    };

    const { error: insertError, data } = await supabase
      .from("marketplace_listings")
      .insert(payload)
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

        {/* Listing type */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">
            Listing type
          </label>
          <select
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={listingType}
            onChange={(e) =>
              setListingType(e.target.value as "general" | "car")
            }
          >
            <option value="general">General item</option>
            <option value="car">Vehicle / car</option>
          </select>
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

        {listingType === "car" && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Vehicle details
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-900">
                  Make
                </label>
                <input
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={carMake}
                  onChange={(e) => setCarMake(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-900">
                  Model
                </label>
                <input
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-900">
                  Year
                </label>
                <input
                  type="number"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={carYear}
                  onChange={(e) => setCarYear(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-900">
                  Mileage
                </label>
                <input
                  type="number"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={carMileage}
                  onChange={(e) => setCarMileage(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-900">
                  Fuel
                </label>
                <input
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={carFuel}
                  onChange={(e) => setCarFuel(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-900">
                  Transmission
                </label>
                <input
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={carTransmission}
                  onChange={(e) => setCarTransmission(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-900">
                  Engine
                </label>
                <input
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={carEngine}
                  onChange={(e) => setCarEngine(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-900">
                  Colour
                </label>
                <input
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={carColour}
                  onChange={(e) => setCarColour(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-900">
                  Doors
                </label>
                <input
                  type="number"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={carDoors}
                  onChange={(e) => setCarDoors(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-900">
                  Owners
                </label>
                <input
                  type="number"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={carOwners}
                  onChange={(e) => setCarOwners(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-900">
                  Taxed until
                </label>
                <input
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="e.g. Dec 2026"
                  value={carTaxedUntil}
                  onChange={(e) => setCarTaxedUntil(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-900">
                  Service history
                </label>
                <input
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={carServiceHistory}
                  onChange={(e) => setCarServiceHistory(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-xs font-medium text-gray-900">
                Features (comma separated)
              </label>
              <textarea
                className="min-h-[70px] w-full rounded-lg border px-3 py-2 text-sm"
                value={carFeatures}
                onChange={(e) => setCarFeatures(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Images */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">
            Upload images
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleUpload(e.target.files)}
            className="w-full rounded-lg border px-3 py-2 text-xs"
          />
          {uploading && (
            <p className="mt-2 text-xs text-gray-500">Uploading…</p>
          )}
          {uploadedUrls.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-gray-600">
              {uploadedUrls.map((url) => (
                <span
                  key={url}
                  className="rounded-full border border-slate-200 bg-white px-2 py-1"
                >
                  Uploaded
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">
            Image URLs (optional)
          </label>
          <textarea
            className="min-h-[80px] w-full rounded-lg border px-3 py-2 text-xs"
            placeholder={"One image URL per line (max 5)."}
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
