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
		console.log("testing function");

		try {
			const { data, error } = await supabase.functions.invoke("get-recommendations");
			console.log("got something");
			if (error) throw error;

			console.log(JSON.stringify(data, null, 2));

		} catch (error) {
			console.log("error");
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
