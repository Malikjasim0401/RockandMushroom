import { useEffect, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { GradientBg } from '@/components/ui';
import { motion } from '@/theme';

const BAND = 180;

/** A soft green band sweeping down the photo while it's identified. Hidden under Reduce Motion. */
export function ScanOverlay() {
  const reduceMotion = useReducedMotion();
  const [height, setHeight] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion || height === 0) return;
    progress.set(
      withRepeat(withTiming(1, { duration: motion.scanMs, easing: Easing.inOut(Easing.quad) }), -1),
    );
    return () => cancelAnimation(progress);
  }, [height, progress, reduceMotion]);

  const bandStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -BAND + progress.get() * (height + BAND) }],
  }));

  if (reduceMotion) return null;

  const onLayout = (e: LayoutChangeEvent) => setHeight(e.nativeEvent.layout.height);

  return (
    <View pointerEvents="none" onLayout={onLayout} style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.band, bandStyle]}>
        <GradientBg variant="scan" style={StyleSheet.absoluteFill} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: BAND,
  },
});
