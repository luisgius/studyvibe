import {
  Scene,
  BufferGeometry,
  Float32BufferAttribute,
  PointsMaterial,
  Points,
} from "three";
import type { AnimationConfig } from "@/lib/validation";
import { BaseAnimation } from "./BaseAnimation";

interface Particle {
  x: number;
  y: number;
  phase: number;
  driftSpeed: number;
}

const POOL_SIZE = 100;
const BOUNDS_Y = 2;
const BOUNDS_X = 3;

export class FloatingParticles extends BaseAnimation {
  private scene: Scene | null = null;
  private pool: Particle[] = [];
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

    this.pool = Array.from({ length: POOL_SIZE }, () => ({
      x: (Math.random() - 0.5) * BOUNDS_X * 2,
      y: (Math.random() - 0.5) * BOUNDS_Y * 2,
      phase: Math.random() * Math.PI * 2,
      driftSpeed: 0.2 + Math.random() * 0.3,
    }));

    const positions = new Float32Array(POOL_SIZE * 3);
    this.pool.forEach((p, i) => {
      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = 0;
    });

    this.geometry = new BufferGeometry();
    this.geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));

    this.material = new PointsMaterial({
      color: 0xffffff,
      size: 0.02,
      transparent: true,
      opacity: 0.4,
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
      const p = this.pool[i];

      if (i < activeCount) {
        // Slow upward drift with horizontal sway
        p.y += p.driftSpeed * this.speed * deltaTime * 0.3;
        p.x += Math.sin(this.elapsed + p.phase) * deltaTime * this.speed * 0.1;

        // Wrap around: particles exiting top reappear at bottom
        if (p.y > BOUNDS_Y) {
          p.y = -BOUNDS_Y;
          p.x = (Math.random() - 0.5) * BOUNDS_X * 2;
        }

        positions[i * 3] = p.x;
        positions[i * 3 + 1] = p.y;
        positions[i * 3 + 2] = 0;
      } else {
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
