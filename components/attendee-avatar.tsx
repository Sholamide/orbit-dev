import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { type Profile } from '@/lib/types';
import { useAppTheme } from '@/constants/tokens';

type AttendeeAvatarProps = {
  profile: Profile;
  size?: number;
};

export function AttendeeAvatar({ profile, size = 36 }: AttendeeAvatarProps) {
  const theme = useAppTheme();

  if (profile.is_anonymous) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.colors.surfaceBorder,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: size * 0.5 }}>👻</Text>
      </View>
    );
  }

  if (profile.avatar_url) {
    return (
      <Image
        source={{ uri: profile.avatar_url }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: theme.colors.primary,
        }}
      />
    );
  }

  const initials = (profile.display_name ?? '?')[0].toUpperCase();

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: size * 0.4 }}>
        {initials}
      </Text>
    </View>
  );
}
