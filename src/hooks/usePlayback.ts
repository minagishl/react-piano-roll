import { useRef, useCallback, useState, useEffect } from 'react';
import type { PlaybackState, PlaybackController, Time } from '../types';

interface UsePlaybackOptions {
	/**
	 * Callback fired on each animation frame with current time
	 */
	onTick?: (time: Time) => void;

	/**
	 * Initial playback state
	 */
	initialState?: PlaybackState;

	/**
	 * Initial time position
	 */
	initialTime?: Time;
}

interface UsePlaybackReturn extends PlaybackController {
	/**
	 * Current playback time
	 */
	currentTime: Time;

	/**
	 * Current playback state
	 */
	state: PlaybackState;
}

/**
 * Hook for managing playback state and time
 */
export function usePlayback(options: UsePlaybackOptions = {}): UsePlaybackReturn {
	const { onTick, initialState = 'stopped', initialTime = 0 } = options;

	const [state, setState] = useState<PlaybackState>(initialState);
	const [currentTime, setCurrentTime] = useState<Time>(initialTime);

	const animationFrameRef = useRef<number>();
	const lastTimeRef = useRef<number>(0);
	const playbackTimeRef = useRef<Time>(initialTime);
	const stateRef = useRef<PlaybackState>(initialState);
	const tickRef = useRef<() => void>();

	// Initialize lastTimeRef after mount to avoid calling performance.now() during render
	useEffect(() => {
		lastTimeRef.current = performance.now();
	}, []);

	// Update refs when state changes
	useEffect(() => {
		stateRef.current = state;
	}, [state]);

	useEffect(() => {
		playbackTimeRef.current = currentTime;
	}, [currentTime]);

	// Update onTick ref
	const onTickRef = useRef(onTick);
	useEffect(() => {
		onTickRef.current = onTick;
	}, [onTick]);

	// Animation loop
	const tick = useCallback(() => {
		if (stateRef.current !== 'playing') return;

		const now = performance.now();
		const deltaTime = (now - lastTimeRef.current) / 1000; // Convert to seconds
		lastTimeRef.current = now;

		playbackTimeRef.current += deltaTime;
		setCurrentTime(playbackTimeRef.current);
		onTickRef.current?.(playbackTimeRef.current);

		animationFrameRef.current = requestAnimationFrame(tickRef.current!);
	}, []);

	// Update tick ref when tick changes
	useEffect(() => {
		tickRef.current = tick;
	}, [tick]);

	const play = useCallback(() => {
		if (stateRef.current === 'playing') return;

		setState('playing');
		lastTimeRef.current = performance.now();
		animationFrameRef.current = requestAnimationFrame(tickRef.current!);
	}, []);

	const pause = useCallback(() => {
		if (stateRef.current !== 'playing') return;

		setState('paused');
		if (animationFrameRef.current) {
			cancelAnimationFrame(animationFrameRef.current);
		}
	}, []);

	const stop = useCallback(() => {
		setState('stopped');
		if (animationFrameRef.current) {
			cancelAnimationFrame(animationFrameRef.current);
		}
		playbackTimeRef.current = 0;
		setCurrentTime(0);
	}, []);

	const seek = useCallback((time: Time) => {
		playbackTimeRef.current = Math.max(0, time);
		setCurrentTime(playbackTimeRef.current);
		lastTimeRef.current = performance.now();
	}, []);

	const getCurrentTime = useCallback(() => {
		return playbackTimeRef.current;
	}, []);

	const getState = useCallback(() => {
		return stateRef.current;
	}, []);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
		};
	}, []);

	return {
		play,
		pause,
		stop,
		seek,
		getCurrentTime,
		getState,
		currentTime,
		state,
	};
}
