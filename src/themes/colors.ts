/**
 * Defines the shared color and font tokens used throughout the app theme.
 */
import { Platform } from 'react-native';

const tintColorLight = '#0a92a4';
const tintColorDark = '#0a92a4';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    backgroundDark: '#E7E7E7',
    border: '#11181C',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    primary: tintColorLight,
    star: '#ffce47',
    mute: '#cfcfcf',
    white: '#fff'
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    backgroundDark: '#0B0D0D',
    border: '#ECEDEE',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: tintColorDark,
    star: '#ffce47',
    mute: '#cfcfcf',
    white: '#fff'
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
