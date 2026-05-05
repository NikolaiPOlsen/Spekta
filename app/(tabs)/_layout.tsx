import { Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useColorScheme } from 'react-native';
import { Colors } from '@/themes/colors';

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  return (
    <Stack screenOptions={{ headerTitleAlign: 'center' }}>
      <Stack.Screen
        name="home"
        options={{
          title: 'Home',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}