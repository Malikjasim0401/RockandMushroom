import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { type ColorName, hitSlop, layout } from '@/theme';

import { Text } from './Text';

type TextButtonProps = {
  title: string;
  onPress: () => void;
  color?: ColorName;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Text-only action (links like "Forgot password?") with a full 44 pt touch target. */
export function TextButton({
  title,
  onPress,
  color = 'primary',
  disabled,
  style,
}: TextButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [styles.base, (pressed || disabled) && styles.dim, style]}
    >
      <Text variant="label" color={color}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: layout.touchTarget,
    justifyContent: 'center',
  },
  dim: {
    opacity: 0.55,
  },
});
