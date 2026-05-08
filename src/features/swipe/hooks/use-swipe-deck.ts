import { useAuthContext } from '@/hooks/use-auth-context';
import { useMediaContext } from '@/hooks/use-media-context';
import type { RecommendationMovie } from '@/features/recommendations/types';
import { useCallback, useEffect, useRef, useState } from 'react';

const DETAILED_COUNT = 5;
const INTER_BATCH_BUFFER = 3;
const SEGMENT_SIZE = DETAILED_COUNT + INTER_BATCH_BUFFER;
const SWIPE_FLUSH_BATCH_SIZE = 5;
const SWIPE_FLUSH_INTERVAL_MS = 1500;

type BufferedSwipe = {
	movie: RecommendationMovie;
	liked: boolean;
};

function buildSegment(batch: RecommendationMovie[]): RecommendationMovie[] {
	return batch.slice(0, SEGMENT_SIZE);
}

function getPrefetchTriggerIndex(startIndex: number, segmentLength: number): number {
	if (segmentLength <= 0) {
		return -1;
	}

	return startIndex + Math.min(DETAILED_COUNT - 1, segmentLength - 1);
}

function getSegmentEndIndex(startIndex: number, segmentLength: number): number {
	return segmentLength > 0 ? startIndex + segmentLength - 1 : -1;
}

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
	const [segmentVersion, setSegmentVersion] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [hasInitialized, setHasInitialized] = useState(false);
	const [activeSegmentLength, setActiveSegmentLength] = useState(SEGMENT_SIZE);
	const pendingSwipesRef = useRef<BufferedSwipe[]>([]);
	const flushTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const isFlushingRef = useRef(false);
	const flushPendingSwipesRef = useRef<() => Promise<void>>(async () => {});
	const isMountedRef = useRef(true);
	const nextSegmentPromiseRef = useRef<Promise<RecommendationMovie[] | null> | null>(null);
	const waitingForNextSegmentAtBoundaryRef = useRef(false);

	const clearFlushTimeout = useCallback(() => {
		if (flushTimeoutRef.current) {
			clearTimeout(flushTimeoutRef.current);
			flushTimeoutRef.current = null;
		}
	}, []);

	const scheduleFlush = useCallback(() => {
		clearFlushTimeout();
		flushTimeoutRef.current = setTimeout(() => {
			void flushPendingSwipesRef.current();
		}, SWIPE_FLUSH_INTERVAL_MS);
	}, [clearFlushTimeout]);

	const queueBufferedSwipe = useCallback(
		(movie: RecommendationMovie, liked: boolean) => {
			pendingSwipesRef.current.push({ movie, liked });

			if (pendingSwipesRef.current.length >= SWIPE_FLUSH_BATCH_SIZE) {
				void flushPendingSwipesRef.current();
			} else {
				scheduleFlush();
			}
		},
		[scheduleFlush],
	);

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
				scheduleFlush();
			}
		}
	}, [clearFlushTimeout, persistSwipe, scheduleFlush]);

	useEffect(() => {
		flushPendingSwipesRef.current = flushPendingSwipes;
	}, [flushPendingSwipes]);

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
		setSegmentVersion(0);
		setActiveSegmentLength(SEGMENT_SIZE);
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
			setSegmentVersion(0);
			setActiveSegmentLength(segment.length);
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
			.then((nextSegment) => {
				const normalizedSegment = nextSegment.length > 0 ? nextSegment : null;
				if (isMountedRef.current) {
					if (normalizedSegment) {
						if (waitingForNextSegmentAtBoundaryRef.current) {
							waitingForNextSegmentAtBoundaryRef.current = false;
							setCurrentSegment(normalizedSegment);
							setActiveSegmentLength(normalizedSegment.length);
							setSegmentVersion((currentVersion) => currentVersion + 1);
							setIsLoading(false);
						} else {
							setCurrentSegment((segment) => [...segment, ...normalizedSegment]);
						}
					} else if (waitingForNextSegmentAtBoundaryRef.current) {
						waitingForNextSegmentAtBoundaryRef.current = false;
						setCurrentSegment([]);
						setActiveSegmentLength(0);
						setIsLoading(false);
					}
				}
				return normalizedSegment;
			})
			.catch(() => null)
			.finally(() => {
				nextSegmentPromiseRef.current = null;
			});

		return nextSegmentPromiseRef.current;
	}, [fetchSegment]);

	const prefetchNextSegment = useCallback(async () => {
		void requestNextSegment();
	}, [requestNextSegment]);

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

			const prefetchTriggerIndex = getPrefetchTriggerIndex(0, activeSegmentLength);
			const segmentEndIndex = getSegmentEndIndex(0, activeSegmentLength);

			if (swipedIndex === prefetchTriggerIndex) {
				void prefetchNextSegment();
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
		[activeSegmentLength, compactToAppendedSegment, currentSegment.length, prefetchNextSegment, queueBufferedSwipe, requestNextSegment],
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
