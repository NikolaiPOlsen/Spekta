/**
 * Wraps screens in shared spacing and theme-aware background styling.
 */

import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeColor } from '@/hooks/use-theme-color';

type ScreenWrapperProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

export function ScreenWrapper({ children, style }: ScreenWrapperProps) {
  const backgroundColor = useThemeColor({}, 'background');

  return <SafeAreaView style={[styles.container, { backgroundColor }, style]}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
});
