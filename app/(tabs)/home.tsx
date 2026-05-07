import { StatusBar, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Swipe } from '@/features/swipe/components/swipe';
import { MovieCard, type MovieCardProps } from '@/features/swipe/components/movie-card';
import { useMediaContext } from '@/hooks/use-media-context';
import type { RecommendationMovie } from '@/features/recommendations/types';
import { Colors } from '@/themes/colors';
import { router } from 'expo-router';
import { ProfileButton } from '@/components/ui/app-button';
import { useCallback, useEffect, useRef } from 'react';

const SWIPE_COMMIT_DELAY_MS = -5;

type RecommendationCard = {
	movie: RecommendationMovie;
	card: MovieCardProps;
};

function toRecommendationCard(movie: RecommendationMovie): RecommendationCard {
	const voteavg = typeof movie.voteAverage === 'number' ? movie.voteAverage.toFixed(1) : 'N/A';

	const hasDuration: boolean = movie.runtime !== -1 && movie.runtime !== undefined;

	const duration = {
		hours: 0,
		minutes: 0
	};

	if (hasDuration) {
		const runtime: number = movie.runtime ?? -1;
		// console.log(runtime);
		duration.hours = Math.floor(runtime / 60);
		duration.minutes = runtime % 60;
	}

	const durationString = `${duration.hours}h ${duration.minutes} min`;

	// console.log(`runtime in min: ${movie.runtime} ${duration.hours} -> string: ${durationString}`);

	return {
		movie,
		card: {
			title: movie.title || 'Untitled',
			subtitle: movie.overview || 'No description available.',
			type: 'Movie',
			voteavg,
			poster: movie.posterPath
				? `https://image.tmdb.org/t/p/w780${movie.posterPath}`
				: undefined,
			durationString: durationString,
			hasDuration: hasDuration
		},
	};
}

export default function HomeRoute() {
	const { recommendations, isLoading, error, recordSwipe } = useMediaContext(); // , refreshRecommendations
	const colorScheme = useColorScheme();
	const themeColors = Colors[colorScheme ?? 'light'];
	const insets = useSafeAreaInsets();
	const swipeTimeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

	// useEffect(() => {
	// 	refreshRecommendations();
	// }, []);

	const cards = recommendations.slice(0, 3).map(toRecommendationCard);
	// const cards = recommendations.map(toRecommendationCard);

	const queueSwipeRecord = useCallback((movie: RecommendationMovie, liked: boolean) => {
		const timeoutId = setTimeout(() => {
			swipeTimeoutsRef.current.delete(timeoutId);
			void recordSwipe(movie, liked);
		}, SWIPE_COMMIT_DELAY_MS);

		swipeTimeoutsRef.current.add(timeoutId);
	}, [recordSwipe]);

	useEffect(() => {
		const swipeTimeouts = swipeTimeoutsRef.current;

		return () => {
			for (const timeoutId of swipeTimeouts) {
				clearTimeout(timeoutId);
			}
			swipeTimeouts.clear();
		};
	}, []);

	// useEffect(() => {
	// 	const urls = cards.flatMap((c) => (c.card.poster ? [c.card.poster] : []));
	// 	void Image.prefetch(urls);
	// }, [recommendations]);

	return (
		<SafeAreaView style={[styles.container]}>
			<StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
			<View style={[styles.profileButton, { top: insets.top + 16, right: insets.right + 16 }]}>
				<ProfileButton onPress={() => router.push('/profile')} icon="settings" />
			</View>
			{isLoading ? <Text style={{ color: themeColors.text }}>Loading recommendations...</Text> : null}
			{error ? <Text style={{ color: themeColors.text }}>{error}</Text> : null}
			{!isLoading && !error && cards.length === 0 ? (
				<Text style={{ color: themeColors.text }}>No recommendations available.</Text>
			) : null}
			{cards.length > 0 ? (
				<View style={[styles.deckContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}> 
					<Swipe
						key={recommendations[0]?.id ?? 'recommendations'}
						data={cards}
						renderCard={(item, swipeLeft, swipeRight) => (
							<MovieCard
								{...item.card}
								onSwipeLeft={swipeLeft}
								onSwipeRight={swipeRight}
							/>
						)}
						onSwipeRight={(item) => { queueSwipeRecord(item.movie, true); }}
						onSwipeLeft={(item) => { queueSwipeRecord(item.movie, false); }}
					/>
				</View>
			) : null}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'stretch',
		backgroundColor: "#0e0f0f"
	},
	deckContainer: {
		flex: 1,
		width: '100%',
		alignSelf: 'stretch',
		paddingHorizontal: 16,
	},
	profileButton: {
		position: 'absolute',
		zIndex: 10,
	},
});
