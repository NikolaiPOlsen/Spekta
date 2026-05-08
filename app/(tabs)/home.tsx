import { StatusBar, StyleSheet, Text, View, useColorScheme, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Swipe } from '@/features/swipe/components/swipe';
import { MovieCard, type MovieCardProps } from '@/features/swipe/components/movie-card';
import type { RecommendationMovie } from '@/features/recommendations/types';
import { Colors } from '@/themes/colors';
import { useEffect } from 'react';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ProfileButton } from '@/components/ui/app-button';
import { useSwipeDeck } from '@/features/swipe/hooks/use-swipe-deck';

type RecommendationCard = {
	movie: RecommendationMovie;
	card: MovieCardProps;
};

function toRecommendationCard(movie: RecommendationMovie): RecommendationCard {
	const voteavg =
		typeof movie.voteAverage === 'number' ? movie.voteAverage.toFixed(1) : 'N/A';
	const hasDuration = movie.runtime !== -1 && movie.runtime !== undefined;
	const runtime = movie.runtime ?? -1;
	const durationString = hasDuration
		? `${Math.floor(runtime / 60)}h ${runtime % 60} min`
		: '0h 0 min';
	const year = movie.releaseDate ? movie.releaseDate.split('-')[0] : '';

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
			durationString,
			hasDuration,
			year,
			hasYear: year.length > 0,
		},
	};
}

export default function HomeRoute() {
	const { currentSegment, segmentVersion, isLoading, error, swipeLeft, swipeRight } = useSwipeDeck();
	const colorScheme = useColorScheme();
	const themeColors = Colors[colorScheme ?? 'light'];
	const insets = useSafeAreaInsets();

	const cards = currentSegment.map(toRecommendationCard);

	useEffect(() => {
		const urls = currentSegment.flatMap((movie) =>
			movie.posterPath ? [`https://image.tmdb.org/t/p/w780${movie.posterPath}`] : [],
		);
		void Image.prefetch(urls);
	}, [currentSegment]);

	return (
		<View style={[styles.container]}>
			<StatusBar barStyle={"light-content"} backgroundColor="transparent" translucent />
			<View style={[styles.profileButton, { top: insets.top + 16, right: insets.right + 16 }]}> 
				<ProfileButton onPress={() => router.push('/profile')} icon="person" />
			</View>
			{isLoading && currentSegment.length === 0 ? (
				<Text style={{ color: themeColors.text }}>Loading recommendations...</Text>
			) : null}
			{error ? <Text style={{ color: themeColors.text }}>{error}</Text> : null}
			{!isLoading && !error && currentSegment.length === 0 ? (
				<Text style={{ color: themeColors.text }}>No recommendations available.</Text>
			) : null}
			{cards.length > 0 ? (
				<Swipe
					key={segmentVersion}
					data={cards}
					prerenderItems={2}
					onSwipeLeft={(item, index) => {
						swipeLeft(item.movie, index);
					}}
					onSwipeRight={(item, index) => {
						swipeRight(item.movie, index);
					}}
					renderCard={(item, swipeLeft, swipeRight) => (
						<MovieCard
							{...item.card}
							onSwipeLeft={swipeLeft}
							onSwipeRight={swipeRight}
						/>
					)}
				/>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	},
	profileButton: {
		position: 'absolute',
		zIndex: 10
	},
});
