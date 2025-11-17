// src/app/components/HandleLeadButton.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Props = { id: string; initialHandled: boolean };

export default function HandleLeadButton({ id, initialHandled }: Props) {
  const [handled, setHandled] = useState(initialHandled);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function toggle() {
    const next = !handled;
    setHandled(next); // optimistic
    try {
      const res = await fetch("/api/leads/handle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, handled: next }),
      });
      if (!res.ok) throw new Error("Update failed");
    } catch {
      // revert on failure
      setHandled(!next);
      alert("Sorry—couldn't update that lead. Try again.");
    } finally {
      startTransition(() => router.refresh());
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={`rounded-lg border px-3 py-1.5 text-sm ${
        handled
          ? "border-green-600 text-green-700"
          : "border-gray-300 text-gray-700"
      } ${pending ? "opacity-60" : "hover:bg-gray-50"}`}
    >
      {handled ? "Handled" : "Mark handled"}
    </button>
  );
}