// src/app/components/ProfileCompletion.tsx
"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export type CompletionItem = {
  id: string;
  label: string;
  done: boolean;
  hint?: string;
  actionHref?: string; // e.g. /providers/manage?focus=logo
};

export default function ProfileCompletion({ items }: { items: CompletionItem[] }) {
  const total = items.length;
  const done = items.filter(i => i.done).length;
  const pct = Math.round((done / Math.max(1, total)) * 100);
  const allDone = done === total;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Profile completeness</h2>
          <p className="text-sm text-gray-600">Improve your listing to boost enquiries.</p>
        </div>
        {allDone && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            100% complete
          </span>
        )}
      </div>

      {/* Progress */}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-2 rounded-full bg-[#D90429] transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 text-sm text-gray-500">{pct}% complete</div>

      {/* Tasks */}
      <div className="mt-4 grid grid-cols-1 gap-2">
        {items.map((it) => (
          <div
            key={it.id}
            className="flex items-start justify-between rounded-xl border border-gray-100 bg-white p-3"
          >
            <div className="pr-3">
              <div className="flex items-center gap-2">
                <span
                  className={
                    "inline-block h-2.5 w-2.5 rounded-full " +
                    (it.done ? "bg-emerald-500" : "bg-gray-300")
                  }
                />
                <span className={"text-sm " + (it.done ? "text-gray-500 line-through" : "text-gray-900")}>
                  {it.label}
                </span>
              </div>
              {!it.done && it.hint && (
                <div className="mt-1 pl-5 text-xs text-gray-500">{it.hint}</div>
              )}
            </div>

            {!it.done && it.actionHref && (
              <Link
                href={it.actionHref}
                className="shrink-0 rounded-lg border px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50"
              >
                Complete
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}