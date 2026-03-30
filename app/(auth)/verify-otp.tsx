import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { describeOtpSmsError } from '@/lib/auth/otp-errors';
import {
  clearPendingOtpPhone,
  getPendingOtpPhone,
} from '@/lib/auth/pending-otp-phone';
import { formatNigeriaE164ForDisplay, normalizePhoneFromRouteParam } from '@/lib/phone/nigeria';
import { posthog } from '@/lib/posthog';
import { supabase } from '@/lib/supabase';

export default function VerifyOTPScreen() {
  const theme = useAppTheme();
  const params = useLocalSearchParams<{ phone: string | string[] }>();
  const rawParam = params.phone;
  const singleParam = Array.isArray(rawParam) ? rawParam[0] : rawParam;
  const phone =
    getPendingOtpPhone() ?? normalizePhoneFromRouteParam(singleParam);

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVerify = async () => {
    if (!phone) {
      Alert.alert('Error', 'Phone number is missing. Please go back and try again.');
      router.back();
      return;
    }
    if (code.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit code.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: code,
      type: 'sms',
    });

    setLoading(false);

    if (error) {
      Alert.alert('Verification Failed', error.message);
      return;
    }

    clearPendingOtpPhone();
    posthog.capture('otp_verified');
  };

  const handleResend = async () => {
    if (!phone) return;
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) {
      Alert.alert('Could not send code', describeOtpSmsError(error.message));
    } else {
      posthog.capture('otp_resent');
      Alert.alert('Sent', 'A new code has been sent to your phone.');
    }
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
            Enter the code
          </Text>
          <Text style={{ fontSize: 16, color: theme.colors.textTertiary, lineHeight: 22 }}>
            We sent a 6-digit code to{' '}
            {phone ? formatNigeriaE164ForDisplay(phone) : 'your phone'}
          </Text>
        </View>

        <TextInput
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: 16,
            borderCurve: 'continuous',
            paddingHorizontal: 16,
            paddingVertical: 18,
            fontSize: 24,
            color: theme.colors.text,
            textAlign: 'center',
            letterSpacing: 12,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
          placeholder="000000"
          placeholderTextColor={theme.colors.textPlaceholder}
          keyboardType="number-pad"
          maxLength={6}
          value={code}
          onChangeText={setCode}
          autoFocus
        />

        <Pressable
          onPress={handleVerify}
          disabled={loading || code.length !== 6}
          style={{
            backgroundColor: code.length === 6 ? theme.colors.primary : theme.colors.border,
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
              Verify
            </Text>
          )}
        </Pressable>

        <Pressable onPress={handleResend} style={{ alignItems: 'center' }}>
          <Text style={{ color: theme.colors.primary, fontSize: 15, fontWeight: '600' }}>
            Resend Code
          </Text>
        </Pressable>
      </View>
    </KeyboardAwareScrollView>
  );
}
