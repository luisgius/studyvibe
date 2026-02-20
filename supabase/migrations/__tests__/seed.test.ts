import { describe, it, expect } from "vitest";
import {
  TrackSchema,
  BackgroundSchema,
  AmbientSoundSchema,
  SessionConfigSchema,
} from "@/lib/validation";

// =============================================
// Seed data (mirrors seed.sql)
// =============================================

const TRACK_IDS = {
  moonlit: "a1000000-0000-0000-0000-000000000001",
  prelude: "a1000000-0000-0000-0000-000000000002",
  rainyBeats: "a1000000-0000-0000-0000-000000000003",
  lateNight: "a1000000-0000-0000-0000-000000000004",
  deepSpace: "a1000000-0000-0000-0000-000000000005",
  forest: "a1000000-0000-0000-0000-000000000006",
  mountain: "a1000000-0000-0000-0000-000000000007",
  sunrise: "a1000000-0000-0000-0000-000000000008",
  jazz: "a1000000-0000-0000-0000-000000000009",
  focus: "a1000000-0000-0000-0000-000000000010",
};

const BG_IDS = {
  cozy: "b2000000-0000-0000-0000-000000000001",
  cabin: "b2000000-0000-0000-0000-000000000002",
  nebula: "b2000000-0000-0000-0000-000000000003",
  garden: "b2000000-0000-0000-0000-000000000004",
  city: "b2000000-0000-0000-0000-000000000005",
  clearing: "b2000000-0000-0000-0000-000000000006",
};

const AMBIENT_IDS = {
  rain: "c3000000-0000-0000-0000-000000000001",
  ocean: "c3000000-0000-0000-0000-000000000002",
  fire: "c3000000-0000-0000-0000-000000000003",
  wind: "c3000000-0000-0000-0000-000000000004",
  birds: "c3000000-0000-0000-0000-000000000005",
  coffee: "c3000000-0000-0000-0000-000000000006",
};

const seedTracks = [
  { id: TRACK_IDS.moonlit, title: "Moonlit Sonata Study", filename: "tracks/moonlit-sonata-study.mp3", duration_seconds: 240, tags: ["classical", "piano", "calm"], energy: 0.2, instruments: ["piano"], mood: ["serene", "contemplative"], bpm_estimate: 72, hz_base: 440, best_for: ["reading", "deep_work"], genre: "classical" },
  { id: TRACK_IDS.prelude, title: "Gentle Prelude in C", filename: "tracks/gentle-prelude-c.mp3", duration_seconds: 300, tags: ["classical", "piano", "soft"], energy: 0.15, instruments: ["piano"], mood: ["peaceful", "dreamy"], bpm_estimate: 60, hz_base: 432, best_for: ["meditation", "reading"], genre: "classical" },
  { id: TRACK_IDS.rainyBeats, title: "Rainy Afternoon Beats", filename: "tracks/rainy-afternoon-beats.mp3", duration_seconds: 195, tags: ["lofi", "chill", "beats"], energy: 0.4, instruments: ["synth", "drums", "keys"], mood: ["relaxed", "nostalgic"], bpm_estimate: 85, hz_base: null, best_for: ["studying", "coding"], genre: "lofi" },
  { id: TRACK_IDS.lateNight, title: "Late Night Code Session", filename: "tracks/late-night-code-session.mp3", duration_seconds: 210, tags: ["lofi", "hiphop", "chill"], energy: 0.45, instruments: ["synth", "bass", "drums"], mood: ["focused", "mellow"], bpm_estimate: 90, hz_base: null, best_for: ["coding", "deep_work"], genre: "lofi" },
  { id: TRACK_IDS.deepSpace, title: "Deep Space Drift", filename: "tracks/deep-space-drift.mp3", duration_seconds: 360, tags: ["ambient", "space", "ethereal"], energy: 0.1, instruments: ["synth", "pad"], mood: ["vast", "dreamy", "immersive"], bpm_estimate: null, hz_base: 432, best_for: ["meditation", "sleep"], genre: "ambient" },
  { id: TRACK_IDS.forest, title: "Forest Whisper Ambience", filename: "tracks/forest-whisper-ambience.mp3", duration_seconds: 420, tags: ["ambient", "nature", "organic"], energy: 0.15, instruments: ["field_recording", "pad"], mood: ["natural", "grounding"], bpm_estimate: null, hz_base: 440, best_for: ["relaxation", "yoga"], genre: "ambient" },
  { id: TRACK_IDS.mountain, title: "Mountain Stream Guitar", filename: "tracks/mountain-stream-guitar.mp3", duration_seconds: 270, tags: ["acoustic", "nature", "guitar"], energy: 0.3, instruments: ["guitar", "nature_sounds"], mood: ["warm", "uplifting"], bpm_estimate: 100, hz_base: null, best_for: ["morning_routine", "creative"], genre: "acoustic" },
  { id: TRACK_IDS.sunrise, title: "Sunrise Flute Meditation", filename: "tracks/sunrise-flute-meditation.mp3", duration_seconds: 330, tags: ["world", "flute", "meditative"], energy: 0.2, instruments: ["flute", "nature_sounds"], mood: ["spiritual", "calm"], bpm_estimate: null, hz_base: 528, best_for: ["meditation", "morning_routine"], genre: "world" },
  { id: TRACK_IDS.jazz, title: "Café Jazz Trio", filename: "tracks/cafe-jazz-trio.mp3", duration_seconds: 285, tags: ["jazz", "cafe", "smooth"], energy: 0.5, instruments: ["piano", "bass", "drums"], mood: ["cozy", "sophisticated"], bpm_estimate: 120, hz_base: null, best_for: ["creative", "casual_work"], genre: "jazz" },
  { id: TRACK_IDS.focus, title: "Focus Frequency Alpha", filename: "tracks/focus-frequency-alpha.mp3", duration_seconds: 480, tags: ["electronic", "binaural", "focus"], energy: 0.35, instruments: ["synth", "binaural"], mood: ["focused", "energized"], bpm_estimate: 110, hz_base: 440, best_for: ["deep_work", "coding", "studying"], genre: "electronic" },
];

const seedBackgrounds = [
  { id: BG_IDS.cozy, title: "Cozy Room at Night", filename: "backgrounds/cozy-room-night.jpg", style: "illustration", scene_type: "interior", time_of_day: "night", mood: ["warm", "intimate", "cozy"], color_palette: ["#1a0a2e", "#3d1c56", "#f4a460", "#ffd700"], compatible_animations: ["fireflies", "light_flicker", "floating_particles"], width: 1920, height: 1080 },
  { id: BG_IDS.cabin, title: "Mountain Cabin Dawn", filename: "backgrounds/mountain-cabin-dawn.jpg", style: "illustration", scene_type: "exterior", time_of_day: "dawn", mood: ["serene", "majestic", "fresh"], color_palette: ["#2c3e50", "#e67e22", "#ecf0f1", "#87ceeb"], compatible_animations: ["floating_particles", "clouds_drift", "leaves_falling", "fireflies"], width: 1920, height: 1080 },
  { id: BG_IDS.nebula, title: "Nebula Deep Space", filename: "backgrounds/nebula-deep-space.jpg", style: "digital_art", scene_type: "space", time_of_day: null, mood: ["vast", "mysterious", "awe"], color_palette: ["#0b0033", "#1a0066", "#6600cc", "#cc00ff"], compatible_animations: ["shooting_stars", "floating_particles", "aurora"], width: 1920, height: 1080 },
  { id: BG_IDS.garden, title: "Japanese Garden", filename: "backgrounds/japanese-garden.jpg", style: "illustration", scene_type: "exterior", time_of_day: "morning", mood: ["peaceful", "balanced", "zen"], color_palette: ["#2d572c", "#8fbc8f", "#f0e68c", "#deb887"], compatible_animations: ["floating_particles", "leaves_falling", "fireflies"], width: 1920, height: 1080 },
  { id: BG_IDS.city, title: "City Rooftop Sunset", filename: "backgrounds/city-rooftop-sunset.jpg", style: "illustration", scene_type: "urban", time_of_day: "evening", mood: ["vibrant", "energetic", "urban"], color_palette: ["#ff6347", "#ff8c00", "#1c1c2e", "#4a4a6a"], compatible_animations: ["shooting_stars", "floating_particles", "clouds_drift"], width: 1920, height: 1080 },
  { id: BG_IDS.clearing, title: "Forest Clearing", filename: "backgrounds/forest-clearing.jpg", style: "illustration", scene_type: "exterior", time_of_day: "morning", mood: ["natural", "refreshing", "alive"], color_palette: ["#228b22", "#90ee90", "#f5deb3", "#87ceeb"], compatible_animations: ["fireflies", "floating_particles", "leaves_falling"], width: 1920, height: 1080 },
];

const seedAmbientSounds = [
  { id: AMBIENT_IDS.rain, name: "Light Rain", category: "weather", filename: "ambient/light-rain.mp3", duration_seconds: 120, is_loopable: true, tags: ["rain", "weather", "calming"], icon: "🌧️" },
  { id: AMBIENT_IDS.ocean, name: "Ocean Waves", category: "nature", filename: "ambient/ocean-waves.mp3", duration_seconds: 180, is_loopable: true, tags: ["ocean", "waves", "nature"], icon: "🌊" },
  { id: AMBIENT_IDS.fire, name: "Fireplace", category: "indoor", filename: "ambient/fireplace.mp3", duration_seconds: 90, is_loopable: true, tags: ["fire", "crackling", "warm"], icon: "🔥" },
  { id: AMBIENT_IDS.wind, name: "Gentle Wind", category: "weather", filename: "ambient/gentle-wind.mp3", duration_seconds: 150, is_loopable: true, tags: ["wind", "breeze", "outdoor"], icon: "💨" },
  { id: AMBIENT_IDS.birds, name: "Morning Birds", category: "nature", filename: "ambient/morning-birds.mp3", duration_seconds: 200, is_loopable: true, tags: ["birds", "chirping", "morning"], icon: "🐦" },
  { id: AMBIENT_IDS.coffee, name: "Coffee Shop", category: "indoor", filename: "ambient/coffee-shop.mp3", duration_seconds: 240, is_loopable: true, tags: ["cafe", "chatter", "ambient"], icon: "☕" },
];

const seedPresetConfigs = [
  {
    name: "Late Night Coding",
    config: {
      schema_version: 1 as const,
      music: { track_id: TRACK_IDS.moonlit, volume: 0.4, crossfade_seconds: 5 },
      ambient: { layers: [{ sound_id: AMBIENT_IDS.rain, volume: 0.3 }] },
      visual: { background_id: BG_IDS.cozy, animations: [{ type: "fireflies" as const, intensity: 0.4, speed: 0.3 }], color_temperature: "warm" as const, brightness: 0.6, vignette_intensity: 0.3 },
      timer: { method: "pomodoro" as const, work_minutes: 50, short_break_minutes: 10, long_break_minutes: 30, cycles_before_long_break: 4 },
    },
  },
  {
    name: "Rainy Day Reading",
    config: {
      schema_version: 1 as const,
      music: { track_id: TRACK_IDS.prelude, volume: 0.3, crossfade_seconds: 8 },
      ambient: { layers: [{ sound_id: AMBIENT_IDS.rain, volume: 0.5 }, { sound_id: AMBIENT_IDS.fire, volume: 0.4 }] },
      visual: { background_id: BG_IDS.cozy, animations: [{ type: "floating_particles" as const, intensity: 0.3, speed: 0.2 }], color_temperature: "warm" as const, brightness: 0.5, vignette_intensity: 0.4 },
      timer: { method: "free" as const },
    },
  },
  {
    name: "Calm Focus",
    config: {
      schema_version: 1 as const,
      music: { track_id: TRACK_IDS.deepSpace, volume: 0.25, crossfade_seconds: 10 },
      ambient: { layers: [] },
      visual: { background_id: BG_IDS.nebula, animations: [{ type: "shooting_stars" as const, intensity: 0.5, speed: 0.4 }], color_temperature: "cool" as const, brightness: 0.4, vignette_intensity: 0.5 },
      timer: { method: "pomodoro" as const, work_minutes: 45, short_break_minutes: 5, long_break_minutes: 15, cycles_before_long_break: 4 },
    },
  },
  {
    name: "Morning Energy",
    config: {
      schema_version: 1 as const,
      music: { track_id: TRACK_IDS.mountain, volume: 0.5, crossfade_seconds: 5 },
      ambient: { layers: [{ sound_id: AMBIENT_IDS.birds, volume: 0.4 }] },
      visual: { background_id: BG_IDS.clearing, animations: [{ type: "floating_particles" as const, intensity: 0.6, speed: 0.4 }], color_temperature: "neutral" as const, brightness: 0.7, vignette_intensity: 0.2 },
      timer: { method: "pomodoro" as const, work_minutes: 25, short_break_minutes: 5, long_break_minutes: 20, cycles_before_long_break: 4 },
    },
  },
  {
    name: "Deep Work",
    config: {
      schema_version: 1 as const,
      music: { track_id: TRACK_IDS.lateNight, volume: 0.45, crossfade_seconds: 6 },
      ambient: { layers: [{ sound_id: AMBIENT_IDS.wind, volume: 0.25 }] },
      visual: { background_id: BG_IDS.cabin, animations: [{ type: "fireflies" as const, intensity: 0.3, speed: 0.2 }], color_temperature: "warm" as const, brightness: 0.55, vignette_intensity: 0.35 },
      timer: { method: "pomodoro" as const, work_minutes: 90, short_break_minutes: 15, long_break_minutes: 30, cycles_before_long_break: 2 },
    },
  },
];

// =============================================
// Tests
// =============================================

describe("Seed Data Validation", () => {
  describe("Tracks", () => {
    it("T10.1: Has exactly 10 tracks", () => {
      expect(seedTracks).toHaveLength(10);
    });

    it("T10.2: All tracks pass TrackSchema validation", () => {
      for (const track of seedTracks) {
        const result = TrackSchema.safeParse(track);
        expect(result.success, `Track "${track.title}" failed: ${!result.success ? result.error.issues.map((i) => i.message).join(", ") : ""}`).toBe(true);
      }
    });

    it("T10.3: All tracks have unique IDs", () => {
      const ids = seedTracks.map((t) => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("T10.4: All tracks have unique filenames", () => {
      const filenames = seedTracks.map((t) => t.filename);
      expect(new Set(filenames).size).toBe(filenames.length);
    });

    it("T10.5: Energy values within 0-1 range", () => {
      for (const track of seedTracks) {
        expect(track.energy).toBeGreaterThanOrEqual(0);
        expect(track.energy).toBeLessThanOrEqual(1);
      }
    });

    it("T10.6: Genre distribution matches plan (2 classical, 2 lofi, 2 ambient, 2 nature, 1 jazz, 1 electronic)", () => {
      const genres = seedTracks.map((t) => t.genre);
      expect(genres.filter((g) => g === "classical")).toHaveLength(2);
      expect(genres.filter((g) => g === "lofi")).toHaveLength(2);
      expect(genres.filter((g) => g === "ambient")).toHaveLength(2);
      // nature instrumental = acoustic + world
      expect(genres.filter((g) => g === "acoustic" || g === "world")).toHaveLength(2);
      expect(genres.filter((g) => g === "jazz")).toHaveLength(1);
      expect(genres.filter((g) => g === "electronic")).toHaveLength(1);
    });

    it("T10.7: All filenames start with tracks/ prefix", () => {
      for (const track of seedTracks) {
        expect(track.filename).toMatch(/^tracks\//);
      }
    });

    it("T10.8: Duration is positive for all tracks", () => {
      for (const track of seedTracks) {
        expect(track.duration_seconds).toBeGreaterThan(0);
      }
    });
  });

  describe("Backgrounds", () => {
    it("T10.9: Has exactly 6 backgrounds", () => {
      expect(seedBackgrounds).toHaveLength(6);
    });

    it("T10.10: All backgrounds pass BackgroundSchema validation", () => {
      for (const bg of seedBackgrounds) {
        const result = BackgroundSchema.safeParse(bg);
        expect(result.success, `Background "${bg.title}" failed: ${!result.success ? result.error.issues.map((i) => i.message).join(", ") : ""}`).toBe(true);
      }
    });

    it("T10.11: All backgrounds have unique IDs", () => {
      const ids = seedBackgrounds.map((b) => b.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("T10.12: All backgrounds are 1920x1080", () => {
      for (const bg of seedBackgrounds) {
        expect(bg.width).toBe(1920);
        expect(bg.height).toBe(1080);
      }
    });

    it("T10.13: All filenames start with backgrounds/ prefix", () => {
      for (const bg of seedBackgrounds) {
        expect(bg.filename).toMatch(/^backgrounds\//);
      }
    });

    it("T10.14: Compatible animations reference valid animation types", () => {
      const validTypes = ["shooting_stars", "fireflies", "rain_drops", "snow", "floating_particles", "light_flicker", "parallax_drift", "aurora", "clouds_drift", "leaves_falling"];
      for (const bg of seedBackgrounds) {
        for (const anim of bg.compatible_animations) {
          expect(validTypes).toContain(anim);
        }
      }
    });

    it("T10.15: Each background has at least 2 compatible animations", () => {
      for (const bg of seedBackgrounds) {
        expect(bg.compatible_animations.length).toBeGreaterThanOrEqual(2);
      }
    });
  });

  describe("Ambient Sounds", () => {
    it("T10.16: Has exactly 6 ambient sounds", () => {
      expect(seedAmbientSounds).toHaveLength(6);
    });

    it("T10.17: All ambient sounds pass AmbientSoundSchema validation", () => {
      for (const sound of seedAmbientSounds) {
        const result = AmbientSoundSchema.safeParse(sound);
        expect(result.success, `Sound "${sound.name}" failed: ${!result.success ? result.error.issues.map((i) => i.message).join(", ") : ""}`).toBe(true);
      }
    });

    it("T10.18: All ambient sounds have unique IDs", () => {
      const ids = seedAmbientSounds.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("T10.19: All ambient sounds are loopable", () => {
      for (const sound of seedAmbientSounds) {
        expect(sound.is_loopable).toBe(true);
      }
    });

    it("T10.20: All filenames start with ambient/ prefix", () => {
      for (const sound of seedAmbientSounds) {
        expect(sound.filename).toMatch(/^ambient\//);
      }
    });

    it("T10.21: All sounds have emoji icons", () => {
      for (const sound of seedAmbientSounds) {
        expect(sound.icon).toBeTruthy();
        expect(typeof sound.icon).toBe("string");
      }
    });

    it("T10.22: Category distribution covers weather, nature, indoor", () => {
      const categories = new Set(seedAmbientSounds.map((s) => s.category));
      expect(categories.has("weather")).toBe(true);
      expect(categories.has("nature")).toBe(true);
      expect(categories.has("indoor")).toBe(true);
    });
  });

  describe("System Presets", () => {
    it("T10.23: Has exactly 5 presets", () => {
      expect(seedPresetConfigs).toHaveLength(5);
    });

    it("T10.24: All preset configs pass SessionConfigSchema validation", () => {
      for (const preset of seedPresetConfigs) {
        const result = SessionConfigSchema.safeParse(preset.config);
        expect(result.success, `Preset "${preset.name}" failed: ${!result.success ? result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ") : ""}`).toBe(true);
      }
    });

    it("T10.25: All presets have schema_version = 1", () => {
      for (const preset of seedPresetConfigs) {
        expect(preset.config.schema_version).toBe(1);
      }
    });

    it("T10.26: All preset track_ids reference existing tracks", () => {
      const trackIds = new Set(seedTracks.map((t) => t.id));
      for (const preset of seedPresetConfigs) {
        expect(trackIds.has(preset.config.music.track_id), `Preset "${preset.name}" references non-existent track ${preset.config.music.track_id}`).toBe(true);
      }
    });

    it("T10.27: All preset background_ids reference existing backgrounds", () => {
      const bgIds = new Set(seedBackgrounds.map((b) => b.id));
      for (const preset of seedPresetConfigs) {
        expect(bgIds.has(preset.config.visual.background_id), `Preset "${preset.name}" references non-existent background ${preset.config.visual.background_id}`).toBe(true);
      }
    });

    it("T10.28: All preset ambient sound_ids reference existing sounds", () => {
      const soundIds = new Set(seedAmbientSounds.map((s) => s.id));
      for (const preset of seedPresetConfigs) {
        for (const layer of preset.config.ambient.layers) {
          expect(soundIds.has(layer.sound_id), `Preset "${preset.name}" references non-existent sound ${layer.sound_id}`).toBe(true);
        }
      }
    });

    it("T10.29: All preset volumes are in 0-1 range", () => {
      for (const preset of seedPresetConfigs) {
        expect(preset.config.music.volume).toBeGreaterThanOrEqual(0);
        expect(preset.config.music.volume).toBeLessThanOrEqual(1);
        for (const layer of preset.config.ambient.layers) {
          expect(layer.volume).toBeGreaterThanOrEqual(0);
          expect(layer.volume).toBeLessThanOrEqual(1);
        }
        expect(preset.config.visual.brightness).toBeGreaterThanOrEqual(0);
        expect(preset.config.visual.brightness).toBeLessThanOrEqual(1);
        expect(preset.config.visual.vignette_intensity).toBeGreaterThanOrEqual(0);
        expect(preset.config.visual.vignette_intensity).toBeLessThanOrEqual(1);
      }
    });

    it("T10.30: Presets cover different timer methods", () => {
      const methods = new Set(seedPresetConfigs.map((p) => p.config.timer.method));
      expect(methods.has("pomodoro")).toBe(true);
      expect(methods.has("free")).toBe(true);
    });

    it("T10.31: Presets cover different color temperatures", () => {
      const temps = new Set(seedPresetConfigs.map((p) => p.config.visual.color_temperature));
      expect(temps.has("warm")).toBe(true);
      expect(temps.has("cool")).toBe(true);
      expect(temps.has("neutral")).toBe(true);
    });

    it("T10.32: Presets cover different animation types", () => {
      const animTypes = new Set(
        seedPresetConfigs.flatMap((p) => p.config.visual.animations.map((a) => a.type))
      );
      expect(animTypes.has("fireflies")).toBe(true);
      expect(animTypes.has("shooting_stars")).toBe(true);
      expect(animTypes.has("floating_particles")).toBe(true);
    });
  });

  describe("Cross-references", () => {
    it("T10.33: No orphaned references between presets and catalog data", () => {
      const allTrackIds = new Set(seedTracks.map((t) => t.id));
      const allBgIds = new Set(seedBackgrounds.map((b) => b.id));
      const allSoundIds = new Set(seedAmbientSounds.map((s) => s.id));

      for (const preset of seedPresetConfigs) {
        expect(allTrackIds.has(preset.config.music.track_id)).toBe(true);
        expect(allBgIds.has(preset.config.visual.background_id)).toBe(true);
        for (const layer of preset.config.ambient.layers) {
          expect(allSoundIds.has(layer.sound_id)).toBe(true);
        }
      }
    });

    it("T10.34: Preset animations use types compatible with their backgrounds", () => {
      for (const preset of seedPresetConfigs) {
        const bg = seedBackgrounds.find((b) => b.id === preset.config.visual.background_id);
        expect(bg).toBeDefined();
        for (const anim of preset.config.visual.animations) {
          expect(bg!.compatible_animations).toContain(anim.type);
        }
      }
    });
  });
});
