import { StyleSheet, View } from 'react-native';

import { Icon, type IconName, Text } from '@/components/ui';
import { type SpecimenKind, type SpecimenTraits } from '@/lib/types';
import { colors, radii, spacing } from '@/theme';

import { filledTraits, type TraitGroup } from './kinds';

type TraitChipProps = {
  icon: IconName;
  label: string;
  value: string;
};

export function TraitChip({ icon, label, value }: TraitChipProps) {
  return (
    <View accessible accessibilityLabel={`${label}: ${value}`} style={styles.chip}>
      <View style={styles.icon}>
        <Icon name={icon} size={16} color="primary" />
      </View>
      <View style={styles.text}>
        <Text variant="caption">{label}</Text>
        <Text variant="bodyStrong" numberOfLines={3}>
          {value}
        </Text>
      </View>
    </View>
  );
}

type TraitGridProps = {
  kind: SpecimenKind;
  traits: SpecimenTraits;
  group?: TraitGroup;
};

/** Two-column grid of the traits that apply to this kind; empty traits are skipped. */
export function TraitGrid({ kind, traits, group }: TraitGridProps) {
  const items = filledTraits(kind, traits, group);
  if (items.length === 0) return null;
  return (
    <View style={styles.grid}>
      {items.map((t) => (
        <View key={t.key} style={styles.cell}>
          <TraitChip icon={t.icon} label={t.label} value={traits[t.key]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xxs,
    rowGap: spacing.xs,
  },
  cell: {
    width: '50%',
    paddingHorizontal: spacing.xxs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    minHeight: 64,
    borderRadius: radii.cardSm,
    backgroundColor: colors.bgTop,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: 1,
  },
});
