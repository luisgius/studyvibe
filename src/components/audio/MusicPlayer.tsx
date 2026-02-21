"use client";

import { useState, useRef, useEffect } from "react";
import { useAudioStore } from "@/store/useAudioStore";
import type { Track } from "@/lib/validation";

interface MusicPlayerProps {
  tracks: Track[];
}

function energyColor(energy: number): string {
  if (energy <= 0.2) return "#60a5fa"; // blue
  if (energy <= 0.4) return "#a78bfa"; // purple
  if (energy <= 0.6) return "#fbbf24"; // amber
  return "#f97316"; // orange
}

export function MusicPlayer({ tracks }: MusicPlayerProps) {
  const isPlaying = useAudioStore((s) => s.is_playing);
  const setIsPlaying = useAudioStore((s) => s.setIsPlaying);
  const currentTrackId = useAudioStore((s) => s.current_track_id);
  const setCurrentTrackId = useAudioStore((s) => s.setCurrentTrackId);
  const musicVolume = useAudioStore((s) => s.music_volume);
  const setMusicVolume = useAudioStore((s) => s.setMusicVolume);
  const trackProgress = useAudioStore((s) => s.track_progress);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentTrack = tracks.find((t) => t.id === currentTrackId);

  // Close dropdown on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  // Close dropdown on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey, true);
    return () => document.removeEventListener("keydown", handleKey, true);
  }, [isOpen]);

  return (
    <div className="space-y-3">
      {/* Custom track selector */}
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full flex items-center justify-between bg-gray-800/80 border border-gray-700 rounded-lg px-3 py-2 text-sm text-left hover:border-gray-600 transition-colors"
          aria-label="Select track"
          aria-expanded={isOpen}
          data-testid="track-selector"
        >
          <span className={currentTrack ? "text-gray-200" : "text-gray-500"}>
            {currentTrack ? currentTrack.title : "Select a track..."}
          </span>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M4 6l4 4 4-4" />
          </svg>
        </button>

        {isOpen && (
          <div
            className="absolute z-50 w-full mt-1 bg-gray-800/95 backdrop-blur-md rounded-lg border border-gray-700 shadow-xl max-h-60 overflow-y-auto"
            role="listbox"
          >
            {tracks.map((track) => (
              <button
                key={track.id}
                role="option"
                aria-selected={track.id === currentTrackId}
                onClick={() => {
                  setCurrentTrackId(track.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors ${
                  track.id === currentTrackId
                    ? "bg-indigo-600/20 text-white"
                    : "text-gray-300 hover:bg-white/5"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: energyColor(track.energy) }}
                />
                <span className="flex-1 truncate">{track.title}</span>
                {track.genre && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-400 flex-shrink-0">
                    {track.genre}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Playback controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors flex items-center gap-1.5"
          aria-label={isPlaying ? "Pause" : "Play"}
          data-testid="play-pause-btn"
        >
          {isPlaying ? (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <rect x="2" y="1" width="3" height="10" rx="0.5" />
                <rect x="7" y="1" width="3" height="10" rx="0.5" />
              </svg>
              Pause
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M2.5 1.5v9l8-4.5z" />
              </svg>
              Play
            </>
          )}
        </button>

        <div className="flex-1 bg-gray-700 rounded-full h-1.5">
          <div
            className="bg-indigo-500 h-1.5 rounded-full transition-all"
            style={{ width: `${trackProgress * 100}%` }}
          />
        </div>
      </div>

      {/* Music volume */}
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
