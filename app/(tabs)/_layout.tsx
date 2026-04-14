import { Colors } from '@/themes/colors';
import { useAuthContext } from '@/hooks/use-auth-context';
import AuthProvider from '@/providers/auth-provider';
import { Redirect, Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export function RootNavigation() {
  const { isLoggedIn, isLoading } = useAuthContext();

  if (isLoading) return null;

  if (!isLoggedIn) {
    return <Redirect href={"/(auth)/start"}/>;
  }
  if (isLoggedIn) {
    //return <Redirect href={"/(tabs)/home"}/>;
  }
}
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  return (
    <AuthProvider>
        <Stack>
          <Stack.Screen name='(auth)' options={{ headerShown: false }}/>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }}/>
        </Stack>
        <RootNavigation/>
    </AuthProvider>
  );
}