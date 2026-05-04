import { InputField, PasswordField } from "@/components/ui/input-field";
import { useState } from "react";
import { View, StyleSheet, Text, useWindowDimensions, KeyboardAvoidingView, Platform, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TextStyles } from '@/constants/text-style';
import { AppButton } from "@/components/ui/app-button";
import { supabase } from '@/lib/supabase';
import { Colors } from "@/themes/colors";
import { useAuthContext } from "@/hooks/use-auth-context";

async function signOut() {
        await supabase.auth.signOut();
    }

export default function ProfileRoute() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const { claims } = useAuthContext();
  const placeHolderDisplayName = claims?.user_metadata?.display_name;
  const placeHolderEmail = claims?.user_metadata?.email;

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
            <Text style={[TextStyles.sectionTitle, {color: themeColors.text}]}>Profile</Text>

            <Text style={[TextStyles.inputLabel, {color: themeColors.text}]}>Displayname</Text>
            <InputField name={placeHolderDisplayName} value={username} onChange={setUsername}/>

            <Text style={[TextStyles.inputLabel, {color: themeColors.text}]}>Email</Text>
            <InputField name={placeHolderEmail} value={email} onChange={setEmail} />

            <Text style={[TextStyles.inputLabel, {color: themeColors.text}]}>Password</Text>
            <PasswordField name='Password' value={password} onChange={setPassword}/>

            <Text style={[TextStyles.inputLabel, {color: themeColors.text}]}>Confirm password</Text>
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