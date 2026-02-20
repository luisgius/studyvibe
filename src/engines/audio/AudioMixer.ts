/**
 * Audio mixing bus topology:
 * MasterGain → Destination
 * MusicBus → MasterGain
 * AmbientBus → MasterGain
 */
import * as Tone from "tone";

export class AudioMixer {
  private masterGain: Tone.Gain;
  private musicBus: Tone.Channel;
  private ambientBus: Tone.Channel;

  constructor() {
    this.masterGain = new Tone.Gain(1).toDestination();
    this.musicBus = new Tone.Channel({ volume: 0 }).connect(this.masterGain);
    this.ambientBus = new Tone.Channel({ volume: 0 }).connect(this.masterGain);
  }

  setMasterVolume(volume: number): void {
    const clamped = Math.min(1, Math.max(0, Number.isFinite(volume) ? volume : 0));
    this.masterGain.gain.value = clamped;
  }

  setMusicBusVolume(volume: number): void {
    const clamped = Math.min(1, Math.max(0, Number.isFinite(volume) ? volume : 0));
    // Convert linear 0-1 to dB (-Infinity to 0)
    this.musicBus.volume.value = clamped === 0 ? -Infinity : 20 * Math.log10(clamped);
  }

  setAmbientBusVolume(volume: number): void {
    const clamped = Math.min(1, Math.max(0, Number.isFinite(volume) ? volume : 0));
    this.ambientBus.volume.value = clamped === 0 ? -Infinity : 20 * Math.log10(clamped);
  }

  getMusicBus(): Tone.Channel {
    return this.musicBus;
  }

  getAmbientBus(): Tone.Channel {
    return this.ambientBus;
  }

  dispose(): void {
    this.musicBus.dispose();
    this.ambientBus.dispose();
    this.masterGain.dispose();
  }
}
