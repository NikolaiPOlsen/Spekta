import { AppButton } from '@/components/ui/app-button';
import { Colors } from '@/themes/colors';
import { TextStyles } from '@/constants/text-style';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import * as expo from 'expo-router';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { InputField, PasswordField } from '@/components/ui/input-field'

export default function SignUpScreen() {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];


    const [email, setEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');
    const [repassword, setRePassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function signUp() {
        setLoading(true);
        if (password === repassword){
        const { error } = await supabase.auth.signUp({ email, password, options: {data: { display_name: displayName }}});
        setLoading(false);
        if (error) Alert.alert(error.message);
        else {
            Alert.alert("Please verify your email");
            expo.router.push('/(auth)/login');
        }
        }
        else {
            setLoading(false);
            Alert.alert('Password does not match')
        }
    }

    return (
            <KeyboardAvoidingView style={{ flex: 1, backgroundColor: themeColors.background }} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={80}
            >

                <View style={styles.container}>
                    <View style={styles.inner}>
                        <Text style={[TextStyles.sectionTitle, { color: themeColors.primary, textAlign: 'center' }]}>Sign up</Text>
                        <Text style={[TextStyles.sectionSubTitle, { color: themeColors.text }]}>Sign up to get started!</Text>

                        <InputField name='Displayname' value={displayName} onChange={setDisplayName} />
                        <InputField name='Email' value={email} onChange={setEmail} />

                        <PasswordField name='Password' value={password} onChange={setPassword} />
                        <PasswordField name='Confirm password' value={repassword} onChange={setRePassword} />

                    </View>
                    <AppButton onPress={signUp} label='Sign up' disabled={loading} />
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
