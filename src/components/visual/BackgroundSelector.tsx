"use client";

import { useVisualStore } from "@/store/useVisualStore";
import type { Background } from "@/lib/validation";

interface BackgroundSelectorProps {
  backgrounds: Background[];
}

export function BackgroundSelector({ backgrounds }: BackgroundSelectorProps) {
  const currentBackgroundId = useVisualStore((s) => s.current_background_id);
  const setCurrentBackgroundId = useVisualStore((s) => s.setCurrentBackgroundId);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-200">Background</h3>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {backgrounds.map((bg) => (
          <button
            key={bg.id}
            onClick={() => setCurrentBackgroundId(bg.id)}
            className={`flex-shrink-0 w-20 h-14 rounded-lg border-2 transition-all overflow-hidden ${
              currentBackgroundId === bg.id
                ? "border-indigo-500 ring-2 ring-indigo-500/30"
                : "border-gray-700 hover:border-gray-500"
            }`}
            aria-label={`Select background: ${bg.title}`}
            data-testid={`bg-${bg.id}`}
          >
            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
              <span className="text-xs text-gray-400 truncate px-1">{bg.title}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
