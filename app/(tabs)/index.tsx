import { useRouter } from 'expo-router';
import React, { use, useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { EventSwipeCard } from '@/components/event-swipe-card';
import { SwipeCard } from '@/components/swipe-card';
import { AuthContext } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { type EventWithVenue, type Venue } from '@/lib/types';

type DiscoverMode = 'spots' | 'events';

export default function DiscoverScreen() {
  const { user } = use(AuthContext);
  const router = useRouter();

  const [mode, setMode] = useState<DiscoverMode>('spots');
  const [venues, setVenues] = useState<Venue[]>([]);
  const [events, setEvents] = useState<EventWithVenue[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchVenues = useCallback(async () => {
    if (!user) return;

    const { data: swipedVenueIds } = await supabase
      .from('swipes')
      .select('venue_id')
      .eq('user_id', user.id);

    const excludeIds = swipedVenueIds?.map((s) => s.venue_id) ?? [];

    let query = supabase
      .from('venues')
      .select('*')
      .order('hot_score', { ascending: false });

    if (excludeIds.length > 0) {
      query = query.not('id', 'in', `(${excludeIds.join(',')})`);
    }

    const { data } = await query;
    setVenues(data ?? []);
    setCurrentIndex(0);
    setLoading(false);
  }, [user]);

  const fetchEvents = useCallback(async () => {
    if (!user) return;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

    const { data: eventData } = await supabase
      .from('events')
      .select('*')
      .gte('starts_at', startOfDay)
      .lt('starts_at', endOfDay)
      .order('starts_at', { ascending: true });

    if (!eventData || eventData.length === 0) {
      setEvents([]);
      setCurrentIndex(0);
      setLoading(false);
      return;
    }

    const venueIds = [...new Set(eventData.map((e) => e.venue_id))];
    const { data: venueData } = await supabase
      .from('venues')
      .select('*')
      .in('id', venueIds);

    const venueMap: Record<string, (typeof venueData extends (infer T)[] | null ? T : never)> = {};
    for (const v of venueData ?? []) venueMap[v.id] = v;

    const eventsWithVenue: EventWithVenue[] = eventData
      .filter((e) => venueMap[e.venue_id])
      .map((e) => ({ ...e, venue: venueMap[e.venue_id]! }));

    setEvents(eventsWithVenue);
    setCurrentIndex(0);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    setLoading(true);
    if (mode === 'spots') {
      fetchVenues();
    } else {
      fetchEvents();
    }
  }, [mode, fetchVenues, fetchEvents]);

  const handleSpotSwipe = async (direction: 'left' | 'right') => {
    const venue = venues[currentIndex];
    if (!venue || !user) return;

    await supabase.from('swipes').upsert({
      user_id: user.id,
      venue_id: venue.id,
      direction,
    });

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 350);
  };

  const handleEventSwipe = async (direction: 'left' | 'right') => {
    const event = events[currentIndex];
    if (!event || !user) return;

    if (direction === 'right') {
      await supabase.from('attendances').upsert({
        user_id: user.id,
        event_id: event.id,
        status: 'going' as const,
      });
    }

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 350);
  };

  const handleTap = () => {
    if (mode === 'spots') {
      const venue = venues[currentIndex];
      if (venue) router.push(`/spot/${venue.id}`);
    } else {
      const event = events[currentIndex];
      if (event) router.push(`/event/${event.id}`);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D0D0D' }}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  const items = mode === 'spots' ? venues : events;
  const remaining = items.slice(currentIndex);
  const noMore = remaining.length === 0;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0D0D0D' }}>
      <View style={{ paddingTop: 60, paddingHorizontal: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 32, fontWeight: '800', color: '#FFF' }}>
          Discover
        </Text>

        {/* Mode Toggle */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#1A1A1A',
            borderRadius: 14,
            borderCurve: 'continuous',
            padding: 4,
            marginTop: 12,
          }}
        >
          <Pressable
            onPress={() => setMode('spots')}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 11,
              borderCurve: 'continuous',
              backgroundColor: mode === 'spots' ? '#FF6B6B' : 'transparent',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: mode === 'spots' ? '#FFF' : '#888',
                fontWeight: '700',
                fontSize: 14,
              }}
            >
              Spots 📍
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setMode('events')}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 11,
              borderCurve: 'continuous',
              backgroundColor: mode === 'events' ? '#FF6B6B' : 'transparent',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: mode === 'events' ? '#FFF' : '#888',
                fontWeight: '700',
                fontSize: 14,
              }}
            >
              Events 🎉
            </Text>
          </Pressable>
        </View>

        <Text style={{ fontSize: 15, color: '#888', marginTop: 8 }}>
          {mode === 'spots'
            ? 'Swipe right on spots that look fire 🔥'
            : "Swipe right to RSVP to today's events 🙋"}
        </Text>
      </View>

      <View style={{ flex: 1, marginHorizontal: 16, marginBottom: 16 }}>
        {noMore ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 }}>
            <Text style={{ fontSize: 48 }}>{mode === 'spots' ? '🌙' : '🎭'}</Text>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#FFF' }}>
              {mode === 'spots' ? "You've seen everything" : 'No more events today'}
            </Text>
            <Text style={{ fontSize: 15, color: '#888', textAlign: 'center' }}>
              {mode === 'spots'
                ? "Check back later for new spots\nor explore what's trending."
                : 'Check back later or switch\nto Spots mode.'}
            </Text>
            <Pressable
              onPress={() => {
                setLoading(true);
                if (mode === 'spots') fetchVenues();
                else fetchEvents();
              }}
              style={{
                backgroundColor: '#FF6B6B',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 14,
                borderCurve: 'continuous',
                marginTop: 8,
              }}
            >
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 15 }}>
                Refresh
              </Text>
            </Pressable>
          </View>
        ) : mode === 'spots' ? (
          (remaining as Venue[])
            .slice(0, 3)
            .reverse()
            .map((venue, i, arr) => (
              <SwipeCard
                key={venue.id}
                venue={venue}
                isTop={i === arr.length - 1}
                index={arr.length - 1 - i}
                onSwipeLeft={() => handleSpotSwipe('left')}
                onSwipeRight={() => handleSpotSwipe('right')}
                onTap={handleTap}
              />
            ))
        ) : (
          (remaining as EventWithVenue[])
            .slice(0, 3)
            .reverse()
            .map((event, i, arr) => (
              <EventSwipeCard
                key={event.id}
                event={event}
                isTop={i === arr.length - 1}
                index={arr.length - 1 - i}
                onSwipeLeft={() => handleEventSwipe('left')}
                onSwipeRight={() => handleEventSwipe('right')}
                onTap={handleTap}
              />
            ))
        )}
      </View>
    </GestureHandlerRootView>
  );
}
