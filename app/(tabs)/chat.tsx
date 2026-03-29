import { Link } from 'expo-router';
import React, { use, useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';

import { AttendeeAvatar } from '@/components/attendee-avatar';
import { useAppTheme } from '@/constants/tokens';
import { AuthContext } from '@/contexts/auth-context';
import { listConversations, subscribeToConversations } from '@/lib/services/chat';
import { supabase } from '@/lib/supabase';
import { type Conversation, type Profile } from '@/lib/types';

export default function ChatListScreen() {
  const { user } = use(AuthContext);
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [participantProfiles, setParticipantProfiles] = useState<Record<string, Profile>>({});

  const loadConversations = useCallback(async () => {
    if (!user) return;
    try {
      const data = await listConversations(user.id);
      setConversations(data);
    } catch {
      setConversations([]);
    }
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!user) return;

    const channel = subscribeToConversations(user.id, () => {
      loadConversations();
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadConversations]);

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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 12 }}>
        <Text style={{ fontSize: 32, fontWeight: '800', color: theme.colors.text }}>Chat</Text>
      </View>

      {conversations.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
          <Text style={{ fontSize: 48 }}>💬</Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text }}>No chats yet</Text>
          <Text style={{ fontSize: 14, color: theme.colors.textTertiary, textAlign: 'center', paddingHorizontal: 40 }}>
            When someone accepts your companion request (or you accept theirs), you can chat here.
          </Text>
        </View>
      ) : (
        <FlashList
          data={conversations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => {
            const otherUserId = item.participant_ids.find((pid) => pid !== user?.id);
            const otherProfile = otherUserId ? participantProfiles[otherUserId] : null;
            const timeAgo = item.last_message_at
              ? formatTimeAgo(new Date(item.last_message_at).getTime())
              : '';

            return (
              <Link href={`/chat/${item.id}`} asChild>
                <Pressable
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 14,
                    gap: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.surface,
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
                        backgroundColor: theme.colors.border,
                      }}
                    />
                  )}
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text }}>
                      {otherProfile?.display_name ?? 'Unknown'}
                    </Text>
                    {item.last_message && (
                      <Text
                        style={{ fontSize: 14, color: theme.colors.textTertiary }}
                        numberOfLines={1}
                      >
                        {item.last_message}
                      </Text>
                    )}
                  </View>
                  {timeAgo && (
                    <Text style={{ fontSize: 12, color: theme.colors.textMuted, fontVariant: ['tabular-nums'] }}>
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
