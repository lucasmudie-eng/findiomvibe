// src/app/community-spotlight/page.tsx

import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowRight, MapPin, ChevronRight, Sparkles, Clock } from "lucide-react";
import { STORIES } from "./stories";

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function CommunitySpotlightPage() {
  const [featured, ...rest] = STORIES;
  const mostRecent = rest.length ? rest : STORIES.slice(1);
  const mostRead = (rest.length ? rest : STORIES).slice(0, 4);

  return (
    <main className="mx-auto w-full max-w-6xl overflow-x-hidden px-4 py-10 sm:px-6 sm:py-12 lg:px-8 space-y-12">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link href="/" className="hover:text-slate-700 transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-700">Community Spotlight</span>
      </nav>

      {/* ── PAGE HEADER ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E8002D] mb-2">
            Stories from across the Isle of Man
          </p>
          <h1 className="font-playfair text-4xl font-bold text-slate-900 sm:text-5xl">
            Community<br />
            <em>Spotlight.</em>
          </h1>
          <p className="mt-4 max-w-lg text-base text-slate-500 leading-relaxed">
            Real wins, local stories, island-first. A weekly look at the
            organisations, events, and people bringing ideas to life on ManxHive.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">
            Want to be featured?{" "}
            <Link href="/contact" className="font-semibold text-[#E8002D] hover:underline">
              Tell us your story
            </Link>
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Curated by the ManxHive team. Light editorial, no pay-to-play.
          </p>
        </div>
      </div>

      {/* ── FEATURED STORY ───────────────────────────────────────────── */}
      {featured && (
        <section className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg">
          <div className="grid lg:grid-cols-[1fr_480px]">

            {/* Text side */}
            <div className="flex flex-col justify-center gap-5 p-8 sm:p-10 lg:p-12">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#E8002D]/10 px-3 py-1 text-xs font-semibold text-[#E8002D]">
                  <Sparkles className="h-3 w-3" />
                  Featured this week
                </span>
                <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
                  {featured.tag}
                </span>
              </div>

              <h2 className="font-playfair text-2xl font-bold leading-snug text-slate-900 sm:text-3xl lg:text-[2rem]">
                {featured.title}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(featured.date)}
                </span>
                {featured.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {featured.location}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {featured.readTime}
                </span>
              </div>

              <p className="text-base leading-relaxed text-slate-600">
                {featured.excerpt}
              </p>

              <div>
                <Link
                  href={`/community-spotlight/${featured.slug}`}
                  className="inline-flex items-center gap-2 rounded-full bg-[#E8002D] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c00026]"
                >
                  Read full story
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Image side */}
            <div className="relative h-64 w-full lg:h-auto">
              <Image
                src={featured.image}
                alt={featured.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              {/* Subtle overlay for polish */}
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/5" />
            </div>
          </div>
        </section>
      )}

      {/* ── RECENT + SIDEBAR ─────────────────────────────────────────── */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] min-w-0">

        {/* Story grid */}
        <section className="space-y-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E8002D] mb-1">
                Recent spotlights
              </p>
              <h2 className="font-playfair text-2xl font-bold text-slate-900">
                More stories
              </h2>
            </div>
          </div>

          {/* Desktop grid */}
          <div className="hidden sm:grid sm:grid-cols-2 gap-5">
            {mostRecent.map((story) => (
              <article
                key={story.slug}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-[#E8002D]/25 hover:shadow-lg hover:-translate-y-0.5"
              >
                {/* Image */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={story.image}
                    alt={story.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                  />
                  {/* Tag badge over image */}
                  <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 shadow backdrop-blur-sm">
                    {story.tag}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col gap-2.5 p-5">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(story.date)}
                    </span>
                    {story.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {story.location}
                      </span>
                    )}
                  </div>

                  <h3 className="font-playfair text-lg font-bold leading-snug text-slate-900 group-hover:text-[#E8002D] transition-colors line-clamp-2">
                    {story.title}
                  </h3>

                  <p className="line-clamp-3 text-sm leading-relaxed text-slate-500">
                    {story.excerpt}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-400">{story.readTime}</span>
                    <Link
                      href={`/community-spotlight/${story.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#E8002D] hover:underline"
                    >
                      Read story
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Mobile scroll */}
          <div className="sm:hidden flex gap-4 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
            {mostRecent.map((story) => (
              <article
                key={story.slug}
                className="w-72 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="relative h-36 w-full overflow-hidden bg-slate-100">
                  <Image src={story.image} alt={story.title} fill className="object-cover" />
                  <div className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-700 shadow backdrop-blur-sm">
                    {story.tag}
                  </div>
                </div>
                <div className="flex flex-col gap-2 p-4">
                  <p className="text-[10px] text-slate-400">{formatDate(story.date)}</p>
                  <h3 className="font-playfair text-base font-bold leading-snug text-slate-900 line-clamp-2">
                    {story.title}
                  </h3>
                  <p className="line-clamp-2 text-xs text-slate-500">{story.excerpt}</p>
                  <Link
                    href={`/community-spotlight/${story.slug}`}
                    className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#E8002D] hover:underline"
                  >
                    Read story <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── SIDEBAR ────────────────────────────────────────────── */}
        <aside className="space-y-5 min-w-0 overflow-hidden lg:sticky lg:top-24 lg:h-fit">

          {/* Most read */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E8002D] mb-1">
              Trending
            </p>
            <h3 className="font-playfair text-lg font-bold text-slate-900 mb-4">
              Most read
            </h3>

            <ol className="space-y-4">
              {mostRead.map((story, i) => (
                <li key={story.slug} className="flex gap-3 group">
                  <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#E8002D]/10 text-xs font-bold text-[#E8002D]">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <Link
                      href={`/community-spotlight/${story.slug}`}
                      className="block text-sm font-semibold leading-snug text-slate-900 line-clamp-2 group-hover:text-[#E8002D] transition-colors"
                    >
                      {story.title}
                    </Link>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatDate(story.date)} · {story.readTime}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <Link
                href="/community-spotlight"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#E8002D] hover:underline"
              >
                Browse all spotlights
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Feature CTA */}
          <div className="rounded-2xl border border-[#E8002D]/20 bg-white p-5 shadow-sm">
            <h3 className="font-playfair text-lg font-bold text-slate-900 mb-2">
              Share your story<span className="text-[#E8002D]">.</span>
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Running something great on the Isle of Man? We want to hear about
              it. No PR spin — just honest local stories.
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#E8002D] px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#c00026]"
            >
              Get in touch <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
