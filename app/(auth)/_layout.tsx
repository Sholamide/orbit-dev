import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="phone-login" options={{ headerShown: false, title: 'Sign In', headerBackButtonDisplayMode: 'minimal' }} />
      <Stack.Screen name="verify-otp" options={{ headerShown: false, title: 'Verify', headerBackButtonDisplayMode: 'minimal' }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false, title: 'Set Up Profile', headerBackButtonDisplayMode: 'minimal' }} />
    </Stack>
  );
}
