// src/lib/providerQueries.ts
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type ProviderRow = {
  id: string;
  slug: string;
  name: string;
  summary: string | null;
  description: string | null;
  location: string | null;
  email: string | null;
  phone: string | null;
  category_slug: string | null;
  rating: number | null;
  images: string[] | null;
  services: { name: string; price?: string }[] | null;
  areas_served: string[] | null;
  logo_url?: string | null;
};

/**
 * TEMP: return the first provider as the "current" one.
 * Later we’ll filter by owner (e.g., providers.owner_id = auth.uid()).
 */
export async function getCurrentProvider(): Promise<ProviderRow | null> {
  const { data, error } = await supabaseAdmin
    .from("providers")
    .select(
      "id, slug, name, summary, description, location, email, phone, category_slug, rating, images, services, areas_served, logo_url"
    )
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getCurrentProvider error:", error);
    return null;
  }
  return data ?? null;
}