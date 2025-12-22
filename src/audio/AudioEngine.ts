import type { AudioEngine, MIDINoteNumber, Velocity } from '../types';

/**
 * High-quality sample-based audio engine for piano sounds
 * Uses Web Audio API with pre-loaded samples
 */
export class PianoAudioEngine implements AudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private samples: Map<number, AudioBuffer> = new Map();
  private activeNotes: Map<number, { source: AudioBufferSourceNode; gain: GainNode }> = new Map();
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;

    this.audioContext = new AudioContext();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
    this.masterGain.gain.value = 0.7;

    // Load piano samples
    // For production use, load actual high-quality piano samples
    // Here we'll generate basic samples using OscillatorNode as fallback
    this.initialized = true;
  }

  /**
   * Load a set of piano samples from URLs
   * @param sampleMap Map of MIDI note numbers to audio file URLs
   */
  async loadSamples(sampleMap: Map<number, string>): Promise<void> {
    if (!this.audioContext) {
      throw new Error('AudioEngine not initialized');
    }

    const loadPromises = Array.from(sampleMap.entries()).map(async ([note, url]) => {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
        this.samples.set(note, audioBuffer);
      } catch (error) {
        console.error(`Failed to load sample for note ${note}:`, error);
      }
    });

    await Promise.all(loadPromises);
  }

  playNote(pitch: MIDINoteNumber, velocity: Velocity, duration: number): void {
    if (!this.audioContext || !this.masterGain) {
      console.warn('AudioEngine not initialized');
      return;
    }

    // Resume audio context if suspended (browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    // Stop existing note if playing
    this.stopNote(pitch);

    const gainNode = this.audioContext.createGain();
    gainNode.connect(this.masterGain);

    // Convert MIDI velocity (0-127) to gain (0-1)
    const gain = velocity / 127;
    gainNode.gain.value = gain;

    // Check if we have a sample for this note
    const sample = this.findClosestSample(pitch);

    if (sample) {
      const source = this.audioContext.createBufferSource();
      source.buffer = sample.buffer;

      // Calculate playback rate for pitch shifting
      const playbackRate = this.calculatePlaybackRate(sample.pitch, pitch);
      source.playbackRate.value = playbackRate;

      source.connect(gainNode);

      // Apply ADSR envelope
      const now = this.audioContext.currentTime;
      const attack = 0.01;
      const decay = 0.1;
      const sustain = 0.7;
      const release = 0.3;

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(gain, now + attack);
      gainNode.gain.linearRampToValueAtTime(gain * sustain, now + attack + decay);

      source.start(now);

      // Schedule release
      const releaseTime = now + duration;
      gainNode.gain.setValueAtTime(gain * sustain, releaseTime);
      gainNode.gain.linearRampToValueAtTime(0, releaseTime + release);

      source.stop(releaseTime + release);

      this.activeNotes.set(pitch, { source, gain: gainNode });

      // Clean up after note ends
      source.onended = () => {
        this.activeNotes.delete(pitch);
        gainNode.disconnect();
      };
    } else {
      // Fallback to oscillator if no samples loaded
      this.playOscillatorNote(pitch, velocity, duration, gainNode);
    }
  }

  stopNote(pitch: MIDINoteNumber): void {
    const activeNote = this.activeNotes.get(pitch);
    if (activeNote) {
      try {
        const now = this.audioContext!.currentTime;
        activeNote.gain.gain.cancelScheduledValues(now);
        activeNote.gain.gain.setValueAtTime(activeNote.gain.gain.value, now);
        activeNote.gain.gain.linearRampToValueAtTime(0, now + 0.1);
        activeNote.source.stop(now + 0.1);
      } catch (error) {
        // Note may have already stopped
      }
      this.activeNotes.delete(pitch);
    }
  }

  stopAll(): void {
    const notes = Array.from(this.activeNotes.keys());
    notes.forEach((pitch) => this.stopNote(pitch));
  }

  setVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  dispose(): void {
    this.stopAll();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.masterGain = null;
    this.samples.clear();
    this.initialized = false;
  }

  /**
   * Find the closest loaded sample to the target pitch
   */
  private findClosestSample(targetPitch: number): { buffer: AudioBuffer; pitch: number } | null {
    if (this.samples.size === 0) return null;

    let closestPitch = -1;
    let minDistance = Infinity;

    this.samples.forEach((_, pitch) => {
      const distance = Math.abs(pitch - targetPitch);
      if (distance < minDistance) {
        minDistance = distance;
        closestPitch = pitch;
      }
    });

    const buffer = this.samples.get(closestPitch);
    return buffer ? { buffer, pitch: closestPitch } : null;
  }

  /**
   * Calculate playback rate for pitch shifting
   */
  private calculatePlaybackRate(sourcePitch: number, targetPitch: number): number {
    const semitones = targetPitch - sourcePitch;
    return Math.pow(2, semitones / 12);
  }

  /**
   * Fallback oscillator-based note playback
   */
  private playOscillatorNote(
    pitch: MIDINoteNumber,
    velocity: Velocity,
    duration: number,
    gainNode: GainNode
  ): void {
    if (!this.audioContext) return;

    const frequency = this.midiToFrequency(pitch);
    const gain = velocity / 127;

    // Use multiple oscillators for richer tone
    const oscillators = [
      { type: 'sine' as OscillatorType, detune: 0, gain: 0.5 },
      { type: 'sine' as OscillatorType, detune: 1200, gain: 0.2 }, // Octave up
      { type: 'sine' as OscillatorType, detune: 1900, gain: 0.1 }, // Fifth up
    ];

    const sources = oscillators.map(({ type, detune, gain: oscGain }) => {
      const osc = this.audioContext!.createOscillator();
      const oscGainNode = this.audioContext!.createGain();

      osc.type = type;
      osc.frequency.value = frequency;
      osc.detune.value = detune;

      oscGainNode.gain.value = gain * oscGain;

      osc.connect(oscGainNode);
      oscGainNode.connect(gainNode);

      return { osc, gain: oscGainNode };
    });

    const now = this.audioContext.currentTime;
    const attack = 0.01;
    const decay = 0.1;
    const sustain = 0.7;
    const release = 0.3;

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(gain, now + attack);
    gainNode.gain.linearRampToValueAtTime(gain * sustain, now + attack + decay);

    sources.forEach(({ osc }) => osc.start(now));

    const releaseTime = now + duration;
    gainNode.gain.setValueAtTime(gain * sustain, releaseTime);
    gainNode.gain.linearRampToValueAtTime(0, releaseTime + release);

    sources.forEach(({ osc }) => osc.stop(releaseTime + release));

    // Store primary oscillator for note management
    const primarySource = sources[0].osc as any;
    this.activeNotes.set(pitch, { source: primarySource, gain: gainNode });

    primarySource.onended = () => {
      this.activeNotes.delete(pitch);
      sources.forEach(({ gain: oscGain }) => oscGain.disconnect());
      gainNode.disconnect();
    };
  }

  /**
   * Convert MIDI note number to frequency in Hz
   */
  private midiToFrequency(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }
}
