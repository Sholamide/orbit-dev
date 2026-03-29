import { HotMeter } from '@/components/hot-meter';
import { VibeBadge } from '@/components/vibe-badge';
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
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('venues')
        .select('*')
        .order('hot_score', { ascending: false });
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
          backgroundColor: '#1A1A1A',
          borderRadius: 18,
          borderCurve: 'continuous',
          overflow: 'hidden',
          marginBottom: 14,
          borderWidth: 1,
          borderColor: '#2A2A2A',
        }}
      >
        <Image
          source={{ uri: item.cover_image_url ?? '' }}
          style={{ width: '100%', height: 160 }}
          contentFit="cover"
        />
        <View style={{ padding: 14, gap: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#FFF', flex: 1 }}>
              {item.name}
            </Text>
            <HotMeter score={item.hot_score} />
          </View>
          <Text style={{ fontSize: 13, color: '#999' }}>
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D0D0D' }}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0D0D0D' }}>
      <View style={{ paddingTop: 60, paddingHorizontal: 16, gap: 14, paddingBottom: 8 }}>
        <Text style={{ fontSize: 32, fontWeight: '800', color: '#FFF' }}>Explore</Text>

        <TextInput
          style={{
            backgroundColor: '#1A1A1A',
            borderRadius: 14,
            borderCurve: 'continuous',
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: 16,
            color: '#FFF',
            borderWidth: 1,
            borderColor: '#333',
          }}
          placeholder="Search spots, vibes..."
          placeholderTextColor="#666"
          value={search}
          onChangeText={setSearch}
        />

        <FlashList
          horizontal
          data={CATEGORIES}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }: { item: any }) => (
            <Pressable
              onPress={() => {
                setSelectedCategory(item);
              }}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                borderCurve: 'continuous',
                backgroundColor: selectedCategory === item ? '#FF6B6B' : '#1A1A1A',
                borderWidth: 1,
                borderColor: selectedCategory === item ? '#FF6B6B' : '#333',
              }}
            >
              <Text
                style={{
                  color: selectedCategory === item ? '#FFF' : '#AAA',
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

      <FlashList
        data={filteredVenues}
        renderItem={renderVenue}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 60, gap: 12 }}>
            <Text style={{ fontSize: 40 }}>🔍</Text>
            <Text style={{ color: '#888', fontSize: 16 }}>No spots found</Text>
          </View>
        }
      />
    </View>
  );
}
