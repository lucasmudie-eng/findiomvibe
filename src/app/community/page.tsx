// src/app/community/page.tsx
import Link from "next/link";
import { Calendar, MapPin, ArrowRight, Sparkles } from "lucide-react";

type SpotlightStory = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  location?: string;
  category: "Business" | "Sport" | "Community" | "Youth";
  imageUrl?: string;
};

const STORIES: SpotlightStory[] = [
  {
    slug: "local-plumber-gives-back",
    title: "Local plumber completes 100 free safety checks for elderly residents",
    excerpt:
      "ManxHive providers aren’t just selling services – they’re supporting the community. See how one small business turned bookings into genuine impact.",
    date: "2025-03-01",
    location: "Douglas",
    category: "Business",
    imageUrl: "/placeholder/community-plumber.jpg",
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

export default function CommunityPage() {
  const [featured, ...rest] = STORIES;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="mb-1 text-xs text-gray-500">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        / <span className="text-gray-800">Community Spotlight</span>
      </nav>

      {/* Hero */}
      <section className="flex flex-col gap-4 rounded-2xl border bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF5F5] px-3 py-1 text-[10px] font-medium text-[#D90429]">
            <Sparkles className="h-3 w-3" />
            Community Spotlight
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900">
            Stories from around the island
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Celebrating local wins, good causes, youth success, and ManxHive
            providers making a difference. Curated, short reads — no noise.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
              Success stories
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
              Grassroots sport
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
              Community projects
            </span>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 text-xs">
          <p className="text-gray-600">
            Have a story we should feature?
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium text-gray-800 hover:bg-gray-50"
          >
            Submit a story
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </section>

      {/* Featured story */}
      {featured && (
        <section className="grid gap-4 rounded-2xl border bg-white p-4 shadow-sm md:grid-cols-[2fr,1.5fr]">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 text-[10px] text-gray-500">
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-gray-700">
                {featured.category}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                {formatDate(featured.date)}
              </span>
              {featured.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-gray-400" />
                  {featured.location}
                </span>
              )}
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {featured.title}
            </h2>
            <p className="text-sm text-gray-600">
              {featured.excerpt}
            </p>
            <Link
              href={`/community/${featured.slug}`}
              className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-[#D90429] hover:underline"
            >
              Read full story
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Image slot */}
          <div className="relative h-40 w-full overflow-hidden rounded-xl bg-gray-100">
            {featured.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={featured.imageUrl}
                alt={featured.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center px-4 text-center text-[10px] text-gray-400">
                Drop a feature image here later (e.g. upload via CMS or Supabase
                Storage).
              </div>
            )}
          </div>
        </section>
      )}

      {/* Other stories */}
      <section className="grid gap-4 md:grid-cols-3">
        {rest.map((story) => (
          <article
            key={story.slug}
            className="flex flex-col overflow-hidden rounded-2xl border bg-white text-xs shadow-sm"
          >
            <div className="h-24 w-full bg-gray-100">
              {story.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={story.imageUrl}
                  alt={story.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center px-3 text-[9px] text-gray-400">
                  Image placeholder for this story.
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1 p-3">
              <div className="flex items-center justify-between gap-2 text-[9px] text-gray-500">
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-gray-700">
                  {story.category}
                </span>
                <span>{formatDate(story.date)}</span>
              </div>
              <h3 className="line-clamp-2 text-[13px] font-semibold text-gray-900">
                {story.title}
              </h3>
              <p className="line-clamp-3 text-[10px] text-gray-600">
                {story.excerpt}
              </p>
              {story.location && (
                <p className="mt-auto inline-flex items-center gap-1 text-[9px] text-gray-500">
                  <MapPin className="h-3 w-3 text-gray-400" />
                  {story.location}
                </p>
              )}
              <Link
                href={`/community/${story.slug}`}
                className="mt-1 inline-flex items-center gap-1 text-[9px] font-medium text-[#D90429] hover:underline"
              >
                Read more
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </article>
        ))}
      </section>

      {/* CTA */}
      <section className="mt-2 rounded-2xl border border-dashed bg-white p-4 text-center text-xs text-gray-700">
        Want to highlight a local success story, charity project, club win, or
        provider doing good work?
        <br />
        <Link
          href="/contact"
          className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#D90429] px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-[#b40320]"
        >
          Share a story with the ManxHive team
          <ArrowRight className="h-3 w-3" />
        </Link>
      </section>
    </main>
  );
}