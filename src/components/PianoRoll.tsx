import {
	useRef,
	useEffect,
	useState,
	useMemo,
	useCallback,
	forwardRef,
	useImperativeHandle,
} from 'react';
import type {
	Note,
	PianoRollTheme,
	KeyboardConfig,
	AnimationConfig,
	AudioEngine,
	PlaybackController,
	MIDINoteNumber,
} from '../types';
import { Keyboard } from './Keyboard';
import { NoteCanvas } from './NoteCanvas';
import { PianoAudioEngine } from '../audio/AudioEngine';
import { usePlayback } from '../hooks/usePlayback';
import { countWhiteKeys } from '../utils/piano';

// Default theme
const defaultTheme: Required<PianoRollTheme> = {
	backgroundColor: '#1a1a1a',
	gridColor: 'rgba(255, 255, 255, 0.1)',
	showGrid: true,
	gridSpacing: 50,
	noteColor: '#4a9eff',
	activeNoteColor: '#66ff66',
	noteRadius: 4,
	whiteKeyColor: '#ffffff',
	blackKeyColor: '#000000',
	activeWhiteKeyColor: '#66ff66',
	activeBlackKeyColor: '#44dd44',
	keyBorderColor: '#333333',
};

// Default keyboard config
const defaultKeyboardConfig: Required<KeyboardConfig> = {
	keyCount: 88,
	startNote: 21, // A0
	whiteKeyWidth: 24,
	whiteKeyHeight: 120,
	blackKeyWidth: 14,
	blackKeyHeight: 80,
	showLabels: false,
	labelFontSize: 10,
	labelFontFamily: 'Arial, sans-serif',
	whiteLabelColor: '#000000',
	blackLabelColor: '#ffffff',
	keyBorderRadius: 0,
};

// Default animation config
const defaultAnimationConfig: Required<AnimationConfig> = {
	fallSpeed: 200, // pixels per second
	easing: 'linear',
	lookahead: 3, // seconds
};

export interface PianoRollProps {
	/**
	 * Array of notes to display and play
	 */
	notes: Note[];

	/**
	 * Theme customization
	 */
	theme?: Partial<PianoRollTheme>;

	/**
	 * Keyboard configuration
	 */
	keyboardConfig?: Partial<KeyboardConfig>;

	/**
	 * Animation configuration
	 */
	animationConfig?: Partial<AnimationConfig>;

	/**
	 * Custom audio engine (optional)
	 * If not provided, uses default piano engine
	 */
	audioEngine?: AudioEngine;

	/**
	 * Width of the component (auto-calculated if not provided)
	 */
	width?: number;

	/**
	 * Height of the note roll area
	 */
	rollHeight?: number;

	/**
	 * Callback when playback state changes
	 */
	onStateChange?: (state: 'playing' | 'paused' | 'stopped') => void;

	/**
	 * Callback when playback time changes
	 */
	onTimeUpdate?: (time: number) => void;
}

export interface PianoRollHandle extends PlaybackController {
	/**
	 * Get the current playback time
	 */
	currentTime: number;
}

/**
 * Main PianoRoll component
 * Combines keyboard, note visualization, and audio playback
 */
export const PianoRoll = forwardRef<PianoRollHandle, PianoRollProps>(
	(
		{
			notes,
			theme: themeOverride,
			keyboardConfig: keyboardConfigOverride,
			animationConfig: animationConfigOverride,
			audioEngine: customAudioEngine,
			width: customWidth,
			rollHeight = 400,
			onStateChange,
			onTimeUpdate,
		},
		ref
	) => {
		// Merge configs with defaults
		const theme = useMemo(() => ({ ...defaultTheme, ...themeOverride }), [themeOverride]);

		const keyboardConfig = useMemo(
			() => ({ ...defaultKeyboardConfig, ...keyboardConfigOverride }),
			[keyboardConfigOverride]
		);

		const animationConfig = useMemo(
			() => ({ ...defaultAnimationConfig, ...animationConfigOverride }),
			[animationConfigOverride]
		);

		// Audio engine
		const defaultAudioEngineRef = useRef<AudioEngine>(new PianoAudioEngine());
		const audioEngine = customAudioEngine || defaultAudioEngineRef.current;

		// Initialize audio engine
		useEffect(() => {
			audioEngine.init().catch((error) => {
				console.error('Failed to initialize audio engine:', error);
			});

			return () => {
				if (!customAudioEngine) {
					audioEngine.dispose();
				}
			};
		}, [audioEngine, customAudioEngine]);

		// Active notes
		const [activeNotes, setActiveNotes] = useState<Set<MIDINoteNumber>>(new Set());

		// Handle note triggering
		const handleNoteTrigger = useCallback(
			(note: Note) => {
				const velocity = note.velocity ?? 64;
				audioEngine.playNote(note.pitch, velocity, note.duration);

				setActiveNotes((prev) => new Set(prev).add(note.pitch));

				// Remove from active notes after duration
				setTimeout(() => {
					setActiveNotes((prev) => {
						const next = new Set(prev);
						next.delete(note.pitch);
						return next;
					});
				}, note.duration * 1000);
			},
			[audioEngine]
		);

		// Playback controller
		const playback = usePlayback({
			onTick: (time) => {
				onTimeUpdate?.(time);
			},
		});

		// Notify state changes
		useEffect(() => {
			onStateChange?.(playback.state);
		}, [playback.state, onStateChange]);

		// Expose playback API via ref
		useImperativeHandle(
			ref,
			() => ({
				play: playback.play,
				pause: playback.pause,
				stop: playback.stop,
				seek: playback.seek,
				getCurrentTime: playback.getCurrentTime,
				getState: playback.getState,
				currentTime: playback.currentTime,
			}),
			[playback]
		);

		// Calculate width
		const whiteKeyCount = useMemo(() => {
			return countWhiteKeys(
				keyboardConfig.startNote,
				keyboardConfig.startNote + keyboardConfig.keyCount - 1
			);
		}, [keyboardConfig.startNote, keyboardConfig.keyCount]);

		const totalWidth = customWidth || whiteKeyCount * keyboardConfig.whiteKeyWidth;

		return (
			<div
				style={{
					width: totalWidth,
					backgroundColor: theme.backgroundColor,
					display: 'inline-block',
				}}
			>
				{/* Note roll area */}
				<NoteCanvas
					notes={notes}
					currentTime={playback.currentTime}
					keyboardConfig={keyboardConfig}
					theme={theme}
					animationConfig={animationConfig}
					width={totalWidth}
					height={rollHeight}
					onNoteTrigger={handleNoteTrigger}
				/>

				{/* Piano keyboard */}
				<Keyboard
					activeNotes={activeNotes}
					config={keyboardConfig}
					theme={theme}
					width={totalWidth}
				/>
			</div>
		);
	}
);

PianoRoll.displayName = 'PianoRoll';
