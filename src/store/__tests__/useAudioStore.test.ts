import { describe, it, expect, beforeEach } from "vitest";
import { useAudioStore } from "../useAudioStore";

beforeEach(() => {
  useAudioStore.setState({
    is_playing: false,
    master_volume: 1,
    music_volume: 1,
    current_track_id: null,
    track_progress: 0,
    is_crossfading: false,
    ambient_volumes: {},
  });
});

describe("useAudioStore", () => {
  // T5.10
  it("T5.10: initial state → is_playing: false, master_volume: 1, current_track_id: null", () => {
    const state = useAudioStore.getState();
    expect(state.is_playing).toBe(false);
    expect(state.master_volume).toBe(1);
    expect(state.current_track_id).toBeNull();
  });

  // T5.11
  it("T5.11: setMasterVolume(0.5) → volume is 0.5", () => {
    useAudioStore.getState().setMasterVolume(0.5);
    expect(useAudioStore.getState().master_volume).toBe(0.5);
  });

  // T5.12
  it("T5.12: setMasterVolume(1.5) → clamped to 1.0", () => {
    useAudioStore.getState().setMasterVolume(1.5);
    expect(useAudioStore.getState().master_volume).toBe(1.0);
  });

  // T5.13
  it("T5.13: setMasterVolume(-0.3) → clamped to 0.0", () => {
    useAudioStore.getState().setMasterVolume(-0.3);
    expect(useAudioStore.getState().master_volume).toBe(0.0);
  });

  // T5.14
  it("T5.14: setMasterVolume(NaN) → clamped to 0", () => {
    useAudioStore.getState().setMasterVolume(NaN);
    expect(useAudioStore.getState().master_volume).toBe(0);
  });

  // T5.15
  it("T5.15: setMusicVolume(0.7) → music volume is 0.7", () => {
    useAudioStore.getState().setMusicVolume(0.7);
    expect(useAudioStore.getState().music_volume).toBe(0.7);
  });

  // T5.16
  it("T5.16: setMusicVolume(2.0) → clamped to 1.0", () => {
    useAudioStore.getState().setMusicVolume(2.0);
    expect(useAudioStore.getState().music_volume).toBe(1.0);
  });

  // T5.17
  it("T5.17: setIsPlaying(true) → is_playing: true", () => {
    useAudioStore.getState().setIsPlaying(true);
    expect(useAudioStore.getState().is_playing).toBe(true);
  });

  // T5.18
  it("T5.18: setAmbientVolume('id1', 0.5) → ambient_volumes has entry { id1: 0.5 }", () => {
    useAudioStore.getState().setAmbientVolume("id1", 0.5);
    expect(useAudioStore.getState().ambient_volumes).toEqual({ id1: 0.5 });
  });

  // T5.19
  it("T5.19: setAmbientVolume('id1', 1.5) → clamped to 1.0", () => {
    useAudioStore.getState().setAmbientVolume("id1", 1.5);
    expect(useAudioStore.getState().ambient_volumes.id1).toBe(1.0);
  });

  // T5.20
  it("T5.20: removeAmbientVolume('id1') → entry removed from record", () => {
    useAudioStore.getState().setAmbientVolume("id1", 0.5);
    useAudioStore.getState().setAmbientVolume("id2", 0.3);
    useAudioStore.getState().removeAmbientVolume("id1");
    expect(useAudioStore.getState().ambient_volumes).toEqual({ id2: 0.3 });
  });

  // T5.21
  it("T5.21: setCurrentTrackId('some-uuid') → track ID set", () => {
    useAudioStore.getState().setCurrentTrackId("some-uuid");
    expect(useAudioStore.getState().current_track_id).toBe("some-uuid");
  });

  // T5.22
  it("T5.22: setTrackProgress(0.5) → progress set to 0.5", () => {
    useAudioStore.getState().setTrackProgress(0.5);
    expect(useAudioStore.getState().track_progress).toBe(0.5);
  });
});
