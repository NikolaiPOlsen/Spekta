import { Stack } from 'expo-router';
import { Colors } from '@/themes/colors';
import { useColorScheme } from '@/hooks/use-color-scheme.web';

export default function authLayout() {
    // Get the current color scheme (light or dark) and corresponding theme colors
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];
    return (
        // Stack navigator to manage the authentication flow with initial route set to "start" and header hidden for all screens
        <Stack initialRouteName="start" screenOptions={{ headerShown: false }}>

            // The different auth screens: start, login and signup
            <Stack.Screen name='start' options={{ headerShown: false }}/>
            <Stack.Screen name='login' options={{ headerShown: true, headerBackTitle: 'Back', title: 'Login', headerTintColor: themeColors.text, headerStyle: { backgroundColor: themeColors.background } }}/>
            <Stack.Screen name='signup' options={{ headerShown: true, headerBackTitle: 'Back', title: 'Signup', headerTintColor: themeColors.text, headerStyle: { backgroundColor: themeColors.background } }}/>
        </Stack>
    )
}