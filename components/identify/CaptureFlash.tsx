import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors, motion } from '@/theme';

/** Brief white flash each time `trigger` changes (a capture). Skipped under Reduce Motion. */
export function CaptureFlash({ trigger }: { trigger: number }) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (trigger === 0) return;
    opacity.set(
      withSequence(
        ReduceMotion.System,
        withTiming(0.75, { duration: motion.duration.flash }),
        withTiming(0, { duration: motion.duration.fast }),
      ),
    );
  }, [opacity, trigger]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.get() }));

  return <Animated.View pointerEvents="none" style={[styles.flash, style]} />;
}

const styles = StyleSheet.create({
  flash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.flash,
  },
});
