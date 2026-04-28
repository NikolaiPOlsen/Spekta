import { Redirect, Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ActivityIndicator, View } from 'react-native';

import { useAuthContext } from '@/hooks/use-auth-context';

export default function TabsLayout() {
  const { isLoading, isLoggedIn } = useAuthContext();

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
    <Tabs screenOptions={{ headerTitleAlign: 'center', }}>
      <Tabs.Screen 
        name="home" 
        options={{ title: 'Home', headerShown: false, tabBarIcon: ({ color, size }) => 
        (<MaterialIcons name="home" size={size} color={color} />), }} />
      <Tabs.Screen 
        name="search" 
        options={{ title: 'Search', headerShown: false, tabBarIcon: ({ color, size }) => 
        (<MaterialIcons name="search" size={size} color={color} />), }} />
      <Tabs.Screen 
        name="bookmarks" 
        options={{ title: 'Bookmarks',headerShown: false, tabBarIcon: ({ color, size }) => 
        (<MaterialIcons name="bookmark" size={size} color={color} />), }} />
      <Tabs.Screen 
        name="profile" 
        options={{ title: 'Profile', headerShown: false, tabBarIcon: ({ color, size }) => 
        (<MaterialIcons name="person" size={size} color={color} />), }} />
    </Tabs>
  );
}
