import { Text, View } from 'react-native';

import { useAppTheme } from '@/constants/tokens';

type ChatBubbleProps = {
  body: string;
  isOwn: boolean;
  isAnonymous: boolean;
  timestamp: number;
};

export function ChatBubble({ body, isOwn, isAnonymous, timestamp }: ChatBubbleProps) {
  const theme = useAppTheme();

  const time = new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <View
      style={{
        alignSelf: isOwn ? 'flex-end' : 'flex-start',
        maxWidth: '78%',
        gap: 4,
      }}
    >
      {isAnonymous && !isOwn && (
        <Text style={{ fontSize: 11, color: theme.colors.textMuted, marginLeft: 12 }}>
          👻 Anonymous
        </Text>
      )}
      <View
        style={{
          backgroundColor: isOwn ? theme.colors.primary : theme.colors.surface,
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 20,
          borderCurve: 'continuous',
          borderBottomRightRadius: isOwn ? 6 : 20,
          borderBottomLeftRadius: isOwn ? 20 : 6,
        }}
      >
        <Text style={{ color: theme.colors.text, fontSize: 15, lineHeight: 21 }}>
          {body}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 11,
          color: theme.colors.textPlaceholder,
          alignSelf: isOwn ? 'flex-end' : 'flex-start',
          marginHorizontal: 12,
          fontVariant: ['tabular-nums'],
        }}
      >
        {time}
      </Text>
    </View>
  );
}
