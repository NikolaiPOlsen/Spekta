/**
 * Renders the home route inside the main tab navigator.
 */

import { StyleSheet } from 'react-native';

import { ScreenWrapper } from '@/components/layout/screen-wrapper';
import { HelloWave } from '@/components/ui/hello-wave';
import { ThemedText } from '@/components/ui/themed-text';
import { APP_NAME } from '@/constants/app';
import { MovieCard } from '@/features/movies/components';

export default function HomeRoute() {
  return (
    <ScreenWrapper style={styles.container}>
      <HelloWave />
      <ThemedText type="title">Welcome to {APP_NAME}</ThemedText>
      <ThemedText>
        This route stays in `app/`, while feature-specific UI and data logic move into `src/features`.
      </ThemedText>
      <MovieCard title="Starter movie card" subtitle="Shared movie UI belongs in the movies feature." />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
});
