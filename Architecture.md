# StudyVibe — Architecture Document v1.0

> **Purpose**: This document defines the complete technical architecture for StudyVibe, a web application that generates personalized study environments with custom music, ambient sounds, and animated visual backgrounds. It is designed to serve as the single source of truth for AI-assisted development (Claude Code / Codex).
>
> **Last updated**: February 2026

---

## 1. Product Vision

### Problem

YouTube is full of "lofi beats to study to" style videos, but finding one with the right combination of music, visuals, and duration is frustrating. Users are forced to compromise on either the audio or the visual experience.

### Solution

A web app where users describe what they want (via natural language prompt or manual controls), and the system generates a personalized study session combining:

- **Music** from a curated library, matched to the user's intent
- **Ambient sounds** (rain, ocean, fireplace, etc.) layered on top with independent volume controls
- **Animated visual backgrounds** (illustration/anime style) with subtle, non-distracting motion
- **Study timers** (Pomodoro, custom intervals, free session)

### Design Principles

1. **Non-distracting**: Every visual and audio element should enhance focus, never break it
2. **Personalized**: The user should get exactly what they want, not a "close enough" preset
3. **Simple surface, deep control**: Easy to start with a prompt, but full manual control available
4. **Performance**: Must run for hours without memory leaks, performance degradation, or excessive resource consumption

---

## 2. Tech Stack

| Layer               | Technology              | Version                    | Justification                                                                   |
| ------------------- | ----------------------- | -------------------------- | ------------------------------------------------------------------------------- |
| **Framework**       | Next.js (App Router)    | 14+                        | Full-stack React, API routes, Vercel-native deployment                          |
| **Language**        | TypeScript              | 5.x                        | Type safety critical for complex audio/visual state management                  |
| **Styling**         | Tailwind CSS            | 3.x                        | Rapid UI development, utility-first                                             |
| **Audio Engine**    | Tone.js + Web Audio API | 14.x                       | Professional audio mixing, effects, crossfading in the browser                  |
| **Visual Engine**   | Three.js                | r160+                      | Most complete WebGL library, supports 2D/2.5D scenes with shaders and particles |
| **Database**        | Supabase (PostgreSQL)   | -                          | Auth, DB, real-time subscriptions, Row Level Security                           |
| **File Storage**    | Supabase Storage        | -                          | MP3s, background images, ambient sound files                                    |
| **LLM**             | Claude API (Sonnet)     | claude-sonnet-4-5-20250929 | Prompt interpretation and session configuration                                 |
| **Deployment**      | Vercel                  | -                          | Zero-config Next.js hosting, edge functions, global CDN                         |
| **Package Manager** | pnpm                    | 8+                         | Fast, disk-efficient                                                            |

### Architecture Pattern

- **Frontend**: React components with client-side state (Zustand for global state)
- **Backend**: Next.js API routes (serverless functions on Vercel)
- **Audio/Visual**: Dedicated engine classes instantiated on the client, managed via React refs (NOT React state for performance-critical real-time rendering)

### Data Access Boundaries (STRICT)

Each data path has ONE primary access method. Never duplicate.

| Data                                                | Access Method                                               | Why                                             |
| --------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------- |
| Catalog reads (tracks, backgrounds, ambient_sounds) | **Supabase client SDK** (direct, RLS: public read)          | No secrets needed, low latency, CDN-cacheable   |
| System presets (read)                               | **Supabase client SDK** (direct, RLS: public read)          | Same as catalog                                 |
| User presets (read/write)                           | **Supabase client SDK** (direct, RLS: user-scoped)          | Auth token in client is sufficient              |
| Session history (write)                             | **API route** (`/api/sessions`)                              | Enforces server-side validation and consistent analytics writes |
| LLM interpretation                                  | **API route** (`/api/interpret`)                            | Requires ANTHROPIC_API_KEY (server-side secret) |
| Catalog summary for LLM                             | **API route** (fetched server-side inside `/api/interpret`) | Keeps catalog injection server-side             |

**Rule**: If it needs a server-side secret or centralized server-side validation/business logic → API route. If it only needs the user's auth token or is public and requires no server-only logic → Supabase client SDK.

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                      │
│                                                              │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  React UI │  │  Audio Engine │  │    Visual Engine        │ │
│  │  (Next.js)│  │  (Tone.js)   │  │    (Three.js)          │ │
│  │           │  │              │  │                        │ │
│  │ • Prompt  │  │ • MusicLayer │  │ • SceneManager         │ │
│  │ • Controls│──│ • AmbientMix │  │ • BackgroundLayer      │ │
│  │ • Timer   │  │ • MasterGain │  │ • ParticleSystem       │ │
│  │ • Presets │  │ • Crossfader │  │ • LightingEffects      │ │
│  └──────┬───┘  └──────────────┘  └────────────────────────┘ │
│         │                                                    │
│         │  Zustand Store (global state)                      │
└─────────┼────────────────────────────────────────────────────┘
          │
          │ HTTPS (API Routes)
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL (Serverless)                        │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────────────────────┐ │
│  │  /api/interpret   │  │          /api/sessions           │ │
│  │  (LLM Proxy)     │  │       (Validated Writes)          │ │
│  └────────┬─────────┘  └──────────────┬───────────────────┘ │
│           │                           │                      │
└───────────┼───────────────────────────┼──────────────────────┘
            │                           │
            ▼                           ▼
   ┌────────────────┐        ┌─────────────────────┐
   │   Claude API    │        │     Supabase         │
   │   (Sonnet)      │        │  • PostgreSQL (data) │
   └────────────────┘        │  • Storage (files)   │
                             │  • Auth (users)      │
                             └─────────────────────┘
```

---

## 4. Data Models (Supabase PostgreSQL)

### 4.1 `tracks` — Music library metadata

```sql
CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  filename TEXT NOT NULL,                    -- path in Supabase Storage
  duration_seconds INTEGER NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',          -- e.g., ['piano', 'classical', 'calm']
  energy FLOAT NOT NULL CHECK (energy >= 0 AND energy <= 1),  -- 0=very calm, 1=energetic
  instruments TEXT[] NOT NULL DEFAULT '{}',   -- e.g., ['piano', 'strings', 'synth']
  mood TEXT[] NOT NULL DEFAULT '{}',          -- e.g., ['focused', 'melancholic', 'uplifting']
  bpm_estimate INTEGER,                      -- beats per minute (approximate)
  hz_base INTEGER,                           -- e.g., 432, 528 (if relevant)
  best_for TEXT[] NOT NULL DEFAULT '{}',      -- e.g., ['programming', 'reading', 'meditation']
  genre TEXT,                                -- e.g., 'lofi', 'classical', 'ambient', 'electronic'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 4.2 `backgrounds` — Visual background assets

```sql
CREATE TABLE backgrounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  filename TEXT NOT NULL,                    -- path in Supabase Storage
  style TEXT NOT NULL DEFAULT 'illustration', -- 'illustration', 'anime', 'pixel_art', 'photo'
  scene_type TEXT NOT NULL,                  -- 'indoor', 'outdoor', 'space', 'urban', 'nature'
  time_of_day TEXT,                          -- 'day', 'night', 'sunset', 'dawn'
  mood TEXT[] NOT NULL DEFAULT '{}',          -- e.g., ['cozy', 'epic', 'serene']
  color_palette TEXT[] NOT NULL DEFAULT '{}', -- e.g., ['warm', 'cool', 'dark', 'pastel']
  compatible_animations TEXT[] NOT NULL DEFAULT '{}', -- which animation modules work with this bg
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 4.3 `ambient_sounds` — Layerable ambient audio

```sql
CREATE TABLE ambient_sounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                        -- e.g., 'Light Rain', 'Ocean Waves'
  category TEXT NOT NULL,                    -- 'weather', 'nature', 'urban', 'indoor', 'white_noise'
  filename TEXT NOT NULL,                    -- path in Supabase Storage (loopable MP3/OGG)
  duration_seconds INTEGER NOT NULL,
  is_loopable BOOLEAN DEFAULT true,
  tags TEXT[] NOT NULL DEFAULT '{}',
  icon TEXT,                                 -- emoji or icon name for UI
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 4.4 `presets` — Pre-built session configurations

```sql
CREATE TABLE presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                        -- e.g., 'Late Night Coding', 'Rainy Day Reading'
  description TEXT,
  is_system BOOLEAN DEFAULT false,           -- system presets vs user-created
  user_id UUID REFERENCES auth.users(id),    -- null for system presets
  config JSONB NOT NULL,                     -- full session configuration (see SessionConfig type)
  thumbnail_url TEXT,                        -- preview image
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 4.5 `session_history` — User session tracking

```sql
CREATE TABLE session_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  config JSONB NOT NULL,                     -- the SessionConfig used
  prompt_used TEXT,                           -- original user prompt (if any)
  duration_seconds INTEGER,                  -- actual session duration
  pomodoro_cycles_completed INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ
);
```

### 4.6 Config JSONB Versioning Strategy

All `config` JSONB columns (presets, session_history) store a `schema_version` field inside the JSON. This is **mandatory**.

**Rules:**

- Every `SessionConfig` object MUST include `"schema_version": 1` (current version)
- When the SessionConfig schema changes in a breaking way, increment the version number
- The application MUST include a `migrateConfig(config: unknown): SessionConfig` function that:
  1. Reads `schema_version` from the JSON
  2. If it matches the current version → return as-is
  3. If it's an older version → apply migration transforms sequentially (v1→v2→v3→...→current)
  4. If `schema_version` is missing → treat as v1 (the initial version)
- Migrations are applied **at read time** (when loading a preset or session), never by mutating the stored data
- This ensures old presets and session history remain functional across schema evolution

### 4.6 Indexes, Constraints, and Triggers

```sql
-- Unique constraints
ALTER TABLE tracks ADD CONSTRAINT uq_tracks_filename UNIQUE (filename);
ALTER TABLE backgrounds ADD CONSTRAINT uq_backgrounds_filename UNIQUE (filename);
ALTER TABLE ambient_sounds ADD CONSTRAINT uq_ambient_sounds_filename UNIQUE (filename);

-- GIN indexes for array/JSONB searches
CREATE INDEX idx_tracks_tags ON tracks USING GIN (tags);
CREATE INDEX idx_tracks_instruments ON tracks USING GIN (instruments);
CREATE INDEX idx_tracks_mood ON tracks USING GIN (mood);
CREATE INDEX idx_tracks_best_for ON tracks USING GIN (best_for);
CREATE INDEX idx_backgrounds_mood ON backgrounds USING GIN (mood);
CREATE INDEX idx_backgrounds_compatible_animations ON backgrounds USING GIN (compatible_animations);
CREATE INDEX idx_ambient_sounds_tags ON ambient_sounds USING GIN (tags);
CREATE INDEX idx_presets_config ON presets USING GIN (config);

-- B-tree indexes for frequent lookups
CREATE INDEX idx_tracks_genre ON tracks (genre);
CREATE INDEX idx_tracks_energy ON tracks (energy);
CREATE INDEX idx_backgrounds_scene_type ON backgrounds (scene_type);
CREATE INDEX idx_backgrounds_time_of_day ON backgrounds (time_of_day);
CREATE INDEX idx_ambient_sounds_category ON ambient_sounds (category);
CREATE INDEX idx_presets_user_id ON presets (user_id);
CREATE INDEX idx_presets_is_system ON presets (is_system);
CREATE INDEX idx_session_history_user_id ON session_history (user_id);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tracks_updated_at
  BEFORE UPDATE ON tracks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_presets_updated_at
  BEFORE UPDATE ON presets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 5. TypeScript Types (Core)

```typescript
// ============================================
// SESSION CONFIGURATION
// This is the central type that the LLM produces
// and that drives the entire application state
// ============================================

interface SessionConfig {
  schema_version: number; // REQUIRED. Current version: 1. Increment on breaking changes.
  music: MusicConfig;
  ambient: AmbientConfig;
  visual: VisualConfig;
  timer: TimerConfig;
}

interface MusicConfig {
  track_id: string; // UUID from tracks table
  volume: number; // 0.0 - 1.0
  crossfade_seconds: number; // for transitioning between tracks (default: 5)
}

interface AmbientConfig {
  layers: AmbientLayer[];
}

interface AmbientLayer {
  sound_id: string; // UUID from ambient_sounds table
  volume: number; // 0.0 - 1.0
}

interface VisualConfig {
  background_id: string; // UUID from backgrounds table
  animations: AnimationConfig[];
  color_temperature: "warm" | "cool" | "neutral";
  brightness: number; // 0.0 - 1.0 (default: 0.7, dimmed for focus)
  vignette_intensity: number; // 0.0 - 1.0 (darkened edges)
}

interface AnimationConfig {
  type: AnimationType;
  intensity: number; // 0.0 - 1.0 (frequency/density of the animation)
  speed: number; // 0.0 - 1.0 (how fast elements move)
}

type AnimationType =
  | "shooting_stars" // brief streaks across the sky
  | "fireflies" // floating glowing dots
  | "rain_drops" // falling rain particles
  | "snow" // falling snow particles
  | "floating_particles" // generic gentle floating particles
  | "light_flicker" // subtle light source flickering
  | "parallax_drift" // slow camera movement creating depth
  | "aurora" // northern lights effect
  | "clouds_drift" // slow-moving clouds
  | "leaves_falling"; // autumn leaves

interface TimerConfig {
  method: "pomodoro" | "custom_intervals" | "free" | "countdown";
  // Pomodoro-specific
  work_minutes?: number; // default: 25
  short_break_minutes?: number; // default: 5
  long_break_minutes?: number; // default: 15
  cycles_before_long_break?: number; // default: 4
  // Countdown-specific
  total_minutes?: number;
  // Free session has no additional config
  // Custom intervals
  intervals?: { label: string; minutes: number }[];
}

// ============================================
// LLM RESPONSE TYPE
// What the Claude API returns after interpreting a prompt
// ============================================

interface LLMInterpretation {
  config: SessionConfig;
  needs_clarification: boolean;
  clarification_questions?: string[];
  reasoning?: string; // why these choices were made (for debug/transparency)
}

// ============================================
// AUDIO ENGINE TYPES
// ============================================

interface AudioEngineState {
  is_playing: boolean;
  master_volume: number;
  music_volume: number;
  ambient_volumes: Record<string, number>; // sound_id -> volume
  current_track_id: string | null;
  current_track_progress: number; // 0.0 - 1.0
  is_crossfading: boolean;
}

// ============================================
// VISUAL ENGINE TYPES
// ============================================

interface VisualEngineState {
  is_running: boolean;
  current_background_id: string | null;
  active_animations: AnimationType[];
  fps: number; // for performance monitoring
}
```

---

## 6. API Routes

> **Note**: Catalog reads (tracks, backgrounds, ambient sounds, system presets) are done
> directly from the client via Supabase SDK with RLS policies. API routes exist ONLY for
> operations that require server-side secrets (LLM) or server-side validation.

### 6.1 `POST /api/interpret` — LLM prompt interpretation

**Request:**

```json
{
  "prompt": "I need to focus on programming tonight, something calm but not sleepy"
}
```

> The client does NOT send catalog IDs. The server fetches a compact catalog summary
> itself. This keeps the request small and prevents clients from manipulating the catalog.

**Backend logic:**

1. Fetch **compact catalog summary** from Supabase (id, title, tags, energy, mood, best_for only — NOT full objects)
2. If catalog exceeds context budget (>50 items per category), pre-filter by extracting keywords from the user prompt and filtering by tags/mood/best_for server-side before injection
3. Build system prompt with compact catalog context (see Section 8)
4. Call Claude API with user prompt + catalog
5. **Validate response with Zod schema** (see Section 8.1). If parsing fails → return fallback preset with `"reasoning": "LLM output was malformed, using default configuration"`
6. Validate all referenced IDs exist in the database
7. Return `LLMInterpretation`

**Response:**

```json
{
  "config": {
    /* SessionConfig with schema_version: 1 */
  },
  "needs_clarification": false,
  "reasoning": "Selected ambient piano track with low energy for late-night coding. Added light rain for background texture without distraction."
}
```

### 6.2 `POST /api/sessions` — Log a completed session (authenticated)

**Request:**

```json
{
  "config": {
    /* SessionConfig */
  },
  "prompt_used": "calm programming night",
  "duration_seconds": 5400,
  "pomodoro_cycles_completed": 4
}
```

---

## 7. Component Architecture (React)

```
src/
├── app/
│   ├── layout.tsx                   # Root layout with providers
│   ├── page.tsx                     # Main app page (single page app)
│   └── api/
│       ├── interpret/route.ts       # LLM proxy (server-side only)
│       └── sessions/route.ts        # Session logging (authenticated)
│
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx             # Main layout wrapper
│   │   └── ControlPanel.tsx         # Sidebar/bottom panel with all controls
│   │
│   ├── prompt/
│   │   ├── PromptInput.tsx          # Text input + submit button
│   │   └── ClarificationDialog.tsx  # Follow-up questions from LLM
│   │
│   ├── audio/
│   │   ├── MusicPlayer.tsx          # Track display, progress, controls
│   │   ├── AmbientMixer.tsx         # Grid of ambient sounds with sliders
│   │   └── MasterVolume.tsx         # Global volume control
│   │
│   ├── visual/
│   │   ├── VisualCanvas.tsx         # Three.js canvas wrapper (React ref)
│   │   ├── BackgroundSelector.tsx   # Gallery of available backgrounds
│   │   └── AnimationControls.tsx    # Toggle animations, adjust intensity
│   │
│   ├── timer/
│   │   ├── TimerDisplay.tsx         # Clock display + current phase
│   │   ├── TimerControls.tsx        # Start/pause/reset + method selection
│   │   └── PomodoroConfig.tsx       # Configure work/break intervals
│   │
│   └── presets/
│       ├── PresetGrid.tsx           # Browse presets (system + user)
│       └── PresetSaveDialog.tsx     # Save current config as preset
│
├── engines/
│   ├── audio/
│   │   ├── AudioEngine.ts           # Main audio controller class
│   │   ├── MusicPlayer.ts           # Single track playback with crossfade
│   │   ├── AmbientLayer.ts          # Individual ambient sound with loop
│   │   └── AudioMixer.ts            # Mixing bus, master gain, effects
│   │
│   └── visual/
│       ├── VisualEngine.ts          # Main Three.js scene controller
│       ├── BackgroundLayer.ts       # Loads image as textured plane
│       ├── animations/
│       │   ├── BaseAnimation.ts     # Abstract animation interface
│       │   ├── ShootingStars.ts
│       │   ├── Fireflies.ts
│       │   ├── RainDrops.ts
│       │   ├── Snow.ts
│       │   ├── FloatingParticles.ts
│       │   ├── LightFlicker.ts
│       │   ├── ParallaxDrift.ts
│       │   ├── Aurora.ts
│       │   ├── CloudsDrift.ts
│       │   └── LeavesFalling.ts
│       └── effects/
│           ├── ColorTemperature.ts  # Warm/cool color grading
│           ├── Vignette.ts          # Darkened edges
│           └── Brightness.ts        # Overall brightness control
│
├── store/
│   ├── useSessionStore.ts           # Zustand: current SessionConfig
│   ├── useAudioStore.ts             # Zustand: audio engine state
│   ├── useVisualStore.ts            # Zustand: visual engine state
│   └── useTimerStore.ts             # Zustand: timer state and logic
│
├── lib/
│   ├── supabase.ts                  # Supabase client initialization
│   ├── claude.ts                    # Claude API helper (server-side only)
│   ├── validation.ts                # Zod schemas for LLM output validation (source of truth for all types)
│   ├── catalog.ts                   # Supabase direct queries for tracks, backgrounds, ambient sounds
│   └── utils.ts                     # Shared utilities
│
└── types/
    └── index.ts                     # All TypeScript types from Section 5
```

---

## 8. LLM System Prompt (for /api/interpret)

```
You are the brain of StudyVibe, a personalized study environment generator.

Your job is to interpret the user's natural language request and produce an
LLMInterpretation JSON object that configures their ideal study session.

## Available Catalog (compact summaries)

### Music Tracks:
{tracks_compact_json}

### Backgrounds:
{backgrounds_compact_json}

### Ambient Sounds:
{ambient_sounds_compact_json}

## Rules:

1. ALWAYS return a valid JSON object matching the LLMInterpretation schema below
2. The top-level object is LLMInterpretation, which CONTAINS a config (SessionConfig). Do NOT return SessionConfig directly.
3. Only reference IDs that exist in the catalog above
4. If the user's request is clear, set needs_clarification to false and provide a complete config
5. If ambiguous, set needs_clarification to true, provide 1-3 specific questions, and still provide a best-guess config
6. Match energy levels: "focus" = low-medium energy, "motivation" = medium-high, "relaxation" = very low
7. Consider time of day cues: "night" = darker backgrounds, warmer colors; "morning" = brighter, cooler
8. Consider activity cues: "programming" = minimal distraction, lower animation intensity; "creative writing" = more inspiring visuals
9. Default timer to Pomodoro 25/5 unless the user specifies otherwise
10. Default ambient sounds: add 1-2 subtle layers unless the user says "no ambient sounds"
11. Keep animation intensity low by default (0.2-0.4) — this is for focus, not entertainment
12. Always explain your reasoning in the "reasoning" field
13. config.schema_version MUST always be 1

## Output Schema (EXACT shape required):

{
  "config": {
    "schema_version": 1,
    "music": { "track_id": "uuid", "volume": 0.7, "crossfade_seconds": 5 },
    "ambient": { "layers": [{ "sound_id": "uuid", "volume": 0.3 }] },
    "visual": {
      "background_id": "uuid",
      "animations": [{ "type": "fireflies", "intensity": 0.3, "speed": 0.2 }],
      "color_temperature": "warm",
      "brightness": 0.7,
      "vignette_intensity": 0.3
    },
    "timer": { "method": "pomodoro", "work_minutes": 25, "short_break_minutes": 5, "long_break_minutes": 15, "cycles_before_long_break": 4 }
  },
  "needs_clarification": false,
  "clarification_questions": [],
  "reasoning": "Explanation of choices..."
}

Respond with ONLY the JSON object. No markdown fences. No text outside the JSON.
```

### 8.1 LLM Output Validation (Zod)

The LLM is non-deterministic. Its output MUST be validated before use. Use Zod schemas that mirror the TypeScript types from Section 5.

**Validation pipeline:**

1. Attempt `JSON.parse()` on the raw LLM response string. If it fails, retry once with a repair prompt requesting strict JSON-only output. If it still fails → **fallback to default preset**.
2. Run parsed JSON through `LLMInterpretationSchema.safeParse()`. If it fails → **fallback to default preset**, log the validation errors for debugging.
3. Verify all referenced IDs (track_id, background_id, sound_ids) exist in the database. If any are invalid → replace with a valid default from the same category, log the substitution.
4. Clamp all numeric values to their valid ranges (volume 0-1, intensity 0-1, etc.).
5. If `needs_clarification` is true, `config` is still required and must be valid. If `config` is missing or invalid → **fallback to default preset**.

**Fallback behavior:**
When validation fails, return:

```json
{
  "config": {
    /* system default preset "Calm Focus" */
  },
  "needs_clarification": false,
  "reasoning": "Your session has been configured with default settings. You can adjust everything using the manual controls.",
  "_meta": { "fallback_used": true, "original_error": "..." }
}
```

The Zod schemas must be the **single source of truth** for validation — the TypeScript types in Section 5 should be derived from them using `z.infer<>`, not maintained separately.

---

## 9. Engine Specifications

### 9.1 Audio Engine (Tone.js)

**Architecture:**

```
MasterGain (0.0 - 1.0)
├── MusicChannel
│   ├── PlayerA (current track)  ──→ GainNode ──→ MusicBus
│   └── PlayerB (next track)     ──→ GainNode ──→ MusicBus (for crossfade)
│
└── AmbientChannel
    ├── Layer: Rain     ──→ GainNode ──→ AmbientBus
    ├── Layer: Fire     ──→ GainNode ──→ AmbientBus
    └── Layer: Wind     ──→ GainNode ──→ AmbientBus

MusicBus + AmbientBus ──→ MasterGain ──→ Destination (speakers)
```

**Key behaviors:**

- **Crossfade**: When switching tracks, fade out PlayerA while fading in PlayerB over N seconds (configurable, default 5s). Use equal-power crossfade (not linear) to avoid volume dip.
- **Looping**: Ambient sounds loop seamlessly. Music tracks can optionally loop or auto-advance.
- **Lazy loading**: Don't load all MP3s at startup. Load on demand, with a loading indicator.
- **Memory management**: When a track finishes crossfading out, dispose of its buffer. Critical for multi-hour sessions.
- **Resume after tab focus**: Web Audio API suspends when tab is backgrounded in some browsers. Handle `AudioContext.resume()` on visibility change.

### 9.2 Visual Engine (Three.js)

**Scene setup:**

```
Camera: OrthographicCamera (2D/2.5D scene, no perspective distortion)
Scene:
├── BackgroundMesh (plane with image texture, fills viewport)
├── AnimationGroup (container for all animation objects)
│   ├── ParticleSystem instances
│   └── Overlay effects
└── PostProcessing (if needed)
    ├── ColorGrading (temperature, brightness)
    └── Vignette
```

**Key behaviors:**

- **Responsive**: Canvas fills viewport, background image scales with `cover` behavior (no stretching)
- **Animation loop**: Use `requestAnimationFrame` with delta time for consistent speed regardless of frame rate
- **Performance**: Target 30fps (not 60 — saves battery/CPU for multi-hour sessions). Use `renderer.setAnimationLoop` with frame limiting.
- **Animation modules**: Each animation type is a class extending `BaseAnimation` with `init()`, `update(deltaTime)`, and `dispose()` methods. They are added/removed dynamically.
- **Particle recycling**: Particle systems use object pooling — don't create/destroy objects every frame. Pre-allocate a fixed pool and recycle.
- **Resolution scaling**: On lower-end devices, reduce canvas resolution (e.g., 0.75x) while keeping CSS size full. Add a quality setting.

**BaseAnimation interface:**

```typescript
abstract class BaseAnimation {
  abstract init(scene: THREE.Scene, config: AnimationConfig): void;
  abstract update(deltaTime: number): void;
  abstract setIntensity(intensity: number): void;
  abstract setSpeed(speed: number): void;
  abstract dispose(): void;
}
```

---

## 10. Implementation Phases

### Phase 1 — Static MVP (no LLM, manual controls only)

**Goal**: A working audio player + visual canvas with manual selection.

**Deliverables:**

- [ ] Next.js project setup with TypeScript, Tailwind, Supabase
- [ ] Supabase tables created (tracks, backgrounds, ambient_sounds)
- [ ] 10 music tracks uploaded to Supabase Storage with metadata
- [ ] 5 background images (illustration style) uploaded with metadata
- [ ] 6 ambient sounds uploaded (rain, ocean, fireplace, wind, birds, coffee shop)
- [ ] Audio Engine: play/pause music, control volume, basic crossfade
- [ ] Audio Engine: ambient sound mixer with independent volume sliders
- [ ] Visual Engine: display background image on Three.js canvas
- [ ] Visual Engine: 3 animation types working (shooting_stars, fireflies, floating_particles)
- [ ] UI: music selector, ambient mixer, background gallery, master volume
- [ ] UI: basic Pomodoro timer (25/5 default)
- [ ] Deployed on Vercel

**Estimated effort**: 2-3 weeks of part-time vibe coding

### Phase 2 — LLM Integration

**Goal**: User can type a prompt and get a configured session.

**Deliverables:**

- [ ] `/api/interpret` endpoint with Claude API integration
- [ ] System prompt with dynamic catalog injection
- [ ] Prompt input UI with loading state
- [ ] Clarification dialog for ambiguous prompts
- [ ] Session auto-configuration from LLM response
- [ ] "Reasoning" display (optional, for transparency)

**Estimated effort**: 1-2 weeks

### Phase 3 — Presets and Persistence

**Goal**: Save, load, and share session configurations.

**Deliverables:**

- [ ] Supabase Auth integration (email + social login)
- [ ] 5-10 system presets (hand-crafted good defaults)
- [ ] Save current session as user preset
- [ ] Preset browser UI (cards with thumbnails)
- [ ] Session history logging
- [ ] RLS policies for user data isolation

**Estimated effort**: 1-2 weeks

### Phase 4 — Polish and Remaining Animations

**Goal**: Complete the animation library and polish the UX.

**Deliverables:**

- [ ] Remaining animation types (rain, snow, aurora, clouds, leaves, light_flicker, parallax)
- [ ] Color temperature and brightness controls
- [ ] Vignette effect
- [ ] Smooth transitions between backgrounds
- [ ] Loading states and skeleton UI
- [ ] Error handling and offline graceful degradation
- [ ] Mobile responsive layout
- [ ] Keyboard shortcuts (space = play/pause, etc.)

**Estimated effort**: 2-3 weeks

### Phase 5 — Advanced Features (future)

- [ ] AI-generated music (Suno API / MusicGen integration)
- [ ] AI-generated backgrounds (Stable Diffusion + animation)
- [ ] User image upload with auto-animation
- [ ] Study statistics dashboard
- [ ] Shareable session links
- [ ] Browser notifications for Pomodoro breaks
- [ ] Spotify integration as alternative music source

---

## 11. Supabase Storage Structure

```
studyvibe-assets/
├── tracks/
│   ├── track_001_deep_focus_piano.mp3
│   ├── track_002_ambient_synth.mp3
│   └── ...
├── backgrounds/
│   ├── bg_001_cozy_room_night.png
│   ├── bg_002_mountain_cabin.png
│   └── ...
└── ambient/
    ├── amb_rain_light.mp3
    ├── amb_ocean_waves.mp3
    ├── amb_fireplace.mp3
    ├── amb_wind_gentle.mp3
    ├── amb_birds_morning.mp3
    └── amb_coffee_shop.mp3
```

**Storage policies:**

- Public read access for all audio and image files (served via CDN)
- Write access restricted to admin/service role only
- Files served with appropriate cache headers (immutable content, long cache)

---

## 12. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # Server-side only, never expose

# Claude API
ANTHROPIC_API_KEY=sk-ant-...            # Server-side only

# App
NEXT_PUBLIC_APP_URL=https://studyvibe.vercel.app
```

---

## 13. Performance Budget

| Metric              | Target          | Why                                                    |
| ------------------- | --------------- | ------------------------------------------------------ |
| Initial bundle (JS) | < 300KB gzipped | Fast first load                                        |
| Canvas FPS          | 30fps stable    | Battery/CPU preservation for long sessions             |
| Audio latency       | < 50ms          | Responsive volume/track changes                        |
| Memory after 2hrs   | < 500MB         | No memory leaks from particle systems or audio buffers |
| Time to interactive | < 3s            | User can start a session quickly                       |

---

## 14. Key Technical Decisions Log

| Decision          | Choice             | Alternatives Considered        | Rationale                                                                                  |
| ----------------- | ------------------ | ------------------------------ | ------------------------------------------------------------------------------------------ |
| State management  | Zustand            | Redux, Jotai, Context          | Minimal boilerplate, good TypeScript support, no providers needed                          |
| Audio library     | Tone.js            | Howler.js, raw Web Audio       | Best balance of abstraction and control, built-in effects and scheduling                   |
| Visual library    | Three.js           | PixiJS, Canvas 2D, p5.js       | Most future-proof, WebGPU ready, handles both 2D and 3D                                    |
| LLM               | Claude Sonnet      | GPT-4, Claude Haiku            | Best structured output quality for the cost; Haiku as fallback for cost optimization later |
| Styling           | Tailwind           | CSS Modules, styled-components | Fastest for AI-generated code, class-based approach is easy to review                      |
| Background style  | Illustration/anime | Photography, pixel art         | Easier to animate with particles (less visual conflict), more stylistic cohesion           |
| Frame rate target | 30fps              | 60fps                          | Multi-hour sessions need battery preservation; visual content is slow-moving anyway        |
| DB                | Supabase           | PlanetScale, Neon, Firebase    | Integrated auth + storage + DB simplifies architecture significantly                       |

---

## 15. Security Considerations

- **API keys**: Claude API key NEVER exposed to client. All LLM calls go through server-side API routes.
- **RLS**: All Supabase tables have Row Level Security policies. Users can only read/write their own presets and session history. Catalog tables (tracks, backgrounds, ambient_sounds) have public read, admin-only write.
- **Rate limiting**: `/api/interpret` should be rate-limited (e.g., 10 requests per minute per user) to prevent LLM API abuse. Implement via Vercel edge middleware or Upstash Redis.
- **Input sanitization**: User prompts are passed to the LLM but should be length-limited (max 500 chars) and sanitized.
- **CORS**: Supabase Storage configured with appropriate CORS for the app domain only.

### 15.1 LLM Output Validation (Critical)

The LLM can return malformed JSON, hallucinated IDs, or out-of-range values. A strict validation layer is **mandatory** between the LLM response and the application.

**Validation pipeline:**

1. **Parse**: Attempt `JSON.parse()` on LLM output. If it fails, retry once with a repair prompt. If still fails, return fallback preset.
2. **Schema validate**: Use **Zod** to validate the parsed object against `LLMInterpretation` schema. Every field must match type, range, and constraints.
3. **Referential integrity**: Verify all `track_id`, `background_id`, and `sound_id` values exist in the database. If any are invalid, replace with a valid default from the same category and log the substitution.
4. **Range clamping**: Clamp all numeric values to their valid ranges (volumes 0-1, intensity 0-1, etc.) rather than rejecting outright.
5. **Fallback**: If validation fails after retry, return a safe default preset (e.g., "Calm Focus" system preset) with a user-facing message: "I couldn't fully understand your request. Here's a starting point — feel free to adjust."

**Zod schemas must be the single source of truth** — the TypeScript interfaces in Section 5 are derived from them, not the other way around.

### 15.2 Catalog Injection Scalability

For the MVP (10 tracks, 5 backgrounds, 6 ambient sounds), injecting the full catalog into the LLM context is fine (~2-3K tokens). As the catalog grows, this must evolve:

- **Phase 1-3 (< 50 items total)**: Full catalog injection. Simple, reliable.
- **Phase 5+ (50+ items)**: Pre-filter candidates before LLM call. Extract key terms from the user prompt (via a lightweight first LLM call or keyword extraction), query Supabase with tag/mood filters, and send only the top 20-30 relevant items to the LLM. This reduces cost and latency while maintaining quality.

---

## 16. Content Sourcing Notes (MVP)

### Music Tracks (10 for MVP)

For the initial version, curate tracks from royalty-free sources:

- **Pixabay Music** (free, no attribution required)
- **Free Music Archive** (check individual licenses)
- **Incompetech** (Kevin MacLeod, CC BY)

Categories to cover:

1. 2x Classical piano (calm, focused)
2. 2x Lo-fi / chill hop
3. 2x Ambient / atmospheric
4. 2x Nature-inspired instrumental
5. 1x Jazz / café style
6. 1x Electronic / minimal

### Background Images (5-6 for MVP)

Source from royalty-free illustration sites or commission:

1. Cozy room at night (desk, window, rain outside)
2. Mountain cabin with fireplace
3. Space / stars / nebula
4. Japanese garden / temple
5. City rooftop at night (urban skyline)
6. Forest clearing with stream

### Ambient Sounds (6 for MVP)

Source from Freesound.org (check licenses) or record:

1. Light rain
2. Ocean waves
3. Fireplace crackling
4. Gentle wind
5. Morning birds
6. Coffee shop ambiance

---

_This document should be treated as the source of truth for the project. Update it as decisions evolve._
