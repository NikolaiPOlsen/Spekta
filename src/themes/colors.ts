/**
 * Defines the shared color and font tokens used throughout the app theme.
 */
import { Platform } from 'react-native';

const tintColorLight = '#89d6d6';
const tintColorDark = '#121414';
const lightPrimary = "#11181C";
const darkPrimary = "#ECEDEE";

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    backgroundDark: '#E7E7E7',
    buttonBackground: "#11181C",
    buttonText: "#ECEDEE",
    border: '#11181C',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    primary: lightPrimary,
    star: '#ffce47',
    mute: '#cfcfcf',
    white: '#fff',
    light: "#E7E7E7",
    dark: "#11181C",
    themeIsDark: false
  },
  dark: {
    text: '#ECEDEE',
    background: '#121314',
    backgroundDark: '#1b1e20',
    buttonBackground: "#ECEDEE",
    buttonText: "#ECEDEE",
    border: '#ECEDEE',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: darkPrimary,
    star: '#ffce47',
    mute: '#cfcfcf',
    white: '#fff',
    light: "#E7E7E7",
    dark: "#11181C",
    themeIsDark: true
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
