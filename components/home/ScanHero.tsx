import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Badge, Button, GradientBg, Icon, type IconName, Text } from '@/components/ui';
import { KIND_META } from '@/components/specimen/kinds';
import { type KindCounts } from '@/lib/stats';
import { KINDS } from '@/lib/types';
import { colors, motion, radii, shadows, spacing, transitions } from '@/theme';

type ScanHeroProps = {
  counts: KindCounts;
  onScan: () => void;
};

/** Ambient glow behind the gem: a slow breathing loop, still under Reduce Motion. */
function Glow() {
  const reduceMotion = useReducedMotion();
  const level = useSharedValue(0.55);

  useEffect(() => {
    if (reduceMotion) return;
    level.set(
      withRepeat(
        withTiming(1, { duration: motion.glowMs, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      ),
    );
    return () => cancelAnimation(level);
  }, [level, reduceMotion]);

  const style = useAnimatedStyle(() => ({ opacity: level.get() }));
  return <Animated.View pointerEvents="none" style={[styles.glow, style]} />;
}

/** The gem drifts up and down and tilts a little, like it's catching light. */
function FloatingGem() {
  const reduceMotion = useReducedMotion();
  const phase = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    phase.set(
      withRepeat(
        withTiming(1, { duration: motion.floatMs, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      ),
    );
    return () => cancelAnimation(phase);
  }, [phase, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -6 + phase.get() * 12 }, { rotate: `${-18 + phase.get() * 8}deg` }],
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.watermark, style]}>
      <Icon name="mineral" size={150} color="cameraControl" />
    </Animated.View>
  );
}

function Counter({ icon, label, value }: { icon: IconName; label: string; value: number }) {
  return (
    <View accessible accessibilityLabel={`${value} ${label}`} style={styles.counter}>
      <Icon name={icon} size={16} color="sun" />
      {/* Keyed by value, so the number pops when a new find lands. */}
      <Animated.View key={value} entering={transitions.pop}>
        <Text variant="stat" color="onCamera">
          {value}
        </Text>
      </Animated.View>
      <Text variant="caption" color="onCameraMuted">
        {label}
      </Text>
    </View>
  );
}

export function ScanHero({ counts, onScan }: ScanHeroProps) {
  return (
    <GradientBg variant="slate" style={styles.card}>
      <Glow />
      <FloatingGem />
      <Badge label="Photo ID" icon="sparkles" tone="glass" />
      <Text variant="cardTitle" color="onCamera" style={styles.title}>
        What did you find?
      </Text>
      <Text variant="body" color="onCameraMuted">
        Snap a rock, mineral or mushroom and learn what it is in seconds.
      </Text>
      <Button title="Open camera" icon="camera" onPress={onScan} style={styles.button} />
      <View style={styles.counters}>
        {KINDS.map((kind) => (
          <Counter
            key={kind}
            icon={KIND_META[kind].icon}
            label={`${KIND_META[kind].label}s`}
            value={counts[kind]}
          />
        ))}
      </View>
    </GradientBg>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.hero,
    padding: spacing.lg,
    gap: spacing.xs,
    overflow: 'hidden',
    boxShadow: shadows.raised,
  },
  glow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 90,
    height: 90,
    borderRadius: radii.pill,
    backgroundColor: colors.sunSoft,
    boxShadow: shadows.glowSun,
  },
  watermark: {
    position: 'absolute',
    right: -24,
    bottom: -10,
  },
  title: {
    marginTop: spacing.xs,
  },
  button: {
    marginTop: spacing.sm,
  },
  counters: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  counter: {
    flex: 1,
    gap: 2,
    padding: spacing.sm,
    borderRadius: radii.cardSm,
    backgroundColor: colors.cameraControl,
  },
});
