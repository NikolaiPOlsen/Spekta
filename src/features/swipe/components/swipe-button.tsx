import { useColorScheme, StyleSheet, Dimensions } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import type { Props } from "@/components/ui/app-button";
import { Colors } from "@/themes/colors";
import { MaterialIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];

export function SwipeButton({ onPress, disabled, icon }: Props & { icon: MaterialIconName }) {

    // Get the current color scheme (light or dark) and corresponding theme colors
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];
    return (

        // Pressable component to create a button that can be pressed, with styles that change when pressed or disabled
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={({ pressed }) => [
                styles.SwipeButton,
                {backgroundColor: themeColors.primary},
                (pressed || disabled) && {opacity: 0.5}
            ]}>
            <MaterialIcons name={icon} size={24} color={themeColors.white} />
        </Pressable>
    )
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    buttonText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    SwipeButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        paddingHorizontal: 12,
        borderRadius: 100,
        width: height * 0.075,
        height: height * 0.075,
    }
});