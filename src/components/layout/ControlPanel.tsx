"use client";

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

export function ControlPanel({
  visible,
  tracks,
  backgrounds,
  ambientSounds,
}: ControlPanelProps) {
  return (
    <div
      className={`fixed right-0 top-0 h-full w-80 bg-black/70 backdrop-blur-md border-l border-gray-800 overflow-y-auto transition-transform duration-300 ${
        visible ? "translate-x-0" : "translate-x-full"
      }`}
      data-testid="control-panel"
    >
      <div className="p-4 space-y-6">
        <h2 className="text-lg font-semibold text-white">StudyVibe</h2>

        <div className="space-y-1">
          <TimerDisplay />
          <TimerControls />
        </div>

        <hr className="border-gray-700" />

        <MasterVolume />

        <hr className="border-gray-700" />

        <MusicPlayer tracks={tracks} />

        <hr className="border-gray-700" />

        <AmbientMixer sounds={ambientSounds} />

        <hr className="border-gray-700" />

        <BackgroundSelector backgrounds={backgrounds} />

        <hr className="border-gray-700" />

        <AnimationControls />

        <hr className="border-gray-700" />

        <PomodoroConfig />
      </div>
    </div>
  );
}
