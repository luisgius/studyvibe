/**
 * Add a new music track to Supabase (storage + database).
 *
 * Usage:
 *   npx tsx --require dotenv/config scripts/add-track.ts \
 *     --file ./my-song.mp3 \
 *     --title "Chill Lofi Beat" \
 *     --genre lofi \
 *     --energy 0.4 \
 *     --duration 210
 *
 * Optional flags:
 *   --bpm 85
 *   --hz 440
 *   --instruments "synth,drums"  (comma-separated)
 *   --mood "relaxed,chill"  (comma-separated)
 *   --tags "lofi,chill,beats"  (comma-separated)
 *   --best-for "coding,studying"  (comma-separated)
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

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

const AUDIO_MIME: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".flac": "audio/flac",
};

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (!opts.file || !opts.title || !opts.genre || !opts.energy || !opts.duration) {
    console.error("Required: --file <path> --title <name> --genre <genre> --energy <0-1> --duration <seconds>");
    console.error("Optional: --bpm <n> --hz <n> --instruments <csv> --mood <csv> --tags <csv> --best-for <csv>");
    process.exit(1);
  }

  const energy = parseFloat(opts.energy);
  if (isNaN(energy) || energy < 0 || energy > 1) {
    console.error("Energy must be a number between 0 and 1");
    process.exit(1);
  }

  const duration = parseInt(opts.duration, 10);
  if (isNaN(duration) || duration <= 0) {
    console.error("Duration must be a positive integer (seconds)");
    process.exit(1);
  }

  const filePath = path.resolve(opts.file);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = AUDIO_MIME[ext];
  if (!contentType) {
    console.error(`Unsupported audio format: ${ext}. Use .mp3, .wav, .ogg, or .flac`);
    process.exit(1);
  }

  const slug = slugify(opts.title);
  const storagePath = `tracks/${slug}${ext}`;

  console.log(`Uploading as ${storagePath} (${duration}s, energy ${energy})`);

  const supabase = getSupabaseAdmin();

  // Upload to storage
  const fileBuffer = fs.readFileSync(filePath);
  const sizeMB = (fileBuffer.length / (1024 * 1024)).toFixed(2);
  console.log(`File size: ${sizeMB} MB`);

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, { contentType, upsert: true });

  if (uploadError) {
    console.error(`Upload failed: ${uploadError.message}`);
    process.exit(1);
  }
  console.log("Uploaded to storage.");

  // Parse CSV fields
  const parseCSV = (val: string | undefined) =>
    val ? val.split(",").map((s) => s.trim()) : [];

  // Insert into database
  const { data, error: dbError } = await supabase
    .from("tracks")
    .insert({
      title: opts.title,
      filename: storagePath,
      duration_seconds: duration,
      tags: parseCSV(opts.tags),
      energy,
      instruments: parseCSV(opts.instruments),
      mood: parseCSV(opts.mood),
      bpm_estimate: opts.bpm ? parseInt(opts.bpm, 10) : null,
      hz_base: opts.hz ? parseInt(opts.hz, 10) : null,
      best_for: parseCSV(opts["best-for"]),
      genre: opts.genre,
    })
    .select("id")
    .single();

  if (dbError) {
    console.error(`Database insert failed: ${dbError.message}`);
    process.exit(1);
  }

  console.log(`Added track: ${opts.title} (ID: ${data.id})`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
