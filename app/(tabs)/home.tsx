import { StyleSheet, Text, View } from 'react-native';

export default function HomeRoute() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spekta test screen</Text>
      <Text style={styles.copy}>The app now boots into a simple visible screen for Android emulator testing.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  copy: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
  },
});
