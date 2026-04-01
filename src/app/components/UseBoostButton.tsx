// src/app/components/UseBoostButton.tsx
"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Sparkles } from "lucide-react";

type BoostType = "marketplace" | "business";

interface UseBoostButtonProps {
  boostType: BoostType;
  refId: string; // listing id or business id
  defaultDays?: number; // only used for clarity in UI for paid flows later
}

export default function UseBoostButton({
  boostType,
  refId,
  defaultDays = 1,
}: UseBoostButtonProps) {
  const supabase = supabaseBrowser();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setMsg(null);
    setError(null);

    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!user) throw new Error("You need to be logged in to use boosts.");

      // For now we only trigger the FREE-boost path.
      const res = await fetch("/api/billing/boost/fulfill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          boostType,
          refId,
          days: defaultDays,
          paypalOrderId: null,
          pricePaidPence: null,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Could not apply boost.");
      }

      if (data.free) {
        setMsg("Free boost applied! It may take a minute to reflect everywhere.");
      } else {
        setMsg("Boost applied. Thanks for supporting ManxHive.");
      }
    } catch (err: any) {
      console.error("[UseBoostButton] error:", err);
      setError(err?.message || "Could not apply boost right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-amber-600 disabled:opacity-60"
      >
        <Sparkles className="h-3 w-3" />
        {loading ? "Applying boost…" : "Use free boost"}
      </button>
      {msg && (
        <p className="text-[10px] text-emerald-700">
          {msg}
        </p>
      )}
      {error && (
        <p className="text-[10px] text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}