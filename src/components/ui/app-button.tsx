import { Dimensions, Pressable, StyleSheet, Text, useColorScheme } from 'react-native';
import { Colors } from '@/themes/colors';

// Type definition for the props of the AppButton component
type Props = {
    onPress: () => void;
    label: string;
    disabled?: boolean;
}

export default function AppButton({ onPress, label, disabled }: Props) {

    // Get the current color scheme (light or dark) and corresponding theme colors
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];
    return (

        // Pressable component to create a button that can be pressed, with styles that change when pressed or disabled
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={({ pressed }) => [
                styles.homeButton,
                {backgroundColor: themeColors.primary},
                (pressed || disabled) && {opacity: 0.5}
            ]}>
            {/*  Button label with themed text color and optional icon */}
            <Text style={[styles.buttonText, { color: themeColors.background }]}>{label}</Text>
        </Pressable>
    )
}

// Get the dimensions of the device screen for responsive styling
const { width, height } = Dimensions.get('window');

// Styles for the AppButton component
const styles = StyleSheet.create({
    buttonText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    homeButton: {
        height: height * 0.06,
        width: width * 0.6,
        borderRadius: 25,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: 400,
        marginBottom: 15,
    },
});
