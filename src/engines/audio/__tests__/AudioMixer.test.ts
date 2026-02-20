import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Tone.js
const mockGainConnect = vi.fn().mockReturnThis();
const mockGainToDestination = vi.fn().mockReturnThis();
const mockChannelConnect = vi.fn().mockReturnThis();
const mockDispose = vi.fn();

vi.mock("tone", () => {
  return {
    Gain: vi.fn().mockImplementation(function (this: Record<string, unknown>, value: number) {
      this.gain = { value };
      this.connect = mockGainConnect;
      this.toDestination = mockGainToDestination;
      this.dispose = mockDispose;
    }),
    Channel: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
      this.volume = { value: 0 };
      this.connect = mockChannelConnect;
      this.dispose = mockDispose;
    }),
  };
});

import { AudioMixer } from "../AudioMixer";
import * as Tone from "tone";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AudioMixer", () => {
  // T6.1
  it("T6.1: constructor creates MasterGain, MusicBus, AmbientBus", () => {
    new AudioMixer();
    // 1 Gain (master), 2 Channels (music + ambient)
    expect(Tone.Gain).toHaveBeenCalledTimes(1);
    expect(Tone.Channel).toHaveBeenCalledTimes(2);
    // MasterGain connected to destination
    expect(mockGainToDestination).toHaveBeenCalledTimes(1);
    // Both channels connected to master gain
    expect(mockChannelConnect).toHaveBeenCalledTimes(2);
  });

  // T6.2
  it("T6.2: setMasterVolume(0.5) → MasterGain volume updated", () => {
    const mixer = new AudioMixer();
    mixer.setMasterVolume(0.5);
    // The gain.value should be set to 0.5
    // Access via the mock
    const gainInstance = (Tone.Gain as unknown as ReturnType<typeof vi.fn>).mock.results[0].value;
    expect(gainInstance.gain.value).toBe(0.5);
  });

  // T6.3
  it("T6.3: setMasterVolume(1.5) → clamped to 1.0", () => {
    const mixer = new AudioMixer();
    mixer.setMasterVolume(1.5);
    const gainInstance = (Tone.Gain as unknown as ReturnType<typeof vi.fn>).mock.results[0].value;
    expect(gainInstance.gain.value).toBe(1.0);
  });

  // T6.4
  it("T6.4: setMasterVolume(-0.5) → clamped to 0.0", () => {
    const mixer = new AudioMixer();
    mixer.setMasterVolume(-0.5);
    const gainInstance = (Tone.Gain as unknown as ReturnType<typeof vi.fn>).mock.results[0].value;
    expect(gainInstance.gain.value).toBe(0.0);
  });

  // T6.5
  it("T6.5: MusicBus is connected to MasterGain", () => {
    new AudioMixer();
    // First Channel (music bus) should be connected
    expect(mockChannelConnect).toHaveBeenCalled();
  });

  // T6.6
  it("T6.6: AmbientBus is connected to MasterGain", () => {
    new AudioMixer();
    // Both channels connected
    expect(mockChannelConnect).toHaveBeenCalledTimes(2);
  });

  // T6.7
  it("T6.7: dispose() → all nodes disposed", () => {
    const mixer = new AudioMixer();
    mixer.dispose();
    // 1 gain + 2 channels = 3 dispose calls
    expect(mockDispose).toHaveBeenCalledTimes(3);
  });
});
