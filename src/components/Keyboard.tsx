import { useMemo } from 'react';
import type { MIDINoteNumber, KeyboardConfig, PianoRollTheme } from '../types';
import { isBlackKey, countWhiteKeys } from '../utils/piano';

interface KeyboardProps {
  /**
   * Set of currently active notes (MIDI numbers)
   */
  activeNotes: Set<MIDINoteNumber>;

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

export const Keyboard: React.FC<KeyboardProps> = ({ activeNotes, config, theme, width }) => {
  const { startNote, keyCount, whiteKeyWidth, whiteKeyHeight, blackKeyWidth, blackKeyHeight } =
    config;

  // Calculate keyboard dimensions
  const whiteKeyCount = useMemo(() => {
    return countWhiteKeys(startNote, startNote + keyCount - 1);
  }, [startNote, keyCount]);

  const totalWidth = width || whiteKeyCount * whiteKeyWidth;

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
      aria-label="Piano keyboard"
    >
      {keys.map((key) => {
        const isActive = activeNotes.has(key.midiNote);
        const fill = key.isBlack
          ? isActive
            ? theme.activeBlackKeyColor
            : theme.blackKeyColor
          : isActive
            ? theme.activeWhiteKeyColor
            : theme.whiteKeyColor;

        return (
          <rect
            key={key.midiNote}
            x={key.x}
            y={0}
            width={key.width}
            height={key.height}
            fill={fill}
            stroke={theme.keyBorderColor}
            strokeWidth={1}
            rx={2}
            data-note={key.midiNote}
            style={{
              transition: 'fill 0.05s ease-out',
            }}
          />
        );
      })}
    </svg>
  );
};

Keyboard.displayName = 'Keyboard';
