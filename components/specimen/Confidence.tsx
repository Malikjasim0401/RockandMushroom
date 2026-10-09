import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Badge, Text } from '@/components/ui';
import { type Alternative } from '@/lib/types';
import { colors, motion, radii, spacing } from '@/theme';

/** Below this, the result is labelled "Best guess" and alternatives are shown. */
export const BEST_GUESS_BELOW = 60;

export const isBestGuess = (confidence: number) => confidence < BEST_GUESS_BELOW;

export function ConfidenceBadge({ confidence }: { confidence: number }) {
  return isBestGuess(confidence) ? (
    <Badge label={`Best guess · ${confidence}%`} icon="help" tone="sun" />
  ) : (
    <Badge label={`${confidence}% match`} icon="sparkles" tone="primary" />
  );
}

/** Bar that fills from empty when it appears, so a new result feels earned. */
export function Meter({ value }: { value: number }) {
  const fill = useSharedValue(0);
  const target = Math.max(4, Math.min(100, value)) / 100;

  useEffect(() => {
    fill.set(
      withTiming(target, {
        duration: motion.duration.slow,
        easing: motion.easing,
        reduceMotion: ReduceMotion.System,
      }),
    );
  }, [fill, target]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.get() * 100}%` }));
  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, fillStyle]} />
    </View>
  );
}

/** Other likely identifications with a confidence bar each. */
export function Alternatives({ items }: { items: Alternative[] }) {
  if (items.length === 0) return null;
  return (
    <View style={styles.list}>
      <Text variant="section">Could also be</Text>
      {items.map((a) => (
        <View
          key={a.name}
          accessible
          accessibilityLabel={`${a.name}, ${a.confidence} percent`}
          style={styles.row}
        >
          <View style={styles.rowTop}>
            <Text variant="bodyStrong" style={styles.name} numberOfLines={1}>
              {a.name}
            </Text>
            <Text variant="captionStrong" color="inkMuted">
              {a.confidence}%
            </Text>
          </View>
          <Meter value={a.confidence} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  row: {
    gap: spacing.xs,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    flex: 1,
  },
  track: {
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.divider,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.amber,
  },
});
