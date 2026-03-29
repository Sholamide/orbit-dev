CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_ids text[] NOT NULL,
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  last_message text,
  last_message_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_conversations_participants ON conversations USING GIN (participant_ids);
CREATE INDEX idx_conversations_last_message_at ON conversations (last_message_at DESC NULLS LAST);

CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id text NOT NULL,
  body text NOT NULL,
  is_anonymous boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_messages_conversation ON messages (conversation_id, created_at);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  USING (auth.uid()::text = ANY(participant_ids));

CREATE POLICY "Users can create conversations they participate in"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid()::text = ANY(participant_ids));

CREATE POLICY "Users can update their conversations"
  ON conversations FOR UPDATE
  USING (auth.uid()::text = ANY(participant_ids));

CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND auth.uid()::text = ANY(conversations.participant_ids)
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid()::text = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND auth.uid()::text = ANY(conversations.participant_ids)
    )
  );

ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
