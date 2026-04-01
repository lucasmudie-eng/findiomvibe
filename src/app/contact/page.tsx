"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  CalendarDays,
  ShoppingBag,
  Trophy,
  Megaphone,
  HelpCircle,
  UserX,
  Newspaper,
  MessageSquare,
  Bug,
  ChevronRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";

// ─── Topic config ─────────────────────────────────────────────────────────────

type TopicKey =
  | "general"
  | "list-business"
  | "submit-event"
  | "advertising"
  | "marketplace"
  | "sports"
  | "account"
  | "technical"
  | "press"
  | "feedback";

interface TopicConfig {
  key: TopicKey;
  label: string;
  icon: React.ReactNode;
  redirect?: string; // if set, show a redirect card instead of the form
  redirectLabel?: string;
  placeholder: string;
  extraFields?: ExtraField[];
}

interface ExtraField {
  name: string;
  label: string;
  type: "text" | "url" | "select";
  placeholder?: string;
  options?: string[];
  optional?: boolean;
}

const TOPICS: TopicConfig[] = [
  {
    key: "list-business",
    label: "List my business",
    icon: <Building2 className="h-4 w-4" />,
    redirect: "/list-business",
    redirectLabel: "Go to the business listing form",
    placeholder: "Anything else you'd like to tell us about your business?",
  },
  {
    key: "submit-event",
    label: "Submit an event",
    icon: <CalendarDays className="h-4 w-4" />,
    redirect: "/list-event",
    redirectLabel: "Go to the event submission form",
    placeholder: "Any extra details about your event?",
  },
  {
    key: "advertising",
    label: "Advertising & partnerships",
    icon: <Megaphone className="h-4 w-4" />,
    placeholder:
      "Tell us about your business and what kind of promotion you're interested in.",
    extraFields: [
      {
        name: "businessName",
        label: "Business / organisation name",
        type: "text",
        placeholder: "e.g. Manx Motors Ltd",
        optional: true,
      },
      {
        name: "packageInterest",
        label: "Package interest",
        type: "select",
        options: [
          "Not sure yet",
          "Featured listing",
          "Homepage banner",
          "Newsletter sponsor",
          "Event promotion",
          "Custom / discuss",
        ],
      },
    ],
  },
  {
    key: "marketplace",
    label: "Marketplace issue",
    icon: <ShoppingBag className="h-4 w-4" />,
    placeholder:
      "Describe the issue with your listing or a listing you've seen.",
    extraFields: [
      {
        name: "listingUrl",
        label: "Listing URL (if applicable)",
        type: "url",
        placeholder: "https://manxhive.com/marketplace/item/…",
        optional: true,
      },
      {
        name: "issueType",
        label: "Type of issue",
        type: "select",
        options: [
          "My listing isn't showing",
          "Incorrect information",
          "Fraudulent / scam listing",
          "Payment issue",
          "Other",
        ],
      },
    ],
  },
  {
    key: "sports",
    label: "Sports results / fixtures",
    icon: <Trophy className="h-4 w-4" />,
    placeholder:
      "Let us know what's missing or incorrect and we'll look into it.",
    extraFields: [
      {
        name: "sport",
        label: "Sport",
        type: "select",
        options: [
          "Football",
          "Rugby",
          "Cricket",
          "Golf",
          "Athletics",
          "Swimming",
          "Cycling",
          "Other",
        ],
      },
      {
        name: "leagueOrTeam",
        label: "League or team name",
        type: "text",
        placeholder: "e.g. IOMFA Premier League / Ramsey AFC",
        optional: true,
      },
    ],
  },
  {
    key: "account",
    label: "Account / login",
    icon: <UserX className="h-4 w-4" />,
    placeholder: "Describe the account or login issue you're having.",
    extraFields: [
      {
        name: "accountIssue",
        label: "Issue type",
        type: "select",
        options: [
          "Can't log in",
          "Forgot password",
          "Account locked / suspended",
          "Delete my account",
          "Change email address",
          "Other",
        ],
      },
    ],
  },
  {
    key: "technical",
    label: "Technical / bug report",
    icon: <Bug className="h-4 w-4" />,
    placeholder:
      "Describe the bug — what you did, what you expected, and what happened.",
    extraFields: [
      {
        name: "device",
        label: "Device / browser",
        type: "select",
        options: [
          "iPhone (Safari)",
          "iPhone (other browser)",
          "Android",
          "Mac (Safari)",
          "Mac (Chrome / Firefox)",
          "Windows (Chrome / Firefox)",
          "Other",
        ],
      },
      {
        name: "pageUrl",
        label: "Page where the bug occurred",
        type: "url",
        placeholder: "https://manxhive.com/…",
        optional: true,
      },
    ],
  },
  {
    key: "press",
    label: "Press & media",
    icon: <Newspaper className="h-4 w-4" />,
    placeholder: "Tell us about your publication and what you're looking for.",
    extraFields: [
      {
        name: "publication",
        label: "Publication / outlet",
        type: "text",
        placeholder: "e.g. iomtoday.co.im",
        optional: true,
      },
    ],
  },
  {
    key: "feedback",
    label: "Feedback",
    icon: <MessageSquare className="h-4 w-4" />,
    placeholder: "Share your thoughts, suggestions, or ideas with the team.",
  },
  {
    key: "general",
    label: "General enquiry",
    icon: <HelpCircle className="h-4 w-4" />,
    placeholder: "How can we help?",
  },
];

// ─── Input class ──────────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[#D90429] focus:ring-1 focus:ring-[#D90429]";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [selectedTopic, setSelectedTopic] = useState<TopicKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const topic = TOPICS.find((t) => t.key === selectedTopic) ?? null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);

    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const message = String(fd.get("message") || "").trim();

    // Build extra key/value pairs from any extra fields
    const extra: Record<string, string> = {};
    if (topic?.extraFields) {
      for (const field of topic.extraFields) {
        const val = String(fd.get(field.name) || "").trim();
        if (val) extra[field.label] = val;
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          category: topic?.label ?? "General enquiry",
          message,
          extra,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data?.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSuccess(true);
    } catch {
      setErrorMsg("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 space-y-4">
        <Breadcrumb />
        <div className="flex flex-col items-center gap-4 rounded-2xl border bg-white p-10 shadow-sm text-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          <h1 className="text-xl font-semibold text-gray-900">
            Message received!
          </h1>
          <p className="text-sm text-gray-600 max-w-sm">
            Thanks for getting in touch. We aim to reply within 1–2 working
            days. Check your inbox for a confirmation email.
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setSelectedTopic(null);
            }}
            className="mt-2 rounded-full border px-5 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Send another message
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <Breadcrumb />

      {/* Header */}
      <header className="rounded-2xl border bg-white p-5 shadow-sm space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900">Get in touch</h1>
        <p className="text-sm text-gray-600">
          Choose a topic below and we&apos;ll make sure your message gets to the
          right place.
        </p>
      </header>

      {/* Topic picker */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          What can we help with?
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {TOPICS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setSelectedTopic(t.key);
                setErrorMsg(null);
              }}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-colors ${
                selectedTopic === t.key
                  ? "border-[#D90429] bg-[#FFF6F6] text-[#D90429]"
                  : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-white"
              }`}
            >
              <span className="shrink-0">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {/* Redirect card (for topics with dedicated forms) */}
      {topic?.redirect && (
        <section className="rounded-2xl border bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-[#FFF6F6] p-2 text-[#D90429]">
              {topic.icon}
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">{topic.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                We have a dedicated form for this — it only takes a minute.
              </p>
            </div>
          </div>
          <Link
            href={topic.redirect}
            className="flex items-center justify-between rounded-xl bg-[#D90429] px-4 py-3 text-sm font-semibold text-white hover:bg-[#b80321]"
          >
            {topic.redirectLabel}
            <ChevronRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setSelectedTopic(null)}
            className="text-[11px] text-gray-400 hover:underline"
          >
            ← Choose a different topic
          </button>
        </section>
      )}

      {/* Contact form */}
      {topic && !topic.redirect && (
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name + email */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Your name *
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  className={inputCls}
                  placeholder="First and last name"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Email address *
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className={inputCls}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Extra fields for this topic */}
            {topic.extraFields && topic.extraFields.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {topic.extraFields.map((field) =>
                  field.type === "select" ? (
                    <div key={field.name}>
                      <label className="mb-1 block text-xs font-medium text-gray-700">
                        {field.label}
                        {field.optional && (
                          <span className="ml-1 font-normal text-gray-400">
                            (optional)
                          </span>
                        )}
                      </label>
                      <select name={field.name} className={inputCls}>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div key={field.name}>
                      <label className="mb-1 block text-xs font-medium text-gray-700">
                        {field.label}
                        {field.optional && (
                          <span className="ml-1 font-normal text-gray-400">
                            (optional)
                          </span>
                        )}
                      </label>
                      <input
                        name={field.name}
                        type={field.type}
                        className={inputCls}
                        placeholder={field.placeholder}
                      />
                    </div>
                  )
                )}
              </div>
            )}

            {/* Message */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Message *
              </label>
              <textarea
                name="message"
                required
                rows={5}
                className={inputCls}
                placeholder={topic.placeholder}
              />
            </div>

            {/* Error */}
            {errorMsg && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                {errorMsg}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full bg-[#D90429] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#b80321] disabled:opacity-60"
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {loading ? "Sending…" : "Send message"}
              </button>
              <button
                type="button"
                onClick={() => setSelectedTopic(null)}
                className="text-[11px] text-gray-400 hover:underline"
              >
                ← Change topic
              </button>
            </div>

            <p className="text-[10px] text-gray-400">
              We aim to reply within 1–2 working days.
            </p>
          </form>
        </section>
      )}

      {/* Quick links when no topic selected */}
      {!selectedTopic && (
        <section className="rounded-2xl border bg-white p-5 shadow-sm space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Popular links
          </p>
          <div className="space-y-2">
            {[
              { href: "/list-business", label: "Add your business to ManxHive" },
              { href: "/list-event", label: "Submit an event to What's On" },
              { href: "/marketplace", label: "Browse the marketplace" },
              { href: "/whats-on", label: "See upcoming events" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
              >
                {label}
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function Breadcrumb() {
  return (
    <nav className="text-xs text-gray-500">
      <Link href="/" className="hover:underline">
        Home
      </Link>{" "}
      / <span className="text-gray-800">Contact</span>
    </nav>
  );
}
