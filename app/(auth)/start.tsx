import { AppButton } from '@/components/ui/app-button';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/themes/colors';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StartScreen() {
	const colorScheme = useColorScheme();
	const themeColors = Colors[colorScheme ?? 'light'];

	const testEdgeFunc = async () => {
		try {
			const { data, error } = await supabase.functions.invoke("get-recommendations");
			if (error) throw error;

			// console.log(`it worked, data: ${JSON.parse(data)}`);
			console.log(JSON.stringify(data, null, 2));

		} catch (error) {
			if (error instanceof FunctionsHttpError) {
				const errorMessage = await error.context.json();
				console.error("Function returned error body:", errorMessage);
			} else {
				console.error("Unexpected error:", error);
			}
		}
	}

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
			<Text style={styles.title}>Get started!</Text>
			<View style={styles.actions}>
				{/* <Pressable style={[styles.button, { backgroundColor: themeColors.primary }]} onPress={() => router.push('/(auth)/login')}>
					<Text style={[styles.buttonText, { color: themeColors. }]}>Login</Text>
				</Pressable>
				<Pressable style={[styles.button, { backgroundColor: themeColors.primary }]} onPress={() => router.push('/(auth)/signup')}>
					<Text style={[styles.buttonText, { color: themeColors.text }]}>Sign up</Text>
				</Pressable> */}

				<AppButton label='Login' onPress={() => router.push('/(auth)/login')} ></AppButton>
				<AppButton label='Sign up' onPress={() => router.push('/(auth)/signup')} ></AppButton>

				<AppButton label='TEST FUNCTION' onPress={testEdgeFunc} ></AppButton>

			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		// paddingHorizontal: 24,
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
		gap: 12,
		alignItems: 'center'
	}
	// button: {
	// 	paddingVertical: 14,
	// 	borderRadius: 12,
	// 	backgroundColor: '#111827',
	// 	alignItems: 'center',
	// },
	// buttonText: {
	// 	color: '#ffffff',
	// 	fontSize: 16,
	// 	fontWeight: '600',
	// },
});
