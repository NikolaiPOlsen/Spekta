/**
 * Renders a simple auth screen shell for login and signup routes.
 */

import { StyleSheet } from 'react-native';

import { ScreenWrapper } from '@/components/layout/screen-wrapper';
import { ThemedText } from '@/components/ui/themed-text';

type AuthScreenProps = {
  description: string;
  title: string;
};

export function AuthScreen({ description, title }: AuthScreenProps) {
  return (
    <ScreenWrapper style={styles.container}>
      <ThemedText type="title">{title}</ThemedText>
      <ThemedText style={styles.copy}>{description}</ThemedText>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    gap: 12,
  },
  copy: {
    maxWidth: 420,
  },
});
