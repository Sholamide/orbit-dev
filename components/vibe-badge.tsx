import { Text, View } from 'react-native';

import { useAppTheme, palette } from '@/constants/tokens';

const VIBE_COLORS: Record<string, string> = {
  Hype: palette.red,
  Chill: palette.cyan,
  Exclusive: palette.gold,
  'Live Music': palette.pink,
  Rooftop: palette.orange,
  Underground: palette.purple,
  'Day Party': palette.green,
  'Late Night': palette.indigo,
};

export function VibeBadge({ vibe }: { vibe: string }) {
  const theme = useAppTheme();

  const color = VIBE_COLORS[vibe] ?? theme.colors.textTertiary;

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
