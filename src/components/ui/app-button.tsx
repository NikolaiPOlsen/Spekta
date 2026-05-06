import { Dimensions, Pressable, StyleSheet, Text, useColorScheme } from 'react-native';
import { Colors } from '@/themes/colors';
import { ComponentProps } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

// Type definition for the props of the AppButton component
export type Props = {
    onPress: () => void;
    label?: string;
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
            <Text style={[styles.deleteText, { color: '#FF0000' }]}>{label}</Text>
        </Pressable>
    )
}


type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];

export function ProfileButton({ onPress, disabled, icon }: Props & { icon: MaterialIconName }) {

    // Get the current color scheme (light or dark) and corresponding theme colors
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];
    return (

        // Pressable component to create a button that can be pressed, with styles that change when pressed or disabled
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={({ pressed }) => [
                styles.ProfileButton,
                {backgroundColor: themeColors.primary},
                (pressed || disabled) && {opacity: 0.5}
            ]}>
            <MaterialIcons name={icon} size={24} color={themeColors.white} />
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
    },
    ProfileButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderRadius: 100,
        width: height * 0.05,
        height: height * 0.05,
    }
});
