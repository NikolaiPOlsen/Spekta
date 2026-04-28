import { Dimensions, Pressable, StyleSheet, Text, useColorScheme, useWindowDimensions } from 'react-native';
import { type ComponentProps } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/themes/colors';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

// Type definition for the props of the AppButton component
type Props = {
    onPress: () => void;
    icon?: MaterialIconName;
    disabled?: boolean;
}

export function SearchButton({ onPress, icon, disabled }: Props) {

    // Get the current color scheme (light or dark) and corresponding theme colors
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    const { width, height } = useWindowDimensions();
    const inputHeight = Math.round(height * 0.06);

    return (

        // Pressable component to create a button that can be pressed, with styles that change when pressed or disabled
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={({ pressed }) => [
                styles.searchButton,
                {backgroundColor: themeColors.primary, height: inputHeight},
                (pressed || disabled) && {opacity: 0.5}
            ]}>
            <MaterialIcons name={icon} size={24} color={themeColors.background} />
        </Pressable>
    )
}

const { width, height } = Dimensions.get('window');

// Styles for the button component
const styles = StyleSheet.create({
    searchButton: {
        marginTop: 10,
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 50,
    }
});
