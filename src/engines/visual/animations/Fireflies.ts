import {
  Scene,
  BufferGeometry,
  Float32BufferAttribute,
  PointsMaterial,
  Points,
  AdditiveBlending,
} from "three";
import type { AnimationConfig } from "@/lib/validation";
import { BaseAnimation } from "./BaseAnimation";

interface Firefly {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  phase: number;
  brightness: number;
}

const POOL_SIZE = 50;

export class Fireflies extends BaseAnimation {
  private scene: Scene | null = null;
  private pool: Firefly[] = [];
  private geometry: BufferGeometry | null = null;
  private material: PointsMaterial | null = null;
  private mesh: Points | null = null;
  private intensity = 0.5;
  private speed = 0.5;
  private elapsed = 0;

  init(scene: Scene, config: AnimationConfig): void {
    this.scene = scene;
    this.intensity = config.intensity;
    this.speed = config.speed;

    // Initialize pool with random positions
    this.pool = Array.from({ length: POOL_SIZE }, () => {
      const x = (Math.random() - 0.5) * 4;
      const y = (Math.random() - 0.5) * 3;
      return {
        x, y, baseX: x, baseY: y,
        phase: Math.random() * Math.PI * 2,
        brightness: Math.random(),
      };
    });

    const positions = new Float32Array(POOL_SIZE * 3);
    this.pool.forEach((ff, i) => {
      positions[i * 3] = ff.x;
      positions[i * 3 + 1] = ff.y;
      positions[i * 3 + 2] = 0;
    });

    this.geometry = new BufferGeometry();
    this.geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));

    this.material = new PointsMaterial({
      color: 0xffee88,
      size: 0.05,
      transparent: true,
      opacity: 0.8,
      blending: AdditiveBlending,
      sizeAttenuation: true,
    });

    this.mesh = new Points(this.geometry, this.material);
    scene.add(this.mesh);
  }

  update(deltaTime: number): void {
    if (!this.geometry) return;

    this.elapsed += deltaTime;
    const positions = this.geometry.attributes.position.array as Float32Array;
    const activeCount = Math.floor(POOL_SIZE * this.intensity);

    for (let i = 0; i < this.pool.length; i++) {
      const ff = this.pool[i];

      if (i < activeCount) {
        // Sine-wave drift (pseudo-Perlin)
        const driftSpeed = this.speed * 0.5;
        ff.x = ff.baseX + Math.sin(this.elapsed * driftSpeed + ff.phase) * 0.3;
        ff.y = ff.baseY + Math.cos(this.elapsed * driftSpeed * 0.7 + ff.phase) * 0.2;
        ff.brightness = 0.5 + 0.5 * Math.sin(this.elapsed * 2 + ff.phase);

        positions[i * 3] = ff.x;
        positions[i * 3 + 1] = ff.y;
        positions[i * 3 + 2] = 0;
      } else {
        // Hide inactive fireflies far offscreen
        positions[i * 3] = -999;
        positions[i * 3 + 1] = -999;
        positions[i * 3 + 2] = 0;
      }
    }

    this.geometry.attributes.position.needsUpdate = true;
  }

  setIntensity(intensity: number): void {
    this.intensity = Math.min(1, Math.max(0, intensity));
  }

  setSpeed(speed: number): void {
    this.speed = Math.min(1, Math.max(0, speed));
  }

  dispose(): void {
    if (this.mesh && this.scene) {
      this.scene.remove(this.mesh);
    }
    this.geometry?.dispose();
    this.material?.dispose();
    this.mesh = null;
    this.geometry = null;
    this.material = null;
    this.scene = null;
    this.pool = [];
  }
}
