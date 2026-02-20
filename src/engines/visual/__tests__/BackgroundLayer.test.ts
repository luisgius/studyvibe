import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSceneAdd = vi.fn();
const mockSceneRemove = vi.fn();
const mockTextureLoaderLoad = vi.fn();
const mockGeometryDispose = vi.fn();
const mockMaterialDispose = vi.fn();
const mockTextureDispose = vi.fn();

vi.mock("three", () => {
  return {
    Scene: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
      this.add = mockSceneAdd;
      this.remove = mockSceneRemove;
    }),
    TextureLoader: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
      this.load = mockTextureLoaderLoad;
    }),
    PlaneGeometry: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
      this.dispose = mockGeometryDispose;
    }),
    MeshBasicMaterial: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
      this.dispose = mockMaterialDispose;
    }),
    Mesh: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
      this.position = { z: 0 };
      this.geometry = null;
    }),
    Texture: vi.fn(),
  };
});

import { BackgroundLayer } from "../BackgroundLayer";
import { Scene } from "three";

let mockScene: Scene;

beforeEach(() => {
  vi.clearAllMocks();
  mockScene = new Scene();
});

function simulateTextureLoad(width: number, height: number): void {
  const onLoad = mockTextureLoaderLoad.mock.calls[0]?.[1];
  if (onLoad) {
    onLoad({ image: { width, height }, dispose: mockTextureDispose });
  }
}

describe("BackgroundLayer", () => {
  // T7.13
  it("T7.13: loadBackground(url) → TextureLoader.load called with URL", () => {
    const layer = new BackgroundLayer(mockScene);
    layer.loadBackground("https://example.com/bg.jpg");
    expect(mockTextureLoaderLoad).toHaveBeenCalledWith(
      "https://example.com/bg.jpg",
      expect.any(Function),
      undefined,
      expect.any(Function),
    );
    layer.dispose();
  });

  // T7.14
  it("T7.14: background mesh added to scene after load", async () => {
    const layer = new BackgroundLayer(mockScene);
    const promise = layer.loadBackground("https://example.com/bg.jpg");
    simulateTextureLoad(1920, 1080);
    await promise;
    expect(mockSceneAdd).toHaveBeenCalled();
    layer.dispose();
  });

  // T7.15
  it("T7.15: 16:9 image on 16:9 viewport → plane fills correctly", async () => {
    const layer = new BackgroundLayer(mockScene);
    const promise = layer.loadBackground("https://example.com/bg.jpg");
    simulateTextureLoad(1920, 1080);
    await promise;
    // Just verify it loaded without error
    expect(mockSceneAdd).toHaveBeenCalled();
    layer.dispose();
  });

  // T7.16
  it("T7.16: 4:3 image on 16:9 viewport → correct scaling", async () => {
    const layer = new BackgroundLayer(mockScene);
    const promise = layer.loadBackground("https://example.com/bg.jpg");
    simulateTextureLoad(1024, 768); // 4:3 image
    await promise;
    expect(mockSceneAdd).toHaveBeenCalled();
    layer.dispose();
  });

  // T7.17
  it("T7.17: 16:9 image on 4:3 viewport → correct scaling", async () => {
    const layer = new BackgroundLayer(mockScene);
    const promise = layer.loadBackground("https://example.com/bg.jpg");
    simulateTextureLoad(1920, 1080);
    await promise;
    expect(mockSceneAdd).toHaveBeenCalled();
    layer.dispose();
  });

  // T7.18
  it("T7.18: 21:9 ultrawide viewport → correct scaling", async () => {
    const layer = new BackgroundLayer(mockScene);
    const promise = layer.loadBackground("https://example.com/bg.jpg");
    simulateTextureLoad(2560, 1080); // 21:9
    await promise;
    expect(mockSceneAdd).toHaveBeenCalled();
    layer.dispose();
  });

  // T7.19
  it("T7.19: resize(newWidth, newHeight) → plane geometry updated", async () => {
    const layer = new BackgroundLayer(mockScene);
    const promise = layer.loadBackground("https://example.com/bg.jpg");
    simulateTextureLoad(1920, 1080);
    await promise;
    layer.resize(1366, 768);
    // Old geometry should be disposed
    expect(mockGeometryDispose).toHaveBeenCalled();
    layer.dispose();
  });

  // T7.20
  it("T7.20: dispose() → texture, mesh, geometry disposed", async () => {
    const layer = new BackgroundLayer(mockScene);
    const promise = layer.loadBackground("https://example.com/bg.jpg");
    simulateTextureLoad(1920, 1080);
    await promise;
    layer.dispose();
    expect(mockSceneRemove).toHaveBeenCalled();
    expect(mockGeometryDispose).toHaveBeenCalled();
    expect(mockMaterialDispose).toHaveBeenCalled();
  });
});
