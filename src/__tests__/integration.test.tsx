import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

// Mock catalog functions
const mockGetAllTracks = vi.fn().mockResolvedValue([]);
const mockGetAllBackgrounds = vi.fn().mockResolvedValue([]);
const mockGetAllAmbientSounds = vi.fn().mockResolvedValue([]);

vi.mock("@/lib/catalog", () => ({
  getAllTracks: () => mockGetAllTracks(),
  getAllBackgrounds: () => mockGetAllBackgrounds(),
  getAllAmbientSounds: () => mockGetAllAmbientSounds(),
}));

// Mock audio engine
const mockAudioDispose = vi.fn();
const mockAudioSetMasterVolume = vi.fn();
const mockAudioSetMusicVolume = vi.fn();

vi.mock("@/engines/audio/AudioEngine", () => ({
  AudioEngine: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.dispose = mockAudioDispose;
    this.setMasterVolume = mockAudioSetMasterVolume;
    this.setMusicVolume = mockAudioSetMusicVolume;
    this.playTrack = vi.fn().mockResolvedValue(undefined);
    this.pauseTrack = vi.fn();
    this.crossfadeTo = vi.fn().mockResolvedValue(undefined);
    this.addAmbientLayer = vi.fn().mockResolvedValue(undefined);
    this.removeAmbientLayer = vi.fn();
    this.setAmbientVolume = vi.fn();
  }),
}));

// Mock visual engine
const mockVisualInit = vi.fn();
const mockVisualDispose = vi.fn();
const mockVisualSetBackground = vi.fn().mockResolvedValue(undefined);

vi.mock("@/engines/visual/VisualEngine", () => ({
  VisualEngine: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.init = mockVisualInit;
    this.dispose = mockVisualDispose;
    this.setBackground = mockVisualSetBackground;
    this.addAnimation = vi.fn();
    this.removeAnimation = vi.fn();
    this.updateAnimation = vi.fn();
  }),
}));

// Must mock tone for AudioEngine constructor
vi.mock("tone", () => ({
  getContext: vi.fn().mockReturnValue({ resume: vi.fn() }),
}));

// Import AFTER mocks
import Home from "@/app/page";
import { useAudioStore } from "@/store/useAudioStore";

beforeEach(() => {
  vi.clearAllMocks();
  // Reset audio store to defaults
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

describe("Integration", () => {
  // T9.1
  it("T9.1: App mounts without errors", async () => {
    await act(async () => {
      render(<Home />);
    });
    // After loading, should render without crash
    expect(document.body).toBeDefined();
  });

  // T9.2
  it("T9.2: AudioEngine instance created on mount", async () => {
    const { AudioEngine } = await import("@/engines/audio/AudioEngine");
    await act(async () => {
      render(<Home />);
    });
    expect(AudioEngine).toHaveBeenCalled();
  });

  // T9.3
  it("T9.3: VisualEngine instance created when canvas ready", async () => {
    const { VisualEngine } = await import("@/engines/visual/VisualEngine");
    await act(async () => {
      render(<Home />);
    });
    // VisualEngine is created when canvas mounts
    expect(VisualEngine).toHaveBeenCalled();
  });

  // T9.4
  it("T9.4: AudioEngine disposed on unmount", async () => {
    let unmount: () => void;
    await act(async () => {
      const result = render(<Home />);
      unmount = result.unmount;
    });
    act(() => {
      unmount!();
    });
    expect(mockAudioDispose).toHaveBeenCalled();
  });

  // T9.5
  it("T9.5: VisualEngine disposed on unmount", async () => {
    let unmount: () => void;
    await act(async () => {
      const result = render(<Home />);
      unmount = result.unmount;
    });
    act(() => {
      unmount!();
    });
    expect(mockVisualDispose).toHaveBeenCalled();
  });

  // T9.6
  it("T9.6: Press Space → is_playing toggles", async () => {
    await act(async () => {
      render(<Home />);
    });
    expect(useAudioStore.getState().is_playing).toBe(false);

    act(() => {
      fireEvent.keyDown(window, { code: "Space" });
    });
    expect(useAudioStore.getState().is_playing).toBe(true);

    act(() => {
      fireEvent.keyDown(window, { code: "Space" });
    });
    expect(useAudioStore.getState().is_playing).toBe(false);
  });

  // T9.7
  it("T9.7: Press Space when no track → no error", async () => {
    await act(async () => {
      render(<Home />);
    });
    expect(() => {
      act(() => {
        fireEvent.keyDown(window, { code: "Space" });
      });
    }).not.toThrow();
  });

  // T9.8
  it("T9.8: Press M → master volume toggles between 0 and previous", async () => {
    await act(async () => {
      render(<Home />);
    });
    expect(useAudioStore.getState().master_volume).toBe(1);

    act(() => {
      fireEvent.keyDown(window, { code: "KeyM" });
    });
    expect(useAudioStore.getState().master_volume).toBe(0);

    act(() => {
      fireEvent.keyDown(window, { code: "KeyM" });
    });
    expect(useAudioStore.getState().master_volume).toBe(1);
  });

  // T9.10
  it("T9.10: Keyboard shortcuts don't fire when typing in input", async () => {
    await act(async () => {
      render(<Home />);
    });

    // Create a temporary input element and fire keydown on it
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();

    act(() => {
      fireEvent.keyDown(input, { code: "Space" });
    });
    // is_playing should remain false since target is an input
    expect(useAudioStore.getState().is_playing).toBe(false);
    document.body.removeChild(input);
  });

  // T9.11
  it("T9.11: Before catalog loads → loading skeleton visible", () => {
    // Don't resolve the catalog promises yet
    mockGetAllTracks.mockReturnValue(new Promise(() => {}));
    mockGetAllBackgrounds.mockReturnValue(new Promise(() => {}));
    mockGetAllAmbientSounds.mockReturnValue(new Promise(() => {}));

    render(<Home />);
    expect(screen.getByTestId("loading-skeleton")).toBeDefined();
  });

  // T9.12
  it("T9.12: After catalog loads → skeleton replaced with content", async () => {
    mockGetAllTracks.mockResolvedValue([]);
    mockGetAllBackgrounds.mockResolvedValue([]);
    mockGetAllAmbientSounds.mockResolvedValue([]);

    await act(async () => {
      render(<Home />);
    });

    expect(screen.queryByTestId("loading-skeleton")).toBeNull();
  });

  // T9.13
  it("T9.13: Catalog load failure → error message, no crash", async () => {
    mockGetAllTracks.mockRejectedValue(new Error("Network error"));

    await act(async () => {
      render(<Home />);
    });

    expect(screen.getByTestId("error-toast")).toBeDefined();
  });
});
