// src/app/list-business/page.tsx
"use client";

import { useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

/** --- helpers --- */
function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
const hasSeparator = (s: string) => /[ .-]/.test(s);
const toProperCase = (s: string) =>
  s
    .trim()
    .replace(/\s+/g, " ")
    .replace(/(^|\.\s+|-+\s+|\s+)([a-z])/g, (m, p, c) => p + c.toUpperCase());

type ServiceRow = { name: string; price: string };
type ReviewRow = { author: string; rating: number; text: string };

export default function ListBusinessPage() {
  const supabase = supabaseBrowser();

  // core fields
  const [name, setName] = useState("");
  const slug = useMemo(() => (name ? slugify(name) : ""), [name]);
  const [tagline, setTagline] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [area, setArea] = useState("");

  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [openingHours, setOpeningHours] = useState("");

  // images: comma or newline separated
  const [imagesText, setImagesText] = useState("");

  // friendly dynamic inputs
  const [services, setServices] = useState<ServiceRow[]>([
    { name: "", price: "" },
  ]);
  const [reviews, setReviews] = useState<ReviewRow[]>([
    { author: "", rating: 5, text: "" },
  ]);

  // misc
  const [wantBoosted, setWantBoosted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [doneMsg, setDoneMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  /** --- add/remove rows --- */
  const addService = () => setServices((p) => [...p, { name: "", price: "" }]);
  const removeService = (i: number) =>
    setServices((p) => p.filter((_, idx) => idx !== i));

  const addReview = () =>
    setReviews((p) => [...p, { author: "", rating: 5, text: "" }]);
  const removeReview = (i: number) =>
    setReviews((p) => p.filter((_, idx) => idx !== i));

  /** --- submit --- */
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrMsg(null);
    setDoneMsg(null);

    // Basic validations + your formatting rules
    if (!name.trim()) return setErrMsg("Please enter the business name.");
    if (!category.trim())
      return setErrMsg("Please enter a high-level category (e.g., food-drink).");

    // enforce proper case + separator presence where it makes sense
    const cleanName = toProperCase(name);
    const cleanTagline = tagline ? toProperCase(tagline) : "";

    // validate service rows
    const cleanedServices = services
      .map((s) => ({
        name: s.name.trim() ? toProperCase(s.name) : "",
        price: s.price.trim(),
      }))
      .filter((s) => s.name || s.price);

    for (const s of cleanedServices) {
      if (s.name && !hasSeparator(s.name))
        return setErrMsg(
          "Please add a space, period, or dash in the service name."
        );
    }

    // validate review rows
    const cleanedReviews = reviews
      .map((r) => ({
        author: r.author.trim() ? toProperCase(r.author) : "",
        rating: Math.min(5, Math.max(1, Number(r.rating) || 0)),
        text: r.text.trim() ? toProperCase(r.text) : "",
      }))
      .filter((r) => r.author || r.text);

    for (const r of cleanedReviews) {
      if (r.text && !hasSeparator(r.text))
        return setErrMsg(
          "Please add a space, period, or dash in the review comment."
        );
    }

    // images parsing
    const images = imagesText
      .split(/[\n,]+/g)
      .map((u) => u.trim())
      .filter(Boolean);

    // normalize website
    const website_url =
      website && !/^https?:\/\//i.test(website) ? `https://${website}` : website;

    setSubmitting(true);
    try {
      // Insert; approved=false by default; boosted is NOT auto-granted.
      const { error } = await supabase.from("businesses").insert([
        {
          name: cleanName,
          slug: slug || null,
          tagline: cleanTagline || null,
          category: category || null,
          subcategory: subcategory || null,
          area: area || null,

          description: description || null,
          website_url: website_url || null,
          email: email || null,
          phone: phone || null,
          address: address || null,
          opening_hours: openingHours || null,

          images: images.length ? images : null, // text[] in DB

          // These columns are JSONB in your schema; store friendly inputs there:
          services_json: cleanedServices.length ? cleanedServices : null,
          reviews_json: cleanedReviews.length ? cleanedReviews : null,

          boosted: false,
          boosted_request: wantBoosted, // optional flag if you added it
          approved: false,
        },
      ]);

      if (error) throw error;
      setDoneMsg(
        "Thanks! Your business was submitted. We’ll review and publish shortly."
      );
      // clear
      setName("");
      setTagline("");
      setCategory("");
      setSubcategory("");
      setArea("");
      setDescription("");
      setWebsite("");
      setEmail("");
      setPhone("");
      setAddress("");
      setOpeningHours("");
      setImagesText("");
      setServices([{ name: "", price: "" }]);
      setReviews([{ author: "", rating: 5, text: "" }]);
      setWantBoosted(false);
    } catch (err: any) {
      setErrMsg(err.message || "Could not submit right now.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-slate-900">Add a business</h1>
      <p className="mt-2 text-sm text-slate-600">
        Submit a listing. We’ll review and approve before it appears publicly.
      </p>

      {doneMsg && (
        <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
          {doneMsg}
        </div>
      )}
      {errMsg && (
        <div className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">
          {errMsg}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-6">
        {/* top row */}
        <div className="grid gap-3 sm:grid-cols-[1fr,240px]">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-800">
              Business name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
              placeholder="e.g., Laxey Bakehouse"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-800">
              Slug
            </label>
            <input
              value={slug}
              readOnly
              className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              placeholder="auto-generated"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-800">
            Tagline
          </label>
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
            placeholder="Short one-liner"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-800">
              Category
            </label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
              placeholder="e.g., food-drink, home-trades"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-800">
              Subcategory
            </label>
            <input
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
              placeholder="e.g., Bakery, Plumbing"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-800">
              Area
            </label>
            <input
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
              placeholder="Town/Village"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-800">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
            placeholder="Tell people about the business, services, products…"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-800">
              Website URL
            </label>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="example.com"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-800">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="info@example.com"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
              type="email"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-800">
              Phone
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+44…"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-800">
              Address
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, Town, Postcode"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-800">
            Opening hours
          </label>
          <textarea
            value={openingHours}
            onChange={(e) => setOpeningHours(e.target.value)}
            rows={3}
            placeholder={"Mon–Fri 9–5\nSat 10–4\nSun Closed"}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-800">
            Image URLs (comma or new-line separated)
          </label>
          <textarea
            value={imagesText}
            onChange={(e) => setImagesText(e.target.value)}
            rows={3}
            placeholder={"https://…\nhttps://…"}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
          />
        </div>

        {/* SERVICES */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-800">
              Services & Prices
            </label>
            <button
              type="button"
              onClick={addService}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Add service
            </button>
          </div>

          <div className="space-y-2">
            {services.map((s, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[1fr,160px,auto]">
                <input
                  value={s.name}
                  onChange={(e) =>
                    setServices((p) =>
                      p.map((row, idx) =>
                        idx === i ? { ...row, name: e.target.value } : row
                      )
                    )
                  }
                  placeholder="Service name"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <input
                  value={s.price}
                  onChange={(e) =>
                    setServices((p) =>
                      p.map((row, idx) =>
                        idx === i ? { ...row, price: e.target.value } : row
                      )
                    )
                  }
                  placeholder="£…"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <button
                  type="button"
                  onClick={() => removeService(i)}
                  className="h-10 rounded-lg border border-slate-200 px-3 text-xs text-slate-600 hover:bg-slate-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* REVIEWS */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-800">
              Sample Reviews (optional)
            </label>
            <button
              type="button"
              onClick={addReview}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Add review
            </button>
          </div>

          <div className="space-y-2">
            {reviews.map((r, i) => (
              <div
                key={i}
                className="grid gap-2 sm:grid-cols-[1fr,120px,auto] sm:items-start"
              >
                <input
                  value={r.author}
                  onChange={(e) =>
                    setReviews((p) =>
                      p.map((row, idx) =>
                        idx === i ? { ...row, author: e.target.value } : row
                      )
                    )
                  }
                  placeholder="Author"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={r.rating}
                  onChange={(e) =>
                    setReviews((p) =>
                      p.map((row, idx) =>
                        idx === i
                          ? { ...row, rating: Number(e.target.value) }
                          : row
                      )
                    )
                  }
                  placeholder="Rating 1–5"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <textarea
                  value={r.text}
                  onChange={(e) =>
                    setReviews((p) =>
                      p.map((row, idx) =>
                        idx === i ? { ...row, text: e.target.value } : row
                      )
                    )
                  }
                  placeholder="Short comment…"
                  rows={2}
                  className="sm:col-span-3 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <div className="sm:col-span-3">
                  <button
                    type="button"
                    onClick={() => removeReview(i)}
                    className="rounded-lg border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="boosted"
            type="checkbox"
            checked={wantBoosted}
            onChange={(e) => setWantBoosted(e.target.checked)}
          />
          <label htmlFor="boosted" className="text-sm text-slate-700">
            Request boosted placement
          </label>
        </div>

        <div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center rounded-full bg-[#D90429] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#b80321] disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit for review"}
          </button>
        </div>
      </form>
    </main>
  );
}