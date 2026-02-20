"use client";

import { useAudioStore } from "@/store/useAudioStore";

export function MasterVolume() {
  const masterVolume = useAudioStore((s) => s.master_volume);
  const setMasterVolume = useAudioStore((s) => s.setMasterVolume);

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="master-volume" className="text-sm text-gray-300 whitespace-nowrap">
        Master
      </label>
      <input
        id="master-volume"
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={masterVolume}
        onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
        className="w-full accent-indigo-500"
        aria-label="Master volume"
      />
      <span className="text-xs text-gray-400 w-8 text-right">
        {Math.round(masterVolume * 100)}
      </span>
    </div>
  );
}
