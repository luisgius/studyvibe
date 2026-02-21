/**
 * Batch upload assets to Supabase Storage.
 *
 * Usage: npx tsx --require dotenv/config scripts/upload-assets.ts
 *
 * Scans .assets-staging/ for files in tracks/, backgrounds/, and ambient/
 * subfolders and uploads each to the studyvibe-assets bucket.
 * Uses upsert so it's safe to re-run.
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const BUCKET = "studyvibe-assets";
const STAGING_DIR = path.resolve(__dirname, "../.assets-staging");

const MIME_TYPES: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey || url.includes("placeholder") || serviceKey.includes("placeholder")) {
    console.error("Error: Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  return createClient(url, serviceKey);
}

function getFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

async function main() {
  if (!fs.existsSync(STAGING_DIR)) {
    console.error(`Error: Staging directory not found: ${STAGING_DIR}`);
    console.error("Create it with: mkdir -p .assets-staging/{tracks,backgrounds,ambient}");
    process.exit(1);
  }

  const supabase = getSupabaseAdmin();
  const files = getFiles(STAGING_DIR);

  if (files.length === 0) {
    console.log("No files found in .assets-staging/. Nothing to upload.");
    return;
  }

  console.log(`Found ${files.length} file(s) to upload.\n`);

  let uploaded = 0;
  let failed = 0;

  for (const filePath of files) {
    const relativePath = path.relative(STAGING_DIR, filePath).replace(/\\/g, "/");
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    const fileBuffer = fs.readFileSync(filePath);
    const sizeMB = (fileBuffer.length / (1024 * 1024)).toFixed(2);

    process.stdout.write(`  Uploading ${relativePath} (${sizeMB} MB)... `);

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(relativePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.log(`FAILED: ${error.message}`);
      failed++;
    } else {
      console.log("OK");
      uploaded++;
    }
  }

  console.log(`\nDone: ${uploaded} uploaded, ${failed} failed out of ${files.length} total.`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
