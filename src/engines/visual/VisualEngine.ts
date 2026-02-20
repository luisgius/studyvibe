/**
 * VisualEngine — Main scene controller.
 *
 * OrthographicCamera, WebGLRenderer, 30fps target.
 * Zero React dependencies.
 */
import {
  Scene,
  OrthographicCamera,
  WebGLRenderer,
} from "three";
import type { AnimationConfig } from "@/lib/validation";
import { BackgroundLayer } from "./BackgroundLayer";
import { BaseAnimation } from "./animations/BaseAnimation";
import { ShootingStars } from "./animations/ShootingStars";
import { Fireflies } from "./animations/Fireflies";
import { FloatingParticles } from "./animations/FloatingParticles";

const TARGET_FPS = 30;
const FRAME_INTERVAL = 1000 / TARGET_FPS; // ~33.33ms

function createAnimation(type: string): BaseAnimation | null {
  switch (type) {
    case "shooting_stars":
      return new ShootingStars();
    case "fireflies":
      return new Fireflies();
    case "floating_particles":
      return new FloatingParticles();
    default:
      return null;
  }
}

export class VisualEngine {
  private scene: Scene | null = null;
  private camera: OrthographicCamera | null = null;
  private renderer: WebGLRenderer | null = null;
  private background: BackgroundLayer | null = null;
  private animations: Map<string, BaseAnimation> = new Map();
  private lastFrameTime = 0;
  private handleResize: (() => void) | null = null;
  private width = 0;
  private height = 0;

  init(canvas: HTMLCanvasElement): void {
    this.width = canvas.clientWidth || 1;
    this.height = canvas.clientHeight || 1;

    const aspect = this.width / this.height;
    this.camera = new OrthographicCamera(
      -aspect, aspect, 1, -1, 0.1, 10,
    );
    this.camera.position.z = 5;

    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);

    this.scene = new Scene();
    this.background = new BackgroundLayer(this.scene);

    // Animation loop with FPS limiting
    this.lastFrameTime = 0;
    this.renderer.setAnimationLoop((time: number) => {
      const delta = time - this.lastFrameTime;
      if (delta < FRAME_INTERVAL) return;
      this.lastFrameTime = time;

      const deltaSeconds = delta / 1000;

      // Update all active animations
      this.animations.forEach((anim) => anim.update(deltaSeconds));

      if (this.scene && this.camera) {
        this.renderer!.render(this.scene, this.camera);
      }
    });

    // Resize handler
    this.handleResize = () => this.onResize();
    window.addEventListener("resize", this.handleResize);
  }

  setBackground(url: string): Promise<void> {
    if (!this.background) return Promise.resolve();
    return this.background.loadBackground(url);
  }

  addAnimation(type: string, config: AnimationConfig): void {
    if (this.animations.has(type)) return;

    const anim = createAnimation(type);
    if (!anim || !this.scene) return;

    anim.init(this.scene, config);
    this.animations.set(type, anim);
  }

  removeAnimation(type: string): void {
    const anim = this.animations.get(type);
    if (!anim) return;
    anim.dispose();
    this.animations.delete(type);
  }

  updateAnimation(type: string, config: Partial<AnimationConfig>): void {
    const anim = this.animations.get(type);
    if (!anim) return;
    if (config.intensity !== undefined) anim.setIntensity(config.intensity);
    if (config.speed !== undefined) anim.setSpeed(config.speed);
  }

  private onResize(): void {
    if (!this.renderer || !this.camera) return;

    const canvas = this.renderer.domElement;
    this.width = Math.max(1, canvas.clientWidth);
    this.height = Math.max(1, canvas.clientHeight);

    const aspect = this.width / this.height;
    this.camera.left = -aspect;
    this.camera.right = aspect;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.background?.resize(this.width, this.height);
  }

  dispose(): void {
    // Remove resize listener
    if (this.handleResize) {
      window.removeEventListener("resize", this.handleResize);
      this.handleResize = null;
    }

    // Dispose all animations
    this.animations.forEach((anim) => anim.dispose());
    this.animations.clear();

    // Dispose background
    this.background?.dispose();
    this.background = null;

    // Stop animation loop and dispose renderer
    if (this.renderer) {
      this.renderer.setAnimationLoop(null);
      this.renderer.dispose();
      this.renderer = null;
    }

    this.scene = null;
    this.camera = null;
  }
}
