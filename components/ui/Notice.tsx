import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { colors, radii, spacing, transitions } from '@/theme';

import { Icon } from './Icon';
import { Text } from './Text';

type NoticeProps = {
  message: string;
  tone?: 'error' | 'success';
};

/** Inline banner for form-level errors and confirmations. Announced by screen readers. */
export function Notice({ message, tone = 'error' }: NoticeProps) {
  const error = tone === 'error';
  return (
    <Animated.View
      entering={transitions.fadeIn}
      exiting={transitions.fadeOut}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[styles.base, error ? styles.error : styles.success]}
    >
      <Icon name={error ? 'alert' : 'checkCircle'} size={18} color={error ? 'danger' : 'primary'} />
      <Text variant="label" color={error ? 'danger' : 'primaryDeep'} style={styles.text}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radii.input,
  },
  error: {
    backgroundColor: colors.dangerSoft,
  },
  success: {
    backgroundColor: colors.primarySoft,
  },
  text: {
    flex: 1,
  },
});
