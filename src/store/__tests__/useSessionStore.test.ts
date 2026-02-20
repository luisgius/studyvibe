import { describe, it, expect, beforeEach } from "vitest";
import { useSessionStore } from "../useSessionStore";
import type { SessionConfig } from "@/lib/validation";

function validConfig(): SessionConfig {
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

beforeEach(() => {
  useSessionStore.setState({ config: null });
});

describe("useSessionStore", () => {
  // T5.1
  it("T5.1: initial state → config is null", () => {
    expect(useSessionStore.getState().config).toBeNull();
  });

  // T5.2
  it("T5.2: setConfig() → config is set to new value", () => {
    const config = validConfig();
    useSessionStore.getState().setConfig(config);
    expect(useSessionStore.getState().config).toEqual(config);
  });

  // T5.3
  it("T5.3: setConfig() called twice → second value replaces first", () => {
    const config1 = validConfig();
    const config2 = { ...validConfig(), music: { track_id: "xyz-456", volume: 0.5, crossfade_seconds: 3 } };
    useSessionStore.getState().setConfig(config1);
    useSessionStore.getState().setConfig(config2);
    expect(useSessionStore.getState().config?.music.track_id).toBe("xyz-456");
  });

  // T5.4
  it("T5.4: updateMusic() → only music section changes, rest preserved", () => {
    useSessionStore.getState().setConfig(validConfig());
    useSessionStore.getState().updateMusic({ volume: 0.9 });
    const state = useSessionStore.getState().config!;
    expect(state.music.volume).toBe(0.9);
    expect(state.music.track_id).toBe("abc-123");
    expect(state.visual.brightness).toBe(0.7);
  });

  // T5.5
  it("T5.5: updateAmbient() → only ambient section changes", () => {
    useSessionStore.getState().setConfig(validConfig());
    useSessionStore.getState().updateAmbient({ layers: [] });
    const state = useSessionStore.getState().config!;
    expect(state.ambient.layers).toEqual([]);
    expect(state.music.track_id).toBe("abc-123");
  });

  // T5.6
  it("T5.6: updateVisual() → only visual section changes", () => {
    useSessionStore.getState().setConfig(validConfig());
    useSessionStore.getState().updateVisual({ brightness: 0.1 });
    const state = useSessionStore.getState().config!;
    expect(state.visual.brightness).toBe(0.1);
    expect(state.music.track_id).toBe("abc-123");
  });

  // T5.7
  it("T5.7: updateTimer() → only timer section changes", () => {
    useSessionStore.getState().setConfig(validConfig());
    useSessionStore.getState().updateTimer({ work_minutes: 50 });
    const state = useSessionStore.getState().config!;
    expect(state.timer.work_minutes).toBe(50);
    expect(state.music.track_id).toBe("abc-123");
  });

  // T5.8
  it("T5.8: reset() → config becomes null", () => {
    useSessionStore.getState().setConfig(validConfig());
    useSessionStore.getState().reset();
    expect(useSessionStore.getState().config).toBeNull();
  });

  // T5.9
  it("T5.9: updateMusic() when config is null → handles gracefully", () => {
    expect(() => {
      useSessionStore.getState().updateMusic({ volume: 0.5 });
    }).not.toThrow();
    expect(useSessionStore.getState().config).toBeNull();
  });
});
