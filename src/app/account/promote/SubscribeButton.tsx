"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function SubscribeButton({
  tier,
  label,
}: {
  tier: "plus" | "pro";
  label: string;
}) {
  const supabase = supabaseBrowser();
  const [loading, setLoading] = useState(false);

  const startCheckout = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) {
        alert("You must be logged in.");
        return;
      }

      const res = await fetch("/api/billing/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, tier }),
      });

      const json = await res.json();
      if (!res.ok || !json.approveUrl) {
        throw new Error(json.error || "Checkout failed");
      }

      window.location.href = json.approveUrl;
    } catch (e: any) {
      alert(e.message || "Checkout failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={startCheckout}
      disabled={loading}
      className="inline-flex w-full items-center justify-center rounded-full bg-[#D90429] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#b40320] disabled:opacity-60"
    >
      {loading ? "Redirecting…" : label}
    </button>
  );
}