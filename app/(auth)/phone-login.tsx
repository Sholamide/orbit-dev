import { useRouter } from 'expo-router';
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

export default function PhoneLoginScreen() {
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
            What&apos;s your number?
          </Text>
          <Text style={{ fontSize: 16, color: '#888', lineHeight: 22 }}>
            We&apos;ll text you a code to verify it&apos;s really you.
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#1A1A1A',
            borderRadius: 16,
            borderCurve: 'continuous',
            paddingHorizontal: 16,
            paddingVertical: 4,
            borderWidth: 1,
            borderColor: '#333',
          }}
        >
          <Text style={{ fontSize: 18, color: '#888', marginRight: 8 }}>+1</Text>
          <TextInput
            style={{
              flex: 1,
              fontSize: 18,
              color: '#FFFFFF',
              paddingVertical: 16,
            }}
            placeholder="(555) 123-4567"
            placeholderTextColor="#555"
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
            backgroundColor: phone.length >= 10 ? '#FF6B6B' : '#333',
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
              Send Code
            </Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
