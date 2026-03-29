import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { VibeBadge } from '@/components/vibe-badge';
import { useAppTheme } from '@/constants/tokens';
import { type EventWithVenue } from '@/lib/types';

const SWIPE_THRESHOLD = 120;

type EventSwipeCardProps = {
  event: EventWithVenue;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onTap: () => void;
  isTop: boolean;
  index: number;
};

export function EventSwipeCard({
  event,
  onSwipeLeft,
  onSwipeRight,
  onTap,
  isTop,
  index,
}: EventSwipeCardProps) {
  const { width } = useWindowDimensions();
  const theme = useAppTheme();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const cardScale = useSharedValue(1);

  const pan = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.4;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(width + 100, { duration: 300 });
        runOnJS(onSwipeRight)();
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-width - 100, { duration: 300 });
        runOnJS(onSwipeLeft)();
      } else {
        translateX.value = withSpring(0, { damping: 15 });
        translateY.value = withSpring(0, { damping: 15 });
      }
    });

  const tap = Gesture.Tap()
    .enabled(isTop)
    .onEnd(() => {
      runOnJS(onTap)();
    });

  const gesture = Gesture.Race(pan, tap);

  const animatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(translateX.value, [-width / 2, 0, width / 2], [-15, 0, 15]);
    const stackOffset = isTop ? 0 : index * 6;
    const stackScale = isTop ? 1 : 1 - index * 0.04;

    return {
      transform: [
        { translateX: isTop ? translateX.value : 0 },
        { translateY: isTop ? translateY.value : stackOffset },
        { rotate: isTop ? `${rotation}deg` : '0deg' },
        { scale: isTop ? cardScale.value : stackScale },
      ],
    };
  });

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1]),
  }));

  const nopeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0]),
  }));

  const coverUrl = event.cover_image_url ?? event.venue.cover_image_url;
  const startDate = new Date(event.starts_at);
  const timeStr = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const dateStr = startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: 24,
            borderCurve: 'continuous',
            overflow: 'hidden',
            backgroundColor: theme.colors.surface,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          },
          animatedStyle,
        ]}
      >
        <Image
          source={{ uri: coverUrl ?? '' }}
          style={{ width: '100%', height: '100%', position: 'absolute' }}
          contentFit="cover"
        />

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.9)']}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '55%',
          }}
        />

        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 40,
              left: 24,
              borderWidth: 3,
              borderColor: theme.colors.success,
              backgroundColor: theme.colors.success,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 8,
              transform: [{ rotate: '-15deg' }],
            },
            likeOpacity,
          ]}
        >
          <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: '900' }}>
            I'M IN 🙋
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 40,
              right: 24,
              borderWidth: 3,
              borderColor: theme.colors.danger,
              backgroundColor: theme.colors.danger,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 8,
              transform: [{ rotate: '15deg' }],
            },
            nopeOpacity,
          ]}
        >
          <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: '900' }}>
            SKIP 👋
          </Text>
        </Animated.View>

        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 24,
            gap: 10,
          }}
        >
          <View
            style={{
              backgroundColor: '#FF6B6B',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 10,
              borderCurve: 'continuous',
              alignSelf: 'flex-start',
            }}
          >
            <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '700' }}>
              {dateStr} • {timeStr}
            </Text>
          </View>

          <Text style={{ fontSize: 26, fontWeight: '800', color: theme.colors.text }}>
            {event.title}
          </Text>

          {event.description && (
            <Text
              style={{ fontSize: 14, color: '#CCC', lineHeight: 20 }}
              numberOfLines={2}
            >
              {event.description}
            </Text>
          )}

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
            {event.venue.vibe_tags?.map((vibe) => (
              <VibeBadge key={vibe} vibe={vibe} />
            ))}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <Text style={{ fontSize: 13, color: '#999' }}>
              📍 {event.venue.name} • {event.venue.address}
            </Text>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
