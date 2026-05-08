import { useAuthContext } from '@/hooks/use-auth-context';
import { useMediaContext } from '@/hooks/use-media-context';
import type { RecommendationMovie } from '@/features/recommendations/types';
import { useCallback, useEffect, useRef, useState } from 'react';

const LOW_WATERMARK = 4;
const FLUSH_BATCH_SIZE = 5;
const FLUSH_INTERVAL_MS = 1500;

type BufferedSwipe = {
	movie: RecommendationMovie;
	liked: boolean;
	timestamp: number;
};

function dedupeMovies(
	currentDeck: RecommendationMovie[],
	nextBatch: RecommendationMovie[],
): RecommendationMovie[] {
	const existingIds = new Set(currentDeck.map((movie) => movie.id));
	const uniqueMovies = nextBatch.filter((movie) => !existingIds.has(movie.id));
	return uniqueMovies.length > 0 ? [...currentDeck, ...uniqueMovies] : currentDeck;
}

export function useSwipeDeck() {
	const {
		claims,
		isLoading: isAuthLoading,
		isInitializingUser,
		isUserInitialized,
		initializationError,
	} = useAuthContext();
	const { clearMedia, error, fetchRecommendationsBatch, persistSwipe } = useMediaContext();
	const [deck, setDeck] = useState<RecommendationMovie[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasInitialized, setHasInitialized] = useState(false);
	const pendingSwipesRef = useRef<BufferedSwipe[]>([]);
	const flushTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const isFlushingRef = useRef(false);
	const isFetchingMoreRef = useRef(false);
	const flushPendingSwipesRef = useRef<() => Promise<void>>(async () => {});
	const isMountedRef = useRef(true);

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
		}, FLUSH_INTERVAL_MS);
	}, [clearFlushTimeout]);

	const appendBatch = useCallback((nextBatch: RecommendationMovie[]) => {
		if (nextBatch.length === 0) {
			return;
		}

		setDeck((currentDeck) => dedupeMovies(currentDeck, nextBatch));
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

			if (!didFail && pendingSwipesRef.current.length >= FLUSH_BATCH_SIZE) {
				void flushPendingSwipesRef.current();
			} else if (pendingSwipesRef.current.length > 0) {
				scheduleFlush();
			}
		}
	}, [clearFlushTimeout, persistSwipe, scheduleFlush]);

	useEffect(() => {
		flushPendingSwipesRef.current = flushPendingSwipes;
	}, [flushPendingSwipes]);

	const fetchAndAppendBatch = useCallback(async () => {
		if (isFetchingMoreRef.current) {
			return;
		}

		isFetchingMoreRef.current = true;

		try {
			const nextBatch = await fetchRecommendationsBatch();
			appendBatch(nextBatch);
		} catch {
			// MediaProvider owns the shared error state for fetch failures.
		} finally {
			isFetchingMoreRef.current = false;
		}
	}, [appendBatch, fetchRecommendationsBatch]);

	const initializeDeck = useCallback(async () => {
		setIsLoading(true);

		try {
			const initialBatch = await fetchRecommendationsBatch();
			if (isMountedRef.current) {
				setDeck(initialBatch);
			}
		} catch {
			if (isMountedRef.current) {
				setDeck([]);
			}
		} finally {
			if (isMountedRef.current) {
				setHasInitialized(true);
				setIsLoading(false);
			}
		}
	}, [fetchRecommendationsBatch]);

	const queueSwipe = useCallback(
		(movie: RecommendationMovie, liked: boolean, swipedIndex: number) => {
			pendingSwipesRef.current.push({
				movie,
				liked,
				timestamp: Date.now(),
			});

			if (pendingSwipesRef.current.length >= FLUSH_BATCH_SIZE) {
				void flushPendingSwipesRef.current();
			} else {
				scheduleFlush();
			}

			const remainingCards = deck.length - (swipedIndex + 1);
			if (remainingCards <= LOW_WATERMARK) {
				void fetchAndAppendBatch();
			}
		},
		[deck.length, fetchAndAppendBatch, scheduleFlush],
	);

	const swipeLeft = useCallback(
		(movie: RecommendationMovie, swipedIndex: number) => {
			queueSwipe(movie, false, swipedIndex);
		},
		[queueSwipe],
	);

	const swipeRight = useCallback(
		(movie: RecommendationMovie, swipedIndex: number) => {
			queueSwipe(movie, true, swipedIndex);
		},
		[queueSwipe],
	);

	useEffect(() => {
		if (isAuthLoading || isInitializingUser) {
			return;
		}

		if (!claims?.sub) {
			clearFlushTimeout();
			pendingSwipesRef.current = [];
			setDeck([]);
			setHasInitialized(false);
			setIsLoading(false);
			clearMedia();
			return;
		}

		if (!isUserInitialized && !initializationError) {
			return;
		}

		if (!hasInitialized) {
			void initializeDeck();
		}
	}, [
		claims?.sub,
		clearFlushTimeout,
		clearMedia,
		hasInitialized,
		initializationError,
		initializeDeck,
		isAuthLoading,
		isInitializingUser,
		isUserInitialized,
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
		deck,
		isLoading,
		error,
		swipeLeft,
		swipeRight,
	};
}
