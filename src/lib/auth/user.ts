import { supabaseServer } from "@/lib/supabase/server";

export async function getAuthenticatedUserId(): Promise<string | null> {
  const supabase = supabaseServer();
  if (!supabase) return null;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user.id;
}
