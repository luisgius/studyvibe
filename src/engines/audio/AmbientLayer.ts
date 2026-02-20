/**
 * Single ambient sound instance — loops continuously with independent volume.
 */
import * as Tone from "tone";

export class AmbientLayer {
  private player: Tone.Player | null = null;
  private gain: Tone.Gain;
  private outputNode: Tone.ToneAudioNode;

  constructor(outputNode: Tone.ToneAudioNode) {
    this.outputNode = outputNode;
    this.gain = new Tone.Gain(1).connect(outputNode);
  }

  async load(url: string): Promise<void> {
    if (this.player) {
      this.player.stop();
      this.player.dispose();
    }

    this.player = new Tone.Player({
      url,
      loop: true,
      autostart: false,
    });

    await Tone.loaded();
    this.player.connect(this.gain);
  }

  start(): void {
    if (this.player && this.player.loaded) {
      this.player.start();
    }
  }

  stop(): void {
    if (this.player) {
      this.player.stop();
    }
  }

  setVolume(volume: number): void {
    const clamped = Math.min(1, Math.max(0, Number.isFinite(volume) ? volume : 0));
    this.gain.gain.value = clamped;
  }

  dispose(): void {
    if (this.player) {
      this.player.stop();
      this.player.dispose();
      this.player = null;
    }
    this.gain.dispose();
  }
}
