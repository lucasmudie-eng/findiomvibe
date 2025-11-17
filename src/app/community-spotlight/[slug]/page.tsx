// src/app/community-spotlight/[slug]/page.tsx

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar, MapPin, ArrowLeft } from "lucide-react";
import { STORIES, type SpotlightStory } from "../page";

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function buildBody(story: SpotlightStory): string[] {
  // Temporary placeholder body per story.
  // You can later replace this with content from DB / MDX.
  switch (story.slug) {
    case "laxey-bakery-local-legend":
      return [
        "What started as a small village bakery in Laxey quietly posting daily bakes turned into a word-of-mouth engine across the Island.",
        "By sharing specials, seasonal drops, and 'when it’s gone, it’s gone' batches on ManxHive, they built a following that actually shows up — not just likes a post.",
        "Wholesale cafes discovered them through their listing, locals planned detours for cinnamon rolls, and weekend pre-orders began selling out in advance.",
      ];
    case "peel-fc-community-night":
      return [
        "Peel FC were already a pillar of the local game. What they wanted was a simple, central place to tell people what was on — without shouting into the void.",
        "Using ManxHive to list fixtures, club nights, and fundraiser events gave parents, players, and sponsors one trusted link to check.",
        "Crowds grew, volunteers stepped forward, and match nights started to feel like a full community evening again.",
      ];
    case "artisan-makers-market":
      return [
        "A group of independent makers wanted to test a proper curated market before committing to a full calendar.",
        "They used ManxHive’s marketplace and events listings to showcase their products, tell their story, and drive awareness ahead of the launch.",
        "The result: strong footfall, repeat customers, and a blueprint for future island-wide maker events.",
      ];
    default:
      return [
        "This community spotlight highlights how local people, clubs, and businesses use ManxHive to reach the right audiences without noise.",
        "If you’ve used ManxHive to launch something, sell out an event, or grow your project, we’d love to hear from you.",
      ];
  }
}

export default function CommunitySpotlightStoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const story = STORIES.find((s) => s.slug === params.slug);

  if (!story) {
    return notFound();
  }

  const body = buildBody(story);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="mb-1 text-xs text-gray-500">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        /{" "}
        <Link
          href="/community-spotlight"
          className="hover:underline"
        >
          Community spotlight
        </Link>{" "}
        / <span className="text-gray-800">{story.title}</span>
      </nav>

      {/* Back link */}
      <div>
        <Link
          href="/community-spotlight"
          className="inline-flex items-center gap-1 text-[10px] text-gray-600 hover:text-[#D90429]"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to all stories
        </Link>
      </div>

      {/* Hero */}
      <header className="space-y-3">
        <span className="inline-flex items-center rounded-full bg-[#FFF6F6] px-3 py-1 text-[9px] font-semibold uppercase tracking-wide text-[#D90429]">
          {story.tag}
        </span>
        <h1 className="text-2xl font-semibold text-gray-900">
          {story.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-500">
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
          <span>{story.readTime}</span>
        </div>
      </header>

      {/* Image */}
      <div className="relative h-56 w-full overflow-hidden rounded-2xl bg-gray-100">
        <Image
          src={story.image}
          alt={story.title}
          fill
          className="object-cover"
        />
      </div>

      {/* Body */}
      <article className="space-y-3 text-sm text-gray-700">
        {body.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
        <p className="mt-4 text-[11px] text-gray-500">
          Have a story like this to share?
          <Link
            href="/contact"
            className="ml-1 text-[#D90429] hover:underline"
          >
            Get in touch with the ManxHive team.
          </Link>
        </p>
      </article>
    </main>
  );
}