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
	keyboardConfig,
	theme,
	animationConfig,
	width,
	height,
	onNoteTrigger,
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const triggeredNotesRef = useRef<Set<Note>>(new Set());

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
		(velocity: number): string => {
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

		// Draw notes
		notes.forEach((note) => {
			const noteStartTime = note.startTime;
			const noteEndTime = note.startTime + note.duration;

			// Skip notes that are not in visible range
			if (noteEndTime < currentTime || noteStartTime > endTime) {
				return;
			}

			// Trigger note if it's at the bottom
			if (
				noteStartTime <= currentTime &&
				noteEndTime >= currentTime &&
				!triggeredNotesRef.current.has(note)
			) {
				triggeredNotesRef.current.add(note);
				onNoteTrigger?.(note);
			}

			// Clean up triggered notes that have ended
			if (noteEndTime < currentTime && triggeredNotesRef.current.has(note)) {
				triggeredNotesRef.current.delete(note);
			}

			// Calculate note position
			const x = getNoteX(note.pitch);
			const noteWidth = getNoteWidth(note.pitch);

			// Y position: notes fall from top to bottom
			// When note.startTime === currentTime, y should be at height (bottom)
			// As time increases, notes move down
			const timeUntilStart = noteStartTime - currentTime;
			const y = height - timeUntilStart * pixelsPerSecond;

			// Note height based on duration
			const noteHeight = note.duration * pixelsPerSecond;

			// Only draw if visible
			if (y + noteHeight >= 0 && y <= height) {
				const velocity = note.velocity ?? 64;
				const isActive = noteStartTime <= currentTime && noteEndTime >= currentTime;

				ctx.fillStyle = isActive ? theme.activeNoteColor : getNoteColor(velocity);

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
	}, [
		notes,
		currentTime,
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
