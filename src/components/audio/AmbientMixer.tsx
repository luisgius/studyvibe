"use client";

import { useAudioStore } from "@/store/useAudioStore";
import type { AmbientSound } from "@/lib/validation";

interface AmbientMixerProps {
  sounds: AmbientSound[];
}

export function AmbientMixer({ sounds }: AmbientMixerProps) {
  const ambientVolumes = useAudioStore((s) => s.ambient_volumes);
  const setAmbientVolume = useAudioStore((s) => s.setAmbientVolume);
  const removeAmbientVolume = useAudioStore((s) => s.removeAmbientVolume);

  const toggleSound = (id: string) => {
    if (id in ambientVolumes) {
      removeAmbientVolume(id);
    } else {
      setAmbientVolume(id, 0.5);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-200">Ambient Sounds</h3>
      <div className="grid grid-cols-2 gap-2">
        {sounds.map((sound) => {
          const isActive = sound.id in ambientVolumes;
          const volume = ambientVolumes[sound.id] ?? 0.5;

          return (
            <div
              key={sound.id}
              className={`rounded-lg p-3 border transition-colors ${
                isActive
                  ? "bg-indigo-900/40 border-indigo-500/50"
                  : "bg-gray-800/50 border-gray-700"
              }`}
            >
              <button
                onClick={() => toggleSound(sound.id)}
                className="w-full text-left"
                aria-label={`Toggle ${sound.name}`}
                data-testid={`toggle-${sound.id}`}
              >
                <span className="text-lg">{sound.icon ?? "🔊"}</span>
                <span className="ml-2 text-sm text-gray-200">{sound.name}</span>
              </button>

              {isActive && (
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => setAmbientVolume(sound.id, parseFloat(e.target.value))}
                  className="w-full mt-2 accent-indigo-500"
                  aria-label={`${sound.name} volume`}
                  data-testid={`volume-${sound.id}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
