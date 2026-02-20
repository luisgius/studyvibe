import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import type { Track, Background, AmbientSound } from "@/lib/validation";

// Mock stores before importing components
const mockAudioState = {
  is_playing: false,
  master_volume: 1,
  music_volume: 1,
  current_track_id: null as string | null,
  track_progress: 0,
  is_crossfading: false,
  ambient_volumes: {} as Record<string, number>,
  setIsPlaying: vi.fn(),
  setMasterVolume: vi.fn(),
  setMusicVolume: vi.fn(),
  setAmbientVolume: vi.fn(),
  removeAmbientVolume: vi.fn(),
  setCurrentTrackId: vi.fn(),
  setTrackProgress: vi.fn(),
  setIsCrossfading: vi.fn(),
};

const mockVisualState = {
  is_running: false,
  current_background_id: null as string | null,
  active_animations: [] as string[],
  fps: 0,
  setIsRunning: vi.fn(),
  setCurrentBackgroundId: vi.fn(),
  addAnimation: vi.fn(),
  removeAnimation: vi.fn(),
  setFps: vi.fn(),
};

const mockTimerState = {
  method: "pomodoro" as const,
  isRunning: false,
  currentPhase: "idle" as string,
  timeRemainingMs: 0,
  cycleCount: 0,
  startedAt: null as number | null,
  config: {
    workMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    cyclesBeforeLongBreak: 4,
  },
  start: vi.fn(),
  pause: vi.fn(),
  reset: vi.fn(),
  skipPhase: vi.fn(),
  tick: vi.fn(),
  configure: vi.fn(),
};

vi.mock("@/store/useAudioStore", () => ({
  useAudioStore: (selector: (s: typeof mockAudioState) => unknown) => selector(mockAudioState),
}));

vi.mock("@/store/useVisualStore", () => ({
  useVisualStore: (selector: (s: typeof mockVisualState) => unknown) => selector(mockVisualState),
}));

vi.mock("@/store/useTimerStore", () => ({
  useTimerStore: (selector: (s: typeof mockTimerState) => unknown) => selector(mockTimerState),
}));

import { MusicPlayer } from "@/components/audio/MusicPlayer";
import { AmbientMixer } from "@/components/audio/AmbientMixer";
import { MasterVolume } from "@/components/audio/MasterVolume";
import { BackgroundSelector } from "@/components/visual/BackgroundSelector";
import { AnimationControls } from "@/components/visual/AnimationControls";
import { TimerDisplay } from "@/components/timer/TimerDisplay";
import { TimerControls } from "@/components/timer/TimerControls";
import { PomodoroConfig } from "@/components/timer/PomodoroConfig";
import { ControlPanel } from "@/components/layout/ControlPanel";
import { VisualCanvas } from "@/components/visual/VisualCanvas";

// Test data
const mockTracks: Track[] = [
  {
    id: "track-1",
    title: "Calm Piano",
    filename: "piano.mp3",
    duration_seconds: 180,
    tags: ["calm"],
    energy: 0.3,
    instruments: ["piano"],
    mood: ["peaceful"],
    bpm_estimate: 60,
    genre: "classical",
    best_for: ["study"],
    created_at: "2025-01-01",
    updated_at: "2025-01-01",
  },
  {
    id: "track-2",
    title: "Lofi Beats",
    filename: "lofi.mp3",
    duration_seconds: 240,
    tags: ["lofi"],
    energy: 0.5,
    instruments: ["synth"],
    mood: ["chill"],
    bpm_estimate: 80,
    genre: "lofi",
    best_for: ["focus"],
    created_at: "2025-01-01",
    updated_at: "2025-01-01",
  },
];

const mockBackgrounds: Background[] = [
  {
    id: "bg-1",
    title: "Cozy Room",
    filename: "cozy.jpg",
    style: "illustration",
    scene_type: "indoor",
    time_of_day: "night",
    mood: ["cozy"],
    color_palette: ["warm"],
    compatible_animations: ["fireflies"],
    width: 1920,
    height: 1080,
    created_at: "2025-01-01",
  },
  {
    id: "bg-2",
    title: "Space Nebula",
    filename: "space.jpg",
    style: "digital_art",
    scene_type: "space",
    time_of_day: "night",
    mood: ["dreamy"],
    color_palette: ["cool"],
    compatible_animations: ["shooting_stars"],
    width: 1920,
    height: 1080,
    created_at: "2025-01-01",
  },
];

const mockAmbientSounds: AmbientSound[] = [
  {
    id: "rain-1",
    name: "Light Rain",
    category: "weather",
    filename: "rain.mp3",
    duration_seconds: 600,
    tags: ["rain", "calming"],
    icon: "🌧️",
    created_at: "2025-01-01",
  },
  {
    id: "fire-1",
    name: "Fireplace",
    category: "indoor",
    filename: "fire.mp3",
    duration_seconds: 600,
    tags: ["fire", "cozy"],
    icon: "🔥",
    created_at: "2025-01-01",
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  // Reset state defaults
  mockAudioState.is_playing = false;
  mockAudioState.master_volume = 1;
  mockAudioState.music_volume = 1;
  mockAudioState.current_track_id = null;
  mockAudioState.track_progress = 0;
  mockAudioState.ambient_volumes = {};
  mockVisualState.current_background_id = null;
  mockVisualState.active_animations = [];
  mockTimerState.isRunning = false;
  mockTimerState.currentPhase = "idle";
  mockTimerState.timeRemainingMs = 0;
  mockTimerState.startedAt = null;
});

// ====================
// Render tests (T8.1 - T8.10)
// ====================

describe("Render tests", () => {
  it("T8.1: MusicPlayer renders without crashing", () => {
    render(<MusicPlayer tracks={mockTracks} />);
    expect(screen.getByLabelText("Select track")).toBeDefined();
  });

  it("T8.2: AmbientMixer renders without crashing", () => {
    render(<AmbientMixer sounds={mockAmbientSounds} />);
    expect(screen.getByText("Ambient Sounds")).toBeDefined();
  });

  it("T8.3: MasterVolume renders without crashing", () => {
    render(<MasterVolume />);
    expect(screen.getByLabelText("Master volume")).toBeDefined();
  });

  it("T8.4: BackgroundSelector renders without crashing", () => {
    render(<BackgroundSelector backgrounds={mockBackgrounds} />);
    expect(screen.getByText("Background")).toBeDefined();
  });

  it("T8.5: AnimationControls renders without crashing", () => {
    render(<AnimationControls />);
    expect(screen.getByText("Animations")).toBeDefined();
  });

  it("T8.6: TimerDisplay renders without crashing", () => {
    render(<TimerDisplay />);
    expect(screen.getByTestId("timer-display")).toBeDefined();
  });

  it("T8.7: TimerControls renders without crashing", () => {
    render(<TimerControls />);
    expect(screen.getByTestId("timer-start-pause")).toBeDefined();
  });

  it("T8.8: PomodoroConfig renders without crashing", () => {
    render(<PomodoroConfig />);
    expect(screen.getByTestId("apply-config")).toBeDefined();
  });

  it("T8.9: ControlPanel renders without crashing", () => {
    render(
      <ControlPanel
        visible={true}
        tracks={mockTracks}
        backgrounds={mockBackgrounds}
        ambientSounds={mockAmbientSounds}
      />,
    );
    expect(screen.getByTestId("control-panel")).toBeDefined();
  });

  it("T8.10: VisualCanvas renders a canvas element", () => {
    render(<VisualCanvas />);
    expect(screen.getByTestId("visual-canvas")).toBeDefined();
    expect(screen.getByTestId("visual-canvas").tagName).toBe("CANVAS");
  });
});

// ====================
// Interaction tests (T8.11 - T8.22)
// ====================

describe("Interaction tests", () => {
  it("T8.11: MusicPlayer play button click → setIsPlaying(true) called", () => {
    mockAudioState.is_playing = false;
    render(<MusicPlayer tracks={mockTracks} />);
    fireEvent.click(screen.getByTestId("play-pause-btn"));
    expect(mockAudioState.setIsPlaying).toHaveBeenCalledWith(true);
  });

  it("T8.12: MusicPlayer pause button click → setIsPlaying(false) called", () => {
    mockAudioState.is_playing = true;
    render(<MusicPlayer tracks={mockTracks} />);
    fireEvent.click(screen.getByTestId("play-pause-btn"));
    expect(mockAudioState.setIsPlaying).toHaveBeenCalledWith(false);
  });

  it("T8.13: MusicPlayer volume slider change → setMusicVolume called", () => {
    render(<MusicPlayer tracks={mockTracks} />);
    const slider = screen.getByLabelText("Music volume");
    fireEvent.change(slider, { target: { value: "0.7" } });
    expect(mockAudioState.setMusicVolume).toHaveBeenCalledWith(0.7);
  });

  it("T8.14: MasterVolume slider change → setMasterVolume called", () => {
    render(<MasterVolume />);
    const slider = screen.getByLabelText("Master volume");
    fireEvent.change(slider, { target: { value: "0.6" } });
    expect(mockAudioState.setMasterVolume).toHaveBeenCalledWith(0.6);
  });

  it("T8.15: AmbientMixer toggle on → setAmbientVolume called", () => {
    mockAudioState.ambient_volumes = {};
    render(<AmbientMixer sounds={mockAmbientSounds} />);
    fireEvent.click(screen.getByTestId("toggle-rain-1"));
    expect(mockAudioState.setAmbientVolume).toHaveBeenCalledWith("rain-1", 0.5);
  });

  it("T8.16: AmbientMixer toggle off → removeAmbientVolume called", () => {
    mockAudioState.ambient_volumes = { "rain-1": 0.5 };
    render(<AmbientMixer sounds={mockAmbientSounds} />);
    fireEvent.click(screen.getByTestId("toggle-rain-1"));
    expect(mockAudioState.removeAmbientVolume).toHaveBeenCalledWith("rain-1");
  });

  it("T8.17: AmbientMixer volume slider → setAmbientVolume called", () => {
    mockAudioState.ambient_volumes = { "rain-1": 0.5 };
    render(<AmbientMixer sounds={mockAmbientSounds} />);
    const slider = screen.getByTestId("volume-rain-1");
    fireEvent.change(slider, { target: { value: "0.8" } });
    expect(mockAudioState.setAmbientVolume).toHaveBeenCalledWith("rain-1", 0.8);
  });

  it("T8.18: BackgroundSelector click → setCurrentBackgroundId called", () => {
    render(<BackgroundSelector backgrounds={mockBackgrounds} />);
    fireEvent.click(screen.getByTestId("bg-bg-1"));
    expect(mockVisualState.setCurrentBackgroundId).toHaveBeenCalledWith("bg-1");
  });

  it("T8.19: AnimationControls toggle → addAnimation or removeAnimation called", () => {
    mockVisualState.active_animations = [];
    render(<AnimationControls />);
    fireEvent.click(screen.getByTestId("anim-toggle-fireflies"));
    expect(mockVisualState.addAnimation).toHaveBeenCalledWith("fireflies");
  });

  it("T8.19b: AnimationControls toggle off → removeAnimation called", () => {
    mockVisualState.active_animations = ["fireflies"];
    render(<AnimationControls />);
    fireEvent.click(screen.getByTestId("anim-toggle-fireflies"));
    expect(mockVisualState.removeAnimation).toHaveBeenCalledWith("fireflies");
  });

  it("T8.20: TimerControls play button → start() called", () => {
    mockTimerState.isRunning = false;
    render(<TimerControls />);
    fireEvent.click(screen.getByTestId("timer-start-pause"));
    expect(mockTimerState.start).toHaveBeenCalled();
  });

  it("T8.21: TimerControls reset button → reset() called", () => {
    render(<TimerControls />);
    fireEvent.click(screen.getByTestId("timer-reset"));
    expect(mockTimerState.reset).toHaveBeenCalled();
  });

  it("T8.22: TimerControls skip button → skipPhase() called", () => {
    mockTimerState.currentPhase = "work";
    render(<TimerControls />);
    fireEvent.click(screen.getByTestId("timer-skip"));
    expect(mockTimerState.skipPhase).toHaveBeenCalled();
  });
});

// ====================
// Display tests (T8.23 - T8.28)
// ====================

describe("Display tests", () => {
  it("T8.23: TimerDisplay shows 25:00 for default work phase", () => {
    mockTimerState.currentPhase = "work";
    mockTimerState.timeRemainingMs = 25 * 60 * 1000;
    render(<TimerDisplay />);
    expect(screen.getByTestId("timer-display").textContent).toBe("25:00");
  });

  it("T8.24: TimerDisplay shows 05:00 for short break", () => {
    mockTimerState.currentPhase = "short_break";
    mockTimerState.timeRemainingMs = 5 * 60 * 1000;
    render(<TimerDisplay />);
    expect(screen.getByTestId("timer-display").textContent).toBe("05:00");
  });

  it("T8.25: TimerDisplay shows correct phase labels", () => {
    mockTimerState.currentPhase = "work";
    const { rerender } = render(<TimerDisplay />);
    expect(screen.getByTestId("timer-phase").textContent).toBe("Work");

    mockTimerState.currentPhase = "short_break";
    rerender(<TimerDisplay />);
    expect(screen.getByTestId("timer-phase").textContent).toBe("Short Break");

    mockTimerState.currentPhase = "long_break";
    rerender(<TimerDisplay />);
    expect(screen.getByTestId("timer-phase").textContent).toBe("Long Break");
  });

  it("T8.26: TimerDisplay formats single-digit seconds with leading zero", () => {
    mockTimerState.currentPhase = "work";
    mockTimerState.timeRemainingMs = 24 * 60 * 1000 + 5 * 1000; // 24:05
    render(<TimerDisplay />);
    expect(screen.getByTestId("timer-display").textContent).toBe("24:05");
  });

  it("T8.27: MusicPlayer shows currently selected track title", () => {
    mockAudioState.current_track_id = "track-1";
    render(<MusicPlayer tracks={mockTracks} />);
    expect(screen.getByTestId("current-track-title").textContent).toBe("Calm Piano");
  });

  it("T8.28: BackgroundSelector highlights active background", () => {
    mockVisualState.current_background_id = "bg-1";
    render(<BackgroundSelector backgrounds={mockBackgrounds} />);
    const activeBtn = screen.getByTestId("bg-bg-1");
    expect(activeBtn.className).toContain("border-indigo-500");
  });
});

// ====================
// ControlPanel auto-hide (T8.29 - T8.31)
// ====================

describe("ControlPanel auto-hide", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("T8.29: ControlPanel visible on initial render", () => {
    render(
      <ControlPanel
        visible={true}
        tracks={mockTracks}
        backgrounds={mockBackgrounds}
        ambientSounds={mockAmbientSounds}
      />,
    );
    const panel = screen.getByTestId("control-panel");
    expect(panel.className).toContain("translate-x-0");
  });

  it("T8.30: ControlPanel hidden when visible=false", () => {
    render(
      <ControlPanel
        visible={false}
        tracks={mockTracks}
        backgrounds={mockBackgrounds}
        ambientSounds={mockAmbientSounds}
      />,
    );
    const panel = screen.getByTestId("control-panel");
    expect(panel.className).toContain("translate-x-full");
  });

  it("T8.31: AppShell auto-hides panel after 3s, shows on mouse move", async () => {
    const { AppShell } = await import("@/components/layout/AppShell");
    render(
      <AppShell
        tracks={mockTracks}
        backgrounds={mockBackgrounds}
        ambientSounds={mockAmbientSounds}
      />,
    );

    // Panel should be visible initially
    const panel = screen.getByTestId("control-panel");
    expect(panel.className).toContain("translate-x-0");

    // After 3+ seconds, panel should hide
    act(() => {
      vi.advanceTimersByTime(3500);
    });
    expect(panel.className).toContain("translate-x-full");

    // Mouse move should show panel again
    act(() => {
      fireEvent.mouseMove(window);
    });
    expect(panel.className).toContain("translate-x-0");
  });
});
