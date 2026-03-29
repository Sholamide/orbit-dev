import { Text, View } from 'react-native';

import { useAppTheme, palette } from '@/constants/tokens';

export function HotMeter({ score }: { score: number }) {
  const theme = useAppTheme();

  const clampedScore = Math.min(100, Math.max(0, score));
  const isHot = clampedScore >= 85;

  const getColor = () => {
    if (clampedScore >= 90) return theme.colors.danger;
    if (clampedScore >= 75) return palette.orange;
    if (clampedScore >= 50) return palette.gold;
    return theme.colors.textTertiary;
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
