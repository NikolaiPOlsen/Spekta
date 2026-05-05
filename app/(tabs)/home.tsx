import { Pressable, StyleSheet, Text, View, useColorScheme, useWindowDimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Swipe } from '@/features/swipe/components/swipe';
import { MovieCard, type MovieCardProps } from '@/features/swipe/components/movie-card';
import { useMediaContext } from '@/hooks/use-media-context';
import type { RecommendationMovie } from '@/features/recommendations/types';
import { Colors } from '@/themes/colors';
import { useEffect } from 'react';

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
				? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
				: undefined,
		},
	};
}

export default function HomeRoute() {
	const { recommendations, isLoading, error, recordSwipe, refreshRecommendations } = useMediaContext();
	const colorScheme = useColorScheme();
	const themeColors = Colors[colorScheme ?? 'light'];
	const insets = useSafeAreaInsets();
	const { width } = useWindowDimensions();
	const iconSize = Math.min(Math.round(width * 0.09), 56);

	useEffect(() => {
		refreshRecommendations();
	}, []);

	const cards = recommendations.map(toRecommendationCard);

	return (
		<View style={[styles.container]}>
			<Pressable
				style={[styles.profileButton, { top: insets.top + 15, left: insets.left + 12 }]}
				onPress={() => router.push('/(tabs)/profile')}
			>
				<MaterialIcons name='person' size={iconSize} color={themeColors.primary} />
			</Pressable>
			{isLoading ? <Text style={{ color: themeColors.text }}>Loading recommendations...</Text> : null}
			{error ? <Text style={{ color: themeColors.text }}>{error}</Text> : null}
			{!isLoading && !error && cards.length === 0 ? (
				<Text style={{ color: themeColors.text }}>No recommendations available.</Text>
			) : null}
			{cards.length > 0 ? (
				<Swipe
					key={recommendations[0]?.id ?? 'recommendations'}
					data={cards}
					renderCard={(item) => <MovieCard {...item.card} />}
					onSwipeRight={(item) => {
						void recordSwipe(item.movie, true);
					}}
					onSwipeLeft={(item) => {
						void recordSwipe(item.movie, false);
					}}
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
