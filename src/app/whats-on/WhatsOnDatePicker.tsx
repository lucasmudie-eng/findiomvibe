"use client";
import { useRouter } from "next/navigation";

type Props = {
  activeDay: string | null;
  activeCategory?: string;
  activeArea: string | null;
};

export default function WhatsOnDatePicker({ activeDay, activeCategory, activeArea }: Props) {
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (activeArea) params.set("area", activeArea);
    if (val) params.set("on", val);
    // Clear date preset when picking a specific day
    const qs = params.toString();
    router.push(qs ? `/whats-on?${qs}` : "/whats-on");
  };

  const handleClear = () => {
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (activeArea) params.set("area", activeArea);
    const qs = params.toString();
    router.push(qs ? `/whats-on?${qs}` : "/whats-on");
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        defaultValue={activeDay ?? ""}
        key={activeDay ?? "none"}
        onChange={handleChange}
        className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#E8002D]/30"
      />
      {activeDay && (
        <button
          type="button"
          onClick={handleClear}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition"
        >
          Clear
        </button>
      )}
    </div>
  );
}
