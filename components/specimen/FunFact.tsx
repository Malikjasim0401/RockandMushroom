import { StyleSheet, View } from 'react-native';

import { Icon, Text } from '@/components/ui';
import { colors, radii, spacing } from '@/theme';

/** A single surprising fact. Renders nothing for finds saved before facts existed. */
export function FunFact({ text }: { text: string }) {
  if (!text) return null;
  return (
    <View accessible accessibilityLabel={`Did you know? ${text}`} style={styles.box}>
      <View style={styles.icon}>
        <Icon name="sparkles" size={16} color="amberDeep" />
      </View>
      <View style={styles.copy}>
        <Text variant="captionStrong" color="amberDeep">
          DID YOU KNOW
        </Text>
        <Text variant="body" color="ink">
          {text}
        </Text>
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
    backgroundColor: colors.sunSoft,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
});
