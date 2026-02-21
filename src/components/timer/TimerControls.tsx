"use client";

import { useTimerStore } from "@/store/useTimerStore";

export function TimerControls() {
  const isRunning = useTimerStore((s) => s.isRunning);
  const currentPhase = useTimerStore((s) => s.currentPhase);
  const start = useTimerStore((s) => s.start);
  const pause = useTimerStore((s) => s.pause);
  const reset = useTimerStore((s) => s.reset);
  const skipPhase = useTimerStore((s) => s.skipPhase);

  return (
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={() => (isRunning ? pause() : start())}
        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
        aria-label={isRunning ? "Pause timer" : "Start timer"}
        data-testid="timer-start-pause"
      >
        {isRunning ? "Pause" : "Start"}
      </button>

      <button
        onClick={() => reset()}
        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-gray-300 border border-white/10 text-sm transition-colors"
        aria-label="Reset timer"
        data-testid="timer-reset"
      >
        Reset
      </button>

      {currentPhase !== "idle" && (
        <button
          onClick={() => skipPhase()}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-gray-300 border border-white/10 text-sm transition-colors"
          aria-label="Skip phase"
          data-testid="timer-skip"
        >
          Skip
        </button>
      )}
    </div>
  );
}
