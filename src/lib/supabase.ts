// src/lib/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: true } }
);

/**
 * Server-side Supabase client (uses Service Role key).
 * DO NOT expose SUPABASE_SERVICE_KEY to the browser.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl) {
  throw new Error('Missing env: NEXT_PUBLIC_SUPABASE_URL')
}
if (!serviceRoleKey) {
  throw new Error('Missing env: SUPABASE_SERVICE_KEY')
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    // No browser session handling on the server
    persistSession: false,
    autoRefreshToken: false,
  },
})
