import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useQuery } from 'convex/react';
import React, { use, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';

import { AttendeeAvatar } from '@/components/attendee-avatar';
import { AuthContext } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { type Profile } from '@/lib/types';
import { api } from '@/convex/_generated/api';

export default function ChatListScreen() {
  const { user } = use(AuthContext);
  const conversations = useQuery(api.conversations.list, user ? { userId: user.id } : 'skip');
  const [participantProfiles, setParticipantProfiles] = useState<Record<string, Profile>>({});

  useEffect(() => {
    if (!conversations || !user) return;

    const otherUserIds = new Set<string>();
    for (const conv of conversations) {
      for (const pid of conv.participant_ids) {
        if (pid !== user.id) otherUserIds.add(pid);
      }
    }

    if (otherUserIds.size === 0) return;

    supabase
      .from('profiles')
      .select('*')
      .in('id', Array.from(otherUserIds))
      .then(({ data }) => {
        if (data) {
          const map: Record<string, Profile> = {};
          for (const p of data) map[p.id] = p;
          setParticipantProfiles(map);
        }
      });
  }, [conversations, user]);

  if (!conversations) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D0D0D' }}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0D0D0D' }}>
      <View style={{ paddingTop: 60, paddingHorizontal: 16, paddingBottom: 12 }}>
        <Text style={{ fontSize: 32, fontWeight: '800', color: '#FFF' }}>Chat</Text>
      </View>

      {conversations.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
          <Text style={{ fontSize: 48 }}>💬</Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#FFF' }}>No chats yet</Text>
          <Text style={{ fontSize: 14, color: '#888', textAlign: 'center', paddingHorizontal: 40 }}>
            When someone accepts your companion request (or you accept theirs), you can chat here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => {
            const otherUserId = item.participant_ids.find((pid) => pid !== user?.id);
            const otherProfile = otherUserId ? participantProfiles[otherUserId] : null;
            const timeAgo = item.last_message_at
              ? formatTimeAgo(item.last_message_at)
              : '';

            return (
              <Link href={`/chat/${item._id}`} asChild>
                <Pressable
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 14,
                    gap: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#1A1A1A',
                  }}
                >
                  {otherProfile ? (
                    <AttendeeAvatar profile={otherProfile} size={50} />
                  ) : (
                    <View
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        backgroundColor: '#333',
                      }}
                    />
                  )}
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFF' }}>
                      {otherProfile?.display_name ?? 'Unknown'}
                    </Text>
                    {item.last_message && (
                      <Text
                        style={{ fontSize: 14, color: '#888' }}
                        numberOfLines={1}
                      >
                        {item.last_message}
                      </Text>
                    )}
                  </View>
                  {timeAgo && (
                    <Text style={{ fontSize: 12, color: '#666', fontVariant: ['tabular-nums'] }}>
                      {timeAgo}
                    </Text>
                  )}
                </Pressable>
              </Link>
            );
          }}
        />
      )}
    </View>
  );
}

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}
