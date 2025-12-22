import React, { useMemo, useCallback } from 'react';
import type { MIDINoteNumber, KeyboardConfig, PianoRollTheme } from '../types';
import { isBlackKey, countWhiteKeys, getNoteNameFromMIDI } from '../utils/piano';

interface KeyboardProps {
	/**
	 * Set of currently active notes (MIDI numbers)
	 */
	activeNotes: Set<MIDINoteNumber>;

	/**
	 * Active note velocities for matching key colors
	 */
	activeNoteVelocities?: Map<MIDINoteNumber, number>;

	/**
	 * Keyboard configuration
	 */
	config: Required<KeyboardConfig>;

	/**
	 * Theme configuration
	 */
	theme: Required<PianoRollTheme>;

	/**
	 * Width of the keyboard container
	 */
	width?: number;
}

interface KeyInfo {
	midiNote: number;
	isBlack: boolean;
	x: number;
	width: number;
	height: number;
}

export const Keyboard: React.FC<KeyboardProps> = ({
	activeNotes,
	activeNoteVelocities,
	config,
	theme,
	width,
}) => {
	const {
		startNote,
		keyCount,
		whiteKeyWidth,
		whiteKeyHeight,
		blackKeyWidth,
		blackKeyHeight,
		showLabels,
		labelFontSize,
		labelFontFamily,
		whiteLabelColor,
		blackLabelColor,
		keyBorderRadius,
	} = config;

	// Generate SVG path for a rectangle with only bottom corners rounded
	const getKeyPath = useCallback(
		(x: number, y: number, w: number, h: number, radius: number): string => {
			if (radius === 0) {
				return `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
			}

			const r = Math.min(radius, w / 2, h / 2);
			return `
				M ${x} ${y}
				L ${x + w} ${y}
				L ${x + w} ${y + h - r}
				Q ${x + w} ${y + h} ${x + w - r} ${y + h}
				L ${x + r} ${y + h}
				Q ${x} ${y + h} ${x} ${y + h - r}
				Z
			`;
		},
		[]
	);

	// Calculate keyboard dimensions
	const whiteKeyCount = useMemo(() => {
		return countWhiteKeys(startNote, startNote + keyCount - 1);
	}, [startNote, keyCount]);

	const totalWidth = width || whiteKeyCount * whiteKeyWidth;

	const getActiveKeyColor = useCallback(
		(velocity?: number) => {
			if (theme.activeKeyColorMode !== 'note' || velocity === undefined) {
				return undefined;
			}

			if (typeof theme.noteColor === 'function') {
				return theme.noteColor(velocity);
			}

			return theme.noteColor;
		},
		[theme]
	);

	// Generate key positions
	const keys = useMemo((): KeyInfo[] => {
		const whiteKeys: KeyInfo[] = [];
		const blackKeys: KeyInfo[] = [];

		let whiteKeyIndex = 0;

		for (let i = 0; i < keyCount; i++) {
			const midiNote = startNote + i;
			const isBlack = isBlackKey(midiNote);

			if (isBlack) {
				// Black keys are positioned between white keys
				const x = whiteKeyIndex * whiteKeyWidth - blackKeyWidth / 2;
				blackKeys.push({
					midiNote,
					isBlack: true,
					x,
					width: blackKeyWidth,
					height: blackKeyHeight,
				});
			} else {
				// White key
				const x = whiteKeyIndex * whiteKeyWidth;
				whiteKeys.push({
					midiNote,
					isBlack: false,
					x,
					width: whiteKeyWidth,
					height: whiteKeyHeight,
				});
				whiteKeyIndex++;
			}
		}

		// Render white keys first, then black keys on top
		return [...whiteKeys, ...blackKeys];
	}, [startNote, keyCount, whiteKeyWidth, whiteKeyHeight, blackKeyWidth, blackKeyHeight]);

	return (
		<svg
			width={totalWidth}
			height={whiteKeyHeight}
			style={{ display: 'block' }}
			aria-label='Piano keyboard'
		>
			{keys.map((key) => {
				const isActive = activeNotes.has(key.midiNote);
				const velocity = activeNoteVelocities?.get(key.midiNote);
				const activeNoteColor = getActiveKeyColor(velocity);
				const activeFill =
					activeNoteColor ?? (key.isBlack ? theme.activeBlackKeyColor : theme.activeWhiteKeyColor);
				const fill = key.isBlack
					? isActive
						? activeFill
						: theme.blackKeyColor
					: isActive
						? activeFill
						: theme.whiteKeyColor;

				const noteName = showLabels ? getNoteNameFromMIDI(key.midiNote) : '';
				const labelColor = key.isBlack ? blackLabelColor : whiteLabelColor;

				return (
					<g key={key.midiNote}>
						<path
							d={getKeyPath(
								key.x,
								0,
								key.width,
								key.height,
								key.isBlack ? keyBorderRadius / 2 : keyBorderRadius
							)}
							fill={fill}
							stroke={theme.keyBorderColor}
							strokeWidth={1}
							data-note={key.midiNote}
							style={{
								transition: 'fill 0.05s ease-out',
							}}
						/>
						{showLabels && (
							<text
								x={key.x + key.width / 2}
								y={key.height - 8}
								textAnchor='middle'
								fontSize={key.isBlack ? labelFontSize / 2 : labelFontSize}
								fontFamily={labelFontFamily}
								fill={labelColor}
								pointerEvents='none'
								style={{
									userSelect: 'none',
								}}
							>
								{noteName}
							</text>
						)}
					</g>
				);
			})}
		</svg>
	);
};

Keyboard.displayName = 'Keyboard';
