import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { MovieCard } from '@/features/swipe/components';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeRoute() {
const { width, height } = useWindowDimensions();

  return (
    <SafeAreaView style={[styles.container, { height: height, width: width }]}>
      <MovieCard title='Interstellar' subtitle='ahahahahahahhahahahahahhahahaahahahahahahhahahahahahhahahaahahahahahahhahahahahahhahahaahahahahahahhahahahaahahaha' type='Movie' voteavg='4.7' poster='https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bAY4deknql9Ph7Fk.jpg'/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 12,
    },

});