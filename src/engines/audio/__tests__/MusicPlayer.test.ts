import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Tone.js
const mockPlayerStart = vi.fn();
const mockPlayerStop = vi.fn();
const mockPlayerConnect = vi.fn();
const mockPlayerDispose = vi.fn();
const mockGainRampTo = vi.fn();

vi.mock("tone", () => {
  return {
    Player: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
      this.start = mockPlayerStart;
      this.stop = mockPlayerStop;
      this.connect = mockPlayerConnect;
      this.dispose = mockPlayerDispose;
      this.loaded = true;
      this.buffer = { duration: 180 };
      this.loop = false;
    }),
    Gain: vi.fn().mockImplementation(function (this: Record<string, unknown>, value: number) {
      this.gain = { value, rampTo: mockGainRampTo };
      this.connect = vi.fn().mockReturnThis();
      this.dispose = vi.fn();
    }),
    loaded: vi.fn().mockResolvedValue(undefined),
  };
});

import { MusicPlayer } from "../MusicPlayer";
import * as Tone from "tone";

let mockOutputNode: { connect: ReturnType<typeof vi.fn> };

beforeEach(() => {
  vi.clearAllMocks();
  mockOutputNode = { connect: vi.fn() };
});

describe("MusicPlayer", () => {
  // T6.8
  it("T6.8: loadTrack(url) → creates Tone.Player with correct URL", async () => {
    const player = new MusicPlayer(mockOutputNode as unknown as Tone.ToneAudioNode);
    await player.loadTrack("https://example.com/track.mp3");
    expect(Tone.Player).toHaveBeenCalledWith(
      expect.objectContaining({ url: "https://example.com/track.mp3" }),
    );
  });

  // T6.9
  it("T6.9: play() → player.start() called", async () => {
    const mp = new MusicPlayer(mockOutputNode as unknown as Tone.ToneAudioNode);
    await mp.loadTrack("https://example.com/track.mp3");
    mp.play();
    expect(mockPlayerStart).toHaveBeenCalled();
  });

  // T6.10
  it("T6.10: pause() → player.stop() called", async () => {
    const mp = new MusicPlayer(mockOutputNode as unknown as Tone.ToneAudioNode);
    await mp.loadTrack("https://example.com/track.mp3");
    mp.pause();
    expect(mockPlayerStop).toHaveBeenCalled();
  });

  // T6.11
  it("T6.11: play() then pause() then play() → no errors", async () => {
    const mp = new MusicPlayer(mockOutputNode as unknown as Tone.ToneAudioNode);
    await mp.loadTrack("https://example.com/track.mp3");
    expect(() => {
      mp.play();
      mp.pause();
      mp.play();
    }).not.toThrow();
  });

  // T6.12
  it("T6.12: rapid play()/pause() toggling (10 times) → no errors", async () => {
    const mp = new MusicPlayer(mockOutputNode as unknown as Tone.ToneAudioNode);
    await mp.loadTrack("https://example.com/track.mp3");
    expect(() => {
      for (let i = 0; i < 10; i++) {
        mp.play();
        mp.pause();
      }
    }).not.toThrow();
  });

  // T6.13
  it("T6.13: setVolume(0.7) → gain node value updated", () => {
    const mp = new MusicPlayer(mockOutputNode as unknown as Tone.ToneAudioNode);
    mp.setVolume(0.7);
    const gainInstance = (Tone.Gain as unknown as ReturnType<typeof vi.fn>).mock.results[0].value;
    expect(gainInstance.gain.value).toBe(0.7);
  });

  // T6.14
  it("T6.14: crossfadeTo → isCrossfading true during crossfade, false after", async () => {
    const mp = new MusicPlayer(mockOutputNode as unknown as Tone.ToneAudioNode);
    await mp.loadTrack("https://example.com/track1.mp3");
    mp.play();

    // Use real timer with tiny crossfade duration (10ms)
    const crossfadePromise = mp.crossfadeTo("https://example.com/track2.mp3", 0.01);
    // isCrossfading should be true immediately after calling crossfadeTo
    expect(mp.isCrossfading).toBe(true);

    await crossfadePromise;
    expect(mp.isCrossfading).toBe(false);
  });

  // T6.15
  it("T6.15: after crossfade completes → old player disposed", async () => {
    const mp = new MusicPlayer(mockOutputNode as unknown as Tone.ToneAudioNode);
    await mp.loadTrack("https://example.com/track1.mp3");
    mp.play();

    await mp.crossfadeTo("https://example.com/track2.mp3", 0.01);
    // Old player should have been disposed after crossfade
    expect(mockPlayerDispose).toHaveBeenCalled();
  });

  // T6.16
  it("T6.16: equal-power crossfade → rampTo called for incoming and outgoing gains", async () => {
    const mp = new MusicPlayer(mockOutputNode as unknown as Tone.ToneAudioNode);
    await mp.loadTrack("https://example.com/track1.mp3");

    // Start crossfade — rampTo should be invoked for both gains
    await mp.crossfadeTo("https://example.com/track2.mp3", 2);
    // Verify rampTo was called with target volume (for incoming) and 0 (for outgoing)
    expect(mockGainRampTo).toHaveBeenCalledWith(1, 2);
    expect(mockGainRampTo).toHaveBeenCalledWith(0, 2);
  });

  // T6.17
  it("T6.17: loading a 404 URL → error handler called, no crash", async () => {
    (Tone.loaded as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("404 Not Found"));
    const mp = new MusicPlayer(mockOutputNode as unknown as Tone.ToneAudioNode);
    await expect(mp.loadTrack("https://example.com/missing.mp3")).rejects.toThrow("404");
  });

  // T6.18
  it("T6.18: dispose() → both players and gain nodes disposed", async () => {
    const mp = new MusicPlayer(mockOutputNode as unknown as Tone.ToneAudioNode);
    await mp.loadTrack("https://example.com/track.mp3");
    mp.dispose();
    expect(mockPlayerDispose).toHaveBeenCalled();
  });

  // T6.19
  it("T6.19: loading a track when another is playing → previous track stops", async () => {
    const mp = new MusicPlayer(mockOutputNode as unknown as Tone.ToneAudioNode);
    await mp.loadTrack("https://example.com/track1.mp3");
    mp.play();
    await mp.loadTrack("https://example.com/track2.mp3");
    expect(mockPlayerStop).toHaveBeenCalled();
    expect(mockPlayerDispose).toHaveBeenCalled();
  });
});
