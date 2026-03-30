import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
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
import {
  formatNigeriaNationalForDisplay,
  sanitizeNationalDigitsInput,
  toNigeriaE164,
} from '@/lib/phone/nigeria';
import { describeOtpSmsError } from '@/lib/auth/otp-errors';
import { setPendingOtpPhone } from '@/lib/auth/pending-otp-phone';
import { posthog } from '@/lib/posthog';
import { supabase } from '@/lib/supabase';

export default function PhoneLoginScreen() {
  const theme = useAppTheme();
  const [nationalDigits, setNationalDigits] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const e164 = useMemo(() => toNigeriaE164(nationalDigits), [nationalDigits]);
  const displayValue = formatNigeriaNationalForDisplay(nationalDigits);
  const canSubmit = e164 !== null;

  const handleSendOTP = async () => {
    const formattedPhone = toNigeriaE164(nationalDigits);
    if (!formattedPhone) {
      Alert.alert(
        'Invalid Number',
        'Enter a valid Nigerian mobile number (10 digits starting with 7, 8, or 9).'
      );
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });

      if (error) {
        Alert.alert('Could not send code', describeOtpSmsError(error.message));
        return;
      }

      posthog.capture('phone_login_attempted');

      setPendingOtpPhone(formattedPhone);
      router.push({
        pathname: '/(auth)/verify-otp',
        params: { phone: encodeURIComponent(formattedPhone) },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      Alert.alert(
        'Connection problem',
        'Could not reach the server. Check your internet, and that EXPO_PUBLIC_SUPABASE_URL in .env.local matches your Supabase project URL (Settings → API).'
      );
      console.error('signInWithOtp failed:', message, err);
    } finally {
      setLoading(false);
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
            What&apos;s your number?
          </Text>
          <Text style={{ fontSize: 16, color: theme.colors.textTertiary, lineHeight: 22 }}>
            Nigerian mobile number — we&apos;ll text you a code to verify it&apos;s really you.
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
          <Text style={{ fontSize: 18, color: theme.colors.textTertiary, marginRight: 8 }}>+234</Text>
          <TextInput
            style={{
              flex: 1,
              fontSize: 18,
              color: theme.colors.text,
              paddingVertical: 16,
            }}
            placeholder="901 900 8187"
            placeholderTextColor={theme.colors.textPlaceholder}
            keyboardType="phone-pad"
            value={displayValue}
            onChangeText={(text) => setNationalDigits(sanitizeNationalDigitsInput(text))}
            autoFocus
          />
        </View>

        <Pressable
          onPress={handleSendOTP}
          disabled={loading || !canSubmit}
          style={{
            backgroundColor: canSubmit ? theme.colors.primary : theme.colors.border,
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
