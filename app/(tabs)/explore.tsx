import { HotMeter } from '@/components/hot-meter';
import { VibeBadge } from '@/components/vibe-badge';
import { useAppTheme } from '@/constants/tokens';
import { supabase } from '@/lib/supabase';
import { type Venue } from '@/lib/types';
import { FlashList } from "@shopify/flash-list";
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CATEGORIES = ['All', 'club', 'lounge', 'rooftop', 'bar', 'popup'] as const;
const CATEGORY_LABELS: Record<string, string> = {
  All: 'All',
  club: '🎶 Club',
  lounge: '🍸 Lounge',
  rooftop: '🌆 Rooftop',
  bar: '🍻 Bar',
  popup: '⚡ Pop-Up',
};

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('hot_score', { ascending: false });
      if (error) {
        setLoadError(error.message);
        setLoading(false);
        return;
      }
      setVenues(data ?? []);
      setFilteredVenues(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    let filtered = venues;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((v) => v.category === selectedCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.description?.toLowerCase().includes(q) ||
          v.vibe_tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    setFilteredVenues(filtered);
  }, [search, selectedCategory, venues]);

  const renderVenue = ({ item }: { item: Venue }) => (
    <Link href={`/spot/${item.id}`} asChild>
      <Pressable
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 18,
          borderCurve: 'continuous',
          overflow: 'hidden',
          marginBottom: 14,
          borderWidth: 1,
          borderColor: theme.colors.surfaceBorder,
        }}
      >
        <Image
          source={{ uri: item.cover_image_url ?? '' }}
          style={{ width: '100%', height: 160 }}
          contentFit="cover"
        />
        <View style={{ padding: 14, gap: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text, flex: 1 }}>
              {item.name}
            </Text>
            <HotMeter score={item.hot_score} />
          </View>
          <Text style={{ fontSize: 13, color: theme.colors.textTertiary }}>
            📍 {item.address}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {item.vibe_tags?.slice(0, 3).map((vibe) => (
              <VibeBadge key={vibe} vibe={vibe} />
            ))}
          </View>
        </View>
      </Pressable>
    </Link>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background, padding: 24, gap: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text }}>
          Could not load venues
        </Text>
        <Text style={{ fontSize: 14, color: theme.colors.textTertiary, textAlign: 'center' }}>
          {loadError}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 16, gap: 14, paddingBottom: 8 }}>
        <Text style={{ fontSize: 32, fontWeight: '800', color: theme.colors.text }}>Explore</Text>

        <TextInput
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: 14,
            borderCurve: 'continuous',
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: 16,
            color: theme.colors.text,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
          placeholder="Search spots, vibes..."
          placeholderTextColor={theme.colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />

        <FlashList<string>
          horizontal
          data={[...CATEGORIES]}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                setSelectedCategory(item);
              }}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                borderCurve: 'continuous',
                backgroundColor: selectedCategory === item ? theme.colors.primary : theme.colors.surface,
                borderWidth: 1,
                borderColor: selectedCategory === item ? theme.colors.primary : theme.colors.border,
              }}
            >
              <Text
                style={{
                  color: selectedCategory === item ? theme.colors.text : theme.colors.textSecondary,
                  fontSize: 14,
                  fontWeight: '600',
                }}
              >
                {CATEGORY_LABELS[item]}
              </Text>
            </Pressable>
          )}
        />
      </View>

      <FlashList<Venue>
        data={filteredVenues}
        renderItem={renderVenue}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 60, gap: 12 }}>
            <Text style={{ fontSize: 40 }}>🔍</Text>
            <Text style={{ color: theme.colors.textTertiary, fontSize: 16 }}>No spots found</Text>
          </View>
        }
      />
    </View>
  );
}
