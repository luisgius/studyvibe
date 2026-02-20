import {
  Scene,
  TextureLoader,
  PlaneGeometry,
  MeshBasicMaterial,
  Mesh,
  Texture,
} from "three";

export class BackgroundLayer {
  private scene: Scene | null = null;
  private mesh: Mesh | null = null;
  private geometry: PlaneGeometry | null = null;
  private material: MeshBasicMaterial | null = null;
  private texture: Texture | null = null;
  private loader = new TextureLoader();
  private viewWidth = 1;
  private viewHeight = 1;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  loadBackground(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (texture) => {
          // Dispose old texture/mesh
          this.cleanup();

          this.texture = texture;
          const img = texture.image as { width: number; height: number };
          const imgWidth = img.width;
          const imgHeight = img.height;

          // Scale to cover viewport
          const scale = this.computeCoverScale(imgWidth, imgHeight);
          this.geometry = new PlaneGeometry(imgWidth * scale, imgHeight * scale);
          this.material = new MeshBasicMaterial({ map: texture });
          this.mesh = new Mesh(this.geometry, this.material);
          this.mesh.position.z = -1; // Behind animations

          if (this.scene) {
            this.scene.add(this.mesh);
          }
          resolve();
        },
        undefined,
        (error) => {
          reject(error);
        },
      );
    });
  }

  resize(width: number, height: number): void {
    this.viewWidth = Math.max(1, width);
    this.viewHeight = Math.max(1, height);

    if (this.mesh && this.texture) {
      const img = this.texture.image as { width: number; height: number };
      const imgWidth = img.width;
      const imgHeight = img.height;
      const scale = this.computeCoverScale(imgWidth, imgHeight);

      // Replace geometry with new dimensions
      this.geometry?.dispose();
      this.geometry = new PlaneGeometry(imgWidth * scale, imgHeight * scale);
      this.mesh.geometry = this.geometry;
    }
  }

  private computeCoverScale(imgWidth: number, imgHeight: number): number {
    const imgAspect = imgWidth / imgHeight;
    const viewAspect = this.viewWidth / this.viewHeight;

    // Cover: scale so the image fills the viewport completely
    if (imgAspect > viewAspect) {
      // Image is wider — scale by height
      return this.viewHeight / imgHeight;
    }
    // Image is taller — scale by width
    return this.viewWidth / imgWidth;
  }

  private cleanup(): void {
    if (this.mesh && this.scene) {
      this.scene.remove(this.mesh);
    }
    this.texture?.dispose();
    this.geometry?.dispose();
    this.material?.dispose();
    this.mesh = null;
    this.geometry = null;
    this.material = null;
    this.texture = null;
  }

  dispose(): void {
    this.cleanup();
    this.scene = null;
  }
}
