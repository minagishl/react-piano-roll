/**
 * Core type definitions for react-piano-roll
 */

/**
 * MIDI note number (0-127)
 * A0 = 21, C4 (middle C) = 60, C8 = 108
 */
export type MIDINoteNumber = number;

/**
 * Note velocity (0-127)
 * Represents the intensity/volume of a note
 */
export type Velocity = number;

/**
 * Time in seconds
 */
export type Time = number;

/**
 * Represents a single note in the piano roll
 */
export interface Note {
	/**
	 * MIDI note number (0-127)
	 */
	pitch: MIDINoteNumber;

	/**
	 * Start time in seconds
	 */
	startTime: Time;

	/**
	 * Duration in seconds
	 */
	duration: number;

	/**
	 * Note velocity (0-127), defaults to 64 if not specified
	 */
	velocity?: Velocity;
}

/**
 * Playback state
 */
export type PlaybackState = 'playing' | 'paused' | 'stopped';

/**
 * Theme configuration for customizing the piano roll appearance
 */
export interface PianoRollTheme {
	/**
	 * Background color of the piano roll
	 */
	backgroundColor?: string;

	/**
	 * Grid line color
	 */
	gridColor?: string;

	/**
	 * Whether to show grid lines
	 */
	showGrid?: boolean;

	/**
	 * Grid spacing in pixels
	 */
	gridSpacing?: number;

	/**
	 * Note block color (can be a function for velocity-based coloring)
	 */
	noteColor?: string | ((velocity: number) => string);

	/**
	 * Active/playing note color
	 */
	activeNoteColor?: string;

	/**
	 * Note border radius in pixels
	 */
	noteRadius?: number;

	/**
	 * White key color
	 */
	whiteKeyColor?: string;

	/**
	 * Black key color
	 */
	blackKeyColor?: string;

	/**
	 * Active white key color
	 */
	activeWhiteKeyColor?: string;

	/**
	 * Active black key color
	 */
	activeBlackKeyColor?: string;

	/**
	 * Key border color
	 */
	keyBorderColor?: string;
}

/**
 * Keyboard configuration
 */
export interface KeyboardConfig {
	/**
	 * Number of keys to display
	 */
	keyCount?: number;

	/**
	 * Starting MIDI note number (e.g., 21 for A0)
	 */
	startNote?: MIDINoteNumber;

	/**
	 * Width of white keys in pixels
	 */
	whiteKeyWidth?: number;

	/**
	 * Height of white keys in pixels
	 */
	whiteKeyHeight?: number;

	/**
	 * Width of black keys in pixels (relative to white keys)
	 */
	blackKeyWidth?: number;

	/**
	 * Height of black keys in pixels (relative to white keys)
	 */
	blackKeyHeight?: number;

	/**
	 * Whether to show note labels on keys
	 */
	showLabels?: boolean;

	/**
	 * Font size for key labels in pixels
	 */
	labelFontSize?: number;

	/**
	 * Font family for key labels
	 */
	labelFontFamily?: string;

	/**
	 * Label color for white keys
	 */
	whiteLabelColor?: string;

	/**
	 * Label color for black keys
	 */
	blackLabelColor?: string;
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
	/**
	 * Pixels per second for falling notes
	 */
	fallSpeed?: number;

	/**
	 * Easing function for animations
	 */
	easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';

	/**
	 * Lookahead time in seconds (how far ahead to show notes)
	 */
	lookahead?: number;
}

/**
 * Playback controller interface
 */
export interface PlaybackController {
	/**
	 * Start playback
	 */
	play: () => void;

	/**
	 * Pause playback
	 */
	pause: () => void;

	/**
	 * Stop playback and reset to beginning
	 */
	stop: () => void;

	/**
	 * Seek to a specific time
	 */
	seek: (time: Time) => void;

	/**
	 * Get current playback time
	 */
	getCurrentTime: () => Time;

	/**
	 * Get current playback state
	 */
	getState: () => PlaybackState;
}

/**
 * Audio engine interface for playing notes
 */
export interface AudioEngine {
	/**
	 * Play a note
	 */
	playNote: (pitch: MIDINoteNumber, velocity: Velocity, duration: number) => void;

	/**
	 * Stop a note
	 */
	stopNote: (pitch: MIDINoteNumber) => void;

	/**
	 * Stop all notes
	 */
	stopAll: () => void;

	/**
	 * Set master volume (0-1)
	 */
	setVolume: (volume: number) => void;

	/**
	 * Initialize/load audio resources
	 */
	init: () => Promise<void>;

	/**
	 * Clean up resources
	 */
	dispose: () => void;
}
