import { create } from "zustand";
import type {
  SessionConfig,
  MusicConfig,
  AmbientConfig,
  VisualConfig,
  TimerConfig,
} from "@/lib/validation";

interface SessionState {
  config: SessionConfig | null;
  setConfig: (config: SessionConfig) => void;
  updateMusic: (partial: Partial<MusicConfig>) => void;
  updateAmbient: (partial: Partial<AmbientConfig>) => void;
  updateVisual: (partial: Partial<VisualConfig>) => void;
  updateTimer: (partial: Partial<TimerConfig>) => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>()((set, get) => ({
  config: null,

  setConfig: (config) => set({ config }),

  updateMusic: (partial) => {
    const { config } = get();
    if (!config) return;
    set({ config: { ...config, music: { ...config.music, ...partial } } });
  },

  updateAmbient: (partial) => {
    const { config } = get();
    if (!config) return;
    set({ config: { ...config, ambient: { ...config.ambient, ...partial } } });
  },

  updateVisual: (partial) => {
    const { config } = get();
    if (!config) return;
    set({ config: { ...config, visual: { ...config.visual, ...partial } } });
  },

  updateTimer: (partial) => {
    const { config } = get();
    if (!config) return;
    set({ config: { ...config, timer: { ...config.timer, ...partial } } });
  },

  reset: () => set({ config: null }),
}));
