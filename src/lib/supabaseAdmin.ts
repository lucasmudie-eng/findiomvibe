// src/lib/supabaseAdmin.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

let adminClient: SupabaseClient | null = null;

if (!supabaseUrl || !serviceRoleKey) {
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "[supabaseAdmin] env vars missing. Admin client will be null and admin APIs may return 501."
    );
  }
} else {
  adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const supabaseAdmin = adminClient;