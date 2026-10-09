import { StyleSheet, View } from 'react-native';

import { Icon, Text } from '@/components/ui';
import { type Edibility, type SpecimenKind } from '@/lib/types';
import { colors, radii, spacing } from '@/theme';

import { EDIBILITY_META, MUSHROOM_DISCLAIMER } from './kinds';

type SafetyBannerProps = {
  kind: SpecimenKind;
  edibility: Edibility;
  warning: string;
};

/**
 * Safety first: every mushroom gets the banner with the fixed disclaimer, and rocks only get one
 * when the model reports a real hazard.
 */
export function SafetyBanner({ kind, edibility, warning }: SafetyBannerProps) {
  const isMushroom = kind === 'mushroom';
  if (!isMushroom && !warning) return null;

  const meta = isMushroom && edibility !== 'not_applicable' ? EDIBILITY_META[edibility] : null;
  const danger = meta?.danger ?? false;
  const title = meta?.label ?? 'Handle with care';

  return (
    <View
      accessible
      accessibilityRole="alert"
      accessibilityLabel={`${title}. ${warning} ${isMushroom ? MUSHROOM_DISCLAIMER : ''}`}
      style={[styles.box, danger ? styles.danger : styles.caution]}
    >
      <Icon name={meta?.icon ?? 'warning'} size={22} color={danger ? 'danger' : 'amberDeep'} />
      <View style={styles.copy}>
        <Text variant="bodyStrong" color={danger ? 'danger' : 'amberDeep'}>
          {title}
        </Text>
        {!!warning && <Text variant="body">{warning}</Text>}
        {isMushroom && (
          <Text variant="captionStrong" color="ink">
            {MUSHROOM_DISCLAIMER}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
  },
  danger: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.danger,
  },
  caution: {
    backgroundColor: colors.sunSoft,
    borderColor: colors.amber,
  },
  copy: {
    flex: 1,
    gap: spacing.xxs,
  },
});
