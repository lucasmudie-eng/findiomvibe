import Link from "next/link";
import { MessageSquareQuote, Star, ArrowRight } from "lucide-react";

const starterPrompts = [
  "How was your experience with us this week?",
  "Would you recommend us to another island resident?",
  "What stood out most about the service?",
];

export default function ReviewsPage() {
  return (
    <main className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <MessageSquareQuote className="h-5 w-5 text-[#D90429]" />
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Reviews</h1>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Build trust with honest customer feedback. Reply quickly, keep it kind, and
          highlight what you improved.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Review request starters</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {starterPrompts.map((prompt) => (
              <li key={prompt} className="rounded-lg bg-slate-50 px-3 py-2">
                {prompt}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-amber-300">
            <Star className="h-4 w-4" />
            <h2 className="text-sm font-semibold">What&apos;s landing next</h2>
          </div>
          <p className="mt-2 text-sm text-slate-300">
            We&apos;re adding review moderation, public profile highlights, and saved reply
            templates.
          </p>
          <Link
            href="/provider-help"
            className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-amber-300 hover:underline"
          >
            Ask for early access
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
