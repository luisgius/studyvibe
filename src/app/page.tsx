"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAudioStore } from "@/store/useAudioStore";
import { useVisualStore } from "@/store/useVisualStore";
import { AudioEngine } from "@/engines/audio/AudioEngine";
import { VisualEngine } from "@/engines/visual/VisualEngine";
import { getAllTracks, getAllBackgrounds, getAllAmbientSounds } from "@/lib/catalog";
import type { Track, Background, AmbientSound } from "@/lib/validation";

export default function Home() {
  const audioEngineRef = useRef<AudioEngine | null>(null);
  const visualEngineRef = useRef<VisualEngine | null>(null);

  const [tracks, setTracks] = useState<Track[]>([]);
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [ambientSounds, setAmbientSounds] = useState<AmbientSound[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mute state for keyboard shortcut
  const prevVolumeRef = useRef(1);

  // Load catalog data
  useEffect(() => {
    async function loadCatalog() {
      try {
        const [t, b, a] = await Promise.all([
          getAllTracks(),
          getAllBackgrounds(),
          getAllAmbientSounds(),
        ]);
        setTracks(t);
        setBackgrounds(b);
        setAmbientSounds(a);
      } catch {
        setError("Failed to load catalog data");
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  // Initialize audio engine
  useEffect(() => {
    const engine = new AudioEngine();
    audioEngineRef.current = engine;
    return () => {
      engine.dispose();
      audioEngineRef.current = null;
    };
  }, []);

  // Subscribe to audio store changes
  useEffect(() => {
    const unsub = useAudioStore.subscribe((state, prev) => {
      const engine = audioEngineRef.current;
      if (!engine) return;

      if (state.master_volume !== prev.master_volume) {
        engine.setMasterVolume(state.master_volume);
      }
      if (state.music_volume !== prev.music_volume) {
        engine.setMusicVolume(state.music_volume);
      }
    });
    return unsub;
  }, []);

  // Canvas lifecycle callbacks
  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement) => {
    const engine = new VisualEngine();
    engine.init(canvas);
    visualEngineRef.current = engine;
  }, []);

  const handleCanvasDestroy = useCallback(() => {
    visualEngineRef.current?.dispose();
    visualEngineRef.current = null;
  }, []);

  // Subscribe to visual store changes
  useEffect(() => {
    const unsub = useVisualStore.subscribe((state, prev) => {
      const engine = visualEngineRef.current;
      if (!engine) return;

      if (state.current_background_id !== prev.current_background_id && state.current_background_id) {
        const bg = backgrounds.find((b) => b.id === state.current_background_id);
        if (bg) {
          engine.setBackground(bg.filename).catch(() => {
            setError("Failed to load background");
          });
        }
      }
    });
    return unsub;
  }, [backgrounds]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") {
        return;
      }

      switch (e.code) {
        case "Space": {
          e.preventDefault();
          const audioState = useAudioStore.getState();
          audioState.setIsPlaying(!audioState.is_playing);
          break;
        }
        case "KeyM": {
          const audioState = useAudioStore.getState();
          if (audioState.master_volume > 0) {
            prevVolumeRef.current = audioState.master_volume;
            audioState.setMasterVolume(0);
          } else {
            audioState.setMasterVolume(prevVolumeRef.current);
          }
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center space-y-4" data-testid="loading-skeleton">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400">Loading StudyVibe...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-900/90 text-red-200 px-4 py-2 rounded-lg text-sm"
          data-testid="error-toast"
        >
          {error}
          <button onClick={() => setError(null)} className="ml-3 underline">
            Dismiss
          </button>
        </div>
      )}
      <AppShell
        tracks={tracks}
        backgrounds={backgrounds}
        ambientSounds={ambientSounds}
        onCanvasReady={handleCanvasReady}
        onCanvasDestroy={handleCanvasDestroy}
      />
    </>
  );
}
