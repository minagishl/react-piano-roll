import React, { useRef, useEffect, useCallback } from 'react';
import type {
	Note,
	MIDINoteNumber,
	PianoRollTheme,
	KeyboardConfig,
	AnimationConfig,
} from '../types';
import { isBlackKey, countWhiteKeys } from '../utils/piano';

interface NoteCanvasProps {
	/**
	 * Array of notes to display
	 */
	notes: Note[];

	/**
	 * Current playback time in seconds
	 */
	currentTime: number;

	/**
	 * Whether playback is currently running
	 */
	isPlaying?: boolean;

	/**
	 * Keyboard configuration
	 */
	keyboardConfig: Required<KeyboardConfig>;

	/**
	 * Theme configuration
	 */
	theme: Required<PianoRollTheme>;

	/**
	 * Animation configuration
	 */
	animationConfig: Required<AnimationConfig>;

	/**
	 * Width of the canvas
	 */
	width: number;

	/**
	 * Height of the canvas (note roll area)
	 */
	height: number;

	/**
	 * Callback when a note should be played
	 */
	onNoteTrigger?: (note: Note) => void;
}

export const NoteCanvas: React.FC<NoteCanvasProps> = ({
	notes,
	currentTime,
	isPlaying = true,
	keyboardConfig,
	theme,
	animationConfig,
	width,
	height,
	onNoteTrigger,
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const triggeredNotesRef = useRef<Set<Note>>(new Set());
	const previousTimeRef = useRef<number>(currentTime);

	// Calculate note X position based on pitch
	const getNoteX = useCallback(
		(pitch: MIDINoteNumber): number => {
			const { startNote, whiteKeyWidth, blackKeyWidth } = keyboardConfig;
			let x = 0;
			let whiteKeyIndex = 0;

			for (let note = startNote; note < pitch; note++) {
				if (!isBlackKey(note)) {
					whiteKeyIndex++;
				}
			}

			x = whiteKeyIndex * whiteKeyWidth;

			// Center black keys on their position
			if (isBlackKey(pitch)) {
				x -= blackKeyWidth / 2;
			}

			return x;
		},
		[keyboardConfig]
	);

	// Get note width based on whether it's a black or white key
	const getNoteWidth = useCallback(
		(pitch: MIDINoteNumber): number => {
			const { whiteKeyWidth, blackKeyWidth } = keyboardConfig;
			return isBlackKey(pitch) ? blackKeyWidth : whiteKeyWidth;
		},
		[keyboardConfig]
	);

	// Calculate note color
	const getNoteColor = useCallback(
		(note: Note): string => {
			if (note.color) {
				return note.color;
			}
			const velocity = note.velocity ?? 64;
			if (typeof theme.noteColor === 'function') {
				return theme.noteColor(velocity);
			}
			return theme.noteColor;
		},
		[theme]
	);

	// Draw the piano roll
	const draw = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		// Clear canvas
		ctx.fillStyle = theme.backgroundColor;
		ctx.fillRect(0, 0, width, height);

		// Draw grid if enabled
		if (theme.showGrid) {
			ctx.strokeStyle = theme.gridColor;
			ctx.lineWidth = 1;

			// Vertical grid lines (for each white key)
			const whiteKeyCount = countWhiteKeys(
				keyboardConfig.startNote,
				keyboardConfig.startNote + keyboardConfig.keyCount - 1
			);

			for (let i = 0; i <= whiteKeyCount; i++) {
				const x = i * keyboardConfig.whiteKeyWidth;
				ctx.beginPath();
				ctx.moveTo(x, 0);
				ctx.lineTo(x, height);
				ctx.stroke();
			}

			// Horizontal grid lines
			if (theme.gridSpacing > 0) {
				for (let y = 0; y < height; y += theme.gridSpacing) {
					ctx.beginPath();
					ctx.moveTo(0, y);
					ctx.lineTo(width, y);
					ctx.stroke();
				}
			}
		}

		// Calculate visible time range
		const { fallSpeed, lookahead } = animationConfig;
		const pixelsPerSecond = fallSpeed;
		const endTime = currentTime + lookahead;

		const previousTime = previousTimeRef.current;
		if (currentTime < previousTime) {
			triggeredNotesRef.current.clear();
		}

		// Draw notes
		notes.forEach((note) => {
			const noteStartTime = note.startTime;
			const noteEndTime = note.startTime + note.duration;

			// Trigger note as it reaches the keyboard (bottom of canvas), using a small time tolerance.
			const timeTolerance = 0.01; // 10ms tolerance
			const hasReachedKeyboard = noteStartTime <= currentTime + timeTolerance;
			const justReachedKeyboard = noteStartTime >= previousTime - timeTolerance;
			const shouldTrigger =
				isPlaying && hasReachedKeyboard && justReachedKeyboard && noteEndTime >= currentTime;

			if (shouldTrigger && !triggeredNotesRef.current.has(note)) {
				triggeredNotesRef.current.add(note);
				onNoteTrigger?.(note);
			}

			// Clean up triggered notes that have ended
			if (noteEndTime < currentTime && triggeredNotesRef.current.has(note)) {
				triggeredNotesRef.current.delete(note);
			}

			// Skip notes that are not in visible range
			if (noteEndTime < currentTime || noteStartTime > endTime) {
				return;
			}

			// Calculate note position
			const x = getNoteX(note.pitch);
			const noteWidth = getNoteWidth(note.pitch);

			// Y position: notes fall from top to bottom
			// When note.startTime === currentTime, the note's bottom edge should align with the keyboard line.
			// As time increases, notes move down.
			const timeUntilStart = noteStartTime - currentTime;

			// Note height based on duration
			const noteHeight = note.duration * pixelsPerSecond;
			const y = height - timeUntilStart * pixelsPerSecond - noteHeight;

			// Only draw if visible
			if (y + noteHeight >= 0 && y <= height) {
				const noteColor = getNoteColor(note);
				const isActive = noteStartTime <= currentTime && noteEndTime >= currentTime;
				const activeColor =
					theme.activeNoteColorMode === 'note' ? noteColor : theme.activeNoteColor;

				ctx.fillStyle = isActive ? activeColor : noteColor;

				// Draw rounded rectangle
				const radius = theme.noteRadius;
				ctx.beginPath();
				ctx.moveTo(x + radius, y);
				ctx.lineTo(x + noteWidth - radius, y);
				ctx.quadraticCurveTo(x + noteWidth, y, x + noteWidth, y + radius);
				ctx.lineTo(x + noteWidth, y + noteHeight - radius);
				ctx.quadraticCurveTo(x + noteWidth, y + noteHeight, x + noteWidth - radius, y + noteHeight);
				ctx.lineTo(x + radius, y + noteHeight);
				ctx.quadraticCurveTo(x, y + noteHeight, x, y + noteHeight - radius);
				ctx.lineTo(x, y + radius);
				ctx.quadraticCurveTo(x, y, x + radius, y);
				ctx.closePath();
				ctx.fill();
			}
		});

		previousTimeRef.current = currentTime;
	}, [
		notes,
		currentTime,
		isPlaying,
		keyboardConfig,
		theme,
		animationConfig,
		width,
		height,
		getNoteX,
		getNoteWidth,
		getNoteColor,
		onNoteTrigger,
	]);

	// Redraw when dependencies change
	useEffect(() => {
		draw();
	}, [draw]);

	return (
		<canvas
			ref={canvasRef}
			width={width}
			height={height}
			style={{ display: 'block' }}
			aria-label='Piano roll visualization'
		/>
	);
};

NoteCanvas.displayName = 'NoteCanvas';
