import { useAuthContext } from '@/hooks/use-auth-context';
import { MediaContext } from '@/hooks/use-media-context';
import {
	fetchRecommendations,
	recordSwipe as saveSwipe,
} from '@/features/recommendations/services';
import type { RecommendationMovie } from '@/features/recommendations/types';
import { PropsWithChildren, useCallback, useEffect, useState } from 'react';

const detailedMoviesAmount = 5; // this is 5 in backend
const genericMoviesBuffer = 3; // amount of movies "buffer", meaning how many between each main batch of 5
const PREFETCH_TRIGGER = detailedMoviesAmount + genericMoviesBuffer;

export default function MediaProvider({ children }: PropsWithChildren) {
	const {
		claims,
		isLoading: isAuthLoading,
		isInitializingUser,
		isUserInitialized,
		initializationError,
	} = useAuthContext();
	const [recommendations, setRecommendations] = useState<RecommendationMovie[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [hasLoaded, setHasLoaded] = useState(false);
	const [swipedInCurrentBatch, setSwipedInCurrentBatch] = useState(0);
	const [isPrefetching, setIsPrefetching] = useState(false);
	const [pendingBatch, setPendingBatch] = useState<RecommendationMovie[] | null>(null);

	const clearMedia = useCallback(() => {
		setRecommendations([]);
		setError(null);
		setHasLoaded(false);
		setSwipedInCurrentBatch(0);
		setIsPrefetching(false);
		setPendingBatch(null);
	}, []);

	const DEBUGLogMovies = () => {
		// if (recommendations[3]) {
		// 	console.log(`[3] KEYWORDIDS: ${recommendations[3].keywordIds}`);
		// }

		let out = "";
		for (let i = 0; i < 8; i++) {
			const element = recommendations[i];
			if (element) {
				out += `[${i}] ${element.title}, `;
			} else {
				out += `[${i}] UNDEFINED, `;
			}
		}

		console.log(`(${recommendations.length}) [${out}...]`);
	}

	const applyPendingBatch = useCallback((nextBatch: RecommendationMovie[]) => {

		setRecommendations(remainingMovies => {
			const nextCurrentMovies = remainingMovies.slice(1, genericMoviesBuffer + 1);
			const newMovies = [...nextCurrentMovies, ...nextBatch];

			let out = "";
			for (let i = 0; i < 10; i++) {
				const element = newMovies[i];
				let title;
				if (element) {
					title = element.title;
				} else {
					title = "UNDEFINED";
				}

				out += `(${i}) ${title}, `;
			}
			console.log("\n\nmovies after combining nextCurrentMovies and nextBatch:");
			console.log(`(${newMovies.length}) [${out}...]`);

			return newMovies;
		});

		setSwipedInCurrentBatch(0);
		setIsPrefetching(false);
		setPendingBatch(null);
	}, []);

	const prefetchNextBatch = useCallback(async () => {
		setIsPrefetching(true);

		try {
			const response = await fetchRecommendations();
			setPendingBatch(response.recommendations);
		} catch (loadError) {
			setError(
				loadError instanceof Error
					? loadError.message
					: 'Failed to prefetch recommendations',
			);
			setIsPrefetching(false);
		}
	}, []);

	const loadRecommendations = useCallback(async () => {
		console.log("loadRecommendations called");
		// console.log(claims);
		if (!claims?.sub) {
			console.log("what is happening");
			clearMedia();
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const response = await fetchRecommendations();
			// console.log(response);
			setRecommendations(response.recommendations);
			setSwipedInCurrentBatch(0);
			setIsPrefetching(false);
			setPendingBatch(null);
			setHasLoaded(true);
		} catch (loadError) {
			setError(
				loadError instanceof Error
					? loadError.message
					: 'Failed to load recommendations',
			);
		} finally {
			setIsLoading(false);
		}
	}, [claims?.sub, clearMedia]);

	const refreshRecommendations = useCallback(async () => {
		console.log("refreshing movies");
		await loadRecommendations();
	}, [loadRecommendations]);

	const recordSwipe = useCallback(
		async (movie: RecommendationMovie, liked: boolean) => {
			const nextSwipeCount = swipedInCurrentBatch + 1;
			const shouldSwapToPendingBatch = pendingBatch != null;
			const shouldPrefetch = !shouldSwapToPendingBatch && nextSwipeCount >= PREFETCH_TRIGGER && !isPrefetching;

			console.log("\n\n\n\nCURRENT MOVIES:\n");
			DEBUGLogMovies();;
			
			if (shouldSwapToPendingBatch) {
				applyPendingBatch(pendingBatch);
			} else {
				// QUEUE.POP
				setRecommendations((current) =>current.filter((currentMovie) => currentMovie.id !== movie.id));
				setSwipedInCurrentBatch(nextSwipeCount);
			}

			if (shouldPrefetch) {
				void prefetchNextBatch();
			}

			try {
				await saveSwipe(movie, liked);
			} catch (recordError) {
				setError(
					recordError instanceof Error ? recordError.message : 'Failed to record swipe',
				);
			}
		},
		[applyPendingBatch, isPrefetching, pendingBatch, prefetchNextBatch, swipedInCurrentBatch],
	);

	useEffect(() => {
		if (pendingBatch && recommendations.length === 0) {
			applyPendingBatch(pendingBatch);
		}
	}, [applyPendingBatch, pendingBatch, recommendations.length]);

	useEffect(() => {
		console.log("useEffect running");
		if (isAuthLoading || isInitializingUser) {
			return;
		}

		if (!claims?.sub) {
			clearMedia();
			return;
		}

		if (!isUserInitialized && !initializationError) {
			return;
		}

		if (!hasLoaded) {
			void loadRecommendations();
		}
	}, [
		claims?.sub,
		clearMedia,
		hasLoaded,
		isAuthLoading,
		isInitializingUser,
		initializationError,
		isUserInitialized,
		loadRecommendations,
	]);

	return (
		<MediaContext.Provider
			value={{
				recommendations,
				isLoading,
				error,
				hasLoaded,
				loadRecommendations,
				refreshRecommendations,
				recordSwipe,
				clearMedia,
			}}
		>
			{children}
		</MediaContext.Provider>
	);
}