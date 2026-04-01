// src/app/account/upgrade/page.tsx
import { redirect } from "next/navigation";

// Plans have been removed — everything is free, boosts are one-time paid.
// Anyone visiting /account/upgrade gets sent to the promote/boost page.
export default function AccountUpgradePage() {
  redirect("/promote");
}
