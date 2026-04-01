// src/app/components/SubscribeButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export function SubscribeButton({ tier }: { tier: "plus" | "pro" }) {
  const router = useRouter();
  const supabase = supabaseBrowser();
  const [loading, setLoading] = useState(false);

  const startCheckout = async () => {
    try {
      setLoading(true);

      if (!supabase) {
        alert("Supabase not configured");
        return;
      }

      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;

      if (!userId) {
        // not logged in
        router.push("/login");
        return;
      }

      const res = await fetch("/api/billing/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, tier }),
      });

      const json = await res.json();

      if (!res.ok) {
        alert(json?.error || "Checkout failed");
        return;
      }

      if (json?.approveUrl) {
        window.location.href = json.approveUrl;
      } else {
        alert("No approveUrl returned.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={startCheckout}
      disabled={loading}
      className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
    >
      {loading ? "Redirecting…" : tier === "plus" ? "Upgrade to PLUS" : "Upgrade to PRO"}
    </button>
  );
}