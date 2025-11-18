// src/app/community-spotlight/page.tsx

import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowRight, MapPin, Sparkles } from "lucide-react";
import { STORIES } from "./stories";

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function CommunitySpotlightPage() {
  const [featured, ...rest] = STORIES;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="mb-1 text-xs text-gray-500">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        / <span className="text-gray-800">Community spotlight</span>
      </nav>

      {/* Page header */}
      <header className="flex flex-col gap-3 rounded-2xl border bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF6F6] px-2 py-1 text-[10px] font-medium text-[#D90429]">
            <Sparkles className="h-3 w-3" />
            Stories from across the Isle of Man
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900">
            Community Spotlight
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            A weekly look at organisations, events, and people using ManxHive to
            bring ideas to life. Real wins. Local stories. Island-first.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 text-xs md:items-end">
          <p className="text-gray-500">
            Want to be featured?{" "}
            <Link
              href="/contact"
              className="font-semibold text-[#D90429] hover:underline"
            >
              Tell us your story
            </Link>
          </p>
          <p className="text-[10px] text-gray-400">
            Curated by the ManxHive team. Light editorial, no pay-to-play.
          </p>
        </div>
      </header>

      {/* Featured story */}
      {featured && (
        <section className="grid gap-4 rounded-2xl border bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1.8fr),minmax(0,1.2fr)]">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 text-[10px] text-gray-500">
              <span className="rounded-full bg-[#FFF6F6] px-2 py-0.5 text-[#D90429]">
                Featured
              </span>
              <span>{featured.tag}</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {featured.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-500">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(featured.date)}
              </span>
              {featured.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {featured.location}
                </span>
              )}
              <span>{featured.readTime}</span>
            </div>
            <p className="mt-1 text-sm text-gray-700">{featured.excerpt}</p>
            <Link
              href={`/community-spotlight/${featured.slug}`}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#D90429] hover:underline"
            >
              Read full story
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-gray-100">
            <Image
              src={featured.image}
              alt={featured.title}
              fill
              className="object-cover"
            />
          </div>
        </section>
      )}

      {/* Remaining stories */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-gray-900">
            Recent spotlights
          </h2>
          <p className="text-[10px] text-gray-500">
            One or two new features each week.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {rest.map((story) => (
            <article
              key={story.slug}
              className="flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm"
            >
              <div className="relative h-24 w-full bg-gray-100">
                <Image
                  src={story.image}
                  alt={story.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1 p-3">
                <div className="flex items-center justify-between gap-1 text-[9px] text-gray-500">
                  <span className="rounded-full bg-[#FFF6F6] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-[#D90429]">
                    {story.tag}
                  </span>
                  <span>{formatDate(story.date)}</span>
                </div>
                <h3 className="line-clamp-2 text-xs font-semibold text-gray-900">
                  {story.title}
                </h3>
                {story.location && (
                  <p className="text-[9px] text-gray-500">
                    <MapPin className="mr-1 inline-block h-3 w-3 align-middle text-gray-400" />
                    {story.location}
                  </p>
                )}
                <p className="mt-0.5 line-clamp-3 text-[10px] text-gray-600">
                  {story.excerpt}
                </p>
                <div className="mt-auto pt-1">
                  <Link
                    href={`/community-spotlight/${story.slug}`}
                    className="inline-flex items-center gap-1 text-[9px] font-semibold text-[#D90429] hover:underline"
                  >
                    Read story
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}