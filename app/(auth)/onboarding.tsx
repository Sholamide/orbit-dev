import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { use, useState } from 'react';
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
import { AuthContext } from '@/contexts/auth-context';
import { posthog } from '@/lib/posthog';
import { supabase } from '@/lib/supabase';

const VIBES = ['Hype', 'Chill', 'Exclusive', 'Live Music', 'Rooftop', 'Underground', 'Day Party', 'Late Night'];

export default function OnboardingScreen() {
  const theme = useAppTheme();
  const { user, refreshProfile } = use(AuthContext);
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const toggleVibe = (vibe: string) => {
    setSelectedVibes((prev) =>
      prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe]
    );
  };

  const handleComplete = async () => {
    if (!user) return;

    if (!displayName.trim()) {
      Alert.alert('Name Required', 'Please enter your display name.');
      return;
    }

    setLoading(true);

    let avatarUrl: string | null = null;

    if (avatarUri) {
      const ext = avatarUri.split('.').pop()?.toLowerCase() ?? 'jpg';
      const fileName = `${user.id}/avatar.${ext}`;
      const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';

      try {
        const response = await fetch(avatarUri);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, blob, { upsert: true, contentType });

        if (uploadError) {
          Alert.alert('Upload Failed', 'Your photo could not be uploaded. You can update it later in your profile.');
        } else {
          const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
          avatarUrl = data.publicUrl;
        }
      } catch {
        Alert.alert('Photo Error', 'Could not read your photo. You can update it later in your profile.');
      }
    }

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      display_name: displayName.trim(),
      bio: bio.trim() || null,
      avatar_url: avatarUrl,
      vibe_preferences: selectedVibes.length > 0 ? selectedVibes : null,
      is_anonymous: false,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    posthog.capture('onboarding_completed', {
      display_name: displayName.trim(),
      vibes: selectedVibes,
    });

    await refreshProfile();
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 60,
        gap: 28,
      }}
    >
      <Text style={{ fontSize: 28, fontWeight: '700', color: theme.colors.text }}>
        Set up your profile
      </Text>

      <Pressable onPress={pickImage} style={{ alignSelf: 'center' }}>
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: theme.colors.surface,
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            borderWidth: 2,
            borderColor: theme.colors.primary,
          }}
        >
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              style={{ width: 100, height: 100 }}
            />
          ) : (
            <Text style={{ color: theme.colors.textTertiary, fontSize: 13 }}>Add Photo</Text>
          )}
        </View>
      </Pressable>

      <View style={{ gap: 6 }}>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 14, fontWeight: '600' }}>
          Display Name
        </Text>
        <TextInput
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: 14,
            borderCurve: 'continuous',
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: 16,
            color: theme.colors.text,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
          placeholder="What should people call you?"
          placeholderTextColor={theme.colors.textPlaceholder}
          value={displayName}
          onChangeText={setDisplayName}
        />
      </View>

      <View style={{ gap: 6 }}>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 14, fontWeight: '600' }}>
          Bio (optional)
        </Text>
        <TextInput
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: 14,
            borderCurve: 'continuous',
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: 16,
            color: theme.colors.text,
            borderWidth: 1,
            borderColor: theme.colors.border,
            minHeight: 80,
          }}
          placeholder="Tell people about yourself..."
          placeholderTextColor={theme.colors.textPlaceholder}
          value={bio}
          onChangeText={setBio}
          multiline
        />
      </View>

      <View style={{ gap: 12 }}>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 14, fontWeight: '600' }}>
          What&apos;s your vibe?
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {VIBES.map((vibe) => {
            const selected = selectedVibes.includes(vibe);
            return (
              <Pressable
                key={vibe}
                onPress={() => toggleVibe(vibe)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 20,
                  borderCurve: 'continuous',
                  backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
                  borderWidth: 1,
                  borderColor: selected ? theme.colors.primary : theme.colors.border,
                }}
              >
                <Text
                  style={{
                    color: selected ? theme.colors.text : theme.colors.textSecondary,
                    fontSize: 14,
                    fontWeight: '600',
                  }}
                >
                  {vibe}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable
        onPress={handleComplete}
        disabled={loading || !displayName.trim()}
        style={{
          backgroundColor: displayName.trim() ? theme.colors.primary : theme.colors.border,
          paddingVertical: 16,
          borderRadius: 16,
          borderCurve: 'continuous',
          alignItems: 'center',
          marginTop: 8,
        }}
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.text} />
        ) : (
          <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: '700' }}>
            Let&apos;s Go
          </Text>
        )}
      </Pressable>
    </KeyboardAwareScrollView>
  );
}
