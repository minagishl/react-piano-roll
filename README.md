# React Piano Roll

A production-ready React component library for creating beautiful piano roll / falling notes visualizations with high-quality audio playback.

## Features

- **Beautiful Piano Roll Visualization** - Smooth falling notes animation
- **High-Quality Audio** - Sample-based piano sound engine using Web Audio API
- **Highly Customizable** - Extensive theming and configuration options
- **External Playback Control** - Programmatic play/pause/seek API
- **Responsive** - Adapts to different keyboard sizes and layouts
- **TypeScript** - Fully typed API for excellent DX
- **Theme Support** - Built-in light/dark themes with easy customization
- **Performance** - Canvas-based rendering for smooth animations
- **Zero Dependencies** - Only peer dependencies on React

## Installation

```bash
# Using pnpm
pnpm add @minagishl/react-piano-roll

# Using npm
npm install @minagishl/react-piano-roll

# Using yarn
yarn add @minagishl/react-piano-roll
```

## Quick Start

```tsx
import { PianoRoll } from '@minagishl/react-piano-roll';
import type { Note } from '@minagishl/react-piano-roll';

const notes: Note[] = [
	{ pitch: 60, startTime: 0, duration: 0.5, velocity: 80 },
	{ pitch: 62, startTime: 0.5, duration: 0.5, velocity: 85 },
	{ pitch: 64, startTime: 1.0, duration: 0.5, velocity: 90 },
];

function App() {
	return <PianoRoll notes={notes} />;
}
```

## Usage

### Basic Example

```tsx
import { useRef } from 'react';
import { PianoRoll, PianoRollHandle } from '@minagishl/react-piano-roll';

function MusicPlayer() {
	const pianoRollRef = useRef<PianoRollHandle>(null);

	const handlePlay = () => {
		pianoRollRef.current?.play();
	};

	const handlePause = () => {
		pianoRollRef.current?.pause();
	};

	const handleStop = () => {
		pianoRollRef.current?.stop();
	};

	return (
		<div>
			<div>
				<button onClick={handlePlay}>Play</button>
				<button onClick={handlePause}>Pause</button>
				<button onClick={handleStop}>Stop</button>
			</div>
			<PianoRoll
				ref={pianoRollRef}
				notes={notes}
				onTimeUpdate={(time) => console.log('Current time:', time)}
			/>
		</div>
	);
}
```

### Custom Theme

```tsx
<PianoRoll
	notes={notes}
	theme={{
		backgroundColor: '#1a1a1a',
		gridColor: 'rgba(255, 255, 255, 0.1)',
		noteColor: '#4a9eff',
		activeNoteColor: '#66ff66',
		whiteKeyColor: '#ffffff',
		blackKeyColor: '#000000',
	}}
/>
```

### Velocity-Based Coloring

```tsx
<PianoRoll
	notes={notes}
	theme={{
		noteColor: (velocity) => {
			const hue = (velocity / 127) * 120;
			return `hsl(${hue}, 70%, 50%)`;
		},
	}}
/>
```

### Custom Keyboard Size

```tsx
<PianoRoll
	notes={notes}
	keyboardConfig={{
		keyCount: 24,
		startNote: 48, // C3
		whiteKeyWidth: 30,
		whiteKeyHeight: 150,
	}}
/>
```

### Custom Animation Speed

```tsx
<PianoRoll
	notes={notes}
	animationConfig={{
		fallSpeed: 300, // pixels per second
		lookahead: 3, // seconds to show ahead
	}}
/>
```

## API Reference

### PianoRoll Component

#### Props

| Prop              | Type                       | Default  | Description                          |
| ----------------- | -------------------------- | -------- | ------------------------------------ |
| `notes`           | `Note[]`                   | required | Array of notes to display and play   |
| `theme`           | `Partial<PianoRollTheme>`  | -        | Theme customization options          |
| `keyboardConfig`  | `Partial<KeyboardConfig>`  | -        | Keyboard configuration               |
| `animationConfig` | `Partial<AnimationConfig>` | -        | Animation configuration              |
| `audioEngine`     | `AudioEngine`              | -        | Custom audio engine implementation   |
| `width`           | `number`                   | auto     | Width of the component               |
| `rollHeight`      | `number`                   | `400`    | Height of the note roll area         |
| `onStateChange`   | `(state) => void`          | -        | Callback when playback state changes |
| `onTimeUpdate`    | `(time) => void`           | -        | Callback when playback time updates  |
| `loop`            | `boolean`                  | `false`  | Loop playback back to the beginning  |

#### Ref Methods (PianoRollHandle)

```tsx
interface PianoRollHandle {
	play: () => void;
	pause: () => void;
	stop: () => void;
	seek: (time: number) => void;
	getCurrentTime: () => number;
	getState: () => PlaybackState;
	currentTime: number;
}
```

### Note Data Model

```tsx
interface Note {
	pitch: number; // MIDI note number (0-127)
	startTime: number; // Start time in seconds
	duration: number; // Duration in seconds
	velocity?: number; // Note velocity (0-127), defaults to 64
}
```

**MIDI Note Reference:**

- Middle C (C4) = 60
- A0 (lowest piano key) = 21
- C8 (highest piano key) = 108

### Theme Configuration

```tsx
interface PianoRollTheme {
	backgroundColor?: string;
	gridColor?: string;
	showGrid?: boolean;
	gridSpacing?: number;
	noteColor?: string | ((velocity: number) => string);
	activeNoteColor?: string;
	activeNoteColorMode?: 'theme' | 'note';
	noteRadius?: number;
	whiteKeyColor?: string;
	blackKeyColor?: string;
	activeWhiteKeyColor?: string;
	activeBlackKeyColor?: string;
	activeKeyColorMode?: 'theme' | 'note';
	keyBorderColor?: string;
}
```

### Keyboard Configuration

```tsx
interface KeyboardConfig {
	keyCount?: number; // Number of keys (default: 88)
	startNote?: number; // Starting MIDI note (default: 21 - A0)
	whiteKeyWidth?: number; // Width in pixels (default: 24)
	whiteKeyHeight?: number; // Height in pixels (default: 120)
	blackKeyWidth?: number; // Width in pixels (default: 14)
	blackKeyHeight?: number; // Height in pixels (default: 80)
}
```

### Animation Configuration

```tsx
interface AnimationConfig {
	fallSpeed?: number; // Pixels per second (default: 200)
	easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
	lookahead?: number; // Seconds to show ahead (default: 3)
}
```

## Utilities

### Piano Helper Functions

```tsx
import {
	isBlackKey,
	getNoteNameFromMIDI,
	getMIDIFromNoteName,
	midiToFrequency,
} from '@minagishl/react-piano-roll';

isBlackKey(61); // true (C#)
getNoteNameFromMIDI(60); // "C4"
getMIDIFromNoteName('A4'); // 69
midiToFrequency(69); // 440 (Hz)
```

## Custom Audio Engine

You can provide your own audio engine implementation:

```tsx
import { AudioEngine } from '@minagishl/react-piano-roll';

class CustomAudioEngine implements AudioEngine {
	async init() {
		/* ... */
	}
	playNote(pitch, velocity, duration) {
		/* ... */
	}
	stopNote(pitch) {
		/* ... */
	}
	stopAll() {
		/* ... */
	}
	setVolume(volume) {
		/* ... */
	}
	dispose() {
		/* ... */
	}
}

const myAudioEngine = new CustomAudioEngine();

<PianoRoll notes={notes} audioEngine={myAudioEngine} />;
```

## Advanced Usage

### Loading Custom Piano Samples

The default audio engine supports loading custom piano samples:

```tsx
import { PianoAudioEngine } from '@minagishl/react-piano-roll';

const audioEngine = new PianoAudioEngine();
await audioEngine.init();

// Load samples
const sampleMap = new Map([
	[60, '/samples/C4.mp3'],
	[61, '/samples/C#4.mp3'],
	// ... more samples
]);

await audioEngine.loadSamples(sampleMap);

<PianoRoll notes={notes} audioEngine={audioEngine} />;
```

**Note:** The engine will automatically pitch-shift samples to cover missing notes.

## Development

```bash
# Install dependencies
pnpm install

# Start Storybook
pnpm storybook

# Build the library
pnpm build

# Type check
pnpm typecheck
```

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions

Requires Web Audio API support.

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
