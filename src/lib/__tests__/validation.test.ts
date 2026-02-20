import { describe, it, expect } from "vitest";
import {
  SessionConfigSchema,
  AnimationTypeSchema,
  MusicConfigSchema,
  validateLLMResponse,
  migrateConfig,
  CURRENT_SCHEMA_VERSION,
} from "../validation";
import type { SessionConfig } from "../validation";

// Helper: minimal valid SessionConfig
function validSessionConfig(): SessionConfig {
  return {
    schema_version: 1,
    music: { track_id: "abc-123", volume: 0.7, crossfade_seconds: 5 },
    ambient: { layers: [{ sound_id: "rain-1", volume: 0.3 }] },
    visual: {
      background_id: "bg-1",
      animations: [{ type: "fireflies", intensity: 0.3, speed: 0.2 }],
      color_temperature: "warm",
      brightness: 0.7,
      vignette_intensity: 0.3,
    },
    timer: { method: "pomodoro", work_minutes: 25, short_break_minutes: 5 },
  };
}

// Helper: valid LLMInterpretation
function validLLMInterpretation() {
  return {
    config: validSessionConfig(),
    needs_clarification: false,
    reasoning: "Test reasoning",
  };
}

describe("Valid input tests", () => {
  // T3.1
  it("T3.1: complete valid SessionConfig passes validation", () => {
    const result = SessionConfigSchema.safeParse(validSessionConfig());
    expect(result.success).toBe(true);
  });

  // T3.2
  it("T3.2: SessionConfig with all optional timer fields passes", () => {
    const config = validSessionConfig();
    config.timer = {
      method: "pomodoro",
      work_minutes: 25,
      short_break_minutes: 5,
      long_break_minutes: 15,
      cycles_before_long_break: 4,
    };
    const result = SessionConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  // T3.3
  it("T3.3: SessionConfig with empty ambient layers passes", () => {
    const config = validSessionConfig();
    config.ambient = { layers: [] };
    const result = SessionConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  // T3.4
  it("T3.4: SessionConfig with multiple animations passes", () => {
    const config = validSessionConfig();
    config.visual.animations = [
      { type: "fireflies", intensity: 0.3, speed: 0.2 },
      { type: "shooting_stars", intensity: 0.5, speed: 0.8 },
      { type: "floating_particles", intensity: 0.1, speed: 0.1 },
    ];
    const result = SessionConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  // T3.5
  it("T3.5: each of the 10 AnimationType enum values passes", () => {
    const types = [
      "shooting_stars", "fireflies", "rain_drops", "snow",
      "floating_particles", "light_flicker", "parallax_drift",
      "aurora", "clouds_drift", "leaves_falling",
    ];
    for (const t of types) {
      const result = AnimationTypeSchema.safeParse(t);
      expect(result.success, `Expected "${t}" to be valid`).toBe(true);
    }
  });
});

describe("Boundary tests", () => {
  // T3.6 - T3.8: Volume boundaries
  it("T3.6: volume = 0.0 (minimum) passes", () => {
    const result = MusicConfigSchema.safeParse({ track_id: "x", volume: 0.0, crossfade_seconds: 5 });
    expect(result.success).toBe(true);
  });

  it("T3.7: volume = 1.0 (maximum) passes", () => {
    const result = MusicConfigSchema.safeParse({ track_id: "x", volume: 1.0, crossfade_seconds: 5 });
    expect(result.success).toBe(true);
  });

  it("T3.8: volume = 0.5 (mid-range) passes", () => {
    const result = MusicConfigSchema.safeParse({ track_id: "x", volume: 0.5, crossfade_seconds: 5 });
    expect(result.success).toBe(true);
  });

  // T3.9 - T3.10: Intensity boundaries
  it("T3.9: intensity = 0.0 passes", () => {
    const config = validSessionConfig();
    config.visual.animations[0].intensity = 0.0;
    const result = SessionConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it("T3.10: intensity = 1.0 passes", () => {
    const config = validSessionConfig();
    config.visual.animations[0].intensity = 1.0;
    const result = SessionConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  // T3.11 - T3.12: Brightness boundaries
  it("T3.11: brightness = 0.0 passes", () => {
    const config = validSessionConfig();
    config.visual.brightness = 0.0;
    const result = SessionConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it("T3.12: brightness = 1.0 passes", () => {
    const config = validSessionConfig();
    config.visual.brightness = 1.0;
    const result = SessionConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  // T3.13 - T3.14: Crossfade boundaries
  it("T3.13: crossfade_seconds = 0 passes", () => {
    const result = MusicConfigSchema.safeParse({ track_id: "x", volume: 0.5, crossfade_seconds: 0 });
    expect(result.success).toBe(true);
  });

  it("T3.14: crossfade_seconds = 30 passes", () => {
    const result = MusicConfigSchema.safeParse({ track_id: "x", volume: 0.5, crossfade_seconds: 30 });
    expect(result.success).toBe(true);
  });
});

describe("Invalid input tests (must reject)", () => {
  // T3.15
  it("T3.15: volume = 1.5 (above max) is rejected", () => {
    const result = MusicConfigSchema.safeParse({ track_id: "x", volume: 1.5, crossfade_seconds: 5 });
    expect(result.success).toBe(false);
  });

  // T3.16
  it("T3.16: volume = -0.3 (below min) is rejected", () => {
    const result = MusicConfigSchema.safeParse({ track_id: "x", volume: -0.3, crossfade_seconds: 5 });
    expect(result.success).toBe(false);
  });

  // T3.17
  it("T3.17: volume = NaN is rejected", () => {
    const result = MusicConfigSchema.safeParse({ track_id: "x", volume: NaN, crossfade_seconds: 5 });
    expect(result.success).toBe(false);
  });

  // T3.18
  it("T3.18: energy-like value > 1 in visual brightness is rejected", () => {
    const config = validSessionConfig();
    config.visual.brightness = 2.0;
    const result = SessionConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

  // T3.19
  it("T3.19: missing schema_version is rejected", () => {
    const config = validSessionConfig();
    const { schema_version: _sv, ...noVersion } = config;
    const result = SessionConfigSchema.safeParse(noVersion);
    expect(result.success).toBe(false);
  });

  // T3.20
  it("T3.20: schema_version: 2 is detected as mismatch", () => {
    const config = { ...validSessionConfig(), schema_version: 2 };
    const result = SessionConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

  // T3.21
  it("T3.21: missing music field is rejected with descriptive error", () => {
    const { music: _music, ...noMusic } = validSessionConfig();
    const result = SessionConfigSchema.safeParse(noMusic);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errorStr = result.error.issues.map((i) => i.path.join(".")).join(", ");
      expect(errorStr).toContain("music");
    }
  });

  // T3.22
  it("T3.22: missing visual field is rejected", () => {
    const { visual: _visual, ...noVisual } = validSessionConfig();
    const result = SessionConfigSchema.safeParse(noVisual);
    expect(result.success).toBe(false);
  });

  // T3.23
  it('T3.23: unknown AnimationType "rainbow_sparkles" is rejected', () => {
    const result = AnimationTypeSchema.safeParse("rainbow_sparkles");
    expect(result.success).toBe(false);
  });

  // T3.24
  it("T3.24: crossfade_seconds = -1 is rejected", () => {
    const result = MusicConfigSchema.safeParse({ track_id: "x", volume: 0.5, crossfade_seconds: -1 });
    expect(result.success).toBe(false);
  });

  // T3.25
  it("T3.25: crossfade_seconds = 100 is rejected", () => {
    const result = MusicConfigSchema.safeParse({ track_id: "x", volume: 0.5, crossfade_seconds: 100 });
    expect(result.success).toBe(false);
  });

  // T3.26
  it("T3.26: empty string for track_id is rejected", () => {
    const result = MusicConfigSchema.safeParse({ track_id: "", volume: 0.5, crossfade_seconds: 5 });
    expect(result.success).toBe(false);
  });
});

describe("Extra fields / forward compatibility", () => {
  // T3.27
  it('T3.27: extra unknown field "foo" is stripped from output', () => {
    const config = { ...validSessionConfig(), foo: "bar" };
    const result = SessionConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
    if (result.success) {
      expect("foo" in result.data).toBe(false);
    }
  });

  // T3.28
  it("T3.28: extra nested unknown field is stripped", () => {
    const config = validSessionConfig();
    (config.music as Record<string, unknown>).extra_field = "should be stripped";
    const result = SessionConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
    if (result.success) {
      expect("extra_field" in result.data.music).toBe(false);
    }
  });
});

describe("validateLLMResponse", () => {
  // T3.29
  it("T3.29: valid JSON string returns success with parsed LLMInterpretation", () => {
    const raw = JSON.stringify(validLLMInterpretation());
    const result = validateLLMResponse(raw);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.config.schema_version).toBe(1);
      expect(result.data.needs_clarification).toBe(false);
    }
  });

  // T3.30
  it("T3.30: malformed JSON string returns error, no crash", () => {
    const result = validateLLMResponse('{ "config": { invalid json }');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Invalid JSON");
    }
  });

  // T3.31
  it("T3.31: valid JSON but wrong structure returns error with description", () => {
    const result = validateLLMResponse('{ "wrong": "structure" }');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Validation failed");
    }
  });

  // T3.32
  it("T3.32: empty string input returns error", () => {
    const result = validateLLMResponse("");
    expect(result.success).toBe(false);
  });

  // T3.33
  it("T3.33: null input returns error", () => {
    const result = validateLLMResponse(null as unknown as string);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("non-empty string");
    }
  });
});

describe("migrateConfig", () => {
  // T3.34
  it("T3.34: config with schema_version: 1 is returned as-is", () => {
    const config = validSessionConfig();
    const result = migrateConfig(config);
    expect(result.schema_version).toBe(1);
    expect(result.music.track_id).toBe("abc-123");
  });

  // T3.35
  it("T3.35: config with missing schema_version is treated as v1", () => {
    const { schema_version: _sv, ...noVersion } = validSessionConfig();
    const result = migrateConfig(noVersion);
    expect(result.schema_version).toBe(CURRENT_SCHEMA_VERSION);
  });

  // T3.36
  it("T3.36: config with schema_version: 0 is treated as v1", () => {
    const config = { ...validSessionConfig(), schema_version: 0 };
    const result = migrateConfig(config);
    expect(result.schema_version).toBe(CURRENT_SCHEMA_VERSION);
  });

  // T3.37
  it("T3.37: completely invalid config (string) throws descriptive error", () => {
    expect(() => migrateConfig("not an object")).toThrow("expected an object");
  });

  it("null config throws descriptive error", () => {
    expect(() => migrateConfig(null)).toThrow("expected an object");
  });
});
