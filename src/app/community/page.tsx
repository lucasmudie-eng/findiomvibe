// src/app/community/page.tsx
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  MapPin,
  Sparkles,
  ChevronRight,
} from "lucide-react";

type SpotlightStory = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  location?: string;
  category: "Business" | "Sport" | "Community" | "Youth";
  imageUrl?: string;
  readingTime?: string;
};

const STORIES: SpotlightStory[] = [
  {
    slug: "local-plumber-gives-back",
    title: "Local plumber completes 100 free safety checks for elderly residents",
    excerpt:
      "ManxHive providers aren’t just selling services — they’re backing the community. One small business turned bookings into genuine impact.",
    date: "2025-03-01",
    location: "Douglas",
    category: "Business",
    imageUrl: "/placeholder/community-plumber.jpg",
    readingTime: "4 min read",
  },
  {
    slug: "peel-sailing-club-open-day",
    title: "Peel Sailing Club opens the season with a record turnout",
    excerpt:
      "A breezy afternoon, youth teams, and a packed harbour as new members joined for the summer launch.",
    date: "2025-02-26",
    location: "Peel",
    category: "Community",
    imageUrl: "/placeholder/community-sailing.jpg",
    readingTime: "3 min read",
  },
  {
    slug: "youth-football-success",
    title: "U16s lift the Manx Cup in dramatic late comeback",
    excerpt:
      "A packed crowd, last-minute winner, and a pathway from grassroots to glory.",
    date: "2025-02-22",
    location: "Onchan",
    category: "Sport",
    imageUrl: "/placeholder/community-football.jpg",
    readingTime: "5 min read",
  },
  {
    slug: "ramsey-community-kitchen",
    title: "Ramsey’s community kitchen delivers 1,000th meal",
    excerpt:
      "A milestone celebration for the volunteers helping families keep warm and fed through winter.",
    date: "2025-02-18",
    location: "Ramsey",
    category: "Community",
    imageUrl: "/placeholder/community-kitchen.jpg",
    readingTime: "4 min read",
  },
  {
    slug: "town-cleanup",
    title: "Over 60 volunteers join Peel beach clean",
    excerpt:
      "Local groups and businesses team up to keep our coastline spotless.",
    date: "2025-02-10",
    location: "Peel",
    category: "Community",
    imageUrl: "/placeholder/community-cleanup.jpg",
    readingTime: "3 min read",
  },
  {
    slug: "youth-tech-workshop",
    title: "Young makers showcase creative tech projects at the Villa",
    excerpt:
      "From robotics to wearable art, the youth workshop proved the island’s next generation is ready.",
    date: "2025-02-06",
    location: "Douglas",
    category: "Youth",
    imageUrl: "/placeholder/community-tech.jpg",
    readingTime: "4 min read",
  },
];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function categoryTone(category: SpotlightStory["category"]) {
  switch (category) {
    case "Business":
      return "bg-emerald-50 text-emerald-700";
    case "Sport":
      return "bg-indigo-50 text-indigo-700";
    case "Youth":
      return "bg-amber-50 text-amber-700";
    default:
      return "bg-rose-50 text-rose-700";
  }
}

export default function CommunityPage() {
  const [featured, second, third, ...rest] = STORIES;
  const latest = rest.slice(0, 4);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-8 overflow-x-hidden">
      {/* Breadcrumb */}
      <nav className="mb-1 text-xs text-gray-500">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        / <span className="text-gray-800">Community Spotlight</span>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-7 text-white shadow-md md:p-9">
        <div className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full bg-[#D90429]/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-slate-700/30 blur-2xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.3fr,1fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/80">
              <Sparkles className="h-3 w-3" />
              Community Spotlight
            </div>
            <h1 className="mt-3 font-playfair text-3xl font-bold text-white sm:text-4xl">
              Stories that prove the island is thriving
              <span className="text-[#D90429]">.</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm text-slate-300">
              A curated feed of local wins, causes, youth stories and community
              moments. Short reads, big impact, and always island‑first.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
              {["Success stories", "Grassroots sport", "Good causes", "Youth talent"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/10 px-3 py-1 text-white/70"
                  >
                    {tag}
                  </span>
                )
              )}
            </div>
            <div className="mt-5 flex flex-wrap gap-3 text-xs">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 font-semibold text-slate-900 shadow-sm hover:bg-slate-100"
              >
                Submit a story
                <ArrowRight className="h-3 w-3" />
              </Link>
              <Link
                href="/community"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 font-semibold text-white hover:bg-white/5"
              >
                View all stories
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {featured && (
            <Link
              href={`/community/${featured.slug}`}
              className="group relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-2xl border border-white/10 bg-slate-800 p-5 text-white shadow-sm"
            >
              {featured.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featured.imageUrl}
                  alt={featured.title}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(217,4,41,0.35),rgba(15,23,42,0.9)_70%)]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="relative z-10">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-[9px] font-semibold ${categoryTone(
                    featured.category
                  )}`}
                >
                  {featured.category}
                </span>
                <h2 className="mt-3 font-playfair text-xl font-bold">
                  {featured.title}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm text-white/80">
                  {featured.excerpt}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-white/70">
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
                  {featured.readingTime && <span>{featured.readingTime}</span>}
                </div>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* Editor's picks */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            Editor&apos;s picks
          </h2>
          <Link
            href="/community"
            className="text-[11px] font-semibold text-[#D90429] hover:underline"
          >
            See all
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[second, third, rest[0]].filter(Boolean).map((story) => (
            <Link
              key={story!.slug}
              href={`/community/${story!.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="relative h-32 w-full overflow-hidden bg-slate-100">
                {story!.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={story!.imageUrl}
                    alt={story!.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                    Image coming soon
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <span
                  className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[9px] font-semibold ${categoryTone(
                    story!.category
                  )}`}
                >
                  {story!.category}
                </span>
                <h3 className="font-playfair line-clamp-2 text-sm font-bold text-slate-900">
                  {story!.title}
                </h3>
                <p className="line-clamp-3 text-[11px] text-slate-600">
                  {story!.excerpt}
                </p>
                <div className="mt-auto flex items-center justify-between text-[10px] text-slate-500">
                  <span>{formatDate(story!.date)}</span>
                  {story!.readingTime && <span>{story!.readingTime}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest stories */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            Latest from the island
          </h2>
          <span className="text-[10px] text-slate-500">
            Updated weekly
          </span>
        </div>
        <div className="grid gap-4">
          {latest.map((story) => (
            <Link
              key={story.slug}
              href={`/community/${story.slug}`}
              className="group grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[180px,1fr]"
            >
              <div className="relative h-32 overflow-hidden rounded-xl bg-slate-100">
                {story.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={story.imageUrl}
                    alt={story.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                    Image coming soon
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[9px] font-semibold ${categoryTone(
                      story.category
                    )}`}
                  >
                    {story.category}
                  </span>
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
                <h3 className="font-playfair text-base font-bold text-slate-900">
                  {story.title}
                </h3>
                <p className="line-clamp-2 text-[11px] text-slate-600">
                  {story.excerpt}
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D90429]">
                  Read story
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center">
        <h3 className="text-lg font-semibold text-slate-900">
          Have a story the island should hear?
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          We’re always looking for local wins, grassroots highlights, and
          projects that deserve more attention.
        </p>
        <Link
          href="/contact"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#D90429] px-5 py-2 text-xs font-semibold text-white hover:bg-[#b40320]"
        >
          Share your story
          <ArrowRight className="h-3 w-3" />
        </Link>
      </section>
    </main>
  );
}
