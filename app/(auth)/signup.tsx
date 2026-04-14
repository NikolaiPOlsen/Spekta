import AppButton from '@/components/ui/app-button';
import { Colors } from '@/themes/colors';
import { supabase } from '@/utils/supabase';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Dimensions, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignupScreen() {
    // Get the current color scheme (light or dark) and corresponding theme colors
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    // State variables for email, display name, password, password confirmation, and loading state
    const [email, setEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');
    const [repassword, setRePassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Function to handle user registration
    async function signUp() {

        // Set loading state to true while the registration process is ongoing
        setLoading(true);

        // Check if the password and password confirmation match
        if (password === repassword){
        
        // Call the Supabase signUp function with the email, password, and display name
        const { error } = await supabase.auth.signUp({ email, password, options: {data: { display_name: displayName }}});

        // Set loading state to false after the registration process is complete
        setLoading(false);

        // If there is an error during registration, show an alert with the error message
        if (error) Alert.alert(error.message);
        else {
            // If registration is successful, show an alert asking the user to verify their email and navigate to the login screen
            Alert.alert("Please verify your email");

            // Navigate to the login screen
            router.push('/(auth)/login');
        }
        }
        else {
            // Set loading state to false if the password and password confirmation do not match
            setLoading(false);

            // If the password and password confirmation do not match, show an alert indicating the mismatch
            Alert.alert('Password does not match')
        }
    }

    return (
        // SafeAreaView to ensure the content is displayed within the safe area of the device
        <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>

            {/* KeyboardAvoidingView to ensure the input fields are not hidden by the keyboard */}
            <KeyboardAvoidingView style={{ alignItems: 'center' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={100}>

                {/* Header text for the registration screen */}
                <Text style={styles.headerText}>Register account</Text>

                {/* Input fields for display name, email, password, and password confirmation */}
                <TextInput style={[styles.textInputBox, { borderColor: themeColors.border }]} placeholder={"Displayname"} onChangeText={setDisplayName}></TextInput>
                <TextInput style={[styles.textInputBox, { borderColor: themeColors.border }]} placeholder={"Email"} onChangeText={setEmail}></TextInput>
                <TextInput style={[styles.textInputBox, { borderColor: themeColors.border }]} placeholder={"Password"} onChangeText={setPassword} secureTextEntry={true}></TextInput>
                <TextInput style={[styles.textInputBox, { borderColor: themeColors.border }]} placeholder={"Re-enter password"} onChangeText={setRePassword} secureTextEntry={true}></TextInput>

                {/* Call the signUp function when the button is pressed */}
                <AppButton onPress={signUp} label="Register account"/>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

// Get the dimensions of the device screen for responsive styling
const { width, height } = Dimensions.get('window');

// Styles for the registration screen
const styles = StyleSheet.create ({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
        headerText: {
        fontSize: width * 0.08,
        fontWeight: 'bold',
        marginBottom: 15,
    },
        textInputBox: {
        width: width * 0.6,
        height: height * 0.06,
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        borderRadius: 20,
        maxWidth: 400,
    },
})