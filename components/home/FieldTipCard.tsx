import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card, Icon, Text } from '@/components/ui';
import { colors, radii, spacing } from '@/theme';

import { tipOfTheDay } from './tips';

/** One short, practical tip per day for rock hounds and foragers. */
export function FieldTipCard() {
  const tip = useMemo(() => tipOfTheDay(), []);
  return (
    <Card>
      <View
        accessible
        accessibilityLabel={`Field tip. ${tip.title}. ${tip.text}`}
        style={styles.row}
      >
        <View style={styles.icon}>
          <Icon name={tip.icon} size={20} color="amberDeep" />
        </View>
        <View style={styles.copy}>
          <Text variant="captionStrong" color="amberDeep">
            FIELD TIP
          </Text>
          <Text variant="bodyStrong" color="ink">
            {tip.title}
          </Text>
          <Text variant="body">{tip.text}</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.sunSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
});
