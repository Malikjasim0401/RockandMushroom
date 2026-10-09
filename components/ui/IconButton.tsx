import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { type ColorName, colors, hitSlop, layout, radii, shadows } from '@/theme';

import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';

type IconButtonProps = {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  tone?: 'light' | 'dark';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Round 44 pt icon control. `dark` sits on the camera panel. */
export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  tone = 'light',
  disabled,
  style,
}: IconButtonProps) {
  const iconColor: ColorName = tone === 'dark' ? 'onCamera' : 'ink';
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityLabel={accessibilityLabel}
      style={[styles.base, tone === 'dark' ? styles.dark : styles.light, style]}
    >
      <Icon name={icon} size={22} color={iconColor} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  light: {
    backgroundColor: colors.surface,
    boxShadow: shadows.card,
  },
  dark: {
    backgroundColor: colors.cameraControl,
  },
});
