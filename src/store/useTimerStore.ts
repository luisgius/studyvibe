import { create } from "zustand";

export type TimerPhase = "idle" | "work" | "short_break" | "long_break";

interface TimerConfig {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  cyclesBeforeLongBreak: number;
}

interface TimerState {
  method: "pomodoro";
  isRunning: boolean;
  currentPhase: TimerPhase;
  timeRemainingMs: number;
  cycleCount: number;
  startedAt: number | null;
  config: TimerConfig;

  start: () => void;
  pause: () => void;
  reset: () => void;
  skipPhase: () => void;
  tick: () => void;
  configure: (
    workMin: number,
    shortBreakMin: number,
    longBreakMin: number,
    cyclesBeforeLong: number,
  ) => void;
}

const DEFAULT_CONFIG: TimerConfig = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLongBreak: 4,
};

function phaseTimeMs(phase: TimerPhase, config: TimerConfig): number {
  switch (phase) {
    case "work":
      return config.workMinutes * 60 * 1000;
    case "short_break":
      return config.shortBreakMinutes * 60 * 1000;
    case "long_break":
      return config.longBreakMinutes * 60 * 1000;
    case "idle":
      return 0;
  }
}

function nextPhase(
  current: TimerPhase,
  cycleCount: number,
  config: TimerConfig,
): { phase: TimerPhase; cycleCount: number } {
  switch (current) {
    case "idle":
      return { phase: "work", cycleCount: 0 };
    case "work": {
      const newCycleCount = cycleCount + 1;
      if (newCycleCount >= config.cyclesBeforeLongBreak) {
        return { phase: "long_break", cycleCount: newCycleCount };
      }
      return { phase: "short_break", cycleCount: newCycleCount };
    }
    case "short_break":
      return { phase: "work", cycleCount };
    case "long_break":
      return { phase: "work", cycleCount: 0 };
  }
}

export const useTimerStore = create<TimerState>()((set, get) => ({
  method: "pomodoro",
  isRunning: false,
  currentPhase: "idle",
  timeRemainingMs: 0,
  cycleCount: 0,
  startedAt: null,
  config: { ...DEFAULT_CONFIG },

  start: () => {
    const state = get();
    if (state.currentPhase === "idle") {
      const phase = "work";
      set({
        isRunning: true,
        currentPhase: phase,
        timeRemainingMs: phaseTimeMs(phase, state.config),
        startedAt: Date.now(),
        cycleCount: 0,
      });
    } else {
      // Resume from pause
      set({ isRunning: true, startedAt: Date.now() });
    }
  },

  pause: () => {
    const state = get();
    if (!state.isRunning || !state.startedAt) return;
    const elapsed = Date.now() - state.startedAt;
    const remaining = Math.max(0, state.timeRemainingMs - elapsed);
    set({ isRunning: false, timeRemainingMs: remaining, startedAt: null });
  },

  reset: () =>
    set({
      isRunning: false,
      currentPhase: "idle",
      timeRemainingMs: 0,
      cycleCount: 0,
      startedAt: null,
    }),

  skipPhase: () => {
    const state = get();
    if (state.currentPhase === "idle") return;
    const { phase, cycleCount } = nextPhase(
      state.currentPhase,
      state.cycleCount,
      state.config,
    );
    set({
      currentPhase: phase,
      timeRemainingMs: phaseTimeMs(phase, state.config),
      cycleCount,
      startedAt: state.isRunning ? Date.now() : null,
    });
  },

  tick: () => {
    const state = get();
    if (!state.isRunning || !state.startedAt) return;

    const elapsed = Date.now() - state.startedAt;
    const remaining = state.timeRemainingMs - elapsed;

    if (remaining <= 0) {
      // Phase completed — auto-transition
      const { phase, cycleCount } = nextPhase(
        state.currentPhase,
        state.cycleCount,
        state.config,
      );
      set({
        currentPhase: phase,
        timeRemainingMs: phaseTimeMs(phase, state.config),
        cycleCount,
        startedAt: Date.now(),
      });
    } else {
      // Update remaining time for display (no state mutation needed
      // because we compute remaining from startedAt on each tick)
      set({ timeRemainingMs: remaining, startedAt: Date.now() });
    }
  },

  configure: (workMin, shortBreakMin, longBreakMin, cyclesBeforeLong) =>
    set({
      config: {
        workMinutes: workMin,
        shortBreakMinutes: shortBreakMin,
        longBreakMinutes: longBreakMin,
        cyclesBeforeLongBreak: cyclesBeforeLong,
      },
    }),
}));
