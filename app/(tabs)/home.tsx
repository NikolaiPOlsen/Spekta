import { StyleSheet, Text, View } from 'react-native';

import { Swipe } from '@/features/swipe/components/swipe';
import { useMediaContext } from '@/hooks/use-media-context';
import type { RecommendationMovie } from '@/features/recommendations/types';

function toMovieCard(movie: RecommendationMovie) {
  const voteavg =
    typeof movie.voteAverage === 'number' ? movie.voteAverage.toFixed(1) : 'N/A';

  return {
    title: movie.title || 'Untitled',
    subtitle: movie.overview || 'No description available.',
    type: 'Movie',
    voteavg,
    poster: movie.posterPath
      ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
      : undefined,
  };
}

export default function HomeRoute() {
  const { recommendations, isLoading, error, recordSwipe } = useMediaContext();

  const cards = recommendations.map(toMovieCard);

  return (
    <View style={styles.container}>
      {isLoading ? <Text>Loading recommendations...</Text> : null}
      {error ? <Text>{error}</Text> : null}
      {!isLoading && !error && cards.length === 0 ? (
        <Text>No recommendations available.</Text>
      ) : null}
      {cards.length > 0 ? (
        <Swipe
          data={cards}
          onSwipeRight={(movieCard, index) => {
            const movie = recommendations[index];

            if (!movie || movie.title !== movieCard.title) {
              return;
            }

            void recordSwipe(movie, true);
          }}
          onSwipeLeft={(movieCard, index) => {
            const movie = recommendations[index];

            if (!movie || movie.title !== movieCard.title) {
              return;
            }

            void recordSwipe(movie, false);
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
