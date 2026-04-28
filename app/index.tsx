import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuthContext } from '@/hooks/use-auth-context';

export default function IndexRoute() {
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

  return <Redirect href="/(auth)/start" />;
}
