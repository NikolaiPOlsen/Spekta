import { AppButton } from '@/components/ui/app-button';
import { Colors } from '@/themes/colors';
import { router } from 'expo-router';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StartScreen() {
	const colorScheme = useColorScheme();
	const themeColors = Colors[colorScheme ?? 'light'];

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
			<Text style={[styles.title, { color: themeColors.text }]}>Get started!</Text>
			<View style={styles.actions}>

				<AppButton label='Login' onPress={() => router.push('/(auth)/login')} ></AppButton>
				<AppButton label='Sign up' onPress={() => router.push('/(auth)/signup')} ></AppButton>

			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#ffffff'
	},
	title: {
		fontSize: 28,
		fontWeight: '700',
		color: '#111827',
		marginBottom: 20
	},
	actions: {
		width: '100%',
		gap: 8,
		alignItems: 'center'
	}
});
