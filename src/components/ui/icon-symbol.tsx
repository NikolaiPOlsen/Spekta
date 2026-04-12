/**
 * Renders cross-platform symbols by mapping SF Symbols to Material Icons outside iOS.
 */

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - See Material Icons in the Icons Directory: https://icons.expo.fyi.
 * - See SF Symbols in Apple's SF Symbols app.
 */
const MAPPING = {
  'chevron.right': 'chevron-right',
  'film.fill': 'movie',
  'hand.thumbsup.fill': 'thumb-up',
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'person.fill': 'person',
  sparkles: 'auto-awesome',
} as IconMapping;

/**
 * Uses SF Symbol names while rendering platform-appropriate icons across iOS, Android, and web.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
