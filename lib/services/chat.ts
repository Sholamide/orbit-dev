import { type RealtimeChannel } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import { type Conversation, type Message } from '@/lib/types';

export async function listConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .contains('participant_ids', [userId])
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (error) throw error;
  return data ?? [];
}

export async function getConversation(conversationId: string): Promise<Conversation | null> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single();

  if (error) return null;
  return data;
}

export async function createConversation(
  participantIds: string[],
  eventId?: string
): Promise<string> {
  const { data: existing } = await supabase
    .from('conversations')
    .select('id, participant_ids')
    .contains('participant_ids', participantIds);

  const match = existing?.find(
    (c) =>
      c.participant_ids.length === participantIds.length &&
      participantIds.every((id) => c.participant_ids.includes(id))
  );

  if (match) return match.id;

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      participant_ids: participantIds,
      event_id: eventId ?? null,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  body: string,
  isAnonymous: boolean = false
): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      body,
      is_anonymous: isAnonymous,
    })
    .select('*')
    .single();

  if (error) throw error;

  await supabase
    .from('conversations')
    .update({
      last_message: body.length > 100 ? body.slice(0, 100) + '...' : body,
      last_message_at: new Date().toISOString(),
    })
    .eq('id', conversationId);

  return data;
}

export function subscribeToMessages(
  conversationId: string,
  onNewMessage: (message: Message) => void
): RealtimeChannel {
  return supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onNewMessage(payload.new as Message);
      }
    )
    .subscribe();
}

export function subscribeToConversations(
  userId: string,
  onUpdate: (conversation: Conversation) => void
): RealtimeChannel {
  return supabase
    .channel(`conversations:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
      },
      (payload) => {
        const conv = (payload.new as Conversation);
        if (conv.participant_ids?.includes(userId)) {
          onUpdate(conv);
        }
      }
    )
    .subscribe();
}
