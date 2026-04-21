import { TextInput, useColorScheme, StyleSheet, useWindowDimensions } from 'react-native';
import { Colors } from '@/themes/colors'

type inputProps = {
    name: string;
    value: string;
    onChange: (text: string) => void;
}

export function InputField({ name, value, onChange }: inputProps) {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    const { width, height } = useWindowDimensions();

    const inputHeight = Math.round(height * 0.06);

    return (
        <TextInput
            placeholder={name}
            placeholderTextColor={themeColors.icon}
            style={[styles.inputBox, styles.inputBoxPortrait, { backgroundColor: themeColors.backgroundDark, color: themeColors.text, height: inputHeight }]}
            value={value}
            onChangeText={onChange}
        />
    )
}

export function PasswordField({ name, value, onChange }: inputProps) {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    const { width, height } = useWindowDimensions();

    const inputHeight = Math.round(height * 0.06);

    return (
        <TextInput
            placeholder={name}
            placeholderTextColor={themeColors.icon}
            style={[styles.inputBox, styles.inputBoxPortrait, { backgroundColor: themeColors.backgroundDark, color: themeColors.text, height: inputHeight }]}
            value={value}
            onChangeText={onChange}
            secureTextEntry
        />
    )
}

const styles = StyleSheet.create({
    inputBox: {
        marginBottom: 18,
        paddingHorizontal: 14,
        borderRadius: 12,
        fontSize: 16,
        maxWidth: 380,
    },
    inputBoxPortrait: {
        maxWidth: undefined,
        width: '100%',
    }
});