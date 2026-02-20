import { create } from "zustand";
import type { AnimationType } from "@/lib/validation";

interface VisualState {
  is_running: boolean;
  current_background_id: string | null;
  active_animations: AnimationType[];
  fps: number;

  setIsRunning: (running: boolean) => void;
  setCurrentBackgroundId: (id: string | null) => void;
  addAnimation: (type: AnimationType) => void;
  removeAnimation: (type: AnimationType) => void;
  setFps: (fps: number) => void;
}

export const useVisualStore = create<VisualState>()((set) => ({
  is_running: false,
  current_background_id: null,
  active_animations: [],
  fps: 0,

  setIsRunning: (running) => set({ is_running: running }),

  setCurrentBackgroundId: (id) => set({ current_background_id: id }),

  addAnimation: (type) =>
    set((state) => {
      if (state.active_animations.includes(type)) return state;
      return { active_animations: [...state.active_animations, type] };
    }),

  removeAnimation: (type) =>
    set((state) => ({
      active_animations: state.active_animations.filter((t) => t !== type),
    })),

  setFps: (fps) => set({ fps }),
}));
