import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, View, useColorScheme } from 'react-native';

import { useAuthContext } from '@/hooks/use-auth-context';
import { Colors } from '@/themes/colors';

export default function TabsLayout() {
  const { isLoading, isLoggedIn } = useAuthContext();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!isLoggedIn) {
    return <Redirect href="/(auth)/start" />;
  }

  return (
    <Tabs screenOptions={{ headerTitleAlign: 'center', tabBarActiveTintColor: themeColors.primary }}>
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'Bookmarks',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <MaterialIcons name="bookmark" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <MaterialIcons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
