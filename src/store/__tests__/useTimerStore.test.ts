import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useTimerStore } from "../useTimerStore";

beforeEach(() => {
  useTimerStore.setState({
    method: "pomodoro",
    isRunning: false,
    currentPhase: "idle",
    timeRemainingMs: 0,
    cycleCount: 0,
    startedAt: null,
    config: {
      workMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      cyclesBeforeLongBreak: 4,
    },
  });
  vi.useRealTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useTimerStore", () => {
  // T5.31
  it("T5.31: initial state → currentPhase: 'idle', isRunning: false", () => {
    const state = useTimerStore.getState();
    expect(state.currentPhase).toBe("idle");
    expect(state.isRunning).toBe(false);
  });

  // T5.32
  it("T5.32: start() → isRunning: true, currentPhase: 'work', timeRemainingMs = 25 * 60 * 1000", () => {
    useTimerStore.getState().start();
    const state = useTimerStore.getState();
    expect(state.isRunning).toBe(true);
    expect(state.currentPhase).toBe("work");
    expect(state.timeRemainingMs).toBe(25 * 60 * 1000);
  });

  // T5.33
  it("T5.33: pause() → isRunning: false, timeRemainingMs reduced by elapsed", () => {
    vi.useFakeTimers();
    const now = Date.now();
    vi.setSystemTime(now);

    useTimerStore.getState().start();
    // Advance 5 seconds
    vi.setSystemTime(now + 5000);
    useTimerStore.getState().pause();

    const state = useTimerStore.getState();
    expect(state.isRunning).toBe(false);
    // Should be ~25min - 5s = 1,495,000ms
    expect(state.timeRemainingMs).toBe(25 * 60 * 1000 - 5000);
  });

  // T5.34
  it("T5.34: pause() then start() → resumes from paused time", () => {
    vi.useFakeTimers();
    const now = Date.now();
    vi.setSystemTime(now);

    useTimerStore.getState().start();
    vi.setSystemTime(now + 5000);
    useTimerStore.getState().pause();

    const pausedRemaining = useTimerStore.getState().timeRemainingMs;

    // Resume
    vi.setSystemTime(now + 10000);
    useTimerStore.getState().start();

    const state = useTimerStore.getState();
    expect(state.isRunning).toBe(true);
    expect(state.timeRemainingMs).toBe(pausedRemaining);
  });

  // T5.35
  it("T5.35: reset() → returns to idle, cycleCount: 0", () => {
    useTimerStore.getState().start();
    useTimerStore.getState().reset();
    const state = useTimerStore.getState();
    expect(state.currentPhase).toBe("idle");
    expect(state.isRunning).toBe(false);
    expect(state.cycleCount).toBe(0);
    expect(state.timeRemainingMs).toBe(0);
  });

  // T5.36
  it("T5.36: work phase completes → auto-transition to short_break", () => {
    vi.useFakeTimers();
    const now = Date.now();
    vi.setSystemTime(now);

    useTimerStore.getState().start();
    // Advance past work phase (25 minutes + 1ms)
    vi.setSystemTime(now + 25 * 60 * 1000 + 1);
    useTimerStore.getState().tick();

    const state = useTimerStore.getState();
    expect(state.currentPhase).toBe("short_break");
    expect(state.cycleCount).toBe(1);
  });

  // T5.37
  it("T5.37: short break completes → auto-transition back to work", () => {
    vi.useFakeTimers();
    const now = Date.now();
    vi.setSystemTime(now);

    // Start and complete work phase
    useTimerStore.getState().start();
    vi.setSystemTime(now + 25 * 60 * 1000 + 1);
    useTimerStore.getState().tick();

    // Now in short_break, complete it
    const breakStart = Date.now();
    vi.setSystemTime(breakStart + 5 * 60 * 1000 + 1);
    useTimerStore.getState().tick();

    expect(useTimerStore.getState().currentPhase).toBe("work");
  });

  // T5.38
  it("T5.38: after 3 work+short_break cycles, 4th work → transition to long_break", () => {
    vi.useFakeTimers();
    let t = Date.now();
    vi.setSystemTime(t);

    useTimerStore.getState().start();

    // Simulate 3 work + short_break cycles
    for (let i = 0; i < 3; i++) {
      // Complete work
      t += 25 * 60 * 1000 + 1;
      vi.setSystemTime(t);
      useTimerStore.getState().tick();

      // Complete short break
      t += 5 * 60 * 1000 + 1;
      vi.setSystemTime(t);
      useTimerStore.getState().tick();
    }

    // 4th work phase — complete it
    t += 25 * 60 * 1000 + 1;
    vi.setSystemTime(t);
    useTimerStore.getState().tick();

    expect(useTimerStore.getState().currentPhase).toBe("long_break");
    expect(useTimerStore.getState().cycleCount).toBe(4);
  });

  // T5.39
  it("T5.39: long break completes → back to work, cycleCount resets to 0", () => {
    vi.useFakeTimers();
    let t = Date.now();
    vi.setSystemTime(t);

    useTimerStore.getState().start();

    // Fast forward through 4 work + 3 short_break + 1 long_break
    for (let i = 0; i < 3; i++) {
      t += 25 * 60 * 1000 + 1;
      vi.setSystemTime(t);
      useTimerStore.getState().tick();
      t += 5 * 60 * 1000 + 1;
      vi.setSystemTime(t);
      useTimerStore.getState().tick();
    }
    // 4th work → long break
    t += 25 * 60 * 1000 + 1;
    vi.setSystemTime(t);
    useTimerStore.getState().tick();

    expect(useTimerStore.getState().currentPhase).toBe("long_break");

    // Complete long break
    t += 15 * 60 * 1000 + 1;
    vi.setSystemTime(t);
    useTimerStore.getState().tick();

    expect(useTimerStore.getState().currentPhase).toBe("work");
    expect(useTimerStore.getState().cycleCount).toBe(0);
  });

  // T5.40
  it("T5.40: skipPhase() → advances to next phase immediately", () => {
    useTimerStore.getState().start();
    useTimerStore.getState().skipPhase();
    expect(useTimerStore.getState().currentPhase).toBe("short_break");
    expect(useTimerStore.getState().timeRemainingMs).toBe(5 * 60 * 1000);
  });

  // T5.41
  it("T5.41: tab hidden 5 minutes → tick() uses Date.now() for correct remaining time", () => {
    vi.useFakeTimers();
    const now = Date.now();
    vi.setSystemTime(now);

    useTimerStore.getState().start();
    // Simulate tab hidden for 5 minutes (no ticks)
    vi.setSystemTime(now + 5 * 60 * 1000);
    useTimerStore.getState().tick();

    const state = useTimerStore.getState();
    // Should show 20 minutes remaining (25 - 5)
    expect(state.timeRemainingMs).toBeCloseTo(20 * 60 * 1000, -2);
  });

  // T5.42
  it("T5.42: configure(50, 10, 30, 2) → changes timer config", () => {
    useTimerStore.getState().configure(50, 10, 30, 2);
    const config = useTimerStore.getState().config;
    expect(config.workMinutes).toBe(50);
    expect(config.shortBreakMinutes).toBe(10);
    expect(config.longBreakMinutes).toBe(30);
    expect(config.cyclesBeforeLongBreak).toBe(2);
  });

  // T5.43
  it("T5.43: timer with 0 minutes → immediate completion on tick", () => {
    vi.useFakeTimers();
    const now = Date.now();
    vi.setSystemTime(now);

    useTimerStore.getState().configure(0, 0, 0, 4);
    useTimerStore.getState().start();

    // Advance 1ms — should complete immediately
    vi.setSystemTime(now + 1);
    useTimerStore.getState().tick();

    // Should auto-transition since 0 minute work completed
    expect(useTimerStore.getState().currentPhase).toBe("short_break");
  });

  // T5.44
  it("T5.44: full Pomodoro cycle: work → short ×3 → work → long → work", () => {
    vi.useFakeTimers();
    let t = Date.now();
    vi.setSystemTime(t);

    useTimerStore.getState().configure(1, 1, 1, 4); // 1 minute phases for speed
    useTimerStore.getState().start();

    const phases: string[] = [useTimerStore.getState().currentPhase];

    // Run through a complete cycle
    for (let i = 0; i < 9; i++) {
      t += 1 * 60 * 1000 + 1;
      vi.setSystemTime(t);
      useTimerStore.getState().tick();
      phases.push(useTimerStore.getState().currentPhase);
    }

    expect(phases).toEqual([
      "work",         // start
      "short_break",  // after 1st work
      "work",         // after 1st short_break
      "short_break",  // after 2nd work
      "work",         // after 2nd short_break
      "short_break",  // after 3rd work
      "work",         // after 3rd short_break
      "long_break",   // after 4th work (cycles = 4)
      "work",         // after long_break (cycle resets)
      "short_break",  // after 1st work of new cycle
    ]);
  });
});
