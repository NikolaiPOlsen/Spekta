import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Swipe } from '@/features/swipe/components/swipe';
import { MovieCardProps } from '@/features/swipe/components/movie-card';

export default function HomeRoute() {
const { width, height } = useWindowDimensions();

const MOVIES: MovieCardProps[] = [
  { title: 'Interstellar', subtitle: 'A team of explorers travel through a wormhole in space.', type: 'Movie', voteavg: '8.6', poster: 'https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bAY4deknql9Ph7Fk.jpg' },
  { title: 'Dune', subtitle: 'A noble family becomes embroiled in a war for control over the galaxy.', type: 'Movie', voteavg: '7.9' },
];

  return (
    <View style={styles.container}>
      <Swipe data={MOVIES} />
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