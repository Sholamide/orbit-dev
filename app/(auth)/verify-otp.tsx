import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { supabase } from '@/lib/supabase';

export default function VerifyOTPScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVerify = async () => {
    if (code.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit code.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      phone: phone!,
      token: code,
      type: 'sms',
    });

    setLoading(false);

    if (error) {
      Alert.alert('Verification Failed', error.message);
      return;
    }
  };

  const handleResend = async () => {
    const { error } = await supabase.auth.signInWithOtp({ phone: phone! });
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Sent', 'A new code has been sent to your phone.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{ flex: 1, backgroundColor: '#0D0D0D' }}
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
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#FFFFFF' }}>
            Enter the code
          </Text>
          <Text style={{ fontSize: 16, color: '#888', lineHeight: 22 }}>
            We sent a 6-digit code to {phone}
          </Text>
        </View>

        <TextInput
          style={{
            backgroundColor: '#1A1A1A',
            borderRadius: 16,
            borderCurve: 'continuous',
            paddingHorizontal: 16,
            paddingVertical: 18,
            fontSize: 24,
            color: '#FFFFFF',
            textAlign: 'center',
            letterSpacing: 12,
            borderWidth: 1,
            borderColor: '#333',
          }}
          placeholder="000000"
          placeholderTextColor="#555"
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
            backgroundColor: code.length === 6 ? '#FF6B6B' : '#333',
            paddingVertical: 16,
            borderRadius: 16,
            borderCurve: 'continuous',
            alignItems: 'center',
          }}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '700' }}>
              Verify
            </Text>
          )}
        </Pressable>

        <Pressable onPress={handleResend} style={{ alignItems: 'center' }}>
          <Text style={{ color: '#FF6B6B', fontSize: 15, fontWeight: '600' }}>
            Resend Code
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
