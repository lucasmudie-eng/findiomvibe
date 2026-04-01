import Link from "next/link";
import IslandMap from "./IslandMap";

export default function MapPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <nav className="mb-1 text-xs text-gray-500">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        / <span className="text-gray-800">Island Map</span>
      </nav>

      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF5F5] px-3 py-1 text-[10px] font-medium text-[#D90429]">
          Discover the island
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
          ManxHive map hub
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          One map for events, deals, businesses, heritage spots and walks. Filter
          by category to plan your week faster.
        </p>
      </header>

      <IslandMap />
    </main>
  );
}
