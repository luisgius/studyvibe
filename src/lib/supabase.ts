/**
 * Supabase browser client — singleton.
 *
 * Uses environment variables directly. Returns null when env vars are
 * missing (e.g., placeholder credentials), allowing the app to fall
 * back to demo data gracefully instead of crashing.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function createSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey || url === "https://placeholder.supabase.co" || anonKey === "placeholder-anon-key") {
    console.warn(
      "Supabase credentials missing or using placeholders. " +
        "App will use demo data. Set real values in .env.local to connect to Supabase."
    );
    return null;
  }

  try {
    return createClient(url, anonKey);
  } catch (e) {
    console.error("Failed to create Supabase client:", e);
    return null;
  }
}

export const supabase = createSupabaseClient();
