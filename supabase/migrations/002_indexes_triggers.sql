-- StudyVibe: Indexes, constraints, and triggers
-- Run this AFTER 001_create_tables.sql

-- ============================================
-- Unique constraints
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_tracks_filename') THEN
    ALTER TABLE tracks ADD CONSTRAINT uq_tracks_filename UNIQUE (filename);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_backgrounds_filename') THEN
    ALTER TABLE backgrounds ADD CONSTRAINT uq_backgrounds_filename UNIQUE (filename);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_ambient_sounds_filename') THEN
    ALTER TABLE ambient_sounds ADD CONSTRAINT uq_ambient_sounds_filename UNIQUE (filename);
  END IF;
END $$;

-- ============================================
-- GIN indexes for array/JSONB searches
-- ============================================
CREATE INDEX IF NOT EXISTS idx_tracks_tags ON tracks USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_tracks_instruments ON tracks USING GIN (instruments);
CREATE INDEX IF NOT EXISTS idx_tracks_mood ON tracks USING GIN (mood);
CREATE INDEX IF NOT EXISTS idx_tracks_best_for ON tracks USING GIN (best_for);
CREATE INDEX IF NOT EXISTS idx_backgrounds_mood ON backgrounds USING GIN (mood);
CREATE INDEX IF NOT EXISTS idx_backgrounds_compatible_animations ON backgrounds USING GIN (compatible_animations);
CREATE INDEX IF NOT EXISTS idx_ambient_sounds_tags ON ambient_sounds USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_presets_config ON presets USING GIN (config);

-- ============================================
-- B-tree indexes for frequent lookups
-- ============================================
CREATE INDEX IF NOT EXISTS idx_tracks_genre ON tracks (genre);
CREATE INDEX IF NOT EXISTS idx_tracks_energy ON tracks (energy);
CREATE INDEX IF NOT EXISTS idx_backgrounds_scene_type ON backgrounds (scene_type);
CREATE INDEX IF NOT EXISTS idx_backgrounds_time_of_day ON backgrounds (time_of_day);
CREATE INDEX IF NOT EXISTS idx_ambient_sounds_category ON ambient_sounds (category);
CREATE INDEX IF NOT EXISTS idx_presets_user_id ON presets (user_id);
CREATE INDEX IF NOT EXISTS idx_presets_is_system ON presets (is_system);
CREATE INDEX IF NOT EXISTS idx_session_history_user_id ON session_history (user_id);

-- ============================================
-- Auto-update updated_at trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach to tracks
DROP TRIGGER IF EXISTS trg_tracks_updated_at ON tracks;
CREATE TRIGGER trg_tracks_updated_at
  BEFORE UPDATE ON tracks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Attach to presets
DROP TRIGGER IF EXISTS trg_presets_updated_at ON presets;
CREATE TRIGGER trg_presets_updated_at
  BEFORE UPDATE ON presets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
