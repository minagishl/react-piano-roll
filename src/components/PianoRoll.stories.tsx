import type { Meta, StoryObj } from '@storybook/react';
import React, { useRef, useEffect, useState } from 'react';
import { Midi } from '@tonejs/midi';
import { PianoRoll, PianoRollHandle } from './PianoRoll';
import type { Note } from '../types';

const meta = {
	title: 'Components/PianoRoll',
	component: PianoRoll,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
} satisfies Meta<typeof PianoRoll>;

export default meta;
type Story = StoryObj<typeof meta>;

const revolutionaryUrl = new URL('../assets/Revolutionary.mid', import.meta.url).toString();
const laCampanellaUrl = new URL('../assets/LaCampanella.mid', import.meta.url).toString();
const quatreMainsUrl = new URL('../assets/QuatreMains.mid', import.meta.url).toString();

const loadMidiNotes = async (url: string): Promise<Note[]> => {
	const response = await fetch(url);
	const arrayBuffer = await response.arrayBuffer();
	const midi = new Midi(arrayBuffer);
	const notes: Note[] = [];

	midi.tracks.forEach((track) => {
		track.notes.forEach((note) => {
			notes.push({
				pitch: note.midi,
				startTime: note.time,
				duration: note.duration,
				velocity: Math.round(note.velocity * 127),
			});
		});
	});

	return notes.sort((a, b) => a.startTime - b.startTime);
};

// Sample notes for demonstration
const sampleNotes: Note[] = [
	// C major scale
	{ pitch: 60, startTime: 0, duration: 0.5, velocity: 80 },
	{ pitch: 62, startTime: 0.5, duration: 0.5, velocity: 85 },
	{ pitch: 64, startTime: 1.0, duration: 0.5, velocity: 90 },
	{ pitch: 65, startTime: 1.5, duration: 0.5, velocity: 95 },
	{ pitch: 67, startTime: 2.0, duration: 0.5, velocity: 100 },
	{ pitch: 69, startTime: 2.5, duration: 0.5, velocity: 105 },
	{ pitch: 71, startTime: 3.0, duration: 0.5, velocity: 110 },
	{ pitch: 72, startTime: 3.5, duration: 1.0, velocity: 115 },
];

const coloredNotes: Note[] = [
	{ pitch: 60, startTime: 0, duration: 0.5, velocity: 80, color: '#ff6b6b' },
	{ pitch: 62, startTime: 0.5, duration: 0.5, velocity: 85, color: '#feca57' },
	{ pitch: 64, startTime: 1.0, duration: 0.5, velocity: 90, color: '#1dd1a1' },
	{ pitch: 65, startTime: 1.5, duration: 0.5, velocity: 95, color: '#54a0ff' },
	{ pitch: 67, startTime: 2.0, duration: 0.5, velocity: 100, color: '#5f27cd' },
	{ pitch: 69, startTime: 2.5, duration: 0.5, velocity: 105, color: '#ff9ff3' },
	{ pitch: 71, startTime: 3.0, duration: 0.5, velocity: 110, color: '#48dbfb' },
	{ pitch: 72, startTime: 3.5, duration: 1.0, velocity: 115, color: '#ff9f43' },
];

const chordProgression: Note[] = [
	// C major chord
	{ pitch: 60, startTime: 0, duration: 1.5, velocity: 80 },
	{ pitch: 64, startTime: 0, duration: 1.5, velocity: 80 },
	{ pitch: 67, startTime: 0, duration: 1.5, velocity: 80 },

	// A minor chord
	{ pitch: 57, startTime: 2, duration: 1.5, velocity: 85 },
	{ pitch: 60, startTime: 2, duration: 1.5, velocity: 85 },
	{ pitch: 64, startTime: 2, duration: 1.5, velocity: 85 },

	// F major chord
	{ pitch: 53, startTime: 4, duration: 1.5, velocity: 90 },
	{ pitch: 57, startTime: 4, duration: 1.5, velocity: 90 },
	{ pitch: 60, startTime: 4, duration: 1.5, velocity: 90 },

	// G major chord
	{ pitch: 55, startTime: 6, duration: 2, velocity: 95 },
	{ pitch: 59, startTime: 6, duration: 2, velocity: 95 },
	{ pitch: 62, startTime: 6, duration: 2, velocity: 95 },
];

const complexMelody: Note[] = [
	{ pitch: 72, startTime: 0, duration: 0.25, velocity: 100 },
	{ pitch: 71, startTime: 0.25, duration: 0.25, velocity: 95 },
	{ pitch: 69, startTime: 0.5, duration: 0.5, velocity: 90 },
	{ pitch: 67, startTime: 1, duration: 0.5, velocity: 85 },
	{ pitch: 65, startTime: 1.5, duration: 0.25, velocity: 90 },
	{ pitch: 67, startTime: 1.75, duration: 0.25, velocity: 95 },
	{ pitch: 69, startTime: 2, duration: 1, velocity: 100 },
	{ pitch: 60, startTime: 3, duration: 0.5, velocity: 80 },
	{ pitch: 64, startTime: 3.5, duration: 0.5, velocity: 85 },
	{ pitch: 67, startTime: 4, duration: 1, velocity: 90 },
];

const isDocsView = () => {
	if (typeof window === 'undefined') return false;

	const params = new URLSearchParams(window.location.search);
	const viewMode = params.get('viewMode');
	const path = params.get('path');

	return viewMode === 'docs' || (path?.startsWith('/docs') ?? false);
};

// Helper component with auto-play
const AutoPlayPianoRoll = ({
	notes,
	autoPlay = true,
	...props
}: { notes: Note[]; autoPlay?: boolean } & React.ComponentPropsWithoutRef<typeof PianoRoll>) => {
	const pianoRollRef = useRef<PianoRollHandle>(null);
	const shouldPlay = autoPlay && !isDocsView();

	useEffect(() => {
		if (!shouldPlay) return;

		// Auto-start playback after a short delay
		const timer = setTimeout(() => {
			pianoRollRef.current?.play();
		}, 500);

		return () => clearTimeout(timer);
	}, [shouldPlay]);

	return <PianoRoll ref={pianoRollRef} notes={notes} {...props} />;
};

const MidiAutoPlayPianoRoll = ({
	midiUrl,
	autoPlay = true,
	...props
}: { midiUrl: string; autoPlay?: boolean } & React.ComponentPropsWithoutRef<typeof PianoRoll>) => {
	const pianoRollRef = useRef<PianoRollHandle>(null);
	const [notes, setNotes] = useState<Note[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const shouldPlay = autoPlay && !isDocsView();

	useEffect(() => {
		let isMounted = true;

		loadMidiNotes(midiUrl)
			.then((loadedNotes) => {
				if (!isMounted) return;
				setNotes(loadedNotes);
				setError(null);
				setIsLoading(false);
			})
			.catch((err: Error) => {
				if (!isMounted) return;
				setError(err.message || 'Failed to load MIDI file.');
				setIsLoading(false);
			});

		return () => {
			isMounted = false;
		};
	}, [midiUrl]);

	useEffect(() => {
		if (notes.length === 0 || !shouldPlay) return;

		const timer = setTimeout(() => {
			pianoRollRef.current?.play();
		}, 500);

		return () => clearTimeout(timer);
	}, [notes, shouldPlay]);

	if (error) {
		return <div style={{ color: '#c00' }}>{error}</div>;
	}

	if (isLoading || notes.length === 0) {
		return <div>Loading MIDI...</div>;
	}

	return <PianoRoll ref={pianoRollRef} {...props} notes={notes} />;
};

export const Default: Story = {
	args: {
		notes: sampleNotes,
	},
	render: (args) => <AutoPlayPianoRoll {...args} />,
};

export const ChordProgression: Story = {
	args: {
		notes: chordProgression,
	},
	render: (args) => <AutoPlayPianoRoll {...args} />,
};

export const ComplexMelody: Story = {
	args: {
		notes: complexMelody,
	},
	render: (args) => <AutoPlayPianoRoll {...args} />,
};

export const PerNoteColors: Story = {
	args: {
		notes: coloredNotes,
		theme: {
			activeNoteColorMode: 'note',
		},
	},
	render: (args) => <AutoPlayPianoRoll {...args} />,
};

export const MidiExampleRevolutionary: Story = {
	args: {
		notes: [],
		rollHeight: 500,
	},
	render: (args) => (
		<MidiAutoPlayPianoRoll {...args} midiUrl={revolutionaryUrl} instrument='acoustic_grand_piano' />
	),
};

export const MidiExampleLaCampanella: Story = {
	args: {
		notes: [],
		rollHeight: 500,
	},
	render: (args) => (
		<MidiAutoPlayPianoRoll {...args} midiUrl={laCampanellaUrl} instrument='acoustic_grand_piano' />
	),
};

export const MidiExampleQuatreMains: Story = {
	args: {
		notes: [],
		rollHeight: 500,
	},
	render: (args) => (
		<MidiAutoPlayPianoRoll {...args} midiUrl={quatreMainsUrl} instrument='acoustic_grand_piano' />
	),
};

export const SmallKeyboard: Story = {
	args: {
		notes: sampleNotes,
		keyboardConfig: {
			keyCount: 24,
			startNote: 48, // C3
		},
	},
	render: (args) => <AutoPlayPianoRoll {...args} />,
};

export const LargeKeyboard: Story = {
	args: {
		notes: complexMelody,
		keyboardConfig: {
			keyCount: 88,
			startNote: 21, // A0
		},
	},
	render: (args) => <AutoPlayPianoRoll {...args} />,
};

export const DarkTheme: Story = {
	args: {
		notes: chordProgression,
		theme: {
			backgroundColor: '#0a0a0a',
			gridColor: 'rgba(100, 100, 255, 0.2)',
			noteColor: '#3366ff',
			activeNoteColor: '#66ff66',
			whiteKeyColor: '#e0e0e0',
			blackKeyColor: '#1a1a1a',
			keyBorderColor: '#444444',
		},
	},
	render: (args) => <AutoPlayPianoRoll {...args} />,
};

export const LightTheme: Story = {
	args: {
		notes: sampleNotes,
		theme: {
			backgroundColor: '#ffffff',
			gridColor: 'rgba(0, 0, 0, 0.1)',
			noteColor: '#0066cc',
			activeNoteColor: '#00cc00',
			whiteKeyColor: '#ffffff',
			blackKeyColor: '#000000',
			activeWhiteKeyColor: '#ccffcc',
			activeBlackKeyColor: '#00aa00',
			keyBorderColor: '#cccccc',
		},
	},
	render: (args) => <AutoPlayPianoRoll {...args} />,
};

export const VelocityColored: Story = {
	args: {
		notes: complexMelody,
		theme: {
			noteColor: (velocity: number) => {
				// Map velocity (0-127) to a color gradient
				const hue = (velocity / 127) * 120; // 0 (red) to 120 (green)
				return `hsl(${hue}, 70%, 50%)`;
			},
			activeNoteColor: '#ffff00',
		},
	},
	render: (args) => <AutoPlayPianoRoll {...args} />,
};

export const KeysMatchNoteColor: Story = {
	args: {
		notes: complexMelody,
		theme: {
			noteColor: (velocity: number) => {
				const hue = (velocity / 127) * 120;
				return `hsl(${hue}, 70%, 50%)`;
			},
			activeNoteColor: '#ffff00',
			activeKeyColorMode: 'note',
			activeNoteColorMode: 'note',
		},
	},
	render: (args) => <AutoPlayPianoRoll {...args} />,
};

export const FastAnimation: Story = {
	args: {
		notes: complexMelody,
		animationConfig: {
			fallSpeed: 400,
			lookahead: 2,
		},
	},
	render: (args) => <AutoPlayPianoRoll {...args} />,
};

export const SlowAnimation: Story = {
	args: {
		notes: sampleNotes,
		animationConfig: {
			fallSpeed: 100,
			lookahead: 5,
		},
	},
	render: (args) => <AutoPlayPianoRoll {...args} />,
};

export const NoGrid: Story = {
	args: {
		notes: chordProgression,
		theme: {
			showGrid: false,
		},
	},
	render: (args) => <AutoPlayPianoRoll {...args} />,
};

export const CustomDimensions: Story = {
	args: {
		notes: sampleNotes,
		keyboardConfig: {
			keyCount: 36,
			startNote: 48,
			whiteKeyWidth: 30,
			whiteKeyHeight: 150,
		},
		rollHeight: 600,
	},
	render: (args) => <AutoPlayPianoRoll {...args} />,
};

const ExternalControlsDemo = (args: React.ComponentPropsWithoutRef<typeof PianoRoll>) => {
	const pianoRollRef = useRef<PianoRollHandle>(null);

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
			<div style={{ display: 'flex', gap: '10px' }}>
				<button
					onClick={() => pianoRollRef.current?.play()}
					style={{
						padding: '10px 20px',
						fontSize: '16px',
						cursor: 'pointer',
					}}
				>
					Play
				</button>
				<button
					onClick={() => pianoRollRef.current?.pause()}
					style={{
						padding: '10px 20px',
						fontSize: '16px',
						cursor: 'pointer',
					}}
				>
					Pause
				</button>
				<button
					onClick={() => pianoRollRef.current?.stop()}
					style={{
						padding: '10px 20px',
						fontSize: '16px',
						cursor: 'pointer',
					}}
				>
					Stop
				</button>
				<button
					onClick={() => pianoRollRef.current?.seek(2)}
					style={{
						padding: '10px 20px',
						fontSize: '16px',
						cursor: 'pointer',
					}}
				>
					Seek to 2s
				</button>
			</div>
			<PianoRoll ref={pianoRollRef} {...args} />
		</div>
	);
};

export const WithExternalControls: Story = {
	args: {
		notes: chordProgression,
	},
	render: (args) => <ExternalControlsDemo {...args} />,
};

export const WithKeyboardLabels: Story = {
	args: {
		notes: sampleNotes,
		keyboardConfig: {
			keyCount: 24,
			startNote: 48,
			showLabels: true,
		},
	},
	render: (args) => <AutoPlayPianoRoll {...args} />,
};

export const WithKeyboardLabelsLargeFont: Story = {
	args: {
		notes: chordProgression,
		keyboardConfig: {
			keyCount: 36,
			startNote: 48,
			showLabels: true,
			labelFontSize: 12,
			whiteKeyWidth: 32,
			whiteKeyHeight: 150,
		},
	},
	render: (args) => <AutoPlayPianoRoll {...args} />,
};

export const WithKeyboardLabelsCustomColors: Story = {
	args: {
		notes: complexMelody,
		keyboardConfig: {
			keyCount: 24,
			startNote: 60,
			showLabels: true,
			labelFontSize: 11,
			whiteLabelColor: '#0066cc',
			blackLabelColor: '#ffcc00',
		},
		theme: {
			backgroundColor: '#f5f5f5',
			gridColor: 'rgba(0, 0, 0, 0.1)',
			noteColor: '#0066cc',
			activeNoteColor: '#00cc00',
			whiteKeyColor: '#ffffff',
			blackKeyColor: '#1a1a1a',
		},
	},
	render: (args) => <AutoPlayPianoRoll {...args} />,
};

export const FullPianoWithLabels: Story = {
	args: {
		notes: complexMelody,
		keyboardConfig: {
			keyCount: 88,
			startNote: 21,
			showLabels: true,
			labelFontSize: 8,
		},
	},
	render: (args) => <AutoPlayPianoRoll {...args} />,
};

export const WithRoundedBottomCorners: Story = {
	args: {
		notes: sampleNotes,
		keyboardConfig: {
			keyCount: 24,
			startNote: 48,
			showLabels: true,
			keyBorderRadius: 4,
			whiteKeyWidth: 32,
			whiteKeyHeight: 150,
		},
	},
	render: (args) => <AutoPlayPianoRoll {...args} />,
};

export const WithLargeRoundedCorners: Story = {
	args: {
		notes: chordProgression,
		keyboardConfig: {
			keyCount: 36,
			startNote: 48,
			showLabels: true,
			keyBorderRadius: 4,
			whiteKeyWidth: 32,
			whiteKeyHeight: 150,
		},
	},
	render: (args) => <AutoPlayPianoRoll {...args} />,
};

export const SharpNoteBlocks: Story = {
	args: {
		notes: chordProgression,
		keyboardConfig: {
			keyCount: 24,
			startNote: 48,
		},
		theme: {
			noteRadius: 0,
		},
	},
	render: (args) => <AutoPlayPianoRoll {...args} />,
};

export const LargeRoundedNoteBlocks: Story = {
	args: {
		notes: complexMelody,
		keyboardConfig: {
			keyCount: 24,
			startNote: 60,
		},
		theme: {
			noteRadius: 12,
			noteColor: '#ff6b6b',
			activeNoteColor: '#ffd93d',
		},
	},
	render: (args) => <AutoPlayPianoRoll {...args} />,
};

export const RoundedEverything: Story = {
	args: {
		notes: chordProgression,
		keyboardConfig: {
			keyCount: 24,
			startNote: 48,
			showLabels: true,
			keyBorderRadius: 6,
			whiteKeyWidth: 32,
			whiteKeyHeight: 150,
		},
		theme: {
			noteRadius: 8,
			backgroundColor: '#f5f5f5',
			gridColor: 'rgba(0, 0, 0, 0.1)',
			noteColor: '#6c5ce7',
			activeNoteColor: '#00b894',
			whiteKeyColor: '#ffffff',
			blackKeyColor: '#2d3436',
		},
		rollHeight: 500,
	},
	render: (args) => <AutoPlayPianoRoll {...args} />,
};

// MusyngKite SoundFont stories
export const MusyngKitePiano: Story = {
	args: {
		notes: sampleNotes,
		instrument: 'acoustic_grand_piano',
	},
	render: (args) => <AutoPlayPianoRoll {...args} />,
};

export const MusyngKiteTrumpet: Story = {
	args: {
		notes: sampleNotes,
		instrument: 'trumpet',
	},
	render: (args) => <AutoPlayPianoRoll {...args} />,
};

export const MusyngKiteViolin: Story = {
	args: {
		notes: complexMelody,
		instrument: 'violin',
	},
	render: (args) => <AutoPlayPianoRoll {...args} />,
};

export const MusyngKiteGuitar: Story = {
	args: {
		notes: chordProgression,
		instrument: 'acoustic_guitar_nylon',
	},
	render: (args) => <AutoPlayPianoRoll {...args} />,
};

export const MusyngKiteSaxophone: Story = {
	args: {
		notes: complexMelody,
		instrument: 'alto_sax',
	},
	render: (args) => <AutoPlayPianoRoll {...args} />,
};

export const MusyngKiteFlute: Story = {
	args: {
		notes: sampleNotes,
		instrument: 'flute',
	},
	render: (args) => <AutoPlayPianoRoll {...args} />,
};

export const MusyngKiteOrgan: Story = {
	args: {
		notes: chordProgression,
		instrument: 'church_organ',
	},
	render: (args) => <AutoPlayPianoRoll {...args} />,
};

export const MusyngKiteByProgramNumber: Story = {
	args: {
		notes: sampleNotes,
		instrument: 56, // Trumpet (MIDI program 56)
	},
	render: (args) => <AutoPlayPianoRoll {...args} />,
};

const InstrumentSelectorDemo = (args: React.ComponentPropsWithoutRef<typeof PianoRoll>) => {
	const pianoRollRef = useRef<PianoRollHandle>(null);
	const [selectedInstrument, setSelectedInstrument] = React.useState<string | number>(
		'acoustic_grand_piano'
	);

	const instruments = [
		{ name: 'Acoustic Grand Piano', value: 'acoustic_grand_piano' },
		{ name: 'Trumpet', value: 'trumpet' },
		{ name: 'Violin', value: 'violin' },
		{ name: 'Acoustic Guitar (Nylon)', value: 'acoustic_guitar_nylon' },
		{ name: 'Alto Sax', value: 'alto_sax' },
		{ name: 'Flute', value: 'flute' },
		{ name: 'Church Organ', value: 'church_organ' },
		{ name: 'Electric Piano 1', value: 'electric_piano_1' },
		{ name: 'Cello', value: 'cello' },
		{ name: 'French Horn', value: 'french_horn' },
	];

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
			<div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
				<label htmlFor='instrument-select' style={{ fontSize: '14px', fontWeight: 'bold' }}>
					Instrument:
				</label>
				<select
					id='instrument-select'
					value={typeof selectedInstrument === 'string' ? selectedInstrument : ''}
					onChange={(e) => setSelectedInstrument(e.target.value)}
					style={{
						padding: '8px 12px',
						fontSize: '14px',
						borderRadius: '4px',
						border: '1px solid #ccc',
						cursor: 'pointer',
					}}
				>
					{instruments.map((inst) => (
						<option key={inst.value} value={inst.value}>
							{inst.name}
						</option>
					))}
				</select>
				<button
					onClick={() => pianoRollRef.current?.play()}
					style={{
						padding: '8px 16px',
						fontSize: '14px',
						cursor: 'pointer',
						borderRadius: '4px',
						border: '1px solid #ccc',
						backgroundColor: '#f0f0f0',
					}}
				>
					Play
				</button>
				<button
					onClick={() => pianoRollRef.current?.stop()}
					style={{
						padding: '8px 16px',
						fontSize: '14px',
						cursor: 'pointer',
						borderRadius: '4px',
						border: '1px solid #ccc',
						backgroundColor: '#f0f0f0',
					}}
				>
					Stop
				</button>
			</div>
			<PianoRoll ref={pianoRollRef} {...args} instrument={selectedInstrument} />
		</div>
	);
};

export const MusyngKiteWithInstrumentSelector: Story = {
	args: {
		notes: sampleNotes,
	},
	render: (args) => <InstrumentSelectorDemo {...args} />,
};

const ProgramNumberDemo = (args: React.ComponentPropsWithoutRef<typeof PianoRoll>) => {
	const pianoRollRef = useRef<PianoRollHandle>(null);
	const [programNumber, setProgramNumber] = React.useState<number>(0);

	const instrumentCategories = [
		{ category: 'Piano', programs: [0, 1, 2, 3, 4, 5, 6, 7] },
		{ category: 'Organ', programs: [16, 17, 18, 19, 20, 21] },
		{ category: 'Guitar', programs: [24, 25, 26, 27, 28, 29, 30, 31] },
		{ category: 'Bass', programs: [32, 33, 34, 35, 36, 37, 38, 39] },
		{ category: 'Strings', programs: [40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51] },
		{ category: 'Brass', programs: [56, 57, 58, 59, 60, 61, 62, 63] },
		{ category: 'Saxophone', programs: [64, 65, 66, 67] },
		{ category: 'Woodwind', programs: [68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79] },
	];

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
			<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
				<label style={{ fontSize: '14px', fontWeight: 'bold' }}>
					MIDI Program Number: {programNumber}
				</label>
				<input
					type='range'
					min='0'
					max='127'
					value={programNumber}
					onChange={(e) => setProgramNumber(Number(e.target.value))}
					style={{ width: '300px' }}
				/>
				<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
					{instrumentCategories.map((category) => (
						<div key={category.category} style={{ marginRight: '20px' }}>
							<div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
								{category.category}:
							</div>
							<div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
								{category.programs.map((prog) => (
									<button
										key={prog}
										onClick={() => setProgramNumber(prog)}
										style={{
											padding: '4px 8px',
											fontSize: '11px',
											cursor: 'pointer',
											borderRadius: '3px',
											border: '1px solid #ccc',
											backgroundColor: programNumber === prog ? '#4a9eff' : '#f0f0f0',
											color: programNumber === prog ? '#fff' : '#000',
										}}
									>
										{prog}
									</button>
								))}
							</div>
						</div>
					))}
				</div>
				<div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
					<button
						onClick={() => pianoRollRef.current?.play()}
						style={{
							padding: '8px 16px',
							fontSize: '14px',
							cursor: 'pointer',
							borderRadius: '4px',
							border: '1px solid #ccc',
							backgroundColor: '#f0f0f0',
						}}
					>
						Play
					</button>
					<button
						onClick={() => pianoRollRef.current?.stop()}
						style={{
							padding: '8px 16px',
							fontSize: '14px',
							cursor: 'pointer',
							borderRadius: '4px',
							border: '1px solid #ccc',
							backgroundColor: '#f0f0f0',
						}}
					>
						Stop
					</button>
				</div>
			</div>
			<PianoRoll ref={pianoRollRef} {...args} instrument={programNumber} />
		</div>
	);
};

export const MusyngKiteWithProgramNumberSelector: Story = {
	args: {
		notes: sampleNotes,
	},
	render: (args) => <ProgramNumberDemo {...args} />,
};

export const SilentPlayback: Story = {
	args: {
		notes: sampleNotes,
	},
	render: (args) => <AutoPlayPianoRoll {...args} allowBackgroundPlayback={false} />,
};

export const LoopingPlayback: Story = {
	args: {
		notes: sampleNotes,
		loop: true,
	},
	render: (args) => <AutoPlayPianoRoll {...args} />,
};
