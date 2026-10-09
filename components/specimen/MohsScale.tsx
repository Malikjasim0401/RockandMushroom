import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/ui';
import { parseMohs } from '@/lib/mohs';
import { colors, motion, radii, spacing } from '@/theme';

const STEPS = Array.from({ length: 10 }, (_, i) => i + 1);

/** Familiar reference points, so "7" means something. */
const REFERENCES: { upTo: number; label: string }[] = [
  { upTo: 2.5, label: 'Softer than a fingernail' },
  { upTo: 3.5, label: 'Softer than a copper coin' },
  { upTo: 5.5, label: 'Softer than a steel knife' },
  { upTo: 7, label: 'Scratches glass' },
  { upTo: 10, label: 'Harder than quartz' },
];

const referenceFor = (max: number) => REFERENCES.find((r) => max <= r.upTo)?.label ?? '';

/** Mohs hardness 1–10 as a segmented bar. Renders nothing if the value can't be read. */
export function MohsScale({ hardness }: { hardness: string }) {
  const range = parseMohs(hardness);
  const fill = useSharedValue(0);

  const min = range?.min ?? 0;
  const max = range?.max ?? 0;
  useEffect(() => {
    fill.set(
      withTiming(max / STEPS.length, {
        duration: motion.duration.slow,
        easing: motion.easing,
        reduceMotion: ReduceMotion.System,
      }),
    );
  }, [fill, max]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.get() * 100}%` }));

  if (!range) return null;

  return (
    <View
      accessible
      accessibilityLabel={`Mohs hardness ${hardness}. ${referenceFor(max)}`}
      style={styles.root}
    >
      <View style={styles.header}>
        <Text variant="section">Mohs hardness</Text>
        <Text variant="captionStrong" color="amberDeep">
          {min === max ? min : `${min}–${max}`} · {referenceFor(max)}
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]} />
        <View style={styles.ticks} pointerEvents="none">
          {STEPS.map((step) => (
            <View key={step} style={styles.tick} />
          ))}
        </View>
      </View>
      <View style={styles.scale}>
        <Text variant="caption">1 Talc</Text>
        <Text variant="caption">10 Diamond</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.xs,
  },
  header: {
    gap: spacing.xxs,
  },
  track: {
    height: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.divider,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.amber,
  },
  ticks: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
  },
  tick: {
    flex: 1,
    borderRightWidth: StyleSheet.hairlineWidth * 2,
    borderRightColor: colors.surface,
  },
  scale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
