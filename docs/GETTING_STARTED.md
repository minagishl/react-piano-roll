# Getting Started with react-piano-roll

This guide will help you get started with developing and using the react-piano-roll package.

## Project Structure

```
react-piano-roll/
├── src/
│   ├── components/      # React components
│   │   ├── PianoRoll.tsx          # Main component
│   │   ├── Keyboard.tsx           # Piano keyboard
│   │   ├── NoteCanvas.tsx         # Note visualization
│   │   └── PianoRoll.stories.tsx  # Storybook stories
│   ├── audio/          # Audio engine
│   │   └── AudioEngine.ts         # Sample-based audio
│   ├── hooks/          # React hooks
│   │   └── usePlayback.ts         # Playback controller
│   ├── types/          # TypeScript types
│   │   └── index.ts               # All type definitions
│   ├── utils/          # Utility functions
│   │   └── piano.ts               # Piano/MIDI helpers
│   └── index.ts        # Main entry point
├── .storybook/         # Storybook configuration
├── dist/               # Built output (generated)
└── docs/               # Documentation
```

## Development Setup

### Prerequisites

- Node.js 18+ or 20+
- pnpm (recommended) or npm/yarn

### Installation

```bash
# Install dependencies
pnpm install

# Run type checking
pnpm typecheck

# Build the library
pnpm build

# Start Storybook for development
pnpm storybook
```

## Available Scripts

```bash
# Development
pnpm dev              # Start Vite dev server
pnpm storybook        # Start Storybook on port 6006

# Building
pnpm build            # Build library for production
pnpm build-storybook  # Build static Storybook

# Quality checks
pnpm typecheck        # Run TypeScript type checking
```

## Development Workflow

### 1. Start Storybook

```bash
pnpm storybook
```

This will open Storybook at `http://localhost:6006` where you can:

- See live examples of the component
- Test different configurations
- Develop new features interactively

### 2. Make Changes

Edit files in the `src/` directory:

- **Components**: `src/components/`
- **Audio engine**: `src/audio/`
- **Types**: `src/types/`
- **Utilities**: `src/utils/`

### 3. Add Stories

When adding new features, create or update stories in `*.stories.tsx` files:

```tsx
export const MyNewFeature: Story = {
	render: () => (
		<AutoPlayPianoRoll
			notes={myNotes}
			theme={
				{
					/* custom theme */
				}
			}
		/>
	),
};
```

### 4. Type Checking

Always run type checking before committing:

```bash
pnpm typecheck
```

### 5. Build

Build the library to ensure it compiles correctly:

```bash
pnpm build
```

## Project Architecture

### Core Components

1. **PianoRoll** (`src/components/PianoRoll.tsx`)

   - Main component that orchestrates everything
   - Manages playback state
   - Coordinates audio and visualization

2. **Keyboard** (`src/components/Keyboard.tsx`)

   - Renders piano keyboard using SVG
   - Highlights active notes
   - Responsive to configuration

3. **NoteCanvas** (`src/components/NoteCanvas.tsx`)
   - Canvas-based note rendering
   - Handles falling notes animation
   - Triggers note playback

### Audio System

**PianoAudioEngine** (`src/audio/AudioEngine.ts`)

- Web Audio API implementation
- Sample-based synthesis
- Pitch shifting for missing samples
- ADSR envelope
- Fallback oscillator synthesis

### Playback System

**usePlayback** (`src/hooks/usePlayback.ts`)

- Animation frame-based timing
- Play/pause/stop/seek controls
- Time tracking
- State management

## Key Concepts

### Note Data Model

```tsx
interface Note {
	pitch: number; // MIDI note (0-127)
	startTime: number; // Seconds
	duration: number; // Seconds
	velocity?: number; // 0-127 (default: 64)
}
```

### Theme System

Themes support both static colors and functions:

```tsx
theme={{
  noteColor: '#4a9eff',  // Static
  // OR
  noteColor: (velocity) => `hsl(${velocity}, 70%, 50%)`  // Dynamic
}}
```

### Playback Control

The component exposes a ref-based API:

```tsx
const ref = useRef<PianoRollHandle>(null);

// Control playback
ref.current?.play();
ref.current?.pause();
ref.current?.seek(5.0);
```

## Testing Your Changes

### Visual Testing

Use Storybook to visually test your changes across different scenarios:

1. Start Storybook: `pnpm storybook`
2. Navigate to your story
3. Test different props and themes
4. Verify animations and audio

### Type Safety

TypeScript will catch most issues:

```bash
pnpm typecheck
```

### Build Verification

Ensure the library builds correctly:

```bash
pnpm build
```

## Adding New Features

### Example: Adding a New Theme

1. Update types in `src/types/index.ts`:

```tsx
export interface PianoRollTheme {
	// ... existing props
	myNewColor?: string;
}
```

2. Add default in `src/components/PianoRoll.tsx`:

```tsx
const defaultTheme = {
	// ... existing defaults
	myNewColor: '#ff0000',
};
```

3. Use in component:

```tsx
<div style={{ color: theme.myNewColor }}>{/* ... */}</div>
```

4. Add story in `src/components/PianoRoll.stories.tsx`:

```tsx
export const CustomColor: Story = {
	render: () => <AutoPlayPianoRoll notes={sampleNotes} theme={{ myNewColor: '#00ff00' }} />,
};
```

## Publishing

### Before Publishing

1. Update version in `package.json`
2. Update `docs/CHANGELOG.md`
3. Run all checks:
   ```bash
   pnpm typecheck
   pnpm build
   ```

### Publish to npm

```bash
npm publish
```

## Tips & Best Practices

### Performance

- Use `useMemo` for expensive calculations
- Keep note arrays filtered to visible range
- Canvas rendering is optimized for 60fps

### Audio Quality

- Provide samples for multiple notes (every 3-12 semitones)
- Use high-quality audio files (MP3/WAV)
- Consider file size vs quality tradeoff

### TypeScript

- Always export types from `src/types/`
- Use strict mode
- Avoid `any` types

### Component Design

- Keep components pure and functional
- Use React.memo for performance-critical components
- Prefer props over context for configuration

## Troubleshooting

### Build Errors

**Problem**: TypeScript errors

```bash
pnpm typecheck
```

**Problem**: Missing dependencies

```bash
pnpm install
```

### Storybook Issues

**Problem**: Storybook won't start

```bash
rm -rf node_modules
pnpm install
pnpm storybook
```

### Audio Issues

**Problem**: No sound

- Check browser console for errors
- Verify AudioContext is not suspended
- User interaction may be required (browser autoplay policy)

**Problem**: Delayed audio

- Reduce lookahead time
- Check system audio latency
- Use Web Audio API scheduling

## Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Storybook Documentation](https://storybook.js.org/)
- [Vite Documentation](https://vitejs.dev/)

## Getting Help

- Check the [README.md](../README.md) for usage examples
- See [EXAMPLES.md](./EXAMPLES.md) for comprehensive examples
- Review [Storybook stories](../src/components/PianoRoll.stories.tsx)

## Contributing

We welcome contributions! Please ensure:

1. Code passes type checking
2. Build succeeds
3. Storybook examples work
4. New features have stories
5. Documentation is updated

Happy coding!
