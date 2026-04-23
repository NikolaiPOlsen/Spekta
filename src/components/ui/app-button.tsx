import { Dimensions, Pressable, StyleSheet, Text, useColorScheme } from 'react-native';
import { Colors } from '@/themes/colors';

// Type definition for the props of the AppButton component
type Props = {
    onPress: () => void;
    label: string;
    disabled?: boolean;
}

export function AppButton({ onPress, label, disabled }: Props) {

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

export function DeleteButton({ onPress, label, disabled }: Props) {

    // Get the current color scheme (light or dark) and corresponding theme colors
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];
    return (

        // Pressable component to create a button that can be pressed, with styles that change when pressed or disabled
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={({ pressed }) => [
                styles.deleteButton,
                (pressed || disabled) && {opacity: 0.5}
            ]}>
            {/*  Button label with themed text color and optional icon */}
            <Text style={[styles.deleteText, { color: '#FF0000' }]}>{label}</Text>
        </Pressable>
    )
}

const { width, height } = Dimensions.get('window');

// Styles for the AppButton component
const styles = StyleSheet.create({
    buttonText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    homeButton: {
        width: '90%',
        height: height * 0.06,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        // maxWidth: 350,
    },
    deleteButton: {
        textAlign: 'center',
        marginBottom: 8,
        paddingHorizontal: 12,
    },    
    deleteText: {
        fontSize: 16,
    }
});
