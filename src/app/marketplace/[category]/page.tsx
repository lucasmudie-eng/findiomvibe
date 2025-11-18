// src/app/marketplace/[category]/page.tsx
import { redirect } from "next/navigation";

interface Props {
  params: { category: string };
}

export default function MarketplaceCategoryPage({ params }: Props) {
  const { category } = params;

  // Redirect old /marketplace/[category] → /marketplace?category=...
  redirect(`/marketplace?category=${encodeURIComponent(category)}`);
}