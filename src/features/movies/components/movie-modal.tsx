import { Modal, View, Text, Image, ScrollView, useColorScheme, StyleSheet, Dimensions } from 'react-native';
import { TextStyles } from '@/constants/text-style';
import { Colors } from "@/themes/colors";
import { AppButton } from '@/components/ui/app-button';

interface MovieModalProps {
    visible: boolean;
    onClose: () => void;
    movieTitle: string;
    movieDescription: string;
    imageUrl: string;
}

export const MovieModal: React.FC<MovieModalProps> = ({ visible, onClose, movieTitle, movieDescription, imageUrl }) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View style={[styles.inner, { backgroundColor: themeColors.background }]}>
                    <Image source={{ uri: imageUrl }} style={{ width: '100%', height: height * 0.35, borderRadius: 10 }} />
                    <Text style={[TextStyles.sectionTitle, { color: themeColors.text, marginTop: 10 }]}>{movieTitle}</Text>
                    <ScrollView style={{ flex: 1, width: '100%' }}>
                        <Text style={[TextStyles.sectionSubTitle, { color: themeColors.text, textAlign: 'left' }]}>{movieDescription}</Text>
                    </ScrollView>
                    <AppButton label="Close" onPress={onClose} />
                </View>
            </View>
        </Modal>
    );
}

const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    inner: {
        height: height * 0.9,
        width: width * 0.9,
        padding: 20,
        borderRadius: 25,
        textAlign: 'left',
        alignItems: 'center',
        gap: 8
    },
});