import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Login screen</Text>
        <Text style={styles.copy}>This route is intentionally minimal until the real auth flow is wired back in.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  copy: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
  },
});
