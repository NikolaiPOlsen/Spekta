/**
 * Renders a placeholder movie detail screen for a selected movie route.
 */

import { StyleSheet } from 'react-native';

import { ScreenWrapper } from '@/components/layout/screen-wrapper';
import { ThemedText } from '@/components/ui/themed-text';
import { formatRuntime } from '@/utils/format-runtime';

type MovieDetailScreenProps = {
  movieId: string;
};

export function MovieDetailScreen({ movieId }: MovieDetailScreenProps) {
  return (
    <ScreenWrapper style={styles.container}>
      <ThemedText type="title">Movie {movieId}</ThemedText>
      <ThemedText type="subtitle">Runtime placeholder: {formatRuntime(126)}</ThemedText>
      <ThemedText>
        Replace this screen with real Supabase-backed movie details when the movies service is ready.
      </ThemedText>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
});
