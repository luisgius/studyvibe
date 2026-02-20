/**
 * Re-exports all types and schemas from lib/validation.ts.
 * This file exists for convenience — import from @/types or @/lib/validation.
 *
 * All types are derived from Zod schemas. Do NOT add manual type definitions here.
 */
export {
  // Schemas
  AnimationTypeSchema,
  AnimationConfigSchema,
  MusicConfigSchema,
  AmbientLayerSchema,
  AmbientConfigSchema,
  ColorTemperatureSchema,
  VisualConfigSchema,
  TimerMethodSchema,
  TimerConfigSchema,
  SessionConfigSchema,
  LLMInterpretationSchema,
  AudioEngineStateSchema,
  VisualEngineStateSchema,
  TrackSchema,
  BackgroundSchema,
  AmbientSoundSchema,
  PresetSchema,
  // Types
  type AnimationType,
  type AnimationConfig,
  type MusicConfig,
  type AmbientLayer,
  type AmbientConfig,
  type ColorTemperature,
  type VisualConfig,
  type TimerMethod,
  type TimerConfig,
  type SessionConfig,
  type LLMInterpretation,
  type AudioEngineState,
  type VisualEngineState,
  type Track,
  type Background,
  type AmbientSound,
  type Preset,
  type ValidationResult,
  // Functions
  validateLLMResponse,
  migrateConfig,
  CURRENT_SCHEMA_VERSION,
} from "@/lib/validation";
