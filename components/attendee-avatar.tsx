import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { type Profile } from '@/lib/types';

type AttendeeAvatarProps = {
  profile: Profile;
  size?: number;
};

export function AttendeeAvatar({ profile, size = 36 }: AttendeeAvatarProps) {
  if (profile.is_anonymous) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#2A2A2A',
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
          borderColor: '#FF6B6B',
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
        backgroundColor: '#FF6B6B',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{ color: '#FFF', fontWeight: '700', fontSize: size * 0.4 }}>
        {initials}
      </Text>
    </View>
  );
}
