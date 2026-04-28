import { StyleSheet, Text, View } from 'react-native';

import { Swipe } from '@/features/swipe/components/swipe';
import { useMediaContext } from '@/hooks/use-media-context';
import type { RecommendationMovie } from '@/features/recommendations/types';

function toMovieCard(movie: RecommendationMovie) {
  const voteavg =
    typeof movie.vote_average === 'number' ? movie.vote_average.toFixed(1) : 'N/A';

  return {
    title: movie.name || 'Untitled',
    subtitle: movie.overview || 'No description available.',
    type: 'Movie',
    voteavg,
    poster: movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
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

            if (!movie || movie.name !== movieCard.title) {
              return;
            }

            void recordSwipe(movie, true);
          }}
          onSwipeLeft={(movieCard, index) => {
            const movie = recommendations[index];

            if (!movie || movie.name !== movieCard.title) {
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
