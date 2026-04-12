/**
 * Renders a simple reusable movie card for movie-related UI.
 */

import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';

type MovieCardProps = {
  subtitle: string;
  title: string;
};

export function MovieCard({ subtitle, title }: MovieCardProps) {
  return (
    <View style={styles.card}>
      <ThemedText type="defaultSemiBold">{title}</ThemedText>
      <ThemedText>{subtitle}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9E0E5',
    padding: 16,
    gap: 6,
  },
});
