import { TextInput, useColorScheme, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Colors } from '@/themes/colors'
import { SearchButton } from './search-button';

type searchProps = {
    value: string;
    onChange: (text: string) => void;
}

export function SearchBar({ value, onChange }: searchProps) {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    const { width, height } = useWindowDimensions();

    const inputHeight = Math.round(height * 0.06);

    return (
        <View style={[{ flexDirection: 'row' }]}>
            <TextInput
                placeholder='Search'
                placeholderTextColor={themeColors.icon}
                style={[styles.inputBox, { backgroundColor: themeColors.backgroundDark, color: themeColors.text, height: inputHeight }]}
                value={value}
                onChangeText={onChange}
            />
            <SearchButton icon="search" onPress={() => false} />
        </View>
    )
}

const styles = StyleSheet.create({
    inputBox: {
        marginTop: 10,
        marginBottom: 18,
        paddingHorizontal: 12,
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
        fontSize: 16,
        maxWidth: 380,
        width: '80%',
    },
});