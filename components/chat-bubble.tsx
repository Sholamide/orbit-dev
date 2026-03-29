import { Text, View } from 'react-native';

type ChatBubbleProps = {
  body: string;
  isOwn: boolean;
  isAnonymous: boolean;
  timestamp: number;
};

export function ChatBubble({ body, isOwn, isAnonymous, timestamp }: ChatBubbleProps) {
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
        <Text style={{ fontSize: 11, color: '#666', marginLeft: 12 }}>
          👻 Anonymous
        </Text>
      )}
      <View
        style={{
          backgroundColor: isOwn ? '#FF6B6B' : '#1A1A1A',
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 20,
          borderCurve: 'continuous',
          borderBottomRightRadius: isOwn ? 6 : 20,
          borderBottomLeftRadius: isOwn ? 20 : 6,
        }}
      >
        <Text style={{ color: '#FFF', fontSize: 15, lineHeight: 21 }}>
          {body}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 11,
          color: '#555',
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
