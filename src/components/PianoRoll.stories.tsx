import type { Meta, StoryObj } from '@storybook/react';
import React, { useRef, useEffect } from 'react';
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

// Helper component with auto-play
const AutoPlayPianoRoll = ({ notes, ...props }: { notes: Note[] } & any) => {
	const pianoRollRef = useRef<PianoRollHandle>(null);

	useEffect(() => {
		// Auto-start playback after a short delay
		const timer = setTimeout(() => {
			pianoRollRef.current?.play();
		}, 500);

		return () => clearTimeout(timer);
	}, []);

	return <PianoRoll ref={pianoRollRef} notes={notes} {...props} />;
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

export const WithExternalControls: Story = {
	args: {
		notes: chordProgression,
	},
	render: (args) => {
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
	},
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
