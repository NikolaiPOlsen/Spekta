import { InputField, PasswordField } from "@/components/ui/input-field";
import { useState } from "react";
import { Alert, View, StyleSheet, Text, KeyboardAvoidingView, Platform, useColorScheme } from 'react-native';
import { TextStyles } from '@/constants/text-style';
import { AppButton } from "@/components/ui/app-button";
import { supabase } from '@/lib/supabase';
import { Colors } from "@/themes/colors";
import { useAuthContext } from "@/hooks/use-auth-context";

async function signOut() {
	await supabase.auth.signOut();
}

export default function ProfileRoute() {
	const colorScheme = useColorScheme();
	const themeColors = Colors[colorScheme ?? 'light'];

	const { claims } = useAuthContext();
	const placeholderDisplayName = claims?.user_metadata?.display_name;
	const placeholderEmail = claims?.email;

	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmpassword, setConfirmPassword] = useState('');

	const hasChanges = !!(username || email || password || confirmpassword);

	async function updateProfile() {
		if (password && password !== confirmpassword) {
			Alert.alert('Passwords do not match');
			return;
		}

		const updates: Parameters<typeof supabase.auth.updateUser>[0] = {};

		if (username) updates.data = { display_name: username };
		if (email) updates.email = email;
		if (password) updates.password = password;

		const { error } = await supabase.auth.updateUser(updates);
		if (error) {
			Alert.alert(error.message);
		} else {
			Alert.alert('Profile updated!');
			setUsername('');
			setEmail('');
			setPassword('');
			setConfirmPassword('');
		}
	}

	const hasUsername = username != "";

	return (
		<KeyboardAvoidingView
			style={{ flex: 1, width: '100%' }}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			keyboardVerticalOffset={0}>

			<View style={styles.container}>
				<View style={styles.inner}>
					<Text style={[TextStyles.sectionTitle, { color: themeColors.text }]}>Profile</Text>

					<Text style={[TextStyles.inputLabel, { color: themeColors.text }]}>Displayname</Text>
					<InputField name={hasUsername ? placeholderDisplayName : "Display name"} value={username} onChange={setUsername} />

					<Text style={[TextStyles.inputLabel, { color: themeColors.text }]}>Email</Text>
					<InputField name={placeholderEmail} value={email} onChange={setEmail} />

					<Text style={[TextStyles.inputLabel, { color: themeColors.text }]}>Password</Text>
					<PasswordField name='Password' value={password} onChange={setPassword} />

					<Text style={[TextStyles.inputLabel, { color: themeColors.text }]}>Confirm password</Text>
					<PasswordField name='Confirm password' value={confirmpassword} onChange={setConfirmPassword} />
				</View>

				{hasChanges && (
					<AppButton label='Save changes' onPress={updateProfile} />
				)}

				<AppButton label='Signout' onPress={signOut} disabled={hasChanges} />
			</View>
		</KeyboardAvoidingView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
	},
	inner: {
		width: '90%',
	},
})
