import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';
import Animated, { FadeOut, ReduceMotion } from 'react-native-reanimated';

import { colors, motion } from '@/theme';

// Same image and size as the native splash (app.config.ts: splash-icon.png at imageWidth 180),
// so the hand-off from the native splash is pixel-identical.
const SPLASH_IMAGE = require('@/assets/splash-icon.png');
const SPLASH_SIZE = 180;

const fadeOut = FadeOut.duration(motion.duration.slow).reduceMotion(ReduceMotion.Never);

/**
 * In-app splash shown once the app is ready. Unmount it and it fades out over the first screen.
 * The fade is kept under Reduce Motion: it's an opacity change, not motion.
 */
export function AnimatedSplash() {
  return (
    <Animated.View
      exiting={fadeOut}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.root}
    >
      <Image source={SPLASH_IMAGE} style={styles.logo} contentFit="contain" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgTop,
  },
  logo: {
    width: SPLASH_SIZE,
    height: SPLASH_SIZE,
  },
});
