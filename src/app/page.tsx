import { Suspense } from "react";
import HomePageClient from "./HomePageClient";

function HomePageSkeleton() {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <div className="space-y-8">
        {/* Hero skeleton */}
        <section className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div className="h-3 w-40 rounded-full bg-slate-100" />
            <div className="h-10 w-64 rounded-full bg-slate-100" />
            <div className="h-6 w-80 rounded-full bg-slate-100" />
            <div className="flex gap-3">
              <div className="h-10 w-32 rounded-full bg-slate-100" />
              <div className="h-10 w-32 rounded-full bg-slate-100" />
              <div className="h-10 w-32 rounded-full bg-slate-100" />
            </div>
          </div>
          <div className="h-52 w-full max-w-md rounded-3xl bg-slate-100" />
        </section>

        {/* Row skeletons */}
        <section className="grid gap-6 md:grid-cols-2">
          <div className="h-40 rounded-3xl bg-slate-100" />
          <div className="h-40 rounded-3xl bg-slate-100" />
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="h-40 rounded-3xl bg-slate-100" />
          <div className="h-40 rounded-3xl bg-slate-100" />
        </section>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageClient />
    </Suspense>
  );
}