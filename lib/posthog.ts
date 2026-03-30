import Constants from 'expo-constants';
import PostHog from 'posthog-react-native';

const token = Constants.expoConfig?.extra?.posthogProjectToken as string | undefined;
const host = Constants.expoConfig?.extra?.posthogHost as string | undefined;

export const posthog = new PostHog(token ?? '', {
  host,
  disabled: !token,
});
