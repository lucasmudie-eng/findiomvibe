import Link from "next/link";
import type { Listing } from "@/lib/marketplace/types";

function formatPrice(pence: number) {
  return "£" + (pence / 100).toFixed(2);
}

export default function ListingCard({ item }: { item: Listing }) {
  const img = item.images?.[0];

  return (
    <article className="grid grid-cols-[120px_1fr] gap-3 rounded-2xl border bg-white p-3 shadow-sm">
      <div className="overflow-hidden rounded-lg bg-gray-100">
        {img ? (
          <img
            src={img}
            alt={item.title}
            className="h-28 w-full object-cover"
          />
        ) : (
          <div className="grid h-28 place-items-center text-xs text-gray-400">
            No image
          </div>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex items-center justify-between gap-2">
          <Link
            href={`/marketplace/item/${item.id}`}
            className="truncate text-sm font-semibold text-gray-900 hover:underline"
          >
            {item.title}
          </Link>
          <div className="shrink-0 rounded-lg bg-[#D90429] px-2 py-0.5 text-xs font-semibold text-white">
            {formatPrice(item.pricePence)}
          </div>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
          <span>
            Listed by{" "}
            <span className="font-medium text-gray-800">
              {item.seller}
            </span>
          </span>
          <span>•</span>
          <span>{new Date(item.dateListed).toLocaleDateString()}</span>
          <span>•</span>
          <span>{item.area}</span>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-700">
          <span className="rounded border px-1.5 py-0.5">
            Condition: {item.condition}
          </span>
          <span
            className={
              "rounded px-1.5 py-0.5 " +
              (item.negotiable
                ? "border border-emerald-400 text-emerald-700"
                : "border text-gray-700")
            }
          >
            {item.negotiable ? "Negotiable" : "Fixed price"}
          </span>
        </div>
      </div>
    </article>
  );
}