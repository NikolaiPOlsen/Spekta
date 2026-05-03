import { AppButton } from '@/components/ui/app-button';
import { Colors } from '@/themes/colors';
import { TextStyles } from '@/constants/text-style';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { InputField, PasswordField } from '@/components/ui/input-field'

export default function LoginScreen() {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];


    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function signIn() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) Alert.alert(error.message);
        setLoading(false);
    }

    return (
            <KeyboardAvoidingView style={{ flex: 1, width: "100%", backgroundColor: themeColors.background }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >

                <View style={styles.container}>
                    <View style={styles.inner}>
                        <Text style={[TextStyles.sectionTitle, { color: themeColors.primary, textAlign: 'center' }]}>Login</Text>
                        <Text style={[TextStyles.sectionSubTitle, { color: themeColors.text }]}>Welcome back! Login to continue where you left off.</Text>

                        <InputField name='Email' value={email} onChange={setEmail} />

                        <PasswordField name='Password' value={password} onChange={setPassword} />

                    </View>
                    <AppButton onPress={signIn} label='Login' disabled={loading} />
                </View>
            </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create ({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inner: {
        width: '90%',
    },
});
