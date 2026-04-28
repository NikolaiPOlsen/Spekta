import { Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from 'react-native';
import { Colors } from '@/themes/colors';

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  return (
    <Tabs screenOptions={{ headerTitleAlign: 'center', tabBarActiveTintColor: themeColors.primary }}>
      <Tabs.Screen 
        name="bookmarks" 
        options={{ title: 'Bookmarks',headerShown: false, tabBarIcon: ({ color, size }) => 
        (<MaterialIcons name="bookmark" size={size} color={color} />), }} />
      <Tabs.Screen 
        name="home" 
        options={{ title: 'Home', headerShown: false, tabBarIcon: ({ color, size }) => 
        (<MaterialIcons name="home" size={size} color={color} />), }} />
      <Tabs.Screen 
        name="profile" 
        options={{ title: 'Profile', headerShown: false, tabBarIcon: ({ color, size }) => 
        (<MaterialIcons name="person" size={size} color={color} />), }} />
    </Tabs>
  );
}