/**
 * Add a new background image to Supabase (storage + database).
 *
 * Usage:
 *   npx tsx --require dotenv/config scripts/add-background.ts \
 *     --file ./my-image.jpg \
 *     --title "Rainy Tokyo" \
 *     --scene exterior \
 *     --time night \
 *     --mood "urban,moody" \
 *     --animations "floating_particles,light_flicker"
 *
 * Optional flags:
 *   --style illustration  (default: "illustration")
 *   --colors "#1a1a2e,#16213e"  (comma-separated hex colors)
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";

const BUCKET = "studyvibe-assets";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey || url.includes("placeholder") || serviceKey.includes("placeholder")) {
    console.error("Error: Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }
  return createClient(url, serviceKey);
}

function parseArgs(args: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--") && i + 1 < args.length) {
      result[args[i].slice(2)] = args[i + 1];
      i++;
    }
  }
  return result;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (!opts.file || !opts.title || !opts.scene) {
    console.error("Required: --file <path> --title <name> --scene <type>");
    console.error("Optional: --time <time_of_day> --mood <csv> --animations <csv> --style <style> --colors <csv>");
    process.exit(1);
  }

  const filePath = path.resolve(opts.file);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext];
  if (!contentType) {
    console.error(`Unsupported image format: ${ext}. Use .jpg, .png, or .webp`);
    process.exit(1);
  }

  // Read image dimensions
  const metadata = await sharp(filePath).metadata();
  const width = metadata.width ?? 1920;
  const height = metadata.height ?? 1080;

  // Build storage path
  const slug = slugify(opts.title);
  const storagePath = `backgrounds/${slug}${ext}`;

  console.log(`Image: ${width}x${height}, uploading as ${storagePath}`);

  const supabase = getSupabaseAdmin();

  // Upload to storage
  const fileBuffer = fs.readFileSync(filePath);
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, { contentType, upsert: true });

  if (uploadError) {
    console.error(`Upload failed: ${uploadError.message}`);
    process.exit(1);
  }
  console.log("Uploaded to storage.");

  // Parse CSV fields
  const mood = opts.mood ? opts.mood.split(",").map((s) => s.trim()) : [];
  const animations = opts.animations ? opts.animations.split(",").map((s) => s.trim()) : [];
  const colors = opts.colors ? opts.colors.split(",").map((s) => s.trim()) : [];

  // Insert into database
  const { data, error: dbError } = await supabase
    .from("backgrounds")
    .insert({
      title: opts.title,
      filename: storagePath,
      style: opts.style || "illustration",
      scene_type: opts.scene,
      time_of_day: opts.time || null,
      mood,
      color_palette: colors,
      compatible_animations: animations,
      width,
      height,
    })
    .select("id")
    .single();

  if (dbError) {
    console.error(`Database insert failed: ${dbError.message}`);
    process.exit(1);
  }

  console.log(`Added background: ${opts.title} (ID: ${data.id})`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
