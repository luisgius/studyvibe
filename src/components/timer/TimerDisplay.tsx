"use client";

import { useEffect } from "react";
import { useTimerStore } from "@/store/useTimerStore";

const PHASE_LABELS: Record<string, string> = {
  idle: "Ready",
  work: "Work",
  short_break: "Short Break",
  long_break: "Long Break",
};

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function TimerDisplay() {
  const currentPhase = useTimerStore((s) => s.currentPhase);
  const timeRemainingMs = useTimerStore((s) => s.timeRemainingMs);
  const isRunning = useTimerStore((s) => s.isRunning);
  const startedAt = useTimerStore((s) => s.startedAt);
  const tick = useTimerStore((s) => s.tick);

  // Tick the timer while running
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => tick(), 250);
    return () => clearInterval(interval);
  }, [isRunning, tick]);

  // Compute display time: if running, subtract elapsed since last tick
  const displayMs =
    isRunning && startedAt
      ? Math.max(0, timeRemainingMs - (Date.now() - startedAt))
      : timeRemainingMs;

  return (
    <div className="text-center space-y-1">
      <div className="text-5xl font-mono font-bold text-white" data-testid="timer-display">
        {formatTime(displayMs)}
      </div>
      <div className="text-sm text-gray-400" data-testid="timer-phase">
        {PHASE_LABELS[currentPhase] ?? currentPhase}
      </div>
    </div>
  );
}
