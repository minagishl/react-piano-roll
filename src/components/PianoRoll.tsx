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
import { MusyngKiteAudioEngine } from '../audio/MusyngKiteAudioEngine';
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
	activeNoteColorMode: 'theme',
	noteRadius: 4,
	whiteKeyColor: '#ffffff',
	blackKeyColor: '#000000',
	activeWhiteKeyColor: '#66ff66',
	activeBlackKeyColor: '#44dd44',
	activeKeyColorMode: 'theme',
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
	 * If not provided, uses default piano engine or MusyngKite engine if instrument is specified
	 */
	audioEngine?: AudioEngine;

	/**
	 * Instrument selection for MusyngKite SoundFont
	 * Can be a MIDI program number (0-127) or instrument name (e.g., 'acoustic_grand_piano', 'trumpet')
	 * If specified, uses MusyngKiteAudioEngine instead of default PianoAudioEngine
	 */
	instrument?: string | number;

	/**
	 * Custom SoundFont URL (optional)
	 * Only used when instrument is specified
	 * Default: Uses built-in MusyngKite SoundFont
	 */
	soundfontUrl?: string;

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

	/**
	 * Allow playback to continue in background tabs
	 */
	allowBackgroundPlayback?: boolean;

	/**
	 * Loop playback back to the beginning when the sequence ends
	 */
	loop?: boolean;
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
			instrument,
			soundfontUrl,
			width: customWidth,
			rollHeight = 400,
			onStateChange,
			onTimeUpdate,
			allowBackgroundPlayback = true,
			loop = false,
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

		// Audio engine - use lazy initialization to avoid creating if customAudioEngine is provided
		const [audioEngine] = useState<AudioEngine>(() => {
			if (customAudioEngine) {
				return customAudioEngine;
			}
			// Use MusyngKite engine if instrument is specified
			if (instrument !== undefined) {
				return new MusyngKiteAudioEngine(instrument, soundfontUrl);
			}
			return new PianoAudioEngine();
		});
		const defaultAudioEngineRef = useRef<AudioEngine | null>(null);

		// Store reference to default engine for cleanup
		useEffect(() => {
			if (!customAudioEngine && !defaultAudioEngineRef.current) {
				defaultAudioEngineRef.current = audioEngine;
			}
		}, [audioEngine, customAudioEngine]);

		// Update instrument if it changes (for MusyngKite engine)
		useEffect(() => {
			if (
				!customAudioEngine &&
				instrument !== undefined &&
				audioEngine instanceof MusyngKiteAudioEngine
			) {
				audioEngine.setInstrument(instrument).catch((error) => {
					console.error('Failed to change instrument:', error);
				});
			}
		}, [instrument, audioEngine, customAudioEngine]);

		// Initialize audio engine
		useEffect(() => {
			audioEngine.init().catch((error) => {
				console.error('Failed to initialize audio engine:', error);
			});

			return () => {
				if (!customAudioEngine && defaultAudioEngineRef.current) {
					defaultAudioEngineRef.current.dispose();
				}
			};
		}, [audioEngine, customAudioEngine]);

		type ActiveNoteState = { velocity: number; count: number };

		// Active notes with velocity/count tracking for key coloring
		const [activeNoteState, setActiveNoteState] = useState<Map<MIDINoteNumber, ActiveNoteState>>(
			new Map()
		);

		const activeNotes = useMemo(() => new Set(activeNoteState.keys()), [activeNoteState]);
		const activeNoteVelocities = useMemo(() => {
			const velocities = new Map<MIDINoteNumber, number>();
			activeNoteState.forEach((value, key) => {
				velocities.set(key, value.velocity);
			});
			return velocities;
		}, [activeNoteState]);

		const loopDuration = useMemo(() => {
			return notes.reduce((maxEndTime, note) => {
				const endTime = note.startTime + note.duration;
				return endTime > maxEndTime ? endTime : maxEndTime;
			}, 0);
		}, [notes]);

		// Handle note triggering
		const handleNoteTrigger = useCallback(
			(note: Note) => {
				const velocity = note.velocity ?? 64;
				audioEngine.playNote(note.pitch, velocity, note.duration);

				setActiveNoteState((prev) => {
					const next = new Map(prev);
					const existing = next.get(note.pitch);
					if (existing) {
						next.set(note.pitch, { velocity, count: existing.count + 1 });
					} else {
						next.set(note.pitch, { velocity, count: 1 });
					}
					return next;
				});

				// Remove from active notes after duration
				setTimeout(() => {
					setActiveNoteState((prev) => {
						const existing = prev.get(note.pitch);
						if (!existing) return prev;
						const next = new Map(prev);
						if (existing.count <= 1) {
							next.delete(note.pitch);
						} else {
							next.set(note.pitch, { velocity: existing.velocity, count: existing.count - 1 });
						}
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
			allowBackgroundPlayback,
			loop,
			loopDuration,
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
					isPlaying={playback.state === 'playing'}
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
					activeNoteVelocities={activeNoteVelocities}
					config={keyboardConfig}
					theme={theme}
					width={totalWidth}
				/>
			</div>
		);
	}
);

PianoRoll.displayName = 'PianoRoll';
