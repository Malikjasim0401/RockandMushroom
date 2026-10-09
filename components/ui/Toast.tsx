import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, layout, motion, radii, shadows, spacing, transitions } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';
import { TextButton } from './TextButton';

type ToastProps = {
  message: string;
  icon?: IconName;
  actionLabel?: string;
  onAction?: () => void;
};

const dropIn = FadeInDown.duration(motion.duration.slow)
  .easing(motion.easing)
  .withInitialValues({ opacity: 0, transform: [{ translateY: -12 }] })
  .reduceMotion(ReduceMotion.System);

/** Top-of-screen banner with an optional action (e.g. Retry). Announced by screen readers. */
export function Toast({ message, icon = 'alert', actionLabel, onAction }: ToastProps) {
  const { top } = useSafeAreaInsets();
  return (
    <Animated.View
      entering={dropIn}
      exiting={transitions.fadeOut}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      style={[styles.toast, { top: top + spacing.xs }]}
    >
      <View style={styles.icon}>
        <Icon name={icon} size={18} color="danger" />
      </View>
      <Text variant="label" style={styles.message}>
        {message}
      </Text>
      {actionLabel && onAction && <TextButton title={actionLabel} onPress={onAction} />}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: layout.touchTarget + spacing.sm,
    paddingLeft: spacing.sm,
    paddingRight: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    boxShadow: shadows.raised,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
});
