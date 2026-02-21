"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { VisualCanvas } from "@/components/visual/VisualCanvas";
import { ControlPanel } from "@/components/layout/ControlPanel";
import { useAudioStore } from "@/store/useAudioStore";
import { useTimerStore } from "@/store/useTimerStore";
import type { Track, Background, AmbientSound } from "@/lib/validation";

const INACTIVITY_TIMEOUT = 8000;

interface AppShellProps {
  tracks: Track[];
  backgrounds: Background[];
  ambientSounds: AmbientSound[];
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
  onCanvasDestroy?: () => void;
}

export function AppShell({
  tracks,
  backgrounds,
  ambientSounds,
  onCanvasReady,
  onCanvasDestroy,
}: AppShellProps) {
  const [panelVisible, setPanelVisible] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    setPanelVisible(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setPanelVisible(false), INACTIVITY_TIMEOUT);
  }, []);

  const togglePanel = useCallback(() => {
    setPanelVisible((prev) => !prev);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    resetTimer();

    const handleMouseMove = () => resetTimer();
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [resetTimer]);

  // Escape key toggles panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        togglePanel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePanel]);

  const isPlaying = useAudioStore((s) => s.is_playing);
  const currentTrackId = useAudioStore((s) => s.current_track_id);
  const timerRunning = useTimerStore((s) => s.isRunning);
  const showWelcome = !isPlaying && !currentTrackId && !timerRunning;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900">
      <VisualCanvas onCanvasReady={onCanvasReady} onCanvasDestroy={onCanvasDestroy} />

      {/* Welcome overlay */}
      <div
        className={`absolute inset-0 flex items-center justify-center z-10 pointer-events-none transition-opacity duration-700 ${
          showWelcome ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl px-10 py-8 text-center max-w-md">
          <h1 className="text-3xl font-light text-white/90 tracking-wide mb-3">StudyVibe</h1>
          <p className="text-sm text-gray-400 mb-5">
            Choose a track and set your timer to create the perfect study session.
          </p>
          <div className="flex items-center justify-center gap-4 text-[11px] text-gray-500">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-400 font-mono text-[10px]">Space</kbd>
              Play
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-400 font-mono text-[10px]">M</kbd>
              Mute
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-400 font-mono text-[10px]">Esc</kbd>
              Panel
            </span>
          </div>
        </div>
      </div>

      <ControlPanel
        visible={panelVisible}
        tracks={tracks}
        backgrounds={backgrounds}
        ambientSounds={ambientSounds}
      />
      <button
        onClick={togglePanel}
        className={`fixed top-4 z-50 w-10 h-10 flex items-center justify-center rounded-lg bg-black/60 backdrop-blur-sm border border-gray-700 text-gray-300 hover:text-white hover:bg-black/80 transition-all duration-300 ${
          panelVisible ? "right-[21rem]" : "right-4"
        }`}
        aria-label={panelVisible ? "Close panel" : "Open panel"}
        data-testid="panel-toggle"
      >
        {panelVisible ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="4" x2="16" y2="16" />
            <line x1="16" y1="4" x2="4" y2="16" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="5" x2="17" y2="5" />
            <line x1="3" y1="10" x2="17" y2="10" />
            <line x1="3" y1="15" x2="17" y2="15" />
          </svg>
        )}
      </button>
    </div>
  );
}
