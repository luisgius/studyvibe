/**
 * AudioEngine — Orchestrator facade.
 *
 * Manages one AudioMixer, one MusicPlayer, and multiple AmbientLayers.
 * Zero React dependencies — this is a plain TypeScript class.
 */
import * as Tone from "tone";
import { AudioMixer } from "./AudioMixer";
import { MusicPlayer } from "./MusicPlayer";
import { AmbientLayer } from "./AmbientLayer";

export class AudioEngine {
  private mixer: AudioMixer;
  private musicPlayer: MusicPlayer;
  private ambientLayers: Map<string, AmbientLayer> = new Map();
  private handleVisibilityChange: (() => void) | null = null;

  constructor() {
    this.mixer = new AudioMixer();
    this.musicPlayer = new MusicPlayer(this.mixer.getMusicBus());

    // Resume audio context when tab becomes visible
    this.handleVisibilityChange = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        Tone.getContext().resume();
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", this.handleVisibilityChange);
    }
  }

  async playTrack(url: string): Promise<void> {
    await this.musicPlayer.loadTrack(url);
    this.musicPlayer.play();
  }

  pauseTrack(): void {
    this.musicPlayer.pause();
  }

  async crossfadeTo(url: string, seconds: number): Promise<void> {
    await this.musicPlayer.crossfadeTo(url, seconds);
  }

  setMasterVolume(volume: number): void {
    this.mixer.setMasterVolume(volume);
  }

  setMusicVolume(volume: number): void {
    this.musicPlayer.setVolume(volume);
  }

  async addAmbientLayer(id: string, url: string): Promise<void> {
    // If layer already exists, don't duplicate
    if (this.ambientLayers.has(id)) return;

    const layer = new AmbientLayer(this.mixer.getAmbientBus());
    this.ambientLayers.set(id, layer);
    await layer.load(url);
    layer.start();
  }

  removeAmbientLayer(id: string): void {
    const layer = this.ambientLayers.get(id);
    if (!layer) return;
    layer.stop();
    layer.dispose();
    this.ambientLayers.delete(id);
  }

  setAmbientVolume(id: string, volume: number): void {
    const layer = this.ambientLayers.get(id);
    if (layer) {
      layer.setVolume(volume);
    }
  }

  dispose(): void {
    // Clean up visibility listener
    if (this.handleVisibilityChange && typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    }

    // Dispose all ambient layers
    this.ambientLayers.forEach((layer) => {
      layer.stop();
      layer.dispose();
    });
    this.ambientLayers.clear();

    // Dispose music player and mixer
    this.musicPlayer.dispose();
    this.mixer.dispose();
  }
}
