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

	/**
	 * Continue playback timing in background tabs
	 */
	allowBackgroundPlayback?: boolean;
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
	const {
		onTick,
		initialState = 'stopped',
		initialTime = 0,
		allowBackgroundPlayback = true,
	} = options;

	const [state, setState] = useState<PlaybackState>(initialState);
	const [currentTime, setCurrentTime] = useState<Time>(initialTime);

	const animationFrameRef = useRef<number>();
	const intervalRef = useRef<number>();
	const lastTimeRef = useRef<number>(0);
	const playbackTimeRef = useRef<Time>(initialTime);
	const stateRef = useRef<PlaybackState>(initialState);
	const tickRef = useRef<() => void>();
	const allowBackgroundPlaybackRef = useRef<boolean>(allowBackgroundPlayback);

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

		if (!allowBackgroundPlaybackRef.current) {
			animationFrameRef.current = requestAnimationFrame(tickRef.current!);
		}
	}, []);

	// Update tick ref when tick changes
	useEffect(() => {
		tickRef.current = tick;
	}, [tick]);

	const stopLoop = useCallback(() => {
		if (animationFrameRef.current) {
			cancelAnimationFrame(animationFrameRef.current);
			animationFrameRef.current = undefined;
		}
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = undefined;
		}
	}, []);

	const startLoop = useCallback(() => {
		stopLoop();
		lastTimeRef.current = performance.now();

		if (allowBackgroundPlaybackRef.current) {
			intervalRef.current = window.setInterval(() => {
				tickRef.current?.();
			}, 16);
		} else {
			animationFrameRef.current = requestAnimationFrame(tickRef.current!);
		}
	}, [stopLoop]);

	const play = useCallback(() => {
		if (stateRef.current === 'playing') return;

		stateRef.current = 'playing';
		setState('playing');
		startLoop();
	}, [startLoop]);

	const pause = useCallback(() => {
		if (stateRef.current !== 'playing') return;

		stateRef.current = 'paused';
		setState('paused');
		stopLoop();
	}, [stopLoop]);

	const stop = useCallback(() => {
		stateRef.current = 'stopped';
		setState('stopped');
		stopLoop();
		playbackTimeRef.current = 0;
		setCurrentTime(0);
	}, [stopLoop]);

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

	// Restart loop when background playback setting changes while playing
	useEffect(() => {
		allowBackgroundPlaybackRef.current = allowBackgroundPlayback;
		if (state !== 'playing') return;
		startLoop();
	}, [allowBackgroundPlayback, state, startLoop]);

	useEffect(() => {
		return () => {
			stopLoop();
		};
	}, [stopLoop]);

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
