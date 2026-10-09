import { useEffect } from 'react';
import { StyleSheet, View, type DimensionValue } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors, motion, radii } from '@/theme';

import { GradientBg } from './GradientBg';

type SkeletonProps = {
  width?: DimensionValue;
  height: number;
  radius?: number;
};

const BAND = 140;

/** Placeholder with a sweeping shimmer. Static under Reduce Motion. */
export function Skeleton({ width = '100%', height, radius = radii.input }: SkeletonProps) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    progress.set(
      withRepeat(withTiming(1, { duration: motion.shimmerMs, easing: Easing.linear }), -1),
    );
    return () => cancelAnimation(progress);
  }, [progress, reduceMotion]);

  const bandStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.get(), [0, 1], [-BAND, 420]) }],
  }));

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.base, { width, height, borderRadius: radius }]}
    >
      {!reduceMotion && (
        <Animated.View style={[styles.band, bandStyle]}>
          <GradientBg variant="shimmer" style={StyleSheet.absoluteFill} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.skeleton,
    overflow: 'hidden',
  },
  band: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: BAND,
  },
});
