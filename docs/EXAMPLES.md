# Usage Examples

This document provides comprehensive examples for using react-piano-roll.

## Table of Contents

- [Basic Usage](#basic-usage)
- [Playback Control](#playback-control)
- [Theming](#theming)
- [Custom Keyboard Sizes](#custom-keyboard-sizes)
- [Animation Configuration](#animation-configuration)
- [Custom Audio Engine](#custom-audio-engine)
- [Loading MIDI Files](#loading-midi-files)
- [Real-time Note Input](#real-time-note-input)

---

## Basic Usage

### Simple Note Display

```tsx
import { PianoRoll } from 'react-piano-roll';
import type { Note } from 'react-piano-roll';

const notes: Note[] = [
	{ pitch: 60, startTime: 0, duration: 1, velocity: 80 },
	{ pitch: 64, startTime: 1, duration: 1, velocity: 85 },
	{ pitch: 67, startTime: 2, duration: 1, velocity: 90 },
];

export function SimpleExample() {
	return <PianoRoll notes={notes} />;
}
```

### Auto-Playing on Mount

```tsx
import { useRef, useEffect } from 'react';
import { PianoRoll, PianoRollHandle } from 'react-piano-roll';

export function AutoPlayExample() {
	const pianoRollRef = useRef<PianoRollHandle>(null);

	useEffect(() => {
		// Start playing after component mounts
		const timer = setTimeout(() => {
			pianoRollRef.current?.play();
		}, 500);

		return () => clearTimeout(timer);
	}, []);

	return <PianoRoll ref={pianoRollRef} notes={notes} />;
}
```

---

## Playback Control

### Full Playback Controls

```tsx
import { useState, useRef } from 'react';
import { PianoRoll, PianoRollHandle } from 'react-piano-roll';

export function PlaybackControls() {
	const pianoRollRef = useRef<PianoRollHandle>(null);
	const [currentTime, setCurrentTime] = useState(0);
	const [state, setState] = useState<'playing' | 'paused' | 'stopped'>('stopped');

	return (
		<div>
			<div className='controls'>
				<button onClick={() => pianoRollRef.current?.play()}>▶ Play</button>
				<button onClick={() => pianoRollRef.current?.pause()}>⏸ Pause</button>
				<button onClick={() => pianoRollRef.current?.stop()}>⏹ Stop</button>
				<button onClick={() => pianoRollRef.current?.seek(0)}>⏮ Reset</button>
			</div>

			<div className='info'>
				<p>State: {state}</p>
				<p>Time: {currentTime.toFixed(2)}s</p>
			</div>

			<PianoRoll
				ref={pianoRollRef}
				notes={notes}
				onStateChange={setState}
				onTimeUpdate={setCurrentTime}
			/>
		</div>
	);
}
```

### Seeking to Specific Times

```tsx
export function SeekExample() {
	const pianoRollRef = useRef<PianoRollHandle>(null);

	const seekTo = (time: number) => {
		pianoRollRef.current?.seek(time);
		pianoRollRef.current?.play();
	};

	return (
		<div>
			<div>
				<button onClick={() => seekTo(0)}>Start</button>
				<button onClick={() => seekTo(5)}>5s</button>
				<button onClick={() => seekTo(10)}>10s</button>
				<button onClick={() => seekTo(15)}>15s</button>
			</div>
			<PianoRoll ref={pianoRollRef} notes={notes} />
		</div>
	);
}
```

---

## Theming

### Dark Theme

```tsx
export function DarkTheme() {
	return (
		<PianoRoll
			notes={notes}
			theme={{
				backgroundColor: '#0a0a0a',
				gridColor: 'rgba(100, 100, 255, 0.2)',
				noteColor: '#3366ff',
				activeNoteColor: '#66ff66',
				whiteKeyColor: '#e0e0e0',
				blackKeyColor: '#1a1a1a',
				activeWhiteKeyColor: '#aaffaa',
				activeBlackKeyColor: '#66dd66',
				keyBorderColor: '#444444',
				noteRadius: 6,
			}}
		/>
	);
}
```

### Light Theme

```tsx
export function LightTheme() {
	return (
		<PianoRoll
			notes={notes}
			theme={{
				backgroundColor: '#ffffff',
				gridColor: 'rgba(0, 0, 0, 0.08)',
				noteColor: '#0066cc',
				activeNoteColor: '#00aa00',
				whiteKeyColor: '#ffffff',
				blackKeyColor: '#000000',
				activeWhiteKeyColor: '#ccffcc',
				activeBlackKeyColor: '#00aa00',
				keyBorderColor: '#cccccc',
				showGrid: true,
				gridSpacing: 50,
			}}
		/>
	);
}
```

### Velocity-Based Colors

```tsx
export function VelocityTheme() {
	return (
		<PianoRoll
			notes={notes}
			theme={{
				// Map velocity to color intensity
				noteColor: (velocity) => {
					const intensity = Math.floor((velocity / 127) * 255);
					return `rgb(${intensity}, 100, ${255 - intensity})`;
				},
				activeNoteColor: '#ffff00',
			}}
		/>
	);
}
```

### Rainbow Theme

```tsx
export function RainbowTheme() {
	return (
		<PianoRoll
			notes={notes}
			theme={{
				backgroundColor: '#000000',
				noteColor: (velocity) => {
					const hue = (velocity / 127) * 360;
					return `hsl(${hue}, 80%, 60%)`;
				},
				activeNoteColor: '#ffffff',
				showGrid: false,
			}}
		/>
	);
}
```

---

## Custom Keyboard Sizes

### Small (2 Octaves)

```tsx
export function SmallKeyboard() {
	return (
		<PianoRoll
			notes={notes}
			keyboardConfig={{
				keyCount: 24,
				startNote: 48, // C3
			}}
		/>
	);
}
```

### Medium (4 Octaves)

```tsx
export function MediumKeyboard() {
	return (
		<PianoRoll
			notes={notes}
			keyboardConfig={{
				keyCount: 49,
				startNote: 36, // C2
			}}
		/>
	);
}
```

### Full Piano (88 Keys)

```tsx
export function FullPiano() {
	return (
		<PianoRoll
			notes={notes}
			keyboardConfig={{
				keyCount: 88,
				startNote: 21, // A0
			}}
		/>
	);
}
```

### Custom Key Dimensions

```tsx
export function LargeKeys() {
	return (
		<PianoRoll
			notes={notes}
			keyboardConfig={{
				keyCount: 24,
				startNote: 60,
				whiteKeyWidth: 40,
				whiteKeyHeight: 180,
				blackKeyWidth: 24,
				blackKeyHeight: 120,
			}}
			rollHeight={600}
		/>
	);
}
```

---

## Animation Configuration

### Fast Animation

```tsx
export function FastAnimation() {
	return (
		<PianoRoll
			notes={notes}
			animationConfig={{
				fallSpeed: 400,
				lookahead: 2,
			}}
		/>
	);
}
```

### Slow Animation

```tsx
export function SlowAnimation() {
	return (
		<PianoRoll
			notes={notes}
			animationConfig={{
				fallSpeed: 100,
				lookahead: 5,
			}}
		/>
	);
}
```

---

## Custom Audio Engine

### Using Custom Samples

```tsx
import { useEffect, useRef } from 'react';
import { PianoAudioEngine, PianoRoll } from 'react-piano-roll';

export function CustomSamples() {
	const audioEngineRef = useRef<PianoAudioEngine>();

	useEffect(() => {
		const engine = new PianoAudioEngine();
		audioEngineRef.current = engine;

		// Initialize and load samples
		engine.init().then(() => {
			// Map of MIDI note to sample URL
			const samples = new Map([
				[60, '/samples/C4.mp3'],
				[62, '/samples/D4.mp3'],
				[64, '/samples/E4.mp3'],
				[65, '/samples/F4.mp3'],
				[67, '/samples/G4.mp3'],
				[69, '/samples/A4.mp3'],
				[71, '/samples/B4.mp3'],
				[72, '/samples/C5.mp3'],
			]);

			engine.loadSamples(samples);
		});

		return () => engine.dispose();
	}, []);

	return <PianoRoll notes={notes} audioEngine={audioEngineRef.current} />;
}
```

### Volume Control

```tsx
import { useState, useRef } from 'react';
import { PianoAudioEngine, PianoRoll } from 'react-piano-roll';

export function VolumeControl() {
	const audioEngineRef = useRef(new PianoAudioEngine());
	const [volume, setVolume] = useState(0.7);

	const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newVolume = parseFloat(e.target.value);
		setVolume(newVolume);
		audioEngineRef.current.setVolume(newVolume);
	};

	return (
		<div>
			<div>
				<label>Volume: {Math.round(volume * 100)}%</label>
				<input
					type='range'
					min='0'
					max='1'
					step='0.01'
					value={volume}
					onChange={handleVolumeChange}
				/>
			</div>
			<PianoRoll notes={notes} audioEngine={audioEngineRef.current} />
		</div>
	);
}
```

---

## Loading MIDI Files

```tsx
import { useState } from 'react';
import { PianoRoll, getMIDIFromNoteName } from 'react-piano-roll';
import type { Note } from 'react-piano-roll';

// You'll need a MIDI parser library like 'midi-parser-js' or '@tonejs/midi'
import { Midi } from '@tonejs/midi';

export function MIDILoader() {
	const [notes, setNotes] = useState<Note[]>([]);

	const handleFileLoad = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const arrayBuffer = await file.arrayBuffer();
		const midi = new Midi(arrayBuffer);

		// Convert MIDI to our Note format
		const convertedNotes: Note[] = [];
		midi.tracks.forEach((track) => {
			track.notes.forEach((note) => {
				convertedNotes.push({
					pitch: note.midi,
					startTime: note.time,
					duration: note.duration,
					velocity: Math.round(note.velocity * 127),
				});
			});
		});

		setNotes(convertedNotes);
	};

	return (
		<div>
			<input type='file' accept='.mid,.midi' onChange={handleFileLoad} />
			{notes.length > 0 && <PianoRoll notes={notes} />}
		</div>
	);
}
```

---

## Real-time Note Input

```tsx
import { useState, useCallback } from 'react';
import { PianoRoll } from 'react-piano-roll';
import type { Note } from 'react-piano-roll';

export function RealtimeInput() {
	const [notes, setNotes] = useState<Note[]>([]);
	const [isRecording, setIsRecording] = useState(false);
	const [startTime] = useState(Date.now());

	const addNote = useCallback(
		(pitch: number) => {
			if (!isRecording) return;

			const currentTime = (Date.now() - startTime) / 1000;
			const newNote: Note = {
				pitch,
				startTime: currentTime,
				duration: 0.5,
				velocity: 80,
			};

			setNotes((prev) => [...prev, newNote]);
		},
		[isRecording, startTime]
	);

	return (
		<div>
			<button onClick={() => setIsRecording(!isRecording)}>
				{isRecording ? 'Stop Recording' : 'Start Recording'}
			</button>
			<button onClick={() => setNotes([])}>Clear</button>

			{/* Simple keyboard for input */}
			<div>
				{[60, 62, 64, 65, 67, 69, 71, 72].map((pitch) => (
					<button key={pitch} onClick={() => addNote(pitch)}>
						{pitch}
					</button>
				))}
			</div>

			<PianoRoll notes={notes} />
		</div>
	);
}
```

---

## Performance Tips

### Optimize Large Note Arrays

```tsx
import { useMemo } from 'react';

export function OptimizedLargeDataset() {
	// Only process visible notes
	const visibleNotes = useMemo(() => {
		const currentTime = getCurrentPlaybackTime();
		const lookahead = 5;

		return allNotes.filter(
			(note) => note.startTime >= currentTime - 1 && note.startTime <= currentTime + lookahead
		);
	}, [allNotes, currentTime]);

	return <PianoRoll notes={visibleNotes} />;
}
```

### Memoize Configuration

```tsx
import { useMemo } from 'react';

export function MemoizedConfig() {
	const theme = useMemo(
		() => ({
			backgroundColor: '#1a1a1a',
			noteColor: '#4a9eff',
			// ... other theme props
		}),
		[]
	);

	const keyboardConfig = useMemo(
		() => ({
			keyCount: 88,
			startNote: 21,
		}),
		[]
	);

	return <PianoRoll notes={notes} theme={theme} keyboardConfig={keyboardConfig} />;
}
```
