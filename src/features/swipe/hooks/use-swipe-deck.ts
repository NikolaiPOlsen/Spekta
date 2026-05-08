import { useAuthContext } from '@/hooks/use-auth-context';
import { useMediaContext } from '@/hooks/use-media-context';
import type { RecommendationMovie } from '@/features/recommendations/types';
import { useCallback, useEffect, useRef, useState } from 'react';

const DETAILED_COUNT = 5;
const INTER_BATCH_BUFFER = 3;
const SEGMENT_SIZE = DETAILED_COUNT + INTER_BATCH_BUFFER;
const MAX_LIVE_SEGMENTS = 2;
const SWIPE_FLUSH_BATCH_SIZE = 5;
const SWIPE_FLUSH_INTERVAL_MS = 1500;

type BufferedSwipe = {
	movie: RecommendationMovie;
	liked: boolean;
};

const buildSegment = (batch: RecommendationMovie[]) => batch.slice(0, SEGMENT_SIZE);

export function useSwipeDeck() {
	const {
		claims,
		isLoading: isAuthLoading,
		isInitializingUser,
		isUserInitialized,
		initializationError,
	} = useAuthContext();
	const {
		clearMedia,
		error,
		fetchRecommendationsBatch,
		persistSwipe,
	} = useMediaContext();
	const [currentSegment, setCurrentSegment] = useState<RecommendationMovie[]>([]);
	const [activeSegmentLength, setActiveSegmentLength] = useState(SEGMENT_SIZE);
	const [segmentVersion, setSegmentVersion] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [hasInitialized, setHasInitialized] = useState(false);
	const pendingSwipesRef = useRef<BufferedSwipe[]>([]);
	const flushTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const flushPendingSwipesRef = useRef<() => Promise<void>>(async () => {});
	const isFlushingRef = useRef(false);
	const nextSegmentPromiseRef = useRef<Promise<RecommendationMovie[] | null> | null>(null);
	const waitingForNextSegmentAtBoundaryRef = useRef(false);
	const isMountedRef = useRef(true);

	const clearFlushTimeout = useCallback(() => {
		if (flushTimeoutRef.current) {
			clearTimeout(flushTimeoutRef.current);
			flushTimeoutRef.current = null;
		}
	}, []);

	const flushPendingSwipes = useCallback(async () => {
		if (isFlushingRef.current || pendingSwipesRef.current.length === 0) {
			return;
		}

		isFlushingRef.current = true;
		clearFlushTimeout();

		const swipesToFlush = [...pendingSwipesRef.current];
		pendingSwipesRef.current = [];
		let processedCount = 0;
		let didFail = false;

		try {
			for (const swipe of swipesToFlush) {
				await persistSwipe(swipe.movie, swipe.liked);
				processedCount += 1;
			}
		} catch {
			didFail = true;
			pendingSwipesRef.current = [
				...swipesToFlush.slice(processedCount),
				...pendingSwipesRef.current,
			];
		} finally {
			isFlushingRef.current = false;

			if (!didFail && pendingSwipesRef.current.length >= SWIPE_FLUSH_BATCH_SIZE) {
				void flushPendingSwipesRef.current();
			} else if (pendingSwipesRef.current.length > 0) {
				flushTimeoutRef.current = setTimeout(() => {
					void flushPendingSwipesRef.current();
				}, SWIPE_FLUSH_INTERVAL_MS);
			}
		}
	}, [clearFlushTimeout, persistSwipe]);

	useEffect(() => {
		flushPendingSwipesRef.current = flushPendingSwipes;
	}, [flushPendingSwipes]);

	const queueBufferedSwipe = useCallback(
		(movie: RecommendationMovie, liked: boolean) => {
			pendingSwipesRef.current.push({ movie, liked });

			if (pendingSwipesRef.current.length >= SWIPE_FLUSH_BATCH_SIZE) {
				void flushPendingSwipesRef.current();
				return;
			}

			clearFlushTimeout();
			flushTimeoutRef.current = setTimeout(() => {
				void flushPendingSwipesRef.current();
			}, SWIPE_FLUSH_INTERVAL_MS);
		},
		[clearFlushTimeout],
	);

	const fetchSegment = useCallback(async () => {
		const batch = await fetchRecommendationsBatch();
		return buildSegment(batch);
	}, [fetchRecommendationsBatch]);

	const resetDeck = useCallback(() => {
		clearFlushTimeout();
		pendingSwipesRef.current = [];
		nextSegmentPromiseRef.current = null;
		waitingForNextSegmentAtBoundaryRef.current = false;
		setCurrentSegment([]);
		setActiveSegmentLength(SEGMENT_SIZE);
		setSegmentVersion(0);
		setHasInitialized(false);
		setIsLoading(false);
	}, [clearFlushTimeout]);

	const loadInitialSegment = useCallback(async () => {
		setIsLoading(true);

		try {
			const segment = await fetchSegment();
			if (!isMountedRef.current) {
				return;
			}

			setCurrentSegment(segment);
			setActiveSegmentLength(segment.length);
			setSegmentVersion(0);
		} catch {
			if (!isMountedRef.current) {
				return;
			}

			setCurrentSegment([]);
			setActiveSegmentLength(0);
		} finally {
			if (isMountedRef.current) {
				setHasInitialized(true);
				setIsLoading(false);
			}
		}
	}, [fetchSegment]);

	const requestNextSegment = useCallback(async () => {
		if (nextSegmentPromiseRef.current) {
			return nextSegmentPromiseRef.current;
		}

		nextSegmentPromiseRef.current = fetchSegment()
			.then((segment) => {
				const nextSegment = segment.length > 0 ? segment : null;

				if (!isMountedRef.current) {
					return nextSegment;
				}

				if (waitingForNextSegmentAtBoundaryRef.current) {
					waitingForNextSegmentAtBoundaryRef.current = false;
					setCurrentSegment(nextSegment ?? []);
					setActiveSegmentLength(nextSegment?.length ?? 0);
					setSegmentVersion((currentVersion) => currentVersion + 1);
					setIsLoading(false);
					return nextSegment;
				}

				if (nextSegment) {
					setCurrentSegment((segmentState) => {
						if (segmentState.length >= SEGMENT_SIZE * MAX_LIVE_SEGMENTS) {
							return segmentState;
						}

						return [...segmentState, ...nextSegment];
					});
				}

				return nextSegment;
			})
			.catch(() => null)
			.finally(() => {
				nextSegmentPromiseRef.current = null;
			});

		return nextSegmentPromiseRef.current;
	}, [fetchSegment]);

	const compactToAppendedSegment = useCallback(() => {
		setCurrentSegment((segment) => {
			const nextSegment = segment.slice(activeSegmentLength);
			setActiveSegmentLength(nextSegment.length);
			return nextSegment;
		});
		setSegmentVersion((currentVersion) => currentVersion + 1);
	}, [activeSegmentLength]);

	const handleSwipe = useCallback(
		(movie: RecommendationMovie, liked: boolean, swipedIndex: number) => {
			queueBufferedSwipe(movie, liked);

			const prefetchTriggerIndex = Math.min(DETAILED_COUNT - 1, activeSegmentLength - 1);
			const segmentEndIndex = activeSegmentLength - 1;

			if (swipedIndex === prefetchTriggerIndex) {
				void requestNextSegment();
			}

			if (swipedIndex === segmentEndIndex) {
				if (currentSegment.length > activeSegmentLength) {
					compactToAppendedSegment();
				} else {
					waitingForNextSegmentAtBoundaryRef.current = true;
					setIsLoading(true);
					void requestNextSegment();
				}
			}
		},
		[activeSegmentLength, compactToAppendedSegment, currentSegment.length, queueBufferedSwipe, requestNextSegment],
	);

	const swipeLeft = useCallback(
		(movie: RecommendationMovie, swipedIndex: number) => {
			handleSwipe(movie, false, swipedIndex);
		},
		[handleSwipe],
	);

	const swipeRight = useCallback(
		(movie: RecommendationMovie, swipedIndex: number) => {
			handleSwipe(movie, true, swipedIndex);
		},
		[handleSwipe],
	);

	useEffect(() => {
		if (isAuthLoading || isInitializingUser) {
			return;
		}

		if (!claims?.sub) {
			resetDeck();
			clearMedia();
			return;
		}

		if (!isUserInitialized && !initializationError) {
			return;
		}

		if (!hasInitialized) {
			void loadInitialSegment();
		}
	}, [
		claims?.sub,
		clearMedia,
		hasInitialized,
		initializationError,
		isAuthLoading,
		isInitializingUser,
		isUserInitialized,
		loadInitialSegment,
		resetDeck,
	]);

	useEffect(() => {
		isMountedRef.current = true;

		return () => {
			isMountedRef.current = false;
			clearFlushTimeout();
			void flushPendingSwipesRef.current();
		};
	}, [clearFlushTimeout]);

	return {
		currentSegment,
		segmentVersion,
		isLoading,
		error,
		swipeLeft,
		swipeRight,
	};
}
