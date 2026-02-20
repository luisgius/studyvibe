-- StudyVibe: Table creation migration
-- Run this FIRST in Supabase SQL Editor.
-- All tables use UUID primary keys and are idempotent (safe to re-run).

-- ============================================
-- 1. tracks — Music library metadata
-- ============================================
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

-- ============================================
-- 2. backgrounds — Visual background assets
-- ============================================
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

-- ============================================
-- 3. ambient_sounds — Layerable ambient audio
-- ============================================
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

-- ============================================
-- 4. presets — Pre-built session configurations
-- ============================================
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

-- ============================================
-- 5. session_history — User session tracking
-- ============================================
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
