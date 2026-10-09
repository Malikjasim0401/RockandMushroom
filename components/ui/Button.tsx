import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, layout, radii, shadows, spacing } from '@/theme';

import { GradientBg } from './GradientBg';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  style,
  accessibilityHint,
}: ButtonProps) {
  const inactive = disabled || loading;
  const fg = variant === 'primary' || variant === 'danger' ? 'onPrimary' : 'primary';

  const content = (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator color={colors[fg]} />
      ) : (
        <>
          {icon && <Icon name={icon} size={18} color={fg} />}
          <Text variant="button" color={fg}>
            {title}
          </Text>
        </>
      )}
    </View>
  );

  return (
    <PressableScale
      onPress={onPress}
      disabled={inactive}
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={[styles.base, variantStyles[variant], inactive && styles.inactive, style]}
    >
      {variant === 'primary' ? (
        <GradientBg variant="primary" style={styles.fill}>
          <GradientBg variant="gloss" style={styles.gloss} />
          {content}
        </GradientBg>
      ) : (
        content
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    height: layout.buttonHeight,
    borderRadius: radii.button,
  },
  fill: {
    flex: 1,
    borderRadius: radii.button,
  },
  gloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
    borderTopLeftRadius: radii.button,
    borderTopRightRadius: radii.button,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  inactive: {
    opacity: 0.55,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    boxShadow: shadows.button,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: colors.transparent,
  },
  // Destructive, irreversible actions (e.g. delete account).
  danger: {
    backgroundColor: colors.danger,
  },
});
