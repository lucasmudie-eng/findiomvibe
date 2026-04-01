// src/app/list-business/page.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react";

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

type StepKey = 0 | 1 | 2 | 3 | 4;

/** Opening-hours structured row */
type OpeningHoursRow = {
  key: string;
  label: string;
  open: string;
  close: string;
  closed: boolean;
};

const STEPS: { id: StepKey; label: string; description: string }[] = [
  { id: 0, label: "Basics", description: "Name, tagline, category and area" },
  {
    id: 1,
    label: "Contact",
    description: "Website, email, phone and address",
  },
  {
    id: 2,
    label: "Details",
    description: "Description, opening hours and key info",
  },
  {
    id: 3,
    label: "Media",
    description: "Images, services & sample reviews",
  },
  {
    id: 4,
    label: "Review",
    description: "Double-check everything, then submit",
  },
];

/** --- static config for dropdowns --- */

// Adjust later to mirror your main business config
const CATEGORY_OPTIONS: {
  slug: string;
  label: string;
  subcategories: string[];
}[] = [
  {
    slug: "food-drink",
    label: "Food & drink",
    subcategories: ["Bakery", "Cafe", "Restaurant", "Takeaway", "Pub & bar"],
  },
  {
    slug: "home-trades",
    label: "Home trades",
    subcategories: [
      "Plumbing",
      "Electrical",
      "Building",
      "Landscaping",
      "Cleaning",
    ],
  },
  {
    slug: "fitness-wellbeing",
    label: "Fitness & wellbeing",
    subcategories: ["Gym", "Personal training", "Yoga / Pilates", "Therapist"],
  },
  {
    slug: "professional-services",
    label: "Professional services",
    subcategories: ["Accountant", "Solicitor", "Consultant", "Marketing"],
  },
  {
    slug: "kids-family",
    label: "Kids & family",
    subcategories: ["Childcare", "Clubs & classes", "Party services"],
  },
  {
    slug: "auto",
    label: "Cars & transport",
    subcategories: ["Garage", "Valeting", "Taxi / transport"],
  },
];

const AREA_OPTIONS: { value: string; label: string }[] = [
  { value: "Douglas", label: "Douglas" },
  { value: "Onchan", label: "Onchan" },
  { value: "Peel", label: "Peel" },
  { value: "Ramsey", label: "Ramsey" },
  { value: "Castletown", label: "Castletown" },
  { value: "Port Erin", label: "Port Erin" },
  { value: "Port St Mary", label: "Port St Mary" },
  { value: "Laxey", label: "Laxey" },
  { value: "Central", label: "Central (other villages)" },
  { value: "North", label: "North (other villages)" },
  { value: "South", label: "South (other villages)" },
  { value: "West", label: "West (other villages)" },
  { value: "Island-wide", label: "Island-wide / mobile" },
  { value: "other", label: "Other / not listed" },
];

// 30-min time options 06:00–22:00
const TIME_OPTIONS: string[] = (() => {
  const out: string[] = [];
  for (let h = 6; h <= 22; h++) {
    for (const m of [0, 30]) {
      const hh = h.toString().padStart(2, "0");
      const mm = m.toString().padStart(2, "0");
      out.push(`${hh}:${mm}`);
    }
  }
  return out;
})();

const DEFAULT_OPENING_HOURS: OpeningHoursRow[] = [
  { key: "mon", label: "Monday", open: "09:00", close: "17:00", closed: false },
  { key: "tue", label: "Tuesday", open: "09:00", close: "17:00", closed: false },
  {
    key: "wed",
    label: "Wednesday",
    open: "09:00",
    close: "17:00",
    closed: false,
  },
  {
    key: "thu",
    label: "Thursday",
    open: "09:00",
    close: "17:00",
    closed: false,
  },
  { key: "fri", label: "Friday", open: "09:00", close: "17:00", closed: false },
  { key: "sat", label: "Saturday", open: "10:00", close: "16:00", closed: false },
  { key: "sun", label: "Sunday", open: "00:00", close: "00:00", closed: true },
];

export default function ListBusinessPage() {
  const supabase = supabaseBrowser();

  const [step, setStep] = useState<StepKey>(0);

  // core fields
  const [name, setName] = useState("");
  const slug = useMemo(() => (name ? slugify(name) : ""), [name]);
  const [tagline, setTagline] = useState("");

  // category / subcategory (with “other” flows)
  const [categorySlug, setCategorySlug] = useState("");
  const [subcategoryValue, setSubcategoryValue] = useState("");
  const [categoryOther, setCategoryOther] = useState("");
  const [subcategoryOther, setSubcategoryOther] = useState("");

  // area / town
  const [areaValue, setAreaValue] = useState("");
  const [areaOther, setAreaOther] = useState("");

  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // structured opening hours
  const [openingHoursRows, setOpeningHoursRows] =
    useState<OpeningHoursRow[]>(DEFAULT_OPENING_HOURS);

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

  const activeCategory = CATEGORY_OPTIONS.find((c) => c.slug === categorySlug);
  const categorySubcategories = activeCategory?.subcategories ?? [];

  /** --- add/remove rows --- */
  const addService = () => setServices((p) => [...p, { name: "", price: "" }]);
  const removeService = (i: number) =>
    setServices((p) => p.filter((_, idx) => idx !== i));

  const addReview = () =>
    setReviews((p) => [...p, { author: "", rating: 5, text: "" }]);
  const removeReview = (i: number) =>
    setReviews((p) => p.filter((_, idx) => idx !== i));

  /** --- opening hours updates --- */
  const updateOpeningRow = (
    key: string,
    patch: Partial<Pick<OpeningHoursRow, "open" | "close" | "closed">>
  ) => {
    setOpeningHoursRows((rows) =>
      rows.map((row) =>
        row.key === key
          ? {
              ...row,
              ...patch,
            }
          : row
      )
    );
  };

  /** derive final values used for payload + review */
  const finalCategorySlugOrOther = (() => {
    if (categorySlug) return categorySlug;
    return categoryOther.trim() || "";
  })();

  const finalSubcategory = (() => {
    if (subcategoryValue === "other") return subcategoryOther.trim() || "";
    if (subcategoryValue) return subcategoryValue;
    return subcategoryOther.trim() || "";
  })();

  const finalArea = (() => {
    if (!areaValue) return areaOther.trim() || "";
    if (areaValue === "other") return areaOther.trim() || "";
    return areaValue;
  })();

  const categoryLabelForReview = (() => {
    if (categorySlug) {
      const cat = CATEGORY_OPTIONS.find((c) => c.slug === categorySlug);
      return cat?.label ?? categorySlug;
    }
    return categoryOther || "—";
  })();

  const areaLabelForReview = (() => {
    if (areaValue === "other") return areaOther || "Other";
    if (areaValue) {
      const opt = AREA_OPTIONS.find((a) => a.value === areaValue);
      return opt?.label ?? areaValue;
    }
    return areaOther || "—";
  })();

  const openingHoursText = openingHoursRows
    .map((row) =>
      row.closed
        ? `${row.label}: Closed`
        : `${row.label}: ${row.open}–${row.close}`
    )
    .join("\n");

  /** --- step validation --- */
  function validateStep(current: StepKey): boolean {
    setErrMsg(null);

    if (current === 0) {
      if (!name.trim()) {
        setErrMsg("Please enter the business name.");
        return false;
      }

      if (!finalCategorySlugOrOther) {
        setErrMsg("Please choose a category or select Other and describe it.");
        return false;
      }

      if (!finalArea) {
        setErrMsg("Please choose an area / town (or specify Other).");
        return false;
      }
    }

    if (current === 1) {
      if (!email.trim() && !phone.trim()) {
        setErrMsg(
          "Add at least an email or a phone number so people can contact you."
        );
        return false;
      }
    }

    if (current === 2) {
      for (const row of openingHoursRows) {
        if (!row.closed && (!row.open || !row.close)) {
          setErrMsg(`Please set hours or mark ${row.label} as closed.`);
          return false;
        }
      }
    }

    return true;
  }

  function goNext() {
    if (!validateStep(step)) return;
    if (step < 4) setStep((s) => (s + 1) as StepKey);
  }

  function goBack() {
    setErrMsg(null);
    if (step > 0) setStep((s) => (s - 1) as StepKey);
  }

  /** --- submit --- */
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrMsg(null);
    setDoneMsg(null);

    // run full validation again
    if (!name.trim()) return setErrMsg("Please enter the business name.");
    if (!finalCategorySlugOrOther)
      return setErrMsg("Please choose a category or describe it.");
    if (!finalArea)
      return setErrMsg("Please choose an area / town (or specify Other).");

    for (const row of openingHoursRows) {
      if (!row.closed && (!row.open || !row.close)) {
        return setErrMsg(`Please set hours or mark ${row.label} as closed.`);
      }
    }

    const cleanName = toProperCase(name);
    const cleanTagline = tagline ? toProperCase(tagline) : "";

    const cleanedServices = services
      .map((s) => ({
        name: s.name.trim() ? toProperCase(s.name) : "",
        price: s.price.trim(),
      }))
      .filter((s) => s.name || s.price);

    for (const s of cleanedServices) {
      if (s.name && !hasSeparator(s.name))
        return setErrMsg(
          "Please add a space, period, or dash in each service name so it reads naturally."
        );
    }

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
          "Please add a space, period, or dash in each review comment so it reads naturally."
        );
    }

    const images = imagesText
      .split(/[\n,]+/g)
      .map((u) => u.trim())
      .filter(Boolean);

    const website_url =
      website && !/^https?:\/\//i.test(website) ? `https://${website}` : website;

    setSubmitting(true);
    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();

      if (userErr) throw userErr;
      if (!user) throw new Error("You must be logged in to list a business.");

      // try to find provider row to link as provider_id
      let providerId: string | null = null;
      try {
        const { data: providerRow, error: providerErr } = await supabase
          .from("providers")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (providerErr) {
          console.warn(
            "[list-business] provider lookup error:",
            providerErr.message
          );
        } else if (providerRow?.id) {
          providerId = providerRow.id as string;
        }
      } catch (provErr) {
        console.warn("[list-business] provider lookup unexpected:", provErr);
      }

      // If they request boosted, record it in description for moderation
      const boostedNote = wantBoosted
        ? "\n\n[Boosted placement requested]"
        : "";

      const payload = {
        name: cleanName,
        slug: slug || null,
        tagline: cleanTagline || null,
        category: finalCategorySlugOrOther || null, // store slug or custom text
        subcategory: finalSubcategory || null,
        area: finalArea || null,

        description: (description || "").trim() + boostedNote || null,
        website_url: website_url || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
        opening_hours: openingHoursText || null,

        images: images.length ? images : null,

        services_json: cleanedServices.length ? cleanedServices : null,
        reviews_json: cleanedReviews.length ? cleanedReviews : null,

        // moderation + RLS-required fields
        status: "pending",
        approved: false,
        boosted: false,
        submitted_by: user.id,
        provider_id: providerId,
      };

      const { error } = await supabase.from("businesses").insert([payload]);
      if (error) throw error;

      setDoneMsg(
        "Thanks! Your business was submitted. We’ll review and publish it shortly."
      );

      // reset everything
      setStep(0);
      setName("");
      setTagline("");
      setCategorySlug("");
      setSubcategoryValue("");
      setCategoryOther("");
      setSubcategoryOther("");
      setAreaValue("");
      setAreaOther("");
      setDescription("");
      setWebsite("");
      setEmail("");
      setPhone("");
      setAddress("");
      setOpeningHoursRows(DEFAULT_OPENING_HOURS);
      setImagesText("");
      setServices([{ name: "", price: "" }]);
      setReviews([{ author: "", rating: 5, text: "" }]);
      setWantBoosted(false);
    } catch (err: any) {
      console.error("[list-business] submit error:", err);
      setErrMsg(err.message || "Could not submit right now.");
    } finally {
      setSubmitting(false);
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-slate-400">
            Provider tools
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            List your business on ManxHive
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Tell us about your business and we&apos;ll create a profile that can
            show in search, categories and local discovery.
          </p>
        </div>
        <Link
          href="/provider-dashboard"
          className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 sm:mt-0"
        >
          Back to provider dashboard
        </Link>
      </header>

      {/* Global messages */}
      {doneMsg && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4" />
          <div>
            <p>{doneMsg}</p>
            <p className="mt-1 text-xs text-emerald-900/80">
              You can track performance from your{" "}
              <Link
                href="/provider-dashboard"
                className="underline underline-offset-2"
              >
                provider dashboard
              </Link>
              .
            </p>
          </div>
        </div>
      )}
      {errMsg && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {errMsg}
        </div>
      )}

      {/* Stepper */}
      <section className="mb-6 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between text-[11px] text-slate-600">
          <span>
            Step {step + 1} of {STEPS.length}:{" "}
            <span className="font-medium text-slate-900">
              {STEPS[step].label}
            </span>
          </span>
          <span className="hidden text-slate-400 sm:block">{STEPS[step].description}</span>
        </div>
        <div className="relative h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-slate-900 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
          {STEPS.map((s) => {
            const isPast = s.id < step;
            const isCurrent = s.id === step;
            return (
              <div
                key={s.id}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <div
                  className={
                    "flex h-5 w-5 items-center justify-center rounded-full border text-[10px] " +
                    (isCurrent
                      ? "border-slate-900 bg-slate-900 text-white"
                      : isPast
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-slate-200 bg-white text-slate-400")
                  }
                >
                  {isPast ? "✓" : s.id + 1}
                </div>
                <span className="hidden truncate text-[9px] sm:block">
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Form wrapper */}
      <form
        onSubmit={onSubmit}
        className="space-y-6 rounded-2xl border bg-white p-5 shadow-sm"
      >
        {/* Step content */}
        {step === 0 && (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Basics about your business
            </h2>
            <p className="text-[11px] text-slate-500">
              Start with the essentials. You can always refine these later.
            </p>

            <div className="grid gap-3 sm:grid-cols-[1.4fr,1fr]">
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
                <p className="mt-1 text-[11px] text-slate-400">
                  Use the name customers recognise.
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-800">
                  Profile URL slug
                </label>
                <input
                  value={slug}
                  readOnly
                  className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  placeholder="auto-generated"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  This is used in your public URL.
                </p>
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
                placeholder="Short one-liner that sums you up"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {/* Category */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-800">
                  Category
                </label>
                <select
                  value={categorySlug || (categoryOther ? "other" : "")}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "other") {
                      setCategorySlug("");
                    } else {
                      setCategorySlug(value);
                      setCategoryOther("");
                    }
                    setSubcategoryValue("");
                    setSubcategoryOther("");
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                >
                  <option value="">Select category…</option>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.label}
                    </option>
                  ))}
                  <option value="other">Other (not listed)</option>
                </select>
                <p className="mt-1 text-[11px] text-slate-400">
                  Choose the closest fit. If truly different, pick “Other”.
                </p>
                {!categorySlug && (
                  <div className="mt-2">
                    <input
                      value={categoryOther}
                      onChange={(e) => setCategoryOther(e.target.value)}
                      placeholder="If Other, briefly describe (e.g., farm experiences)"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-slate-900/10"
                    />
                  </div>
                )}
              </div>

              {/* Subcategory */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-800">
                  Subcategory
                </label>
                {categorySlug && categorySubcategories.length > 0 ? (
                  <>
                    <select
                      value={
                        subcategoryValue || (subcategoryOther ? "other" : "")
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "other") {
                          setSubcategoryValue("other");
                        } else {
                          setSubcategoryValue(value);
                          setSubcategoryOther("");
                        }
                      }}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                    >
                      <option value="">Select subcategory…</option>
                      {categorySubcategories.map((sc) => (
                        <option key={sc} value={sc}>
                          {sc}
                        </option>
                      ))}
                      <option value="other">Other</option>
                    </select>
                    {subcategoryValue === "other" && (
                      <div className="mt-2">
                        <input
                          value={subcategoryOther}
                          onChange={(e) => setSubcategoryOther(e.target.value)}
                          placeholder="Describe the subcategory"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-slate-900/10"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <input
                    value={subcategoryOther}
                    onChange={(e) => setSubcategoryOther(e.target.value)}
                    placeholder="e.g., Bakery, Plumbing"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                )}
              </div>

              {/* Area / town */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-800">
                  Area / town
                </label>
                <select
                  value={areaValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    setAreaValue(value);
                    if (value !== "other") setAreaOther("");
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                >
                  <option value="">Select area…</option>
                  {AREA_OPTIONS.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
                {areaValue === "other" && (
                  <div className="mt-2">
                    <input
                      value={areaOther}
                      onChange={(e) => setAreaOther(e.target.value)}
                      placeholder="Village / area (e.g., Crosby)"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-slate-900/10"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">
              How can people contact you?
            </h2>
            <p className="text-[11px] text-slate-500">
              Add at least one contact method so customers can reach you.
            </p>

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
                <p className="mt-1 text-[11px] text-slate-400">
                  We&apos;ll automatically add https:// if needed.
                </p>
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
          </section>
        )}

        {step === 2 && (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Tell people what you do
            </h2>
            <p className="text-[11px] text-slate-500">
              A clear description and opening times help customers decide quickly.
            </p>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                placeholder="Tell people about the business, services, products…"
              />
            </div>

            {/* Structured opening hours */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-800">
                Opening hours
              </label>
              <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                {openingHoursRows.map((row) => (
                  <div
                    key={row.key}
                    className="grid items-center gap-2 sm:grid-cols-[120px,1fr,1fr,auto]"
                  >
                    <div className="text-xs font-medium text-slate-700">
                      {row.label}
                    </div>

                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-slate-500">Opens</span>
                      <select
                        disabled={row.closed}
                        value={row.open}
                        onChange={(e) =>
                          updateOpeningRow(row.key, { open: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs outline-none disabled:bg-slate-100"
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-slate-500">Closes</span>
                      <select
                        disabled={row.closed}
                        value={row.close}
                        onChange={(e) =>
                          updateOpeningRow(row.key, { close: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs outline-none disabled:bg-slate-100"
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <label className="flex items-center justify-end gap-2 text-[11px] text-slate-600">
                      <input
                        type="checkbox"
                        checked={row.closed}
                        onChange={(e) =>
                          updateOpeningRow(row.key, { closed: e.target.checked })
                        }
                      />
                      Closed
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-6">
            <h2 className="text-sm font-semibold text-slate-900">
              Media, services & social proof
            </h2>
            <p className="text-[11px] text-slate-500">
              Add a few images, your core services and optional sample reviews.
            </p>

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
              <p className="mt-1 text-[11px] text-slate-400">
                You can add up to several images now and more later via support.
              </p>
            </div>

            {/* SERVICES */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-800">
                  Services & prices
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
                  <div
                    key={i}
                    className="grid gap-2 sm:grid-cols-[1fr,160px,auto]"
                  >
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
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
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
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
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
                  Sample reviews (optional)
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
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
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
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
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
                      className="w-full sm:col-span-3 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
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
                Request boosted placement (we’ll contact you about options)
              </label>
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Review your listing
            </h2>
            <p className="text-[11px] text-slate-500">
              Quick summary before you submit. You can still go back to tweak
              anything.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border bg-slate-50 p-3 text-[12px] text-slate-700">
                <h3 className="mb-2 text-xs font-semibold text-slate-900">
                  Basics
                </h3>
                <p>
                  <span className="font-medium">Name:</span> {name || "—"}
                </p>
                <p>
                  <span className="font-medium">Tagline:</span>{" "}
                  {tagline || "—"}
                </p>
                <p>
                  <span className="font-medium">Category:</span>{" "}
                  {categoryLabelForReview}
                </p>
                <p>
                  <span className="font-medium">Subcategory:</span>{" "}
                  {finalSubcategory || "—"}
                </p>
                <p>
                  <span className="font-medium">Area:</span>{" "}
                  {areaLabelForReview}
                </p>
              </div>

              <div className="rounded-xl border bg-slate-50 p-3 text-[12px] text-slate-700">
                <h3 className="mb-2 text-xs font-semibold text-slate-900">
                  Contact
                </h3>
                <p>
                  <span className="font-medium">Website:</span>{" "}
                  {website || "—"}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {email || "—"}
                </p>
                <p>
                  <span className="font-medium">Phone:</span> {phone || "—"}
                </p>
                <p>
                  <span className="font-medium">Address:</span>{" "}
                  {address || "—"}
                </p>
              </div>
            </div>

            <div className="rounded-xl border bg-slate-50 p-3 text-[12px] text-slate-700">
              <h3 className="mb-2 text-xs font-semibold text-slate-900">
                Description & hours
              </h3>
              <p className="whitespace-pre-wrap">
                {description || "No description added yet."}
              </p>
              <div className="mt-3">
                <p className="font-medium">Opening hours</p>
                <p className="whitespace-pre-wrap">
                  {openingHoursText || "Not specified."}
                </p>
              </div>
            </div>

            <div className="rounded-xl border bg-slate-50 p-3 text-[12px] text-slate-700">
              <h3 className="mb-2 text-xs font-semibold text-slate-900">
                Media & extras
              </h3>
              <p>
                <span className="font-medium">Image URLs:</span>{" "}
                {imagesText
                  ? imagesText
                      .split(/[\n,]+/g)
                      .map((s) => s.trim())
                      .filter(Boolean).length
                  : 0}{" "}
                added
              </p>
              <p>
                <span className="font-medium">Services:</span>{" "}
                {services.filter((s) => s.name || s.price).length}
              </p>
              <p>
                <span className="font-medium">Sample reviews:</span>{" "}
                {reviews.filter((r) => r.author || r.text).length}
              </p>
              {wantBoosted && (
                <p className="mt-2 text-amber-700">
                  ⚡ You&apos;ve requested boosted placement. We&apos;ll follow
                  up with you.
                </p>
              )}
            </div>
          </section>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0 || submitting}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <ArrowLeft className="h-3 w-3" />
            Back
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
            >
              Next step
              <ArrowRight className="h-3 w-3" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#D90429] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#b80321] disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit for review"}
            </button>
          )}
        </div>
      </form>
    </main>
  );
}