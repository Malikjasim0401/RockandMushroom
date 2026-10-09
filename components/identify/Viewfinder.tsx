import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Icon, Text } from '@/components/ui';
import { colors, radii, spacing, transitions } from '@/theme';

const CORNER = 34;
const STROKE = 3;

const corners = [
  {
    top: 0,
    left: 0,
    borderTopWidth: STROKE,
    borderLeftWidth: STROKE,
    borderTopLeftRadius: radii.input,
  },
  {
    top: 0,
    right: 0,
    borderTopWidth: STROKE,
    borderRightWidth: STROKE,
    borderTopRightRadius: radii.input,
  },
  {
    bottom: 0,
    left: 0,
    borderBottomWidth: STROKE,
    borderLeftWidth: STROKE,
    borderBottomLeftRadius: radii.input,
  },
  {
    bottom: 0,
    right: 0,
    borderBottomWidth: STROKE,
    borderRightWidth: STROKE,
    borderBottomRightRadius: radii.input,
  },
] as const;

/** Framing guide over the camera preview. Decorative, so hidden from screen readers. */
export function Viewfinder() {
  return (
    <View
      pointerEvents="none"
      style={styles.root}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Animated.View entering={transitions.pop} style={styles.frame}>
        {corners.map((c, i) => (
          <View key={i} style={[styles.corner, c]} />
        ))}
      </Animated.View>
      <Animated.View entering={transitions.fadeIn} style={styles.hint}>
        <Icon name="scan" size={14} color="onCamera" />
        <Text variant="captionStrong" color="onCamera">
          Center the specimen in the frame
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  frame: {
    width: '72%',
    aspectRatio: 1,
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    borderColor: colors.viewfinder,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.hintPill,
  },
});
