import { FlashList } from '@shopify/flash-list';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { use, useCallback, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';

import { ChatBubble } from '@/components/chat-bubble';
import { ReportModal } from '@/components/report-modal';
import { useAppTheme } from '@/constants/tokens';
import { AuthContext } from '@/contexts/auth-context';
import {
  getConversation,
  getMessages,
  sendMessage as sendChatMessage,
  subscribeToMessages,
} from '@/lib/services/chat';
import { supabase } from '@/lib/supabase';
import { type Message, type Profile } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen() {
  const theme = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, profile: myProfile } = use(AuthContext);

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [otherProfile, setOtherProfile] = useState<Profile | null>(null);
  const [showReport, setShowReport] = useState(false);
  const listRef = useRef<any>(null);

  const loadMessages = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getMessages(id);
      setMessages(data);
    } catch {
      setMessages([]);
    }
  }, [id]);

  useEffect(() => {
    if (!id || !user) return;

    getConversation(id).then((conv) => {
      if (!conv) return;
      const otherUserId = conv.participant_ids.find((pid) => pid !== user.id);
      if (otherUserId) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', otherUserId)
          .single()
          .then(({ data }) => setOtherProfile(data));
      }
    });
  }, [id, user]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!id) return;

    const channel = subscribeToMessages(id, (newMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!text.trim() || !user || !id) return;

    const messageText = text.trim();
    setText('');

    try {
      await sendChatMessage(id, user.id, messageText, myProfile?.is_anonymous ?? false);
    } catch {
      setText(messageText);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerBackButtonDisplayMode: 'minimal',
          title: otherProfile?.display_name || 'Chat',
          headerTintColor: theme.colors.text,
          headerStyle: { backgroundColor: theme.colors.background },
          headerRight: () =>
            otherProfile ? (
              <Pressable onPress={() => setShowReport(true)} style={{ padding: 4 }}>
                <Ionicons name="ellipsis-horizontal" size={22} color={theme.colors.text} />
              </Pressable>
            ) : null,
        }}
      />

      <FlashList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 8,
        }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <ChatBubble
            body={item.body}
            isOwn={item.sender_id === user?.id}
            isAnonymous={item.is_anonymous}
            timestamp={new Date(item.created_at).getTime()}
          />
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 60, gap: 8 }}>
            <Text style={{ fontSize: 32 }}>👋</Text>
            <Text style={{ color: theme.colors.textTertiary, fontSize: 15 }}>
              Say hi to {otherProfile?.display_name ?? 'your match'}!
            </Text>
          </View>
        }
      />

      <KeyboardStickyView>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            padding: 12,
            gap: 10,
            borderTopWidth: 1,
            borderTopColor: theme.colors.surface,
            backgroundColor: theme.colors.background,
          }}
        >
          <TextInput
            style={{
              flex: 1,
              backgroundColor: theme.colors.surface,
              borderRadius: 22,
              borderCurve: 'continuous',
              paddingHorizontal: 18,
              paddingVertical: 12,
              fontSize: 16,
              color: theme.colors.text,
              maxHeight: 100,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
            placeholder="Message..."
            placeholderTextColor={theme.colors.textMuted}
            value={text}
            onChangeText={setText}
            multiline
          />
          <Pressable
            onPress={handleSend}
            disabled={!text.trim()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: text.trim() ? theme.colors.primary : theme.colors.border,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons
              name="arrow-forward"
              size={20}
              color={theme.colors.text}
            />
          </Pressable>
        </View>
      </KeyboardStickyView>

      {otherProfile && user && (
        <ReportModal
          visible={showReport}
          onClose={() => setShowReport(false)}
          reporterId={user.id}
          reportedUserId={otherProfile.id}
          reportedUserName={otherProfile.display_name ?? 'User'}
        />
      )}
    </View>
  );
}
