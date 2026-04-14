import AppButton from '@/components/ui/app-button';
import { Colors } from '@/themes/colors';
import { router } from 'expo-router';
import { Dimensions, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StartScreen() {
    // Get the current color scheme (light or dark) and corresponding theme colors
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    return (
        // SafeAreaView to ensure the content is displayed within the safe area of the device
        <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>

            {/* Hero title */}
            <Text style={styles.herotitle}>Spekta</Text>

            <View>
                {/* Navigate to the login screen when the button is pressed */}
                <AppButton onPress={() => router.push("/(auth)/login")} label="Login"/>

                {/* Navigate to the signup screen when the button is pressed */}
                <AppButton onPress={() => router.push("/(auth)/signup")} label="Create Account"/>
            </View>
        </SafeAreaView>
    )
}

// Get the dimensions of the device screen for responsive styling
const { width, height } = Dimensions.get('window');

// Styles for the start screen
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    herotitle: {
        fontSize: width * 0.10,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
    },
})