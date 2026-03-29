import { Text, View } from 'react-native';

const VIBE_COLORS: Record<string, string> = {
  Hype: '#FF4444',
  Chill: '#44BBFF',
  Exclusive: '#FFD700',
  'Live Music': '#FF6BFF',
  Rooftop: '#FF8C42',
  Underground: '#8B5CF6',
  'Day Party': '#22CC88',
  'Late Night': '#6366F1',
};

export function VibeBadge({ vibe }: { vibe: string }) {
  const color = VIBE_COLORS[vibe] ?? '#888';

  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        borderCurve: 'continuous',
        backgroundColor: `${color}22`,
        borderWidth: 1,
        borderColor: `${color}55`,
      }}
    >
      <Text style={{ color, fontSize: 12, fontWeight: '600' }}>{vibe}</Text>
    </View>
  );
}
