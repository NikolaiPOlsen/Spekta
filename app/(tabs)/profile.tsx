import { InputField, PasswordField } from "@/components/ui/input-field";
import { useState } from "react";
import { View, StyleSheet, Text, useWindowDimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TextStyles } from '@/constants/text-style';
import { AppButton } from "@/components/ui/app-button";
import { supabase } from '@/lib/supabase';

async function signOut() {
        await supabase.auth.signOut();
    }

export default function ProfileRoute() {
  const { width, height } = useWindowDimensions();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfirmPassword] = useState('');

  return (
      <KeyboardAvoidingView 
        style={{ flex: 1, width: '100%' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        keyboardVerticalOffset={0}>

        <View style={styles.container}>
          <View style={styles.inner}>
            <Text style={TextStyles.sectionTitle}>Profile</Text>

            <Text style={TextStyles.inputLabel}>Displayname</Text>
            <InputField name='Displayname' value={username} onChange={setUsername}/>

            <Text style={TextStyles.inputLabel}>Email</Text>
            <InputField name='Email' value={email} onChange={setEmail} />

            <Text style={TextStyles.inputLabel}>Password</Text>
            <PasswordField name='Password' value={password} onChange={setPassword}/>

            <Text style={TextStyles.inputLabel}>Confirm password</Text>
            <PasswordField name='Confirm password' value={confirmpassword} onChange={setConfirmPassword}/>
          </View>

          {(username || email || password || confirmpassword) && (
            <AppButton label='Save changes' onPress={() => false}/>
          )}

          <AppButton label='Signout' onPress={signOut}/>
        </View>
      </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create ({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    width: '90%',
  },
})