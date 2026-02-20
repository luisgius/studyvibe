"use client";

import { useRef, useEffect } from "react";

interface VisualCanvasProps {
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
  onCanvasDestroy?: () => void;
}

export function VisualCanvas({ onCanvasReady, onCanvasDestroy }: VisualCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    onCanvasReady?.(canvas);

    return () => {
      onCanvasDestroy?.();
    };
  }, [onCanvasReady, onCanvasDestroy]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10"
      data-testid="visual-canvas"
    />
  );
}
