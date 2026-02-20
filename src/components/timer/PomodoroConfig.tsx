"use client";

import { useState } from "react";
import { useTimerStore } from "@/store/useTimerStore";

export function PomodoroConfig() {
  const config = useTimerStore((s) => s.config);
  const configure = useTimerStore((s) => s.configure);

  const [workMin, setWorkMin] = useState(config.workMinutes);
  const [shortBreakMin, setShortBreakMin] = useState(config.shortBreakMinutes);
  const [longBreakMin, setLongBreakMin] = useState(config.longBreakMinutes);
  const [cycles, setCycles] = useState(config.cyclesBeforeLongBreak);

  const handleApply = () => {
    configure(workMin, shortBreakMin, longBreakMin, cycles);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-200">Timer Settings</h3>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="work-min" className="text-xs text-gray-400">
            Work (min)
          </label>
          <input
            id="work-min"
            type="number"
            min={1}
            max={120}
            value={workMin}
            onChange={(e) => setWorkMin(Number(e.target.value))}
            className="w-full bg-gray-800 text-gray-200 rounded px-2 py-1 text-sm border border-gray-700"
          />
        </div>
        <div>
          <label htmlFor="short-break-min" className="text-xs text-gray-400">
            Short Break
          </label>
          <input
            id="short-break-min"
            type="number"
            min={1}
            max={30}
            value={shortBreakMin}
            onChange={(e) => setShortBreakMin(Number(e.target.value))}
            className="w-full bg-gray-800 text-gray-200 rounded px-2 py-1 text-sm border border-gray-700"
          />
        </div>
        <div>
          <label htmlFor="long-break-min" className="text-xs text-gray-400">
            Long Break
          </label>
          <input
            id="long-break-min"
            type="number"
            min={1}
            max={60}
            value={longBreakMin}
            onChange={(e) => setLongBreakMin(Number(e.target.value))}
            className="w-full bg-gray-800 text-gray-200 rounded px-2 py-1 text-sm border border-gray-700"
          />
        </div>
        <div>
          <label htmlFor="cycles" className="text-xs text-gray-400">
            Cycles
          </label>
          <input
            id="cycles"
            type="number"
            min={1}
            max={10}
            value={cycles}
            onChange={(e) => setCycles(Number(e.target.value))}
            className="w-full bg-gray-800 text-gray-200 rounded px-2 py-1 text-sm border border-gray-700"
          />
        </div>
      </div>

      <button
        onClick={handleApply}
        className="w-full px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm transition-colors"
        data-testid="apply-config"
      >
        Apply
      </button>
    </div>
  );
}
