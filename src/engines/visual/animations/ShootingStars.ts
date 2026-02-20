import {
  Scene,
  BufferGeometry,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments,
} from "three";
import type { AnimationConfig } from "@/lib/validation";
import { BaseAnimation } from "./BaseAnimation";

interface Star {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  lifetime: number;
  age: number;
}

const POOL_SIZE = 20;

export class ShootingStars extends BaseAnimation {
  private scene: Scene | null = null;
  private pool: Star[] = [];
  private geometry: BufferGeometry | null = null;
  private material: LineBasicMaterial | null = null;
  private mesh: LineSegments | null = null;
  private intensity = 0.5;
  private speed = 0.5;
  private timeSinceSpawn = 0;

  init(scene: Scene, config: AnimationConfig): void {
    this.scene = scene;
    this.intensity = config.intensity;
    this.speed = config.speed;

    // Initialize pool
    this.pool = Array.from({ length: POOL_SIZE }, () => ({
      active: false,
      x: 0, y: 0, vx: 0, vy: 0,
      opacity: 0, lifetime: 1, age: 0,
    }));

    // Create geometry for all line segments
    const positions = new Float32Array(POOL_SIZE * 6); // 2 points × 3 coords per star
    this.geometry = new BufferGeometry();
    this.geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    this.material = new LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
    this.mesh = new LineSegments(this.geometry, this.material);
    scene.add(this.mesh);
  }

  update(deltaTime: number): void {
    if (!this.geometry) return;

    this.timeSinceSpawn += deltaTime;
    const spawnInterval = Math.max(0.05, 1 - this.intensity) * 0.5;

    // Spawn new stars
    if (this.timeSinceSpawn >= spawnInterval) {
      this.timeSinceSpawn = 0;
      this.spawnStar();
    }

    // Update existing stars
    const positions = this.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < this.pool.length; i++) {
      const star = this.pool[i];
      if (!star.active) {
        // Hide inactive stars at origin
        const idx = i * 6;
        positions[idx] = positions[idx + 1] = positions[idx + 2] = 0;
        positions[idx + 3] = positions[idx + 4] = positions[idx + 5] = 0;
        continue;
      }

      star.age += deltaTime;
      if (star.age >= star.lifetime) {
        star.active = false;
        continue;
      }

      // Move star
      const moveSpeed = this.speed * 2;
      star.x += star.vx * deltaTime * moveSpeed;
      star.y += star.vy * deltaTime * moveSpeed;
      star.opacity = 1 - (star.age / star.lifetime);

      // Update line segment positions (tail → head)
      const tailLength = 0.1;
      const idx = i * 6;
      positions[idx] = star.x - star.vx * tailLength;
      positions[idx + 1] = star.y - star.vy * tailLength;
      positions[idx + 2] = 0;
      positions[idx + 3] = star.x;
      positions[idx + 4] = star.y;
      positions[idx + 5] = 0;
    }

    this.geometry.attributes.position.needsUpdate = true;
  }

  private spawnStar(): void {
    const star = this.pool.find((s) => !s.active);
    if (!star) return;

    star.active = true;
    star.x = (Math.random() - 0.5) * 4;
    star.y = 1 + Math.random() * 0.5; // Upper portion
    const angle = -Math.PI / 4 + (Math.random() - 0.5) * 0.5;
    star.vx = Math.cos(angle) * (1 + Math.random());
    star.vy = Math.sin(angle) * (1 + Math.random());
    star.opacity = 1;
    star.lifetime = 0.5 + Math.random() * 1.5;
    star.age = 0;
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
