/**
 * react-piano-roll
 * A production-ready React component for piano roll / falling notes visualization
 */

// Main component
export { PianoRoll } from './components/PianoRoll';
export type { PianoRollProps, PianoRollHandle } from './components/PianoRoll';

// Sub-components (for advanced use cases)
export { Keyboard } from './components/Keyboard';
export { NoteCanvas } from './components/NoteCanvas';

// Hooks
export { usePlayback } from './hooks/usePlayback';

// Audio engine
export { PianoAudioEngine } from './audio/AudioEngine';
export { MusyngKiteAudioEngine } from './audio/MusyngKiteAudioEngine';

// Types
export type {
	Note,
	MIDINoteNumber,
	Velocity,
	Time,
	PlaybackState,
	PianoRollTheme,
	KeyboardConfig,
	AnimationConfig,
	PlaybackController,
	AudioEngine,
} from './types';

// Utilities
export {
	isBlackKey,
	getNoteNameFromMIDI,
	getMIDIFromNoteName,
	getKeyXPosition,
	getBlackKeyOffset,
	countWhiteKeys,
	midiToFrequency,
	getNotesInRange,
} from './utils/piano';
