import * as Sentry from '@sentry/react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { use, useEffect } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { ErrorBoundary } from 'react-error-boundary';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import 'react-native-reanimated';

import { AuthContext } from '@/contexts/auth-context';
import { useAppTheme } from '@/constants/tokens';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotifications } from '@/hooks/use-notifications';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  enabled: !__DEV__,
});

SplashScreen.preventAutoHideAsync();

function ErrorFallback({ resetErrorBoundary }: { resetErrorBoundary: () => void }) {
  const theme = useAppTheme();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '600', marginBottom: 16 }}>
        Something went wrong
      </Text>
      <Pressable
        onPress={resetErrorBoundary}
        style={{
          backgroundColor: theme.colors.primary,
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Retry</Text>
      </Pressable>
    </View>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading, profile } = use(AuthContext);
  const theme = useAppTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = (segments as string[])[1] === 'onboarding';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/welcome');
    } else if (session && inAuthGroup && !inOnboarding) {
      if (!profile?.display_name) {
        router.replace('/(auth)/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    } else if (session && inOnboarding && profile?.display_name) {
      router.replace('/(tabs)');
    }
  }, [session, loading, segments, profile]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const inAuthGroup = segments[0] === '(auth)';
  if (!session && !inAuthGroup) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

function RootLayout() {
  const colorScheme = useColorScheme();
  const auth = useAuth();
  useNotifications(auth.user?.id);

  useEffect(() => {
    if (!auth.loading) {
      SplashScreen.hideAsync();
    }
  }, [auth.loading]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onError={(error, info) => Sentry.captureException(error, { extra: { componentStack: info.componentStack } })}>
      <KeyboardProvider>
        <AuthContext value={auth}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <AuthGate>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                  name="spot/[id]"
                  options={{ headerShown: true, title: '', headerBackButtonDisplayMode: 'minimal' }}
                />
                <Stack.Screen
                  name="event/[id]"
                  options={{ headerShown: true, title: '', headerBackButtonDisplayMode: 'minimal' }}
                />
                <Stack.Screen
                  name="chat/[id]"
                  options={{ headerShown: true, title: 'Chat', headerBackButtonDisplayMode: 'minimal' }}
                />
              </Stack>
            </AuthGate>
            <StatusBar style="auto" />
          </ThemeProvider>
        </AuthContext>
      </KeyboardProvider>
    </ErrorBoundary>
  );
}

export default Sentry.wrap(RootLayout);
