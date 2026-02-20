import type { Scene } from "three";
import type { AnimationConfig } from "@/lib/validation";

export abstract class BaseAnimation {
  abstract init(scene: Scene, config: AnimationConfig): void;
  abstract update(deltaTime: number): void;
  abstract setIntensity(intensity: number): void;
  abstract setSpeed(speed: number): void;
  abstract dispose(): void;
}
