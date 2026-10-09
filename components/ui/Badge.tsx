import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { type ColorName, colors, radii, spacing } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

type BadgeTone = 'primary' | 'forest' | 'slate' | 'amber' | 'sun' | 'glass';

type BadgeProps = {
  label: string;
  icon?: IconName;
  tone?: BadgeTone;
  style?: StyleProp<ViewStyle>;
};

const toneColor: Record<BadgeTone, ColorName> = {
  primary: 'primaryDeep',
  forest: 'forestDeep',
  slate: 'slateDeep',
  amber: 'amberDeep',
  sun: 'ink',
  glass: 'primaryDeep',
};

/** Small uppercase pill: labels like "PHOTO ID", "Best guess", "Soon". */
export function Badge({ label, icon, tone = 'primary', style }: BadgeProps) {
  const fg = toneColor[tone];
  return (
    <View style={[styles.base, toneStyles[tone], style]}>
      {icon && <Icon name={icon} size={13} color={fg} />}
      <Text variant="captionStrong" color={fg}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radii.pill,
  },
});

const toneStyles = StyleSheet.create({
  primary: { backgroundColor: colors.primarySoft },
  forest: { backgroundColor: colors.forestSoft },
  slate: { backgroundColor: colors.slateSoft },
  amber: { backgroundColor: colors.sunSoft },
  sun: { backgroundColor: colors.sunSoft },
  glass: {
    backgroundColor: colors.glass,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassEdge,
  },
});
