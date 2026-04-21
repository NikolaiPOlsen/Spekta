import { Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function TabsLayout() {

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