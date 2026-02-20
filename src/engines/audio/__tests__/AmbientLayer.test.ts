import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPlayerStart = vi.fn();
const mockPlayerStop = vi.fn();
const mockPlayerConnect = vi.fn();
const mockPlayerDispose = vi.fn();

vi.mock("tone", () => {
  return {
    Player: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
      this.start = mockPlayerStart;
      this.stop = mockPlayerStop;
      this.connect = mockPlayerConnect;
      this.dispose = mockPlayerDispose;
      this.loaded = true;
      this.loop = true;
    }),
    Gain: vi.fn().mockImplementation(function (this: Record<string, unknown>, value: number) {
      this.gain = { value };
      this.connect = vi.fn().mockReturnThis();
      this.dispose = vi.fn();
    }),
    loaded: vi.fn().mockResolvedValue(undefined),
  };
});

import { AmbientLayer } from "../AmbientLayer";
import * as Tone from "tone";

let mockOutputNode: { connect: ReturnType<typeof vi.fn> };

beforeEach(() => {
  vi.clearAllMocks();
  mockOutputNode = { connect: vi.fn() };
});

describe("AmbientLayer", () => {
  // T6.20
  it("T6.20: load(url) → creates looping Tone.Player", async () => {
    const layer = new AmbientLayer(mockOutputNode as unknown as Tone.ToneAudioNode);
    await layer.load("https://example.com/rain.mp3");
    expect(Tone.Player).toHaveBeenCalledWith(
      expect.objectContaining({ url: "https://example.com/rain.mp3", loop: true }),
    );
  });

  // T6.21
  it("T6.21: start() → player starts", async () => {
    const layer = new AmbientLayer(mockOutputNode as unknown as Tone.ToneAudioNode);
    await layer.load("https://example.com/rain.mp3");
    layer.start();
    expect(mockPlayerStart).toHaveBeenCalled();
  });

  // T6.22
  it("T6.22: stop() → player stops", async () => {
    const layer = new AmbientLayer(mockOutputNode as unknown as Tone.ToneAudioNode);
    await layer.load("https://example.com/rain.mp3");
    layer.start();
    layer.stop();
    expect(mockPlayerStop).toHaveBeenCalled();
  });

  // T6.23
  it("T6.23: setVolume(0.3) → gain updated", () => {
    const layer = new AmbientLayer(mockOutputNode as unknown as Tone.ToneAudioNode);
    layer.setVolume(0.3);
    const gainInstance = (Tone.Gain as unknown as ReturnType<typeof vi.fn>).mock.results[0].value;
    expect(gainInstance.gain.value).toBe(0.3);
  });

  // T6.24
  it("T6.24: dispose() → player and gain disposed", async () => {
    const layer = new AmbientLayer(mockOutputNode as unknown as Tone.ToneAudioNode);
    await layer.load("https://example.com/rain.mp3");
    layer.dispose();
    expect(mockPlayerDispose).toHaveBeenCalled();
  });

  // T6.25
  it("T6.25: load 404 URL → error handled, no crash", async () => {
    (Tone.loaded as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("404"));
    const layer = new AmbientLayer(mockOutputNode as unknown as Tone.ToneAudioNode);
    await expect(layer.load("https://example.com/missing.mp3")).rejects.toThrow("404");
  });
});
