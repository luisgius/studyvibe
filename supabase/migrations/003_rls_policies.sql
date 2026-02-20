-- StudyVibe: Row Level Security policies
-- Run this AFTER 001_create_tables.sql and 002_indexes_triggers.sql

-- ============================================
-- Enable RLS on all tables
-- ============================================
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE backgrounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambient_sounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Catalog tables: public read, no client write
-- (tracks, backgrounds, ambient_sounds)
-- ============================================

-- tracks: anyone can read
DROP POLICY IF EXISTS "tracks_select_all" ON tracks;
CREATE POLICY "tracks_select_all" ON tracks
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- backgrounds: anyone can read
DROP POLICY IF EXISTS "backgrounds_select_all" ON backgrounds;
CREATE POLICY "backgrounds_select_all" ON backgrounds
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ambient_sounds: anyone can read
DROP POLICY IF EXISTS "ambient_sounds_select_all" ON ambient_sounds;
CREATE POLICY "ambient_sounds_select_all" ON ambient_sounds
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================
-- presets: read system + own, write own only
-- ============================================

-- Select: system presets visible to all, user presets only to owner
DROP POLICY IF EXISTS "presets_select" ON presets;
CREATE POLICY "presets_select" ON presets
  FOR SELECT
  TO anon, authenticated
  USING (is_system = true OR user_id = auth.uid());

-- Insert: authenticated users can create their own presets
DROP POLICY IF EXISTS "presets_insert" ON presets;
CREATE POLICY "presets_insert" ON presets
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND is_system = false);

-- Update: users can update their own presets only
DROP POLICY IF EXISTS "presets_update" ON presets;
CREATE POLICY "presets_update" ON presets
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND is_system = false)
  WITH CHECK (user_id = auth.uid() AND is_system = false);

-- Delete: users can delete their own presets only
DROP POLICY IF EXISTS "presets_delete" ON presets;
CREATE POLICY "presets_delete" ON presets
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() AND is_system = false);

-- ============================================
-- session_history: read/write own only
-- ============================================

-- Select: users can read their own session history
DROP POLICY IF EXISTS "session_history_select" ON session_history;
CREATE POLICY "session_history_select" ON session_history
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Insert: users can create their own session records
DROP POLICY IF EXISTS "session_history_insert" ON session_history;
CREATE POLICY "session_history_insert" ON session_history
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Update: users can update their own sessions (e.g., set ended_at)
DROP POLICY IF EXISTS "session_history_update" ON session_history;
CREATE POLICY "session_history_update" ON session_history
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
