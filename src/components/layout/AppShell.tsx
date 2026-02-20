"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { VisualCanvas } from "@/components/visual/VisualCanvas";
import { ControlPanel } from "@/components/layout/ControlPanel";
import type { Track, Background, AmbientSound } from "@/lib/validation";

const INACTIVITY_TIMEOUT = 3000;

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

  useEffect(() => {
    resetTimer();

    const handleMouseMove = () => resetTimer();
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [resetTimer]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900">
      <VisualCanvas onCanvasReady={onCanvasReady} onCanvasDestroy={onCanvasDestroy} />
      <ControlPanel
        visible={panelVisible}
        tracks={tracks}
        backgrounds={backgrounds}
        ambientSounds={ambientSounds}
      />
    </div>
  );
}
