import { StyleSheet, Text, View } from 'react-native';

import { Swipe } from '@/features/swipe/components/swipe';
import { MovieCard, type MovieCardProps } from '@/features/swipe/components/movie-card';
import { useMediaContext } from '@/hooks/use-media-context';
import type { RecommendationMovie } from '@/features/recommendations/types';

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
  const { recommendations, isLoading, error, recordSwipe } = useMediaContext();

  const cards = recommendations.map(toRecommendationCard);

  return (
    <View style={styles.container}>
      {isLoading ? <Text>Loading recommendations...</Text> : null}
      {error ? <Text>{error}</Text> : null}
      {!isLoading && !error && cards.length === 0 ? (
        <Text>No recommendations available.</Text>
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
});
