import AppButton from '@/components/ui/app-button';
import { ThemedView } from '@/components/ui/themed-view';
import { Colors } from '@/themes/colors';
import { supabase } from '@/utils/supabase';
import { useState } from 'react';
import { Alert, Dimensions, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
    // Get the current color scheme (light or dark) and corresponding theme colors
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    // State variables for email, password, and loading state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Function to handle user login
     async function signIn() {

        // Set loading state to true while the login process is ongoing
        setLoading(true);

        // Call the Supabase signInWithPassword function with the email and password
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        // If there is an error during login, show an alert with the error message
        if (error) Alert.alert(error.message);

        // Set loading state to false after the login process is complete
        setLoading(false);
    }

    return (
        // SafeAreaView to ensure the content is displayed within the safe area of the device
        <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>

            {/* KeyboardAvoidingView to ensure the input fields are not hidden by the keyboard */}
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={100}>

                {/* ThemedView to apply theme colors to the login screen */}
                <ThemedView style={styles.container}>

                        {/* Login header text */}
                        <Text style={[styles.loginHeader, { color: themeColors.text }]}>Login</Text>

                        <View>

                            {/* Input fields for email and password with themed styles */}
                            <TextInput style={[styles.inputBox, { borderColor: themeColors.border, color: themeColors.text }]} placeholder='Email' value={email} onChangeText={setEmail} />
                            <TextInput style={[styles.inputBox, { borderColor: themeColors.border, color: themeColors.text }]} placeholder='Password' value={password} onChangeText={setPassword} secureTextEntry />
                        </View>

                        {/* Login button that calls the signIn function when pressed, and is disabled while loading */}
                        <AppButton onPress={signIn} label='Login' disabled={loading} />
                </ThemedView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

// Get the dimensions of the device screen for responsive styling
const { width, height } = Dimensions.get('window');

// Styles for the login screen
const styles = StyleSheet.create ({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputBox: {
        width: width * 0.6,
        height: height * 0.06,
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        borderRadius: 20,
        maxWidth: 400,
    },
    loginHeader: {
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: 15,
    },
});