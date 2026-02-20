/**
 * Validates seed data against Zod schemas.
 *
 * Run: npx tsx scripts/validate-seed.ts
 *
 * This script ensures all seed SQL data would pass our Zod validation
 * at runtime. It uses the same schemas that the app uses to parse
 * catalog query results and preset configs.
 */

import {
  TrackSchema,
  BackgroundSchema,
  AmbientSoundSchema,
  SessionConfigSchema,
} from "../src/lib/validation";

// =============================================
// Seed data mirroring seed.sql
// =============================================

const tracks = [
  { id: "a1000000-0000-0000-0000-000000000001", title: "Moonlit Sonata Study", filename: "tracks/moonlit-sonata-study.mp3", duration_seconds: 240, tags: ["classical", "piano", "calm"], energy: 0.2, instruments: ["piano"], mood: ["serene", "contemplative"], bpm_estimate: 72, hz_base: 440, best_for: ["reading", "deep_work"], genre: "classical" },
  { id: "a1000000-0000-0000-0000-000000000002", title: "Gentle Prelude in C", filename: "tracks/gentle-prelude-c.mp3", duration_seconds: 300, tags: ["classical", "piano", "soft"], energy: 0.15, instruments: ["piano"], mood: ["peaceful", "dreamy"], bpm_estimate: 60, hz_base: 432, best_for: ["meditation", "reading"], genre: "classical" },
  { id: "a1000000-0000-0000-0000-000000000003", title: "Rainy Afternoon Beats", filename: "tracks/rainy-afternoon-beats.mp3", duration_seconds: 195, tags: ["lofi", "chill", "beats"], energy: 0.4, instruments: ["synth", "drums", "keys"], mood: ["relaxed", "nostalgic"], bpm_estimate: 85, hz_base: null, best_for: ["studying", "coding"], genre: "lofi" },
  { id: "a1000000-0000-0000-0000-000000000004", title: "Late Night Code Session", filename: "tracks/late-night-code-session.mp3", duration_seconds: 210, tags: ["lofi", "hiphop", "chill"], energy: 0.45, instruments: ["synth", "bass", "drums"], mood: ["focused", "mellow"], bpm_estimate: 90, hz_base: null, best_for: ["coding", "deep_work"], genre: "lofi" },
  { id: "a1000000-0000-0000-0000-000000000005", title: "Deep Space Drift", filename: "tracks/deep-space-drift.mp3", duration_seconds: 360, tags: ["ambient", "space", "ethereal"], energy: 0.1, instruments: ["synth", "pad"], mood: ["vast", "dreamy", "immersive"], bpm_estimate: null, hz_base: 432, best_for: ["meditation", "sleep"], genre: "ambient" },
  { id: "a1000000-0000-0000-0000-000000000006", title: "Forest Whisper Ambience", filename: "tracks/forest-whisper-ambience.mp3", duration_seconds: 420, tags: ["ambient", "nature", "organic"], energy: 0.15, instruments: ["field_recording", "pad"], mood: ["natural", "grounding"], bpm_estimate: null, hz_base: 440, best_for: ["relaxation", "yoga"], genre: "ambient" },
  { id: "a1000000-0000-0000-0000-000000000007", title: "Mountain Stream Guitar", filename: "tracks/mountain-stream-guitar.mp3", duration_seconds: 270, tags: ["acoustic", "nature", "guitar"], energy: 0.3, instruments: ["guitar", "nature_sounds"], mood: ["warm", "uplifting"], bpm_estimate: 100, hz_base: null, best_for: ["morning_routine", "creative"], genre: "acoustic" },
  { id: "a1000000-0000-0000-0000-000000000008", title: "Sunrise Flute Meditation", filename: "tracks/sunrise-flute-meditation.mp3", duration_seconds: 330, tags: ["world", "flute", "meditative"], energy: 0.2, instruments: ["flute", "nature_sounds"], mood: ["spiritual", "calm"], bpm_estimate: null, hz_base: 528, best_for: ["meditation", "morning_routine"], genre: "world" },
  { id: "a1000000-0000-0000-0000-000000000009", title: "Café Jazz Trio", filename: "tracks/cafe-jazz-trio.mp3", duration_seconds: 285, tags: ["jazz", "cafe", "smooth"], energy: 0.5, instruments: ["piano", "bass", "drums"], mood: ["cozy", "sophisticated"], bpm_estimate: 120, hz_base: null, best_for: ["creative", "casual_work"], genre: "jazz" },
  { id: "a1000000-0000-0000-0000-000000000010", title: "Focus Frequency Alpha", filename: "tracks/focus-frequency-alpha.mp3", duration_seconds: 480, tags: ["electronic", "binaural", "focus"], energy: 0.35, instruments: ["synth", "binaural"], mood: ["focused", "energized"], bpm_estimate: 110, hz_base: 440, best_for: ["deep_work", "coding", "studying"], genre: "electronic" },
];

const backgrounds = [
  { id: "b2000000-0000-0000-0000-000000000001", title: "Cozy Room at Night", filename: "backgrounds/cozy-room-night.jpg", style: "illustration", scene_type: "interior", time_of_day: "night", mood: ["warm", "intimate", "cozy"], color_palette: ["#1a0a2e", "#3d1c56", "#f4a460", "#ffd700"], compatible_animations: ["fireflies", "light_flicker", "floating_particles"], width: 1920, height: 1080 },
  { id: "b2000000-0000-0000-0000-000000000002", title: "Mountain Cabin Dawn", filename: "backgrounds/mountain-cabin-dawn.jpg", style: "illustration", scene_type: "exterior", time_of_day: "dawn", mood: ["serene", "majestic", "fresh"], color_palette: ["#2c3e50", "#e67e22", "#ecf0f1", "#87ceeb"], compatible_animations: ["floating_particles", "clouds_drift", "leaves_falling", "fireflies"], width: 1920, height: 1080 },
  { id: "b2000000-0000-0000-0000-000000000003", title: "Nebula Deep Space", filename: "backgrounds/nebula-deep-space.jpg", style: "digital_art", scene_type: "space", time_of_day: null, mood: ["vast", "mysterious", "awe"], color_palette: ["#0b0033", "#1a0066", "#6600cc", "#cc00ff"], compatible_animations: ["shooting_stars", "floating_particles", "aurora"], width: 1920, height: 1080 },
  { id: "b2000000-0000-0000-0000-000000000004", title: "Japanese Garden", filename: "backgrounds/japanese-garden.jpg", style: "illustration", scene_type: "exterior", time_of_day: "morning", mood: ["peaceful", "balanced", "zen"], color_palette: ["#2d572c", "#8fbc8f", "#f0e68c", "#deb887"], compatible_animations: ["floating_particles", "leaves_falling", "fireflies"], width: 1920, height: 1080 },
  { id: "b2000000-0000-0000-0000-000000000005", title: "City Rooftop Sunset", filename: "backgrounds/city-rooftop-sunset.jpg", style: "illustration", scene_type: "urban", time_of_day: "evening", mood: ["vibrant", "energetic", "urban"], color_palette: ["#ff6347", "#ff8c00", "#1c1c2e", "#4a4a6a"], compatible_animations: ["shooting_stars", "floating_particles", "clouds_drift"], width: 1920, height: 1080 },
  { id: "b2000000-0000-0000-0000-000000000006", title: "Forest Clearing", filename: "backgrounds/forest-clearing.jpg", style: "illustration", scene_type: "exterior", time_of_day: "morning", mood: ["natural", "refreshing", "alive"], color_palette: ["#228b22", "#90ee90", "#f5deb3", "#87ceeb"], compatible_animations: ["fireflies", "floating_particles", "leaves_falling"], width: 1920, height: 1080 },
];

const ambientSounds = [
  { id: "c3000000-0000-0000-0000-000000000001", name: "Light Rain", category: "weather", filename: "ambient/light-rain.mp3", duration_seconds: 120, is_loopable: true, tags: ["rain", "weather", "calming"], icon: "🌧️" },
  { id: "c3000000-0000-0000-0000-000000000002", name: "Ocean Waves", category: "nature", filename: "ambient/ocean-waves.mp3", duration_seconds: 180, is_loopable: true, tags: ["ocean", "waves", "nature"], icon: "🌊" },
  { id: "c3000000-0000-0000-0000-000000000003", name: "Fireplace", category: "indoor", filename: "ambient/fireplace.mp3", duration_seconds: 90, is_loopable: true, tags: ["fire", "crackling", "warm"], icon: "🔥" },
  { id: "c3000000-0000-0000-0000-000000000004", name: "Gentle Wind", category: "weather", filename: "ambient/gentle-wind.mp3", duration_seconds: 150, is_loopable: true, tags: ["wind", "breeze", "outdoor"], icon: "💨" },
  { id: "c3000000-0000-0000-0000-000000000005", name: "Morning Birds", category: "nature", filename: "ambient/morning-birds.mp3", duration_seconds: 200, is_loopable: true, tags: ["birds", "chirping", "morning"], icon: "🐦" },
  { id: "c3000000-0000-0000-0000-000000000006", name: "Coffee Shop", category: "indoor", filename: "ambient/coffee-shop.mp3", duration_seconds: 240, is_loopable: true, tags: ["cafe", "chatter", "ambient"], icon: "☕" },
];

const presetConfigs = [
  {
    name: "Late Night Coding",
    config: {
      schema_version: 1,
      music: { track_id: "a1000000-0000-0000-0000-000000000001", volume: 0.4, crossfade_seconds: 5 },
      ambient: { layers: [{ sound_id: "c3000000-0000-0000-0000-000000000001", volume: 0.3 }] },
      visual: { background_id: "b2000000-0000-0000-0000-000000000001", animations: [{ type: "fireflies" as const, intensity: 0.4, speed: 0.3 }], color_temperature: "warm" as const, brightness: 0.6, vignette_intensity: 0.3 },
      timer: { method: "pomodoro" as const, work_minutes: 50, short_break_minutes: 10, long_break_minutes: 30, cycles_before_long_break: 4 },
    },
  },
  {
    name: "Rainy Day Reading",
    config: {
      schema_version: 1,
      music: { track_id: "a1000000-0000-0000-0000-000000000002", volume: 0.3, crossfade_seconds: 8 },
      ambient: { layers: [{ sound_id: "c3000000-0000-0000-0000-000000000001", volume: 0.5 }, { sound_id: "c3000000-0000-0000-0000-000000000003", volume: 0.4 }] },
      visual: { background_id: "b2000000-0000-0000-0000-000000000001", animations: [{ type: "floating_particles" as const, intensity: 0.3, speed: 0.2 }], color_temperature: "warm" as const, brightness: 0.5, vignette_intensity: 0.4 },
      timer: { method: "free" as const },
    },
  },
  {
    name: "Calm Focus",
    config: {
      schema_version: 1,
      music: { track_id: "a1000000-0000-0000-0000-000000000005", volume: 0.25, crossfade_seconds: 10 },
      ambient: { layers: [] },
      visual: { background_id: "b2000000-0000-0000-0000-000000000003", animations: [{ type: "shooting_stars" as const, intensity: 0.5, speed: 0.4 }], color_temperature: "cool" as const, brightness: 0.4, vignette_intensity: 0.5 },
      timer: { method: "pomodoro" as const, work_minutes: 45, short_break_minutes: 5, long_break_minutes: 15, cycles_before_long_break: 4 },
    },
  },
  {
    name: "Morning Energy",
    config: {
      schema_version: 1,
      music: { track_id: "a1000000-0000-0000-0000-000000000007", volume: 0.5, crossfade_seconds: 5 },
      ambient: { layers: [{ sound_id: "c3000000-0000-0000-0000-000000000005", volume: 0.4 }] },
      visual: { background_id: "b2000000-0000-0000-0000-000000000006", animations: [{ type: "floating_particles" as const, intensity: 0.6, speed: 0.4 }], color_temperature: "neutral" as const, brightness: 0.7, vignette_intensity: 0.2 },
      timer: { method: "pomodoro" as const, work_minutes: 25, short_break_minutes: 5, long_break_minutes: 20, cycles_before_long_break: 4 },
    },
  },
  {
    name: "Deep Work",
    config: {
      schema_version: 1,
      music: { track_id: "a1000000-0000-0000-0000-000000000004", volume: 0.45, crossfade_seconds: 6 },
      ambient: { layers: [{ sound_id: "c3000000-0000-0000-0000-000000000004", volume: 0.25 }] },
      visual: { background_id: "b2000000-0000-0000-0000-000000000002", animations: [{ type: "fireflies" as const, intensity: 0.3, speed: 0.2 }], color_temperature: "warm" as const, brightness: 0.55, vignette_intensity: 0.35 },
      timer: { method: "pomodoro" as const, work_minutes: 90, short_break_minutes: 15, long_break_minutes: 30, cycles_before_long_break: 2 },
    },
  },
];

// =============================================
// Validation
// =============================================

let errors = 0;

console.log("Validating seed data against Zod schemas...\n");

// Tracks
console.log(`--- Tracks (${tracks.length}) ---`);
for (const track of tracks) {
  const result = TrackSchema.safeParse(track);
  if (result.success) {
    console.log(`  ✓ ${track.title}`);
  } else {
    console.error(`  ✗ ${track.title}: ${result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
    errors++;
  }
}

// Backgrounds
console.log(`\n--- Backgrounds (${backgrounds.length}) ---`);
for (const bg of backgrounds) {
  const result = BackgroundSchema.safeParse(bg);
  if (result.success) {
    console.log(`  ✓ ${bg.title}`);
  } else {
    console.error(`  ✗ ${bg.title}: ${result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
    errors++;
  }
}

// Ambient Sounds
console.log(`\n--- Ambient Sounds (${ambientSounds.length}) ---`);
for (const sound of ambientSounds) {
  const result = AmbientSoundSchema.safeParse(sound);
  if (result.success) {
    console.log(`  ✓ ${sound.name}`);
  } else {
    console.error(`  ✗ ${sound.name}: ${result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
    errors++;
  }
}

// Preset Configs
console.log(`\n--- Preset Configs (${presetConfigs.length}) ---`);
for (const preset of presetConfigs) {
  const result = SessionConfigSchema.safeParse(preset.config);
  if (result.success) {
    console.log(`  ✓ ${preset.name}`);
  } else {
    console.error(`  ✗ ${preset.name}: ${result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
    errors++;
  }
}

// Summary
console.log(`\n${"=".repeat(40)}`);
if (errors === 0) {
  console.log(`All ${tracks.length + backgrounds.length + ambientSounds.length + presetConfigs.length} seed entries passed validation!`);
  process.exit(0);
} else {
  console.error(`${errors} validation error(s) found.`);
  process.exit(1);
}
