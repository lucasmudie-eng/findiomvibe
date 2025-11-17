// src/lib/supabase/server.ts
import { cookies } from "next/headers";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Server-side Supabase client.
 * - Returns `null` if env vars are missing (we handle this gracefully where used).
 * - Attaches cookies so that authenticated routes can work later.
 */
export function supabaseServer(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[supabaseServer] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY missing. Returning null client."
      );
    }
    return null;
  }

  const cookieStore = cookies();

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        // Forward cookies so auth can work in SSR/route handlers later.
        Cookie: cookieStore.toString(),
      },
    },
  });
}