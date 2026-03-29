import { File as ExpoFile } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { use, useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AttendeeAvatar } from '@/components/attendee-avatar';
import { VibeBadge } from '@/components/vibe-badge';
import { useAppTheme } from '@/constants/tokens';
import { AuthContext } from '@/contexts/auth-context';
import { createConversation } from '@/lib/services/chat';
import { supabase } from '@/lib/supabase';
import { type CompanionRequest, type Profile } from '@/lib/types';

type RequestWithProfile = CompanionRequest & { sender_profile?: Profile; event_title?: string };

export default function ProfileScreen() {
  const { user, profile, signOut, refreshProfile } = use(AuthContext);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<RequestWithProfile[]>([]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? '');
      setBio(profile.bio ?? '');
      setIsAnonymous(profile.is_anonymous);
    }
  }, [profile]);

  const loadRequests = useCallback(async () => {
    if (!user) return;

    const { data: requests, error: requestsError } = await supabase
      .from('companion_requests')
      .select('*')
      .eq('receiver_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (requestsError || !requests || requests.length === 0) {
      setPendingRequests([]);
      return;
    }

    const senderIds = requests.map((r) => r.sender_id);
    const eventIds = requests.map((r) => r.event_id);

    const [profilesRes, eventsRes] = await Promise.all([
      supabase.from('profiles').select('*').in('id', senderIds),
      supabase.from('events').select('id, title').in('id', eventIds),
    ]);

    const profileMap: Record<string, Profile> = {};
    for (const p of profilesRes.data ?? []) profileMap[p.id] = p;

    const eventMap: Record<string, string> = {};
    for (const e of eventsRes.data ?? []) eventMap[e.id] = e.title;

    setPendingRequests(
      requests.map((r) => ({
        ...r,
        sender_profile: profileMap[r.sender_id],
        event_title: eventMap[r.event_id],
      }))
    );
  }, [user]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName.trim(),
        bio: bio.trim() || null,
        is_anonymous: isAnonymous,
      })
      .eq('id', user.id);

    setSaving(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setEditing(false);
      refreshProfile();
    }
  };

  const handleAvatarChange = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0] || !user) return;

    const uri = result.assets[0].uri;
    const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
    const fileName = `${user.id}/avatar.${ext}`;
    const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';

    const file = new ExpoFile(uri);
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    await supabase.storage.from('avatars').upload(fileName, bytes, { upsert: true, contentType });
    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);

    await supabase
      .from('profiles')
      .update({ avatar_url: data.publicUrl })
      .eq('id', user.id);

    refreshProfile();
  };

  const handleRequestResponse = async (requestId: string, senderId: string, eventId: string, accept: boolean) => {
    const { error } = await supabase
      .from('companion_requests')
      .update({ status: accept ? 'accepted' : 'declined' })
      .eq('id', requestId);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    if (accept && user) {
      try {
        const convId = await createConversation([user.id, senderId], eventId);

        Alert.alert('Matched!', 'You can now chat with them.', [
          { text: 'Chat Now', onPress: () => router.push(`/chat/${convId}`) },
          { text: 'Later' },
        ]);
      } catch {
        Alert.alert('Error', 'Could not create conversation. Please try again.');
      }
    }

    loadRequests();
  };

  if (!profile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 100, gap: 24 }}
    >
      <Text style={{ fontSize: 32, fontWeight: '800', color: theme.colors.text }}>Profile</Text>

      {/* Avatar & Name */}
      <View style={{ alignItems: 'center', gap: 12 }}>
        <Pressable onPress={handleAvatarChange}>
          <AttendeeAvatar profile={profile} size={180} />
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: theme.colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 14 }}>📷</Text>
          </View>
        </Pressable>
        <Text style={{ fontSize: 22, fontWeight: '700', color: theme.colors.text }}>
          {profile.display_name}
        </Text>
        {profile.bio && (
          <Text style={{ fontSize: 14, color: theme.colors.textTertiary, textAlign: 'center' }}>
            {profile.bio}
          </Text>
        )}
        {profile.vibe_preferences && profile.vibe_preferences.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 }}>
            {profile.vibe_preferences.map((v) => (
              <VibeBadge key={v} vibe={v} />
            ))}
          </View>
        )}
      </View>

      {/* Companion Requests */}
      {pendingRequests.length > 0 && (
        <View style={{ gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text }}>
            Companion Requests ({pendingRequests.length})
          </Text>
          {pendingRequests.map((req) => (
            <View
              key={req.id}
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: 16,
                borderCurve: 'continuous',
                padding: 14,
                gap: 10,
                borderWidth: 1,
                borderColor: theme.colors.surfaceBorder,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                {req.sender_profile && (
                  <AttendeeAvatar profile={req.sender_profile} size={40} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 15 }}>
                    {req.sender_profile?.display_name ?? 'Someone'}
                  </Text>
                  <Text style={{ color: theme.colors.textTertiary, fontSize: 13 }}>
                    wants to go to {req.event_title ?? 'an event'} with you
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Pressable
                  onPress={() => handleRequestResponse(req.id, req.sender_id, req.event_id, true)}
                  style={{
                    flex: 1,
                    backgroundColor: theme.colors.success,
                    paddingVertical: 10,
                    borderRadius: 12,
                    borderCurve: 'continuous',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: theme.colors.text, fontWeight: '700' }}>Accept</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleRequestResponse(req.id, req.sender_id, req.event_id, false)}
                  style={{
                    flex: 1,
                    backgroundColor: theme.colors.border,
                    paddingVertical: 10,
                    borderRadius: 12,
                    borderCurve: 'continuous',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: theme.colors.textSecondary, fontWeight: '700' }}>Decline</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Edit Profile */}
      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 18,
          borderCurve: 'continuous',
          padding: 18,
          gap: 16,
          borderWidth: 1,
          borderColor: theme.colors.surfaceBorder,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.text }}>
            Edit Profile
          </Text>
          <Pressable onPress={() => (editing ? handleSave() : setEditing(true))}>
            {saving ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
                {editing ? 'Save' : 'Edit'}
              </Text>
            )}
          </Pressable>
        </View>

        {editing && (
          <>
            <View style={{ gap: 6 }}>
              <Text style={{ color: theme.colors.textTertiary, fontSize: 13 }}>Display Name</Text>
              <TextInput
                style={{
                  backgroundColor: theme.colors.background,
                  borderRadius: 12,
                  borderCurve: 'continuous',
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  fontSize: 15,
                  color: theme.colors.text,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
                value={displayName}
                onChangeText={setDisplayName}
              />
            </View>
            <View style={{ gap: 6 }}>
              <Text style={{ color: theme.colors.textTertiary, fontSize: 13 }}>Bio</Text>
              <TextInput
                style={{
                  backgroundColor: theme.colors.background,
                  borderRadius: 12,
                  borderCurve: 'continuous',
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  fontSize: 15,
                  color: theme.colors.text,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  minHeight: 70,
                }}
                value={bio}
                onChangeText={setBio}
                multiline
              />
            </View>
          </>
        )}
      </View>

      {/* Ghost Mode */}
      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 18,
          borderCurve: 'continuous',
          padding: 18,
          gap: 12,
          borderWidth: 1,
          borderColor: theme.colors.surfaceBorder,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.text }}>
                👻 Ghost Mode
              </Text>
              <View
                style={{
                  backgroundColor: theme.colors.primarySubtle,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: theme.colors.primaryBorder,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: theme.colors.primary }}>
                  PREMIUM
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 13, color: theme.colors.textTertiary }}>
              Browse anonymously. Others see &quot;Someone mysterious&quot; instead of your name.
            </Text>
          </View>
          <Switch
            value={isAnonymous}
            onValueChange={async (val) => {
              if (!user) return;
              setIsAnonymous(val);
              await supabase
                .from('profiles')
                .update({ is_anonymous: val })
                .eq('id', user.id);
              refreshProfile();
            }}
            trackColor={{ false: theme.colors.border, true: theme.colors.primaryMuted }}
            thumbColor={isAnonymous ? theme.colors.primary : theme.colors.textTertiary}
          />
        </View>
      </View>

      {/* Sign Out */}
      <Pressable
        onPress={() => {
          Alert.alert('Sign Out', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: signOut },
          ]);
        }}
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 16,
          borderCurve: 'continuous',
          paddingVertical: 16,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}
      >
        <Text style={{ color: theme.colors.danger, fontSize: 16, fontWeight: '600' }}>
          Sign Out
        </Text>
      </Pressable>
    </ScrollView>
  );
}
