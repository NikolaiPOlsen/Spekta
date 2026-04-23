import { Stack } from 'expo-router';
import { Colors } from '@/themes/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AuthLayout() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  console.log(`COLOR THEME: ${colorScheme}`);

  return (
    <Stack initialRouteName="start" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="start" options={{ headerShown: false }} />
      <Stack.Screen
        name="login"
        options={{
          headerShown: true,
          headerBackTitle: 'Back',
          title: 'Login',
          headerTintColor: themeColors.text,
          headerStyle: { backgroundColor: themeColors.background },
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          headerShown: true,
          headerBackTitle: 'Back',
          title: 'Signup',
          headerTintColor: themeColors.text,
          headerStyle: { backgroundColor: themeColors.background },
        }}
      />
    </Stack>
  );
}
