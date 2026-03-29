import { Text, View } from 'react-native';

export function HotMeter({ score }: { score: number }) {
  const clampedScore = Math.min(100, Math.max(0, score));
  const isHot = clampedScore >= 85;

  const getColor = () => {
    if (clampedScore >= 90) return '#FF4444';
    if (clampedScore >= 75) return '#FF8C42';
    if (clampedScore >= 50) return '#FFD700';
    return '#888';
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Text style={{ fontSize: 12 }}>{isHot ? '🔥' : '🌡️'}</Text>
      <Text
        style={{
          fontSize: 13,
          fontWeight: '700',
          color: getColor(),
          fontVariant: ['tabular-nums'],
        }}
      >
        {clampedScore}
      </Text>
    </View>
  );
}
