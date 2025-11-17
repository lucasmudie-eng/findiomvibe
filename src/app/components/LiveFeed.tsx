"use client";

import useSWR from "swr";
import Link from "next/link";

type FeedItem = {
  id: string | number;
  title: string;
  href?: string;
  meta?: string; // e.g. date, price, location
  tag?: string;  // optional small label
};

type FeedResponse = {
  items?: FeedItem[];
};

// Simple fetcher
const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to load feed");
    return res.json();
  });

export default function LiveFeed({
  title,
  endpoint,
  emptyText,
}: {
  title?: string;
  endpoint: string;
  emptyText?: string;
}) {
  const { data, error, isLoading } = useSWR<FeedResponse>(
    endpoint,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const items = data?.items ?? [];

  return (
    <div className="space-y-2">
      {title && (
        <h3 className="text-sm font-semibold text-gray-900">
          {title}
        </h3>
      )}

      {isLoading && (
        <p className="text-xs text-gray-500">Loading…</p>
      )}

      {error && !isLoading && (
        <p className="text-xs text-red-500">
          Could not load this feed.
        </p>
      )}

      {!isLoading && !error && items.length === 0 && (
        <p className="text-xs text-gray-500">
          {emptyText || "Nothing here yet."}
        </p>
      )}

      <ul className="space-y-2">
        {items.map((item) => {
          const body = (
            <>
              <div className="truncate text-xs font-medium text-gray-900">
                {item.title}
              </div>
              {item.meta && (
                <div className="text-[10px] text-gray-500">
                  {item.meta}
                </div>
              )}
              {item.tag && (
                <div className="mt-1 inline-flex rounded-full bg-red-50 px-2 py-0.5 text-[9px] font-medium text-[#D90429]">
                  {item.tag}
                </div>
              )}
            </>
          );

          return (
            <li
              key={item.id}
              className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-xs hover:bg-white hover:shadow-sm"
            >
              {item.href ? (
                <Link href={item.href} className="block">
                  {body}
                </Link>
              ) : (
                body
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}