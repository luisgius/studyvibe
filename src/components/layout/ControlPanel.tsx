"use client";

import { useState } from "react";
import { MasterVolume } from "@/components/audio/MasterVolume";
import { MusicPlayer } from "@/components/audio/MusicPlayer";
import { AmbientMixer } from "@/components/audio/AmbientMixer";
import { BackgroundSelector } from "@/components/visual/BackgroundSelector";
import { AnimationControls } from "@/components/visual/AnimationControls";
import { TimerDisplay } from "@/components/timer/TimerDisplay";
import { TimerControls } from "@/components/timer/TimerControls";
import { PomodoroConfig } from "@/components/timer/PomodoroConfig";
import type { Track, Background, AmbientSound } from "@/lib/validation";

interface ControlPanelProps {
  visible: boolean;
  tracks: Track[];
  backgrounds: Background[];
  ambientSounds: AmbientSound[];
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] uppercase tracking-widest text-gray-500 font-medium">
      {children}
    </span>
  );
}

export function ControlPanel({
  visible,
  tracks,
  backgrounds,
  ambientSounds,
}: ControlPanelProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div
      className={`fixed right-0 top-0 h-full w-80 bg-black/70 backdrop-blur-md border-l border-gray-800 overflow-y-auto transition-transform duration-300 ${
        visible ? "translate-x-0" : "translate-x-full"
      }`}
      data-testid="control-panel"
    >
      <div className="p-4 pt-5">
        {/* TIMER */}
        <div className="space-y-2">
          <TimerDisplay />
          <TimerControls />
        </div>

        {/* MUSIC */}
        <div className="mt-6 space-y-3">
          <SectionLabel>Music</SectionLabel>
          <MasterVolume />
          <MusicPlayer tracks={tracks} />
        </div>

        {/* AMBIENCE */}
        <div className="mt-6 space-y-3">
          <SectionLabel>Ambience</SectionLabel>
          <AmbientMixer sounds={ambientSounds} />
        </div>

        {/* VISUALS */}
        <div className="mt-6 space-y-3">
          <SectionLabel>Visuals</SectionLabel>
          <BackgroundSelector backgrounds={backgrounds} />
          <AnimationControls />
        </div>

        {/* SETTINGS — collapsible */}
        <div className="mt-6">
          <button
            onClick={() => setSettingsOpen((prev) => !prev)}
            className="flex items-center gap-2 w-full text-left"
          >
            <SectionLabel>Settings</SectionLabel>
            <svg
              className={`w-3 h-3 text-gray-500 transition-transform ${settingsOpen ? "rotate-180" : ""}`}
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M2 4l4 4 4-4" />
            </svg>
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              settingsOpen ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"
            }`}
          >
            <PomodoroConfig />
          </div>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}
