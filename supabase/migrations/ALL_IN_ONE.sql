-- =============================================
-- StudyVibe: ALL MIGRATIONS COMBINED
-- =============================================
-- Paste this entire file into Supabase SQL Editor and click "Run".
-- It includes all 5 migration files in the correct order.
-- Safe to re-run (idempotent).

-- =============================================
-- 001: CREATE TABLES
-- =============================================

CREATE TABLE IF NOT EXISTS tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  filename TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  energy FLOAT NOT NULL CHECK (energy >= 0 AND energy <= 1),
  instruments TEXT[] NOT NULL DEFAULT '{}',
  mood TEXT[] NOT NULL DEFAULT '{}',
  bpm_estimate INTEGER,
  hz_base INTEGER,
  best_for TEXT[] NOT NULL DEFAULT '{}',
  genre TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS backgrounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  filename TEXT NOT NULL,
  style TEXT NOT NULL DEFAULT 'illustration',
  scene_type TEXT NOT NULL,
  time_of_day TEXT,
  mood TEXT[] NOT NULL DEFAULT '{}',
  color_palette TEXT[] NOT NULL DEFAULT '{}',
  compatible_animations TEXT[] NOT NULL DEFAULT '{}',
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ambient_sounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  filename TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  is_loopable BOOLEAN DEFAULT true,
  tags TEXT[] NOT NULL DEFAULT '{}',
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id),
  config JSONB NOT NULL,
  thumbnail_url TEXT,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS session_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  config JSONB NOT NULL,
  prompt_used TEXT,
  duration_seconds INTEGER,
  pomodoro_cycles_completed INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ
);

-- =============================================
-- 002: INDEXES & TRIGGERS
-- =============================================

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

CREATE INDEX IF NOT EXISTS idx_tracks_tags ON tracks USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_tracks_instruments ON tracks USING GIN (instruments);
CREATE INDEX IF NOT EXISTS idx_tracks_mood ON tracks USING GIN (mood);
CREATE INDEX IF NOT EXISTS idx_tracks_best_for ON tracks USING GIN (best_for);
CREATE INDEX IF NOT EXISTS idx_backgrounds_mood ON backgrounds USING GIN (mood);
CREATE INDEX IF NOT EXISTS idx_backgrounds_compatible_animations ON backgrounds USING GIN (compatible_animations);
CREATE INDEX IF NOT EXISTS idx_ambient_sounds_tags ON ambient_sounds USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_presets_config ON presets USING GIN (config);

CREATE INDEX IF NOT EXISTS idx_tracks_genre ON tracks (genre);
CREATE INDEX IF NOT EXISTS idx_tracks_energy ON tracks (energy);
CREATE INDEX IF NOT EXISTS idx_backgrounds_scene_type ON backgrounds (scene_type);
CREATE INDEX IF NOT EXISTS idx_backgrounds_time_of_day ON backgrounds (time_of_day);
CREATE INDEX IF NOT EXISTS idx_ambient_sounds_category ON ambient_sounds (category);
CREATE INDEX IF NOT EXISTS idx_presets_user_id ON presets (user_id);
CREATE INDEX IF NOT EXISTS idx_presets_is_system ON presets (is_system);
CREATE INDEX IF NOT EXISTS idx_session_history_user_id ON session_history (user_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tracks_updated_at ON tracks;
CREATE TRIGGER trg_tracks_updated_at
  BEFORE UPDATE ON tracks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_presets_updated_at ON presets;
CREATE TRIGGER trg_presets_updated_at
  BEFORE UPDATE ON presets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 003: ROW LEVEL SECURITY
-- =============================================

ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE backgrounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambient_sounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tracks_select_all" ON tracks;
CREATE POLICY "tracks_select_all" ON tracks
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "backgrounds_select_all" ON backgrounds;
CREATE POLICY "backgrounds_select_all" ON backgrounds
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "ambient_sounds_select_all" ON ambient_sounds;
CREATE POLICY "ambient_sounds_select_all" ON ambient_sounds
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "presets_select" ON presets;
CREATE POLICY "presets_select" ON presets
  FOR SELECT TO anon, authenticated
  USING (is_system = true OR user_id = auth.uid());

DROP POLICY IF EXISTS "presets_insert" ON presets;
CREATE POLICY "presets_insert" ON presets
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND is_system = false);

DROP POLICY IF EXISTS "presets_update" ON presets;
CREATE POLICY "presets_update" ON presets
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND is_system = false)
  WITH CHECK (user_id = auth.uid() AND is_system = false);

DROP POLICY IF EXISTS "presets_delete" ON presets;
CREATE POLICY "presets_delete" ON presets
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND is_system = false);

DROP POLICY IF EXISTS "session_history_select" ON session_history;
CREATE POLICY "session_history_select" ON session_history
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "session_history_insert" ON session_history;
CREATE POLICY "session_history_insert" ON session_history
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "session_history_update" ON session_history;
CREATE POLICY "session_history_update" ON session_history
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =============================================
-- 004: STORAGE BUCKET
-- =============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('studyvibe-assets', 'studyvibe-assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "studyvibe_assets_public_read" ON storage.objects;
CREATE POLICY "studyvibe_assets_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'studyvibe-assets');

-- =============================================
-- SEED DATA
-- =============================================

INSERT INTO tracks (id, title, filename, duration_seconds, tags, energy, instruments, mood, bpm_estimate, hz_base, best_for, genre)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Moonlit Sonata Study',     'tracks/moonlit-sonata-study.wav',     240, ARRAY['classical','piano','calm'],        0.2, ARRAY['piano'],               ARRAY['serene','contemplative'],      72,  440, ARRAY['reading','deep_work'],           'classical'),
  ('a1000000-0000-0000-0000-000000000002', 'Gentle Prelude in C',      'tracks/gentle-prelude-c.wav',         300, ARRAY['classical','piano','soft'],         0.15, ARRAY['piano'],              ARRAY['peaceful','dreamy'],           60,  432, ARRAY['meditation','reading'],          'classical'),
  ('a1000000-0000-0000-0000-000000000003', 'Rainy Afternoon Beats',    'tracks/rainy-afternoon-beats.wav',    195, ARRAY['lofi','chill','beats'],             0.4, ARRAY['synth','drums','keys'], ARRAY['relaxed','nostalgic'],          85,  NULL, ARRAY['studying','coding'],             'lofi'),
  ('a1000000-0000-0000-0000-000000000004', 'Late Night Code Session',  'tracks/late-night-code-session.wav',  210, ARRAY['lofi','hiphop','chill'],            0.45, ARRAY['synth','bass','drums'], ARRAY['focused','mellow'],            90,  NULL, ARRAY['coding','deep_work'],            'lofi'),
  ('a1000000-0000-0000-0000-000000000005', 'Deep Space Drift',         'tracks/deep-space-drift.wav',         360, ARRAY['ambient','space','ethereal'],       0.1, ARRAY['synth','pad'],          ARRAY['vast','dreamy','immersive'],    NULL, 432, ARRAY['meditation','sleep'],            'ambient'),
  ('a1000000-0000-0000-0000-000000000006', 'Forest Whisper Ambience',  'tracks/forest-whisper-ambience.wav',  420, ARRAY['ambient','nature','organic'],       0.15, ARRAY['field_recording','pad'], ARRAY['natural','grounding'],         NULL, 440, ARRAY['relaxation','yoga'],             'ambient'),
  ('a1000000-0000-0000-0000-000000000007', 'Mountain Stream Guitar',   'tracks/mountain-stream-guitar.wav',   270, ARRAY['acoustic','nature','guitar'],       0.3, ARRAY['guitar','nature_sounds'], ARRAY['warm','uplifting'],            100, NULL, ARRAY['morning_routine','creative'],    'acoustic'),
  ('a1000000-0000-0000-0000-000000000008', 'Sunrise Flute Meditation', 'tracks/sunrise-flute-meditation.wav', 330, ARRAY['world','flute','meditative'],       0.2, ARRAY['flute','nature_sounds'],  ARRAY['spiritual','calm'],            NULL, 528, ARRAY['meditation','morning_routine'],  'world'),
  ('a1000000-0000-0000-0000-000000000009', 'Café Jazz Trio',           'tracks/cafe-jazz-trio.wav',           285, ARRAY['jazz','cafe','smooth'],             0.5, ARRAY['piano','bass','drums'],  ARRAY['cozy','sophisticated'],        120, NULL, ARRAY['creative','casual_work'],        'jazz'),
  ('a1000000-0000-0000-0000-000000000010', 'Focus Frequency Alpha',    'tracks/focus-frequency-alpha.wav',    480, ARRAY['electronic','binaural','focus'],    0.35, ARRAY['synth','binaural'],     ARRAY['focused','energized'],         110, 440, ARRAY['deep_work','coding','studying'], 'electronic')
ON CONFLICT (id) DO NOTHING;

INSERT INTO backgrounds (id, title, filename, style, scene_type, time_of_day, mood, color_palette, compatible_animations, width, height)
VALUES
  ('b2000000-0000-0000-0000-000000000001', 'Cozy Room at Night',   'backgrounds/cozy-room-night.jpg',    'illustration', 'interior', 'night',    ARRAY['warm','intimate','cozy'],      ARRAY['#1a0a2e','#3d1c56','#f4a460','#ffd700'], ARRAY['fireflies','light_flicker','floating_particles'],         1920, 1080),
  ('b2000000-0000-0000-0000-000000000002', 'Mountain Cabin Dawn',  'backgrounds/mountain-cabin-dawn.jpg','illustration', 'exterior', 'dawn',     ARRAY['serene','majestic','fresh'],    ARRAY['#2c3e50','#e67e22','#ecf0f1','#87ceeb'], ARRAY['floating_particles','clouds_drift','leaves_falling','fireflies'], 1920, 1080),
  ('b2000000-0000-0000-0000-000000000003', 'Nebula Deep Space',    'backgrounds/nebula-deep-space.jpg',  'digital_art',  'space',    NULL,       ARRAY['vast','mysterious','awe'],      ARRAY['#0b0033','#1a0066','#6600cc','#cc00ff'], ARRAY['shooting_stars','floating_particles','aurora'],           1920, 1080),
  ('b2000000-0000-0000-0000-000000000004', 'Japanese Garden',      'backgrounds/japanese-garden.jpg',     'illustration', 'exterior', 'morning',  ARRAY['peaceful','balanced','zen'],    ARRAY['#2d572c','#8fbc8f','#f0e68c','#deb887'], ARRAY['floating_particles','leaves_falling','fireflies'],        1920, 1080),
  ('b2000000-0000-0000-0000-000000000005', 'City Rooftop Sunset',  'backgrounds/city-rooftop-sunset.jpg','illustration', 'urban',    'evening',  ARRAY['vibrant','energetic','urban'],  ARRAY['#ff6347','#ff8c00','#1c1c2e','#4a4a6a'], ARRAY['shooting_stars','floating_particles','clouds_drift'],     1920, 1080),
  ('b2000000-0000-0000-0000-000000000006', 'Forest Clearing',      'backgrounds/forest-clearing.jpg',     'illustration', 'exterior', 'morning',  ARRAY['natural','refreshing','alive'], ARRAY['#228b22','#90ee90','#f5deb3','#87ceeb'], ARRAY['fireflies','floating_particles','leaves_falling'],        1920, 1080)
ON CONFLICT (id) DO NOTHING;

INSERT INTO ambient_sounds (id, name, category, filename, duration_seconds, is_loopable, tags, icon)
VALUES
  ('c3000000-0000-0000-0000-000000000001', 'Light Rain',     'weather',  'ambient/light-rain.wav',     120, true,  ARRAY['rain','weather','calming'],       '🌧️'),
  ('c3000000-0000-0000-0000-000000000002', 'Ocean Waves',    'nature',   'ambient/ocean-waves.wav',    180, true,  ARRAY['ocean','waves','nature'],         '🌊'),
  ('c3000000-0000-0000-0000-000000000003', 'Fireplace',      'indoor',   'ambient/fireplace.wav',       90, true,  ARRAY['fire','crackling','warm'],        '🔥'),
  ('c3000000-0000-0000-0000-000000000004', 'Gentle Wind',    'weather',  'ambient/gentle-wind.wav',    150, true,  ARRAY['wind','breeze','outdoor'],        '💨'),
  ('c3000000-0000-0000-0000-000000000005', 'Morning Birds',  'nature',   'ambient/morning-birds.wav',  200, true,  ARRAY['birds','chirping','morning'],     '🐦'),
  ('c3000000-0000-0000-0000-000000000006', 'Coffee Shop',    'indoor',   'ambient/coffee-shop.wav',    240, true,  ARRAY['cafe','chatter','ambient'],       '☕')
ON CONFLICT (id) DO NOTHING;

INSERT INTO presets (id, name, description, is_system, user_id, config, thumbnail_url)
VALUES
  (
    'd4000000-0000-0000-0000-000000000001',
    'Late Night Coding',
    'Dark room ambience with low-energy piano and light rain. Perfect for focused coding sessions after midnight.',
    true, NULL,
    '{"schema_version":1,"music":{"track_id":"a1000000-0000-0000-0000-000000000001","volume":0.4,"crossfade_seconds":5},"ambient":{"layers":[{"sound_id":"c3000000-0000-0000-0000-000000000001","volume":0.3}]},"visual":{"background_id":"b2000000-0000-0000-0000-000000000001","animations":[{"type":"fireflies","intensity":0.4,"speed":0.3}],"color_temperature":"warm","brightness":0.6,"vignette_intensity":0.3},"timer":{"method":"pomodoro","work_minutes":50,"short_break_minutes":10,"long_break_minutes":30,"cycles_before_long_break":4}}'::jsonb,
    NULL
  ),
  (
    'd4000000-0000-0000-0000-000000000002',
    'Rainy Day Reading',
    'Cozy room with rain and fireplace crackling. Ideal for long reading sessions on a grey afternoon.',
    true, NULL,
    '{"schema_version":1,"music":{"track_id":"a1000000-0000-0000-0000-000000000002","volume":0.3,"crossfade_seconds":8},"ambient":{"layers":[{"sound_id":"c3000000-0000-0000-0000-000000000001","volume":0.5},{"sound_id":"c3000000-0000-0000-0000-000000000003","volume":0.4}]},"visual":{"background_id":"b2000000-0000-0000-0000-000000000001","animations":[{"type":"floating_particles","intensity":0.3,"speed":0.2}],"color_temperature":"warm","brightness":0.5,"vignette_intensity":0.4},"timer":{"method":"free"}}'::jsonb,
    NULL
  ),
  (
    'd4000000-0000-0000-0000-000000000003',
    'Calm Focus',
    'Minimal space ambience with shooting stars. For distraction-free deep work with a sense of vastness.',
    true, NULL,
    '{"schema_version":1,"music":{"track_id":"a1000000-0000-0000-0000-000000000005","volume":0.25,"crossfade_seconds":10},"ambient":{"layers":[]},"visual":{"background_id":"b2000000-0000-0000-0000-000000000003","animations":[{"type":"shooting_stars","intensity":0.5,"speed":0.4}],"color_temperature":"cool","brightness":0.4,"vignette_intensity":0.5},"timer":{"method":"pomodoro","work_minutes":45,"short_break_minutes":5,"long_break_minutes":15,"cycles_before_long_break":4}}'::jsonb,
    NULL
  ),
  (
    'd4000000-0000-0000-0000-000000000004',
    'Morning Energy',
    'Fresh forest scenery with bird sounds. Start your day with natural energy and gentle guitar.',
    true, NULL,
    '{"schema_version":1,"music":{"track_id":"a1000000-0000-0000-0000-000000000007","volume":0.5,"crossfade_seconds":5},"ambient":{"layers":[{"sound_id":"c3000000-0000-0000-0000-000000000005","volume":0.4}]},"visual":{"background_id":"b2000000-0000-0000-0000-000000000006","animations":[{"type":"floating_particles","intensity":0.6,"speed":0.4}],"color_temperature":"neutral","brightness":0.7,"vignette_intensity":0.2},"timer":{"method":"pomodoro","work_minutes":25,"short_break_minutes":5,"long_break_minutes":20,"cycles_before_long_break":4}}'::jsonb,
    NULL
  ),
  (
    'd4000000-0000-0000-0000-000000000005',
    'Deep Work',
    'Mountain cabin at dawn with lofi beats and gentle wind. Designed for extended flow states.',
    true, NULL,
    '{"schema_version":1,"music":{"track_id":"a1000000-0000-0000-0000-000000000004","volume":0.45,"crossfade_seconds":6},"ambient":{"layers":[{"sound_id":"c3000000-0000-0000-0000-000000000004","volume":0.25}]},"visual":{"background_id":"b2000000-0000-0000-0000-000000000002","animations":[{"type":"fireflies","intensity":0.3,"speed":0.2}],"color_temperature":"warm","brightness":0.55,"vignette_intensity":0.35},"timer":{"method":"pomodoro","work_minutes":90,"short_break_minutes":15,"long_break_minutes":30,"cycles_before_long_break":2}}'::jsonb,
    NULL
  )
ON CONFLICT (id) DO NOTHING;
