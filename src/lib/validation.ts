/**
 * Zod schemas — SINGLE SOURCE OF TRUTH for all types.
 *
 * TypeScript types are derived from these schemas using z.infer<>.
 * Do NOT create manual interface/type definitions that duplicate these.
 *
 * Architecture reference: Sections 5, 8.1, 4.6
 */
import { z } from "zod/v4";

// ============================================
// ANIMATION TYPES
// ============================================

export const AnimationTypeSchema = z.enum([
  "shooting_stars",
  "fireflies",
  "rain_drops",
  "snow",
  "floating_particles",
  "light_flicker",
  "parallax_drift",
  "aurora",
  "clouds_drift",
  "leaves_falling",
]);

export const AnimationConfigSchema = z.object({
  type: AnimationTypeSchema,
  intensity: z.number().min(0).max(1),
  speed: z.number().min(0).max(1),
});

// ============================================
// MUSIC CONFIG
// ============================================

export const MusicConfigSchema = z.object({
  track_id: z.string().min(1),
  volume: z.number().min(0).max(1),
  crossfade_seconds: z.number().min(0).max(30),
});

// ============================================
// AMBIENT CONFIG
// ============================================

export const AmbientLayerSchema = z.object({
  sound_id: z.string().min(1),
  volume: z.number().min(0).max(1),
});

export const AmbientConfigSchema = z.object({
  layers: z.array(AmbientLayerSchema),
});

// ============================================
// VISUAL CONFIG
// ============================================

export const ColorTemperatureSchema = z.enum(["warm", "cool", "neutral"]);

export const VisualConfigSchema = z.object({
  background_id: z.string().min(1),
  animations: z.array(AnimationConfigSchema),
  color_temperature: ColorTemperatureSchema,
  brightness: z.number().min(0).max(1),
  vignette_intensity: z.number().min(0).max(1),
});

// ============================================
// TIMER CONFIG
// ============================================

export const TimerMethodSchema = z.enum([
  "pomodoro",
  "custom_intervals",
  "free",
  "countdown",
]);

export const IntervalSchema = z.object({
  label: z.string(),
  minutes: z.number().min(0),
});

export const TimerConfigSchema = z.object({
  method: TimerMethodSchema,
  // Pomodoro-specific
  work_minutes: z.number().min(0).max(240).optional(),
  short_break_minutes: z.number().min(0).max(120).optional(),
  long_break_minutes: z.number().min(0).max(120).optional(),
  cycles_before_long_break: z.number().min(1).max(20).optional(),
  // Countdown-specific
  total_minutes: z.number().min(0).max(720).optional(),
  // Custom intervals
  intervals: z.array(IntervalSchema).optional(),
});

// ============================================
// SESSION CONFIG (Central type)
// ============================================

export const CURRENT_SCHEMA_VERSION = 1;

export const SessionConfigSchema = z.object({
  schema_version: z.literal(CURRENT_SCHEMA_VERSION),
  music: MusicConfigSchema,
  ambient: AmbientConfigSchema,
  visual: VisualConfigSchema,
  timer: TimerConfigSchema,
});

// ============================================
// LLM INTERPRETATION
// ============================================

export const LLMInterpretationSchema = z.object({
  config: SessionConfigSchema,
  needs_clarification: z.boolean(),
  clarification_questions: z.array(z.string()).optional(),
  reasoning: z.string().optional(),
});

// ============================================
// AUDIO ENGINE STATE
// ============================================

export const AudioEngineStateSchema = z.object({
  is_playing: z.boolean(),
  master_volume: z.number().min(0).max(1),
  music_volume: z.number().min(0).max(1),
  ambient_volumes: z.record(z.string(), z.number().min(0).max(1)),
  current_track_id: z.string().nullable(),
  current_track_progress: z.number().min(0).max(1),
  is_crossfading: z.boolean(),
});

// ============================================
// VISUAL ENGINE STATE
// ============================================

export const VisualEngineStateSchema = z.object({
  is_running: z.boolean(),
  current_background_id: z.string().nullable(),
  active_animations: z.array(AnimationTypeSchema),
  fps: z.number(),
});

// ============================================
// DATABASE ROW TYPES (for catalog queries)
// ============================================

export const TrackSchema = z.object({
  id: z.string(),
  title: z.string(),
  filename: z.string(),
  duration_seconds: z.number(),
  tags: z.array(z.string()),
  energy: z.number().min(0).max(1),
  instruments: z.array(z.string()),
  mood: z.array(z.string()),
  bpm_estimate: z.number().nullable().optional(),
  hz_base: z.number().nullable().optional(),
  best_for: z.array(z.string()),
  genre: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const BackgroundSchema = z.object({
  id: z.string(),
  title: z.string(),
  filename: z.string(),
  style: z.string(),
  scene_type: z.string(),
  time_of_day: z.string().nullable().optional(),
  mood: z.array(z.string()),
  color_palette: z.array(z.string()),
  compatible_animations: z.array(z.string()),
  width: z.number(),
  height: z.number(),
  created_at: z.string().optional(),
});

export const AmbientSoundSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  filename: z.string(),
  duration_seconds: z.number(),
  is_loopable: z.boolean().optional(),
  tags: z.array(z.string()),
  icon: z.string().nullable().optional(),
  created_at: z.string().optional(),
});

export const PresetSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  is_system: z.boolean(),
  user_id: z.string().nullable().optional(),
  config: SessionConfigSchema,
  thumbnail_url: z.string().nullable().optional(),
  usage_count: z.number().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// ============================================
// INFERRED TYPES (single source of truth)
// ============================================

export type AnimationType = z.infer<typeof AnimationTypeSchema>;
export type AnimationConfig = z.infer<typeof AnimationConfigSchema>;
export type MusicConfig = z.infer<typeof MusicConfigSchema>;
export type AmbientLayer = z.infer<typeof AmbientLayerSchema>;
export type AmbientConfig = z.infer<typeof AmbientConfigSchema>;
export type ColorTemperature = z.infer<typeof ColorTemperatureSchema>;
export type VisualConfig = z.infer<typeof VisualConfigSchema>;
export type TimerMethod = z.infer<typeof TimerMethodSchema>;
export type TimerConfig = z.infer<typeof TimerConfigSchema>;
export type SessionConfig = z.infer<typeof SessionConfigSchema>;
export type LLMInterpretation = z.infer<typeof LLMInterpretationSchema>;
export type AudioEngineState = z.infer<typeof AudioEngineStateSchema>;
export type VisualEngineState = z.infer<typeof VisualEngineStateSchema>;
export type Track = z.infer<typeof TrackSchema>;
export type Background = z.infer<typeof BackgroundSchema>;
export type AmbientSound = z.infer<typeof AmbientSoundSchema>;
export type Preset = z.infer<typeof PresetSchema>;

// ============================================
// VALIDATION FUNCTIONS
// ============================================

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Validates a raw JSON string as an LLMInterpretation.
 * Returns a discriminated union: success with data, or failure with error message.
 */
export function validateLLMResponse(
  raw: string | null | undefined,
): ValidationResult<LLMInterpretation> {
  if (!raw || typeof raw !== "string") {
    return { success: false, error: "Input must be a non-empty string" };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return {
      success: false,
      error: `Invalid JSON: ${e instanceof Error ? e.message : "parse error"}`,
    };
  }

  const result = LLMInterpretationSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    return { success: false, error: `Validation failed: ${issues}` };
  }

  return { success: true, data: result.data };
}

/**
 * Migrates a config from any version to the current schema version.
 * - Missing schema_version → treated as v1
 * - Current version → returned as-is
 * - Future versions → throw error (can't migrate forward)
 *
 * Architecture reference: Section 4.6 Config JSONB Versioning Strategy
 */
export function migrateConfig(config: unknown): SessionConfig {
  if (typeof config !== "object" || config === null) {
    throw new Error(
      "Invalid config: expected an object, got " + typeof config,
    );
  }

  const raw = config as Record<string, unknown>;

  // Missing schema_version → treat as v1
  if (raw.schema_version === undefined || raw.schema_version === null) {
    raw.schema_version = CURRENT_SCHEMA_VERSION;
  }

  // Currently only v1 exists. When v2 is introduced, add migration logic here:
  // if (raw.schema_version === 0) { /* migrate 0 → 1 */ raw.schema_version = 1; }

  // For legacy/unknown versions, attempt to treat as current
  if (typeof raw.schema_version === "number" && raw.schema_version < CURRENT_SCHEMA_VERSION) {
    raw.schema_version = CURRENT_SCHEMA_VERSION;
  }

  const result = SessionConfigSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Config migration failed: ${issues}`);
  }

  return result.data;
}
