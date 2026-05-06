import { StyleSheet, Text, View, useColorScheme, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Swipe } from '@/features/swipe/components/swipe';
import { MovieCard, type MovieCardProps } from '@/features/swipe/components/movie-card';
import { useMediaContext } from '@/hooks/use-media-context';
import type { RecommendationMovie } from '@/features/recommendations/types';
import { Colors } from '@/themes/colors';
import { useEffect } from 'react';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ProfileButton } from '@/components/ui/app-button';

type RecommendationCard = {
	movie: RecommendationMovie;
	card: MovieCardProps;
};

function toRecommendationCard(movie: RecommendationMovie): RecommendationCard {
	const voteavg =
		typeof movie.voteAverage === 'number' ? movie.voteAverage.toFixed(1) : 'N/A';

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
		},
	};
}

export default function HomeRoute() {
	const { recommendations, isLoading, error, recordSwipe } = useMediaContext(); // , refreshRecommendations
	const colorScheme = useColorScheme();
	const themeColors = Colors[colorScheme ?? 'light'];
	const insets = useSafeAreaInsets();
	const { width } = useWindowDimensions();
	const iconSize = Math.min(Math.round(width * 0.09), 56);

	// useEffect(() => {
	// 	refreshRecommendations();
	// }, []);

	const cards = recommendations.map(toRecommendationCard);

	useEffect(() => {
		const urls = cards.flatMap((c) => (c.card.poster ? [c.card.poster] : []));
		void Image.prefetch(urls);
	}, [recommendations]);

	return (
		<View style={[styles.container]}>
			<View style={[styles.profileButton, { top: insets.top + 16, right: insets.right + 16 }]}>
				<ProfileButton onPress={() => router.push('/profile')} icon="person" />
			</View>
			{isLoading ? <Text style={{ color: themeColors.text }}>Loading recommendations...</Text> : null}
			{error ? <Text style={{ color: themeColors.text }}>{error}</Text> : null}
			{!isLoading && !error && cards.length === 0 ? (
				<Text style={{ color: themeColors.text }}>No recommendations available.</Text>
			) : null}
			{cards.length > 0 ? (
				<Swipe
					key={recommendations[0]?.id ?? 'recommendations'}
					data={cards}
					renderCard={(item, swipeLeft, swipeRight) => (
						<MovieCard
							{...item.card}
							onSwipeLeft={() => { swipeLeft(); void recordSwipe(item.movie, false); }}
							onSwipeRight={() => { swipeRight(); void recordSwipe(item.movie, true); }}
						/>
					)}
					onSwipeRight={(item) => { void recordSwipe(item.movie, true); }}
					onSwipeLeft={(item) => { void recordSwipe(item.movie, false); }}
				/>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	profileButton: {
		position: 'absolute',
		zIndex: 10,
	},
});
