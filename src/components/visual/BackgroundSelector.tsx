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
    <div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {backgrounds.map((bg) => {
          const gradient = bg.color_palette.length >= 2
            ? `linear-gradient(135deg, ${bg.color_palette.join(", ")})`
            : undefined;
          return (
            <button
              key={bg.id}
              onClick={() => setCurrentBackgroundId(bg.id)}
              className={`flex-shrink-0 w-20 h-14 rounded-lg border-2 transition-all overflow-hidden ${
                currentBackgroundId === bg.id
                  ? "border-indigo-500 ring-2 ring-indigo-500/30 scale-105"
                  : "border-gray-700 hover:border-gray-500"
              }`}
              aria-label={`Select background: ${bg.title}`}
              data-testid={`bg-${bg.id}`}
            >
              <div
                className="w-full h-full flex items-end justify-center"
                style={gradient ? { background: gradient } : { backgroundColor: "#374151" }}
              >
                <span
                  className="text-[10px] text-white/90 truncate px-1 pb-0.5 w-full text-center"
                  style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
                >
                  {bg.title}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
