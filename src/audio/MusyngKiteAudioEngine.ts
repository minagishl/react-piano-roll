import type { AudioEngine, MIDINoteNumber, Velocity } from '../types';
import Soundfont from 'soundfont-player';

const INSTRUMENTS = [
	'acoustic_grand_piano',
	'bright_acoustic_piano',
	'electric_grand_piano',
	'honkytonk_piano',
	'electric_piano_1',
	'electric_piano_2',
	'harpsichord',
	'clavinet',
	'celesta',
	'glockenspiel',
	'music_box',
	'vibraphone',
	'marimba',
	'xylophone',
	'tubular_bells',
	'dulcimer',
	'drawbar_organ',
	'percussive_organ',
	'rock_organ',
	'church_organ',
	'reed_organ',
	'accordion',
	'harmonica',
	'tango_accordion',
	'acoustic_guitar_nylon',
	'acoustic_guitar_steel',
	'electric_guitar_jazz',
	'electric_guitar_clean',
	'electric_guitar_muted',
	'overdriven_guitar',
	'distortion_guitar',
	'guitar_harmonics',
	'acoustic_bass',
	'electric_bass_finger',
	'electric_bass_pick',
	'fretless_bass',
	'slap_bass_1',
	'slap_bass_2',
	'synth_bass_1',
	'synth_bass_2',
	'violin',
	'viola',
	'cello',
	'contrabass',
	'tremolo_strings',
	'pizzicato_strings',
	'orchestral_harp',
	'timpani',
	'string_ensemble_1',
	'string_ensemble_2',
	'synth_strings_1',
	'synth_strings_2',
	'choir_aahs',
	'voice_oohs',
	'synth_choir',
	'orchestra_hit',
	'trumpet',
	'trombone',
	'tuba',
	'muted_trumpet',
	'french_horn',
	'brass_section',
	'synth_brass_1',
	'synth_brass_2',
	'soprano_sax',
	'alto_sax',
	'tenor_sax',
	'baritone_sax',
	'oboe',
	'english_horn',
	'bassoon',
	'clarinet',
	'piccolo',
	'flute',
	'recorder',
	'pan_flute',
	'blown_bottle',
	'shakuhachi',
	'whistle',
	'ocarina',
	'lead_1_square',
	'lead_2_sawtooth',
	'lead_3_calliope',
	'lead_4_chiff',
	'lead_5_charang',
	'lead_6_voice',
	'lead_7_fifths',
	'lead_8_bass__lead',
	'pad_1_new_age',
	'pad_2_warm',
	'pad_3_polysynth',
	'pad_4_choir',
	'pad_5_bowed',
	'pad_6_metallic',
	'pad_7_halo',
	'pad_8_sweep',
	'fx_1_rain',
	'fx_2_soundtrack',
	'fx_3_crystal',
	'fx_4_atmosphere',
	'fx_5_brightness',
	'fx_6_goblins',
	'fx_7_echoes',
	'fx_8_scifi',
	'sitar',
	'banjo',
	'shamisen',
	'koto',
	'kalimba',
	'bagpipe',
	'fiddle',
	'shanai',
	'tinkle_bell',
	'agogo',
	'steel_drums',
	'woodblock',
	'taiko_drum',
	'melodic_tom',
	'synth_drum',
	'reverse_cymbal',
	'guitar_fret_noise',
	'breath_noise',
	'seashore',
	'bird_tweet',
	'telephone_ring',
	'helicopter',
	'applause',
	'gunshot',
] as const satisfies readonly Soundfont.InstrumentName[];

// Derive the type from the array
type InstrumentName = (typeof INSTRUMENTS)[number];

/**
 * Audio engine using MusyngKite SoundFont
 * Supports instrument selection via MIDI program numbers
 */
export class MusyngKiteAudioEngine implements AudioEngine {
	private audioContext: AudioContext | null = null;
	private masterGain: GainNode | null = null;
	private instrument: Soundfont.Player | null = null;
	private activeNotes: Map<number, AudioNode[]> = new Map();
	private initialized = false;
	private instrumentName: InstrumentName;
	private soundfontUrl: string;

	/**
	 * @param instrumentName - MIDI instrument name or program number (0-127)
	 *                         Default: 'acoustic_grand_piano' (program 0)
	 * @param soundfontUrl - URL to the MusyngKite SoundFont file
	 *                       Default: Uses soundfont-player's built-in musyngkite
	 */
	constructor(
		instrumentName: string | number | InstrumentName = 'acoustic_grand_piano',
		soundfontUrl?: string
	) {
		if (typeof instrumentName === 'number') {
			// Convert MIDI program number to instrument name
			this.instrumentName = this.getInstrumentNameFromProgram(instrumentName);
		} else {
			this.instrumentName = instrumentName as InstrumentName;
		}
		this.soundfontUrl = soundfontUrl || 'MusyngKite';
	}

	async init(): Promise<void> {
		if (this.initialized) return;

		this.audioContext = new AudioContext();
		this.masterGain = this.audioContext.createGain();
		this.masterGain.connect(this.audioContext.destination);
		this.masterGain.gain.value = 0.7;

		try {
			// Load the instrument from SoundFont
			this.instrument = await Soundfont.instrument(
				this.audioContext,
				this.instrumentName as Soundfont.InstrumentName,
				{
					soundfont: this.soundfontUrl,
				}
			);
		} catch (error) {
			console.error('Failed to load MusyngKite instrument:', error);
			throw error;
		}

		this.initialized = true;
	}

	/**
	 * Change the instrument
	 * @param instrumentName - MIDI instrument name or program number (0-127)
	 */
	async setInstrument(instrumentName: string | number | InstrumentName): Promise<void> {
		if (typeof instrumentName === 'number') {
			this.instrumentName = this.getInstrumentNameFromProgram(instrumentName);
		} else {
			this.instrumentName = instrumentName as InstrumentName;
		}

		if (this.audioContext) {
			try {
				this.instrument = await Soundfont.instrument(
					this.audioContext,
					this.instrumentName as Soundfont.InstrumentName,
					{
						soundfont: this.soundfontUrl,
					}
				);
			} catch (error) {
				console.error('Failed to change instrument:', error);
			}
		}
	}

	playNote(pitch: MIDINoteNumber, velocity: Velocity, duration: number): void {
		if (!this.audioContext || !this.masterGain || !this.instrument) {
			console.warn('MusyngKiteAudioEngine not initialized');
			return;
		}

		// Resume audio context if suspended (browser autoplay policy)
		if (this.audioContext.state === 'suspended') {
			this.audioContext.resume();
		}

		// Stop existing note if playing
		this.stopNote(pitch);

		// Convert MIDI velocity (0-127) to gain (0-1)
		const gain = velocity / 127;

		// Convert MIDI note to note name (e.g., 60 -> 'C4')
		const noteName = this.midiToNoteName(pitch);

		// Play the note using soundfont-player
		// The play method handles duration automatically, so the note will stop after the specified duration
		this.instrument.play(noteName, this.audioContext.currentTime, {
			gain: gain,
			duration: duration,
		});
	}

	stopNote(pitch: MIDINoteNumber): void {
		// soundfont-player manages notes internally, so we just track that the note should be stopped
		// The actual stopping is handled by the duration parameter in play()
		this.activeNotes.delete(pitch);
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
		this.instrument = null;
		this.initialized = false;
	}

	/**
	 * Convert MIDI note number to note name
	 */
	private midiToNoteName(midi: number): string {
		const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
		const octave = Math.floor(midi / 12) - 1;
		const note = midi % 12;
		return `${noteNames[note]}${octave}`;
	}

	/**
	 * Convert MIDI program number to instrument name
	 * General MIDI program numbers (0-127)
	 */
	private getInstrumentNameFromProgram(program: number): InstrumentName {
		if (program >= 0 && program < INSTRUMENTS.length) {
			return INSTRUMENTS[program];
		}
		return 'acoustic_grand_piano'; // Default fallback
	}
}
