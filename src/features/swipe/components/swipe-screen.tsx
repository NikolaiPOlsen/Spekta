/**
 * Renders a placeholder swipe screen for the movie matching flow.
 */

import { StyleSheet } from 'react-native';

import { ScreenWrapper } from '@/components/layout/screen-wrapper';
import { ThemedText } from '@/components/ui/themed-text';

export function SwipeScreen() {
  return (
    <ScreenWrapper style={styles.container}>
      <ThemedText type="title">Swipe</ThemedText>
      <ThemedText>Swipe queue components and hooks should stay local to this feature.</ThemedText>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    gap: 12,
  },
});
