import { useAuthContext } from '@/hooks/use-auth-context';
import { MediaContext } from '@/hooks/use-media-context';
import {
	fetchRecommendations,
	recordSwipe as saveSwipe,
} from '@/features/recommendations/services';
import type { RecommendationMovie } from '@/features/recommendations/types';
import { PropsWithChildren, useCallback, useEffect, useState } from 'react';

export default function MediaProvider({ children }: PropsWithChildren) {
	const {
		claims,
		isLoading: isAuthLoading,
		isInitializingUser,
	} = useAuthContext();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const clearMedia = useCallback(() => {
		setError(null);
		setIsLoading(false);
	}, []);

	const fetchRecommendationsBatch = useCallback(async () => {
		if (!claims?.sub) {
			clearMedia();
			return [];
		}

		setIsLoading(true);
		setError(null);

		try {
			const response = await fetchRecommendations();
			return response.recommendations;
		} catch (loadError) {
			const message =
				loadError instanceof Error ? loadError.message : 'Failed to load recommendations';
			setError(message);
			throw new Error(message);
		} finally {
			setIsLoading(false);
		}
	}, [claims?.sub, clearMedia]);

	const persistSwipe = useCallback(async (movie: RecommendationMovie, liked: boolean) => {
		setError(null);

		try {
			await saveSwipe(movie, liked);
		} catch (recordError) {
			const message =
				recordError instanceof Error ? recordError.message : 'Failed to record swipe';
			setError(message);
			throw new Error(message);
		}
	}, []);

	useEffect(() => {
		if (isAuthLoading || isInitializingUser) {
			return;
		}

		if (!claims?.sub) {
			clearMedia();
		}
	}, [claims?.sub, clearMedia, isAuthLoading, isInitializingUser]);

	return (
		<MediaContext.Provider
			value={{
				isLoading,
				error,
				fetchRecommendationsBatch,
				persistSwipe,
				clearMedia,
			}}
		>
			{children}
		</MediaContext.Provider>
	);
}
