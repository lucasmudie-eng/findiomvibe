"use client";

import { useState } from "react";

export default function ShareButton({ title }: { title?: string }) {
  const [msg, setMsg] = useState<string | null>(null);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: title || "ManxHive", url });
        setMsg("Shared");
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setMsg("Link copied");
        return;
      }

      setMsg("Copy not supported");
    } catch {
      setMsg("Could not share");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleShare}
        className="rounded-full border border-slate-200 px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-50"
      >
        Share
      </button>
      {msg && <span className="text-[10px] text-slate-500">{msg}</span>}
    </div>
  );
}
