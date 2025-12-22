/**
 * Piano keyboard utilities
 */

import type { MIDINoteNumber } from '../types';

/**
 * Check if a MIDI note is a black key
 */
export function isBlackKey(midiNote: MIDINoteNumber): boolean {
	const noteInOctave = midiNote % 12;
	return [1, 3, 6, 8, 10].includes(noteInOctave);
}

/**
 * Get the note name from MIDI number
 */
export function getNoteNameFromMIDI(midiNote: MIDINoteNumber): string {
	const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
	const octave = Math.floor(midiNote / 12) - 1;
	const noteName = noteNames[midiNote % 12];
	return `${noteName}${octave}`;
}

/**
 * Get MIDI note number from note name (e.g., "C4" -> 60)
 */
export function getMIDIFromNoteName(noteName: string): MIDINoteNumber {
	const noteMap: Record<string, number> = {
		C: 0,
		'C#': 1,
		Db: 1,
		D: 2,
		'D#': 3,
		Eb: 3,
		E: 4,
		F: 5,
		'F#': 6,
		Gb: 6,
		G: 7,
		'G#': 8,
		Ab: 8,
		A: 9,
		'A#': 10,
		Bb: 10,
		B: 11,
	};

	const match = noteName.match(/^([A-G][#b]?)(-?\d+)$/);
	if (!match) {
		throw new Error(`Invalid note name: ${noteName}`);
	}

	const [, note, octave] = match;
	const noteValue = noteMap[note];
	if (noteValue === undefined) {
		throw new Error(`Invalid note: ${note}`);
	}

	return noteValue + (parseInt(octave) + 1) * 12;
}

/**
 * Calculate the x position of a key on the keyboard
 */
export function getKeyXPosition(
	midiNote: MIDINoteNumber,
	startNote: MIDINoteNumber,
	whiteKeyWidth: number
): number {
	let whiteKeyCount = 0;

	for (let note = startNote; note < midiNote; note++) {
		if (!isBlackKey(note)) {
			whiteKeyCount++;
		}
	}

	return whiteKeyCount * whiteKeyWidth;
}

/**
 * Get the width offset for black keys
 * Black keys are offset relative to their white key neighbors
 */
export function getBlackKeyOffset(midiNote: MIDINoteNumber, whiteKeyWidth: number): number {
	const noteInOctave = midiNote % 12;
	const blackKeyWidth = whiteKeyWidth * 0.6;

	// Black keys are positioned between white keys
	switch (noteInOctave) {
		case 1: // C#
			return whiteKeyWidth - blackKeyWidth / 2;
		case 3: // D#
			return whiteKeyWidth * 2 - blackKeyWidth / 2;
		case 6: // F#
			return whiteKeyWidth * 4 - blackKeyWidth / 2;
		case 8: // G#
			return whiteKeyWidth * 5 - blackKeyWidth / 2;
		case 10: // A#
			return whiteKeyWidth * 6 - blackKeyWidth / 2;
		default:
			return 0;
	}
}

/**
 * Count white keys in a range
 */
export function countWhiteKeys(startNote: MIDINoteNumber, endNote: MIDINoteNumber): number {
	let count = 0;
	for (let note = startNote; note <= endNote; note++) {
		if (!isBlackKey(note)) {
			count++;
		}
	}
	return count;
}

/**
 * Convert MIDI note number to frequency in Hz
 */
export function midiToFrequency(midi: MIDINoteNumber): number {
	return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Get all notes in a range
 */
export function getNotesInRange(startNote: MIDINoteNumber, keyCount: number): MIDINoteNumber[] {
	return Array.from({ length: keyCount }, (_, i) => startNote + i);
}
