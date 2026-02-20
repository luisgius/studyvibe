"use client";

import { useAudioStore } from "@/store/useAudioStore";
import type { Track } from "@/lib/validation";

interface MusicPlayerProps {
  tracks: Track[];
}

export function MusicPlayer({ tracks }: MusicPlayerProps) {
  const isPlaying = useAudioStore((s) => s.is_playing);
  const setIsPlaying = useAudioStore((s) => s.setIsPlaying);
  const currentTrackId = useAudioStore((s) => s.current_track_id);
  const setCurrentTrackId = useAudioStore((s) => s.setCurrentTrackId);
  const musicVolume = useAudioStore((s) => s.music_volume);
  const setMusicVolume = useAudioStore((s) => s.setMusicVolume);
  const trackProgress = useAudioStore((s) => s.track_progress);

  const currentTrack = tracks.find((t) => t.id === currentTrackId);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-200">Music</h3>

      <select
        value={currentTrackId ?? ""}
        onChange={(e) => setCurrentTrackId(e.target.value || null)}
        className="w-full bg-gray-800 text-gray-200 rounded px-3 py-2 text-sm border border-gray-700"
        aria-label="Select track"
      >
        <option value="">Select a track...</option>
        {tracks.map((track) => (
          <option key={track.id} value={track.id}>
            {track.title}
          </option>
        ))}
      </select>

      {currentTrack && (
        <p className="text-xs text-gray-400" data-testid="current-track-title">
          {currentTrack.title}
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-sm transition-colors"
          aria-label={isPlaying ? "Pause" : "Play"}
          data-testid="play-pause-btn"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>

        <div className="flex-1 bg-gray-700 rounded-full h-1.5">
          <div
            className="bg-indigo-500 h-1.5 rounded-full transition-all"
            style={{ width: `${trackProgress * 100}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label htmlFor="music-volume" className="text-xs text-gray-400">
          Vol
        </label>
        <input
          id="music-volume"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={musicVolume}
          onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
          className="w-full accent-indigo-500"
          aria-label="Music volume"
        />
      </div>
    </div>
  );
}
