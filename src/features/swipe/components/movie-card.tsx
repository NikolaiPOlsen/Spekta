/**
 * Renders a simple reusable movie card for movie-related UI.
 */

import { StyleSheet, View, Text, ImageBackground, useWindowDimensions, useColorScheme, Pressable } from 'react-native';
import { TextStyles } from '@/constants/text-style';
import { Colors } from '@/themes/colors'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export type MovieCardProps = {
  title: string;
  subtitle: string;
  poster?: string;
  type: string;
  voteavg: string;
};

export function MovieCard({ subtitle, title, poster, voteavg, type }: MovieCardProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.shadow}>
      <ImageBackground
        source={poster ? { uri: poster } : undefined}
        style={styles.card}
        imageStyle={styles.cardImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={[TextStyles.cardTitle, { color: themeColors.white }]}>{title}</Text>
            <View style={{ flexDirection: 'row', gap: 5 }}>
              <MaterialIcons name="star-rate" size={24} color={themeColors.star} />
              <Text style={[TextStyles.cardRating, { color: themeColors.star }]}>{voteavg}</Text>
            </View>
          </View>
          <Text style={[TextStyles.cardType, { color: themeColors.mute }]}>{type}</Text>
          <Text style={[TextStyles.cardInfo, { color: themeColors.mute }]} numberOfLines={3}>{subtitle}</Text>
        </View>

        <Pressable style={styles.infoButton} onPress={() => false}>
          <MaterialIcons name='info' size={24} color={themeColors.white} />
        </Pressable>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    flex: 1,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  card: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardImage: {
    borderRadius: 24,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  infoButton: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
});