/**
 * Renders a placeholder profile screen for user-specific account UI.
 */

import { StyleSheet } from 'react-native';

import { ScreenWrapper } from '@/components/layout/screen-wrapper';
import { ThemedText } from '@/components/ui/themed-text';

export function ProfileScreen() {
  return (
    <ScreenWrapper style={styles.container}>
      <ThemedText type="title">Profile</ThemedText>
      <ThemedText>Profile services, hooks, and types should stay local to this feature.</ThemedText>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    gap: 12,
  },
});
