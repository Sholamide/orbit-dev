import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { useAppTheme } from '@/constants/tokens';
import { supabase } from '@/lib/supabase';

export default function PhoneLoginScreen() {
  const theme = useAppTheme();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOTP = async () => {
    if (phone.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid phone number.');
      return;
    }

    setLoading(true);
    const formattedPhone = phone.startsWith('+') ? phone : `+1${phone}`;

    const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    router.push({
      pathname: '/(auth)/verify-otp',
      params: { phone: formattedPhone },
    });
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          paddingTop: 40,
          gap: 32,
        }}
      >
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: theme.colors.text }}>
            What&apos;s your number?
          </Text>
          <Text style={{ fontSize: 16, color: theme.colors.textTertiary, lineHeight: 22 }}>
            We&apos;ll text you a code to verify it&apos;s really you.
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            borderRadius: 16,
            borderCurve: 'continuous',
            paddingHorizontal: 16,
            paddingVertical: 4,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text style={{ fontSize: 18, color: theme.colors.textTertiary, marginRight: 8 }}>+1</Text>
          <TextInput
            style={{
              flex: 1,
              fontSize: 18,
              color: theme.colors.text,
              paddingVertical: 16,
            }}
            placeholder="(555) 123-4567"
            placeholderTextColor={theme.colors.textPlaceholder}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            autoFocus
          />
        </View>

        <Pressable
          onPress={handleSendOTP}
          disabled={loading || phone.length < 10}
          style={{
            backgroundColor: phone.length >= 10 ? theme.colors.primary : theme.colors.border,
            paddingVertical: 16,
            borderRadius: 16,
            borderCurve: 'continuous',
            alignItems: 'center',
          }}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.text} />
          ) : (
            <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: '700' }}>
              Send Code
            </Text>
          )}
        </Pressable>
      </View>
    </KeyboardAwareScrollView>
  );
}
