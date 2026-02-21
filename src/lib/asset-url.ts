/**
 * Asset URL resolution — converts filenames to full URLs.
 *
 * When Supabase is connected: resolves to Supabase Storage public URL.
 * When offline/demo: resolves to local /assets/ folder in public/.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const BUCKET_NAME = "studyvibe-assets";

const isSupabaseConfigured =
  SUPABASE_URL &&
  SUPABASE_URL !== "https://placeholder.supabase.co" &&
  !SUPABASE_URL.includes("placeholder");

/**
 * Convert a catalog filename (e.g. "tracks/moonlit-sonata-study.mp3")
 * to a full URL the browser can fetch.
 */
export function getAssetUrl(filename: string): string {
  if (filename.startsWith("http://") || filename.startsWith("https://")) {
    return filename;
  }

  if (isSupabaseConfigured) {
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${filename}`;
  }

  // Local dev: serve from public/assets/
  return `/assets/${filename}`;
}
