-- StudyVibe: Storage bucket setup
-- Run this AFTER all other migrations.
--
-- NOTE: Supabase Storage bucket creation is typically done via the Dashboard
-- or Supabase CLI, not pure SQL. The SQL below creates the bucket entry
-- in the storage schema if using the SQL Editor directly.
--
-- If this doesn't work in your Supabase version, create the bucket manually:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "New bucket"
-- 3. Name: "studyvibe-assets"
-- 4. Check "Public bucket"
-- 5. Create folders: tracks/, backgrounds/, ambient/

-- Create the storage bucket (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('studyvibe-assets', 'studyvibe-assets', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Storage RLS policies: public read, admin-only write
-- ============================================

-- Allow public read access to all files in the bucket
DROP POLICY IF EXISTS "studyvibe_assets_public_read" ON storage.objects;
CREATE POLICY "studyvibe_assets_public_read" ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'studyvibe-assets');

-- Only service role (admin) can upload/modify files
-- This is enforced by NOT creating INSERT/UPDATE/DELETE policies
-- for anon or authenticated roles. Only the service_role key
-- (used server-side) bypasses RLS.
