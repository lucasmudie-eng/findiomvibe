"use client";

import Link from "next/link";
import { Bell, Mail, ShieldCheck, ArrowRight } from "lucide-react";
import PushPreferences from "@/app/components/PushPreferences";

export default function SettingsPage() {
  return (
    <main className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage notification routes, contact preferences, and account safety.
        </p>
      </header>

      {/* Push notifications */}
      <PushPreferences />

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-900">
            <Mail className="h-4 w-4 text-[#D90429]" />
            <h2 className="text-sm font-semibold">Email notifications</h2>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Email alerts are active for new enquiries and listing activity.
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-900">
            <ShieldCheck className="h-4 w-4 text-[#D90429]" />
            <h2 className="text-sm font-semibold">Security</h2>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Password and session controls are managed through your account provider.
          </p>
        </article>
      </section>

      <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-slate-100 shadow-sm">
        <p className="text-sm text-slate-200">
          Need a setting changed before this panel is fully wired?
        </p>
        <Link
          href="/provider-help"
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-amber-300 hover:underline"
        >
          Contact provider support
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </main>
  );
}
