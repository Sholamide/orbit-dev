import { useMutation, useQuery } from 'convex/react';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { use, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ChatBubble } from '@/components/chat-bubble';
import { AuthContext } from '@/contexts/auth-context';
import { api } from '@/convex/_generated/api';
import { type Id } from '@/convex/_generated/dataModel';
import { supabase } from '@/lib/supabase';
import { type Profile } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, profile: myProfile } = use(AuthContext);
  const conversationId = id as Id<'conversations'>;

  const conversation = useQuery(api.conversations.get, { id: conversationId });
  const messages = useQuery(api.messages.list, { conversationId });
  const sendMessage = useMutation(api.messages.send);

  const [text, setText] = useState('');
  const [otherProfile, setOtherProfile] = useState<Profile | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!conversation || !user) return;
    const otherUserId = conversation.participant_ids.find((pid) => pid !== user.id);
    if (otherUserId) {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', otherUserId)
        .single()
        .then(({ data }) => setOtherProfile(data));
    }
  }, [conversation, user]);

  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages?.length]);

  const handleSend = async () => {
    if (!text.trim() || !user) return;

    const messageText = text.trim();
    setText('');

    await sendMessage({
      conversationId,
      senderId: user.id,
      body: messageText,
      isAnonymous: myProfile?.is_anonymous ?? false,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0D0D0D' }}>
      <Stack.Screen
        options={{
          title: otherProfile?.display_name ?? '',
          headerTintColor: '#FFF',
          headerStyle: { backgroundColor: '#0D0D0D' },
        }}
      />

      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1 }}
        keyboardVerticalOffset={100}
      >
        <FlatList
          ref={flatListRef}
          data={messages ?? []}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{
            padding: 16,
            gap: 8,
            paddingBottom: 8,
          }}
          renderItem={({ item }) => (
            <ChatBubble
              body={item.body}
              isOwn={item.sender_id === user?.id}
              isAnonymous={item.is_anonymous}
              timestamp={item.created_at}
            />
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60, gap: 8 }}>
              <Text style={{ fontSize: 32 }}>👋</Text>
              <Text style={{ color: '#888', fontSize: 15 }}>
                Say hi to {otherProfile?.display_name ?? 'your match'}!
              </Text>
            </View>
          }
        />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            padding: 12,
            gap: 10,
            borderTopWidth: 1,
            borderTopColor: '#1A1A1A',
            backgroundColor: '#0D0D0D',
          }}
        >
          <TextInput
            style={{
              flex: 1,
              backgroundColor: '#1A1A1A',
              borderRadius: 22,
              borderCurve: 'continuous',
              paddingHorizontal: 18,
              paddingVertical: 12,
              fontSize: 16,
              color: '#FFF',
              maxHeight: 100,
              borderWidth: 1,
              borderColor: '#333',
            }}
            placeholder="Message..."
            placeholderTextColor="#666"
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
              backgroundColor: text.trim() ? '#FF6B6B' : '#333',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons
              name="arrow-forward"
              style={{ width: 20, height: 20 }}
              tintColor="#FFF"
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
