"use client";

import { useVisualStore } from "@/store/useVisualStore";
import type { AnimationType } from "@/lib/validation";

const AVAILABLE_ANIMATIONS: { type: AnimationType; label: string }[] = [
  { type: "fireflies", label: "Fireflies" },
  { type: "shooting_stars", label: "Shooting Stars" },
  { type: "floating_particles", label: "Floating Particles" },
];

export function AnimationControls() {
  const activeAnimations = useVisualStore((s) => s.active_animations);
  const addAnimation = useVisualStore((s) => s.addAnimation);
  const removeAnimation = useVisualStore((s) => s.removeAnimation);

  const toggleAnimation = (type: AnimationType) => {
    if (activeAnimations.includes(type)) {
      removeAnimation(type);
    } else {
      addAnimation(type);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-200">Animations</h3>
      <div className="space-y-2">
        {AVAILABLE_ANIMATIONS.map(({ type, label }) => {
          const isActive = activeAnimations.includes(type);

          return (
            <div key={type} className="flex items-center gap-3">
              <button
                onClick={() => toggleAnimation(type)}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  isActive ? "bg-indigo-600" : "bg-gray-700"
                }`}
                role="switch"
                aria-checked={isActive}
                aria-label={`Toggle ${label}`}
                data-testid={`anim-toggle-${type}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    isActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-sm text-gray-300">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
