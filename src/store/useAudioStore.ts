import { create } from "zustand";

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

interface AudioState {
  is_playing: boolean;
  master_volume: number;
  music_volume: number;
  current_track_id: string | null;
  track_progress: number;
  is_crossfading: boolean;
  ambient_volumes: Record<string, number>;

  setIsPlaying: (playing: boolean) => void;
  setMasterVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  setAmbientVolume: (soundId: string, volume: number) => void;
  removeAmbientVolume: (soundId: string) => void;
  setCurrentTrackId: (id: string | null) => void;
  setTrackProgress: (progress: number) => void;
  setIsCrossfading: (crossfading: boolean) => void;
}

export const useAudioStore = create<AudioState>()((set) => ({
  is_playing: false,
  master_volume: 1,
  music_volume: 1,
  current_track_id: null,
  track_progress: 0,
  is_crossfading: false,
  ambient_volumes: {},

  setIsPlaying: (playing) => set({ is_playing: playing }),

  setMasterVolume: (volume) => set({ master_volume: clamp01(volume) }),

  setMusicVolume: (volume) => set({ music_volume: clamp01(volume) }),

  setAmbientVolume: (soundId, volume) =>
    set((state) => ({
      ambient_volumes: { ...state.ambient_volumes, [soundId]: clamp01(volume) },
    })),

  removeAmbientVolume: (soundId) =>
    set((state) => {
      const { [soundId]: _removed, ...rest } = state.ambient_volumes;
      return { ambient_volumes: rest };
    }),

  setCurrentTrackId: (id) => set({ current_track_id: id }),

  setTrackProgress: (progress) => set({ track_progress: clamp01(progress) }),

  setIsCrossfading: (crossfading) => set({ is_crossfading: crossfading }),
}));
