/**
 * Renders a placeholder recommendations screen for curated movie suggestions.
 */

import { StyleSheet } from 'react-native';

import { ScreenWrapper } from '@/components/layout/screen-wrapper';
import { ThemedText } from '@/components/ui/themed-text';

export function RecommendationsScreen() {
  return (
    <ScreenWrapper style={styles.container}>
      <ThemedText type="title">Recommendations</ThemedText>
      <ThemedText>
        Recommendation queries, ranking logic, and UI should live inside this feature folder.
      </ThemedText>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    gap: 12,
  },
});
