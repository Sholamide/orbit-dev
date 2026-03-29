import { Image } from 'expo-image';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { AttendeeAvatar } from '@/components/attendee-avatar';
import { HotMeter } from '@/components/hot-meter';
import { VibeBadge } from '@/components/vibe-badge';
import { useAppTheme } from '@/constants/tokens';
import { supabase } from '@/lib/supabase';
import { type Event, type Profile, type Venue } from '@/lib/types';

export default function SpotDetailScreen() {
  const theme = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();

  const [venue, setVenue] = useState<Venue | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [attendees, setAttendees] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [venueRes, eventsRes] = await Promise.all([
        supabase.from('venues').select('*').eq('id', id).single(),
        supabase
          .from('events')
          .select('*')
          .eq('venue_id', id)
          .gte('starts_at', new Date().toISOString())
          .order('starts_at'),
      ]);

      if (venueRes.error || eventsRes.error) {
        setLoading(false);
        return;
      }

      setVenue(venueRes.data);
      setEvents(eventsRes.data ?? []);

      if (eventsRes.data && eventsRes.data.length > 0) {
        const eventIds = eventsRes.data.map((e) => e.id);
        const { data: attendanceData } = await supabase
          .from('attendances')
          .select('user_id')
          .in('event_id', eventIds)
          .eq('status', 'going');

        if (attendanceData && attendanceData.length > 0) {
          const userIds = [...new Set(attendanceData.map((a) => a.user_id))];
          const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .in('id', userIds);
          setAttendees(profiles ?? []);
        }
      }

      setLoading(false);
    }
    load();
  }, [id]);

  if (loading || !venue) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack.Screen
        options={{
          title: venue.name,
          headerTransparent: true,
          headerTintColor: theme.colors.text,
          headerStyle: { backgroundColor: 'transparent' },
        }}
      />

      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <Image
          source={{ uri: venue.cover_image_url ?? '' }}
          style={{ width, height: width * 0.7 }}
          contentFit="cover"
        />

        <View style={{ padding: 20, gap: 20 }}>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 28, fontWeight: '800', color: theme.colors.text, flex: 1 }}>
                {venue.name}
              </Text>
              <HotMeter score={venue.hot_score} />
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 14, color: theme.colors.textTertiary }}>
                📍 {venue.address}
              </Text>
            </View>

            <Text style={{ fontSize: 15, color: theme.colors.textSecondary, lineHeight: 22 }}>
              {venue.description}
            </Text>
          </View>

          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.text }}>Vibe</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {venue.vibe_tags?.map((vibe) => (
                <VibeBadge key={vibe} vibe={vibe} />
              ))}
            </View>
          </View>

          {events.length > 0 && (
            <View style={{ gap: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.text }}>
                Upcoming Events
              </Text>
              {events.map((event) => (
                <Link key={event.id} href={`/event/${event.id}`} asChild>
                  <Pressable
                    style={{
                      backgroundColor: theme.colors.surface,
                      borderRadius: 16,
                      borderCurve: 'continuous',
                      padding: 16,
                      gap: 6,
                      borderWidth: 1,
                      borderColor: theme.colors.surfaceBorder,
                    }}
                  >
                    <Text style={{ fontSize: 17, fontWeight: '700', color: theme.colors.text }}>
                      {event.title}
                    </Text>
                    <Text style={{ fontSize: 13, color: theme.colors.textTertiary }}>
                      {new Date(event.starts_at).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </Text>
                    {event.description && (
                      <Text
                        style={{ fontSize: 14, color: theme.colors.textSecondary, lineHeight: 20 }}
                        numberOfLines={2}
                      >
                        {event.description}
                      </Text>
                    )}
                  </Pressable>
                </Link>
              ))}
            </View>
          )}

          {attendees.length > 0 && (
            <View style={{ gap: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.text }}>
                Who&apos;s Going ({attendees.length})
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {attendees.map((profile) => (
                  <View key={profile.id} style={{ alignItems: 'center', gap: 4, width: 56 }}>
                    <AttendeeAvatar profile={profile} size={44} />
                    <Text
                      style={{ fontSize: 11, color: theme.colors.textSecondary, textAlign: 'center' }}
                      numberOfLines={1}
                    >
                      {profile.is_anonymous ? 'Ghost' : profile.display_name ?? '?'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {venue.gallery_urls && venue.gallery_urls.length > 0 && (
            <View style={{ gap: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.text }}>Gallery</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ gap: 8 }}>
                {venue.gallery_urls.map((url, i) => (
                  <Image
                    key={i}
                    source={{ uri: url }}
                    style={{
                      width: 200,
                      height: 150,
                      borderRadius: 12,
                      marginRight: 10,
                    }}
                    contentFit="cover"
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
