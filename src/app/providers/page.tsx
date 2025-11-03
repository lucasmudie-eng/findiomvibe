// src/app/providers/page.tsx
import { redirect } from "next/navigation";

export default function ProvidersIndex() {
  redirect("/dashboard");
}