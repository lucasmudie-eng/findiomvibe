// src/app/community-spotlight/[slug]/page.tsx

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar, MapPin, ArrowLeft } from "lucide-react";
import { STORIES } from "../stories";

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function SpotlightStoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const story = STORIES.find((s) => s.slug === params.slug);
  if (!story) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <nav className="mb-1 flex items-center gap-2 text-xs text-gray-500">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span>/</span>
        <Link href="/community-spotlight" className="hover:underline">
          Community spotlight
        </Link>
        <span>/</span>
        <span className="text-gray-800 line-clamp-1">{story.title}</span>
      </nav>

      <Link
        href="/community-spotlight"
        className="inline-flex items-center gap-1 text-[11px] text-[#D90429] hover:underline"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to all stories
      </Link>

      <article className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm">
        <header className="space-y-2">
          <p className="text-[11px] uppercase tracking-wide text-[#D90429]">
            {story.tag}
          </p>
          <h1 className="text-2xl font-semibold text-gray-900">
            {story.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
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

        <div className="relative h-52 w-full overflow-hidden rounded-2xl bg-gray-100">
          <Image
            src={story.image}
            alt={story.title}
            fill
            className="object-cover"
          />
        </div>

        <section className="space-y-3 text-sm leading-relaxed text-gray-700">
          <p>{story.excerpt}</p>
          <p>
            Full long-form copy can go here later – for now we reuse the
            excerpt as placeholder content.
          </p>
        </section>
      </article>
    </main>
  );
}