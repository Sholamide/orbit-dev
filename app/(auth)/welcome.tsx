import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { useAppTheme } from '@/constants/tokens';

export default function WelcomeScreen() {
  const theme = useAppTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingHorizontal: 32,
          paddingBottom: 60,
          gap: 24,
        }}
      >
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Text
            style={{
              fontSize: 48,
              fontWeight: '800',
              color: theme.colors.text,
              letterSpacing: -1,
            }}
          >
            Orbit
          </Text>
          <Text
            style={{
              fontSize: 18,
              color: theme.colors.textSecondary,
              textAlign: 'center',
              lineHeight: 26,
            }}
          >
            Discover the hottest spots.{'\n'}Find your crew. Pull up tonight.
          </Text>
        </View>

        <View style={{ width: '100%', gap: 14, marginTop: 20 }}>
          <Link href="/(auth)/phone-login" asChild>
            <Pressable
              style={{
                backgroundColor: theme.colors.primary,
                paddingVertical: 16,
                borderRadius: 16,
                borderCurve: 'continuous',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: '700' }}>
                Continue with Phone
              </Text>
            </Pressable>
          </Link>
        </View>

        <Text style={{ color: theme.colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 8 }}>
          By continuing, you agree to our Terms of Service{'\n'}and Privacy Policy
        </Text>
      </View>
    </View>
  );
}
