import { Modal, View, Text, Image, useColorScheme, StyleSheet } from 'react-native';
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
                    <Image source={{ uri: imageUrl }} style={{ width: '100%', height: 400, borderRadius: 10 }} />
                    <Text style={[TextStyles.sectionTitle, { color: themeColors.text, marginTop: 10 }]}>{movieTitle}</Text>
                    <Text style={[TextStyles.sectionSubTitle, { color: themeColors.text , textAlign: 'left' }]}>{movieDescription}</Text>
                    <AppButton label="Close" onPress={onClose} />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    inner: {
        width: '90%',
        padding: 20,
        borderRadius: 25,
        textAlign: 'left',
        alignItems: 'center',
        gap: 8
    },
});