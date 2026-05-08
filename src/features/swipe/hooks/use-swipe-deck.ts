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
	const [pendingSegment, setPendingSegment] = useState<RecommendationMovie[] | null>(null);
	const [segmentVersion, setSegmentVersion] = useState(0);
	const [showPendingPreview, setShowPendingPreview] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [hasInitialized, setHasInitialized] = useState(false);
	const pendingSwipesRef = useRef<BufferedSwipe[]>([]);
	const flushTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const isFlushingRef = useRef(false);
	const flushPendingSwipesRef = useRef<() => Promise<void>>(async () => {});
	const isMountedRef = useRef(true);
	const isFetchingNextSegmentRef = useRef(false);
	const nextSegmentPromiseRef = useRef<Promise<RecommendationMovie[] | null> | null>(null);

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
		isFetchingNextSegmentRef.current = false;
		nextSegmentPromiseRef.current = null;
		setCurrentSegment([]);
		setPendingSegment(null);
		setSegmentVersion(0);
		setShowPendingPreview(false);
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
			setPendingSegment(null);
			setSegmentVersion(0);
			setShowPendingPreview(false);
		} catch {
			if (!isMountedRef.current) {
				return;
			}

			setCurrentSegment([]);
			setPendingSegment(null);
			setShowPendingPreview(false);
		} finally {
			if (isMountedRef.current) {
				setHasInitialized(true);
				setIsLoading(false);
			}
		}
	}, [fetchSegment]);

	const requestNextSegment = useCallback(async () => {
		if (pendingSegment && pendingSegment.length > 0) {
			return pendingSegment;
		}

		if (nextSegmentPromiseRef.current) {
			return nextSegmentPromiseRef.current;
		}

		isFetchingNextSegmentRef.current = true;
		nextSegmentPromiseRef.current = fetchSegment()
			.then((nextSegment) => {
				const normalizedSegment = nextSegment.length > 0 ? nextSegment : null;
				if (isMountedRef.current) {
					setPendingSegment(normalizedSegment);
				}
				return normalizedSegment;
			})
			.catch(() => null)
			.finally(() => {
				isFetchingNextSegmentRef.current = false;
				nextSegmentPromiseRef.current = null;
			});

		return nextSegmentPromiseRef.current;
	}, [fetchSegment, pendingSegment]);

	const prefetchNextSegment = useCallback(async () => {
		void requestNextSegment();
	}, [requestNextSegment]);

	const activateSegment = useCallback((nextSegment: RecommendationMovie[]) => {
		setCurrentSegment(nextSegment);
		setPendingSegment(null);
		setSegmentVersion((currentVersion) => currentVersion + 1);
		setShowPendingPreview(false);
	}, []);

	const fetchAndActivateNextSegment = useCallback(async () => {
		if (pendingSegment && pendingSegment.length > 0) {
			activateSegment(pendingSegment);
			return;
		}

		setIsLoading(true);

		try {
			const nextSegment = await requestNextSegment();
			if (!isMountedRef.current) {
				return;
			}

			if (nextSegment && nextSegment.length > 0) {
				activateSegment(nextSegment);
			} else {
				setCurrentSegment([]);
				setPendingSegment(null);
			}
		} catch {
			if (!isMountedRef.current) {
				return;
			}

			setCurrentSegment([]);
			setPendingSegment(null);
		} finally {
			if (isMountedRef.current) {
				setIsLoading(false);
			}
		}
	}, [activateSegment, pendingSegment, requestNextSegment]);

	const handleSwipe = useCallback(
		(movie: RecommendationMovie, liked: boolean, swipedIndex: number) => {
			queueBufferedSwipe(movie, liked);

			const lastSegmentIndex = currentSegment.length - 1;
			const prefetchTriggerIndex = Math.min(DETAILED_COUNT - 1, lastSegmentIndex);

			if (swipedIndex === prefetchTriggerIndex) {
				setShowPendingPreview(true);
				void prefetchNextSegment();
			}

			if (swipedIndex === lastSegmentIndex) {
				if (pendingSegment && pendingSegment.length > 0) {
					activateSegment(pendingSegment);
				} else {
					void fetchAndActivateNextSegment();
				}
			}
		},
		[
			activateSegment,
			currentSegment.length,
			fetchAndActivateNextSegment,
			pendingSegment,
			prefetchNextSegment,
			queueBufferedSwipe,
		],
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

	const renderSegment =
		showPendingPreview && pendingSegment
			? [...currentSegment, ...pendingSegment.slice(0, 2)]
			: currentSegment;

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
		renderSegment,
		currentSegment,
		segmentVersion,
		isLoading,
		error,
		swipeLeft,
		swipeRight,
	};
}
