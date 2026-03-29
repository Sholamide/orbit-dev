import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { use, useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { AttendeeAvatar } from '@/components/attendee-avatar';
import { useAppTheme } from '@/constants/tokens';
import { AuthContext } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { type Attendance, type Event, type Profile, type Venue } from '@/lib/types';

export default function EventDetailScreen() {
  const theme = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = use(AuthContext);
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [event, setEvent] = useState<Event | null>(null);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [attendees, setAttendees] = useState<(Profile & { attendanceStatus: string })[]>([]);
  const [myAttendance, setMyAttendance] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!user || !id) return;

    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (eventError || !eventData) {
      setLoading(false);
      return;
    }

    setEvent(eventData);

    const [venueRes, attendanceRes, myAttRes] = await Promise.all([
      supabase.from('venues').select('*').eq('id', eventData.venue_id).single(),
      supabase
        .from('attendances')
        .select('user_id, status')
        .eq('event_id', id)
        .eq('status', 'going'),
      supabase
        .from('attendances')
        .select('*')
        .eq('event_id', id)
        .eq('user_id', user.id)
        .single(),
    ]);

    setVenue(venueRes.data);
    setMyAttendance(myAttRes.data);

    if (attendanceRes.data && attendanceRes.data.length > 0) {
      const userIds = attendanceRes.data.map((a) => a.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      setAttendees(
        (profiles ?? []).map((p) => ({
          ...p,
          attendanceStatus: 'going',
        }))
      );
    } else {
      setAttendees([]);
    }

    setLoading(false);
  }, [id, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAttendance = async () => {
    if (!user || !id) return;
    setActionLoading(true);

    if (myAttendance) {
      await supabase.from('attendances').delete().eq('id', myAttendance.id);
      setMyAttendance(null);
    } else {
      const { data } = await supabase
        .from('attendances')
        .upsert({ user_id: user.id, event_id: id, status: 'going' as const })
        .select()
        .single();
      setMyAttendance(data);
    }

    setActionLoading(false);
    loadData();
  };

  const handleCompanionRequest = async (receiverId: string) => {
    if (!user || !id || receiverId === user.id) return;

    const { data: existing } = await supabase
      .from('companion_requests')
      .select('*')
      .eq('sender_id', user.id)
      .eq('receiver_id', receiverId)
      .eq('event_id', id)
      .single();

    if (existing) {
      Alert.alert('Already Sent', 'You already sent a request to this person.');
      return;
    }

    const { error } = await supabase.from('companion_requests').insert({
      sender_id: user.id,
      receiver_id: receiverId,
      event_id: id,
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Sent! 🎉', "They'll get notified. If they accept, you can chat!");
    }
  };

  if (loading || !event) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const startDate = new Date(event.starts_at);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack.Screen
        options={{
          title: event.title,
          headerTransparent: true,
          headerTintColor: theme.colors.text,
        }}
      />

      <ScrollView contentInsetAdjustmentBehavior="automatic">
        {event.cover_image_url ? (
          <Image
            source={{ uri: event.cover_image_url }}
            style={{ width, height: width * 0.55 }}
            contentFit="cover"
          />
        ) : venue?.cover_image_url ? (
          <Image
            source={{ uri: venue.cover_image_url }}
            style={{ width, height: width * 0.55 }}
            contentFit="cover"
          />
        ) : null}

        <View style={{ padding: 20, gap: 20 }}>
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 26, fontWeight: '800', color: theme.colors.text }}>
              {event.title}
            </Text>
            <Text style={{ fontSize: 15, color: theme.colors.primary, fontWeight: '600' }}>
              {startDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}{' '}
              at{' '}
              {startDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
            {venue && (
              <Pressable onPress={() => router.push(`/spot/${venue.id}`)}>
                <Text style={{ fontSize: 14, color: theme.colors.textTertiary }}>
                  📍 {venue.name} • {venue.address}
                </Text>
              </Pressable>
            )}
          </View>

          {event.description && (
            <Text style={{ fontSize: 15, color: theme.colors.textSecondary, lineHeight: 22 }}>
              {event.description}
            </Text>
          )}

          <Pressable
            onPress={handleAttendance}
            disabled={actionLoading}
            style={{
              backgroundColor: myAttendance ? theme.colors.success : theme.colors.primary,
              paddingVertical: 16,
              borderRadius: 16,
              borderCurve: 'continuous',
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {actionLoading ? (
              <ActivityIndicator color={theme.colors.text} />
            ) : (
              <>
                <Text style={{ fontSize: 18 }}>
                  {myAttendance ? '✅' : '🙋'}
                </Text>
                <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: '700' }}>
                  {myAttendance ? "You're Going!" : "I'm Going"}
                </Text>
              </>
            )}
          </Pressable>

          {attendees.length > 0 && (
            <View style={{ gap: 14 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.text }}>
                Who&apos;s Going ({attendees.length})
              </Text>
              {attendees.map((profile) => (
                <View
                  key={profile.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: theme.colors.surface,
                    padding: 14,
                    borderRadius: 14,
                    borderCurve: 'continuous',
                    gap: 12,
                    borderWidth: 1,
                    borderColor: theme.colors.surfaceBorder,
                  }}
                >
                  <AttendeeAvatar profile={profile} size={44} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 15 }}>
                      {profile.is_anonymous ? 'Someone mysterious 👻' : profile.display_name}
                    </Text>
                    {profile.bio && (
                      <Text style={{ color: theme.colors.textTertiary, fontSize: 13 }} numberOfLines={1}>
                        {profile.bio}
                      </Text>
                    )}
                  </View>
                  {profile.id !== user?.id && (
                    <Pressable
                      onPress={() => handleCompanionRequest(profile.id)}
                      style={{
                        backgroundColor: theme.colors.primarySubtle,
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 12,
                        borderCurve: 'continuous',
                        borderWidth: 1,
                        borderColor: theme.colors.primaryBorder,
                      }}
                    >
                      <Text style={{ color: theme.colors.primary, fontSize: 13, fontWeight: '700' }}>
                        Let&apos;s Go 🤝
                      </Text>
                    </Pressable>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
