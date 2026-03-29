import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { ConvexProvider } from 'convex/react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { AuthContext } from '@/contexts/auth-context';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { convex } from '@/lib/convex';

SplashScreen.preventAutoHideAsync();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading, profile } = useAuth();
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D0D0D' }}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  const inAuthGroup = segments[0] === '(auth)';
  if (!session && !inAuthGroup) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D0D0D' }}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const auth = useAuth();

  useEffect(() => {
    if (!auth.loading) {
      SplashScreen.hideAsync();
    }
  }, [auth.loading]);

  return (
    <AuthContext value={auth}>
      <ConvexProvider client={convex}>
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
      </ConvexProvider>
    </AuthContext>
  );
}
