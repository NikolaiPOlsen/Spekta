import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuthContext } from '@/hooks/use-auth-context';
import { Colors } from '@/themes/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AuthLayout() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const { isLoading, isLoggedIn } = useAuthContext();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isLoggedIn) {
    return <Redirect href="/(tabs)/home" />;
  }

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
