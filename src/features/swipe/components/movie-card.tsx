/**
 * Renders a simple reusable movie card for movie-related UI.
 */

import { StyleSheet, View, Text, ImageBackground, useColorScheme, Pressable } from 'react-native';
import { useState } from 'react';
import { TextStyles } from '@/constants/text-style';
import { Colors } from '@/themes/colors'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { MovieModal } from '@/features/movies/components/movie-modal';
import { SwipeButton } from './swipe-button';

export type MovieCardProps = {
	title: string;
	subtitle: string;
	poster?: string;
	type: string;
	voteavg: string;
	onSwipeLeft?: () => void;
	onSwipeRight?: () => void;
};

export function MovieCard({ subtitle, title, poster, voteavg, type, onSwipeLeft, onSwipeRight }: MovieCardProps) {
	const colorScheme = useColorScheme();
	const themeColors = Colors[colorScheme ?? 'light'];
	const [modalVisible, setModalVisible] = useState(false);

	return (
		<View style={{ flex: 1 }}>
			<Pressable style={{ flex: 1 }} onPress={() => setModalVisible(true)}>
				<ImageBackground
					source={poster ? { uri: poster } : undefined}
					style={styles.card}
					resizeMode="cover"
				>
					<View style={styles.overlay}>
						<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
							<Text style={[TextStyles.cardTitle, { color: themeColors.white }]}>{title}</Text>
						</View>
						<Text style={[TextStyles.cardType, { color: themeColors.mute }]}>{type}</Text>
						<Text style={[TextStyles.cardInfo, { color: themeColors.mute }]} numberOfLines={3}>{subtitle}</Text>
						<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
							<View style={{ flexDirection: 'row', gap: 5 }}>
								<MaterialIcons name="star-rate" size={24} color={themeColors.star} />
								<Text style={[TextStyles.cardRating, { color: themeColors.star }]}>{voteavg}</Text>
							</View>
							<View style={{ flexDirection: 'row', gap: 12 }}>
								<SwipeButton onPress={() => onSwipeLeft?.()} icon="thumb-down" />
								<SwipeButton onPress={() => onSwipeRight?.()} icon="thumb-up" />
							</View>
						</View>
					</View>
				</ImageBackground>
			</Pressable>

			<MovieModal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
				movieTitle={title}
				movieDescription={subtitle}
				imageUrl={poster ?? ''}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		flex: 1,
		overflow: 'hidden',
		borderRadius: 16
	},
	overlay: {
		flex: 1,
		justifyContent: 'flex-end',
		padding: 16,
		gap: 4,
		backgroundColor: 'rgba(0,0,0,0.35)',
	},
});