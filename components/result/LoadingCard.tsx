import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, Skeleton, Text } from '@/components/ui';
import { useRotatingIndex } from '@/hooks/useRotatingIndex';
import { colors, layout, radii, shadows, spacing, transitions } from '@/theme';

export type LoadingPhase = 'preparing' | 'uploading' | 'identifying';

const LABEL: Record<LoadingPhase, string> = {
  preparing: 'Preparing your photo',
  uploading: 'Uploading photo',
  identifying: 'Identifying your specimen',
};

// While the model works, cycle through what a specimen expert would check.
const IDENTIFYING_LINES = [
  'Studying texture and color',
  'Checking luster and hardness',
  'Reading cap, gills and stem',
  'Comparing with known specimens',
] as const;

const LINE_MS = 1800;

/** Skeleton of the result sheet, shown until the ID returns. */
export function LoadingCard({ phase }: { phase: LoadingPhase }) {
  const { bottom } = useSafeAreaInsets();
  const line = useRotatingIndex(phase === 'identifying' ? IDENTIFYING_LINES.length : 0, LINE_MS);
  const text = phase === 'identifying' ? (IDENTIFYING_LINES[line] ?? LABEL[phase]) : LABEL[phase];
  return (
    <Animated.View
      entering={transitions.sheetIn}
      exiting={transitions.fadeOut}
      accessibilityRole="progressbar"
      accessibilityLabel={LABEL[phase]}
      style={[styles.card, { paddingBottom: bottom + spacing.lg }]}
    >
      <View style={styles.header}>
        <View style={styles.icon}>
          <Icon name="sparkles" size={16} color="primary" />
        </View>
        {/* Keyed so each new line fades in. */}
        <Animated.View key={text} entering={transitions.fadeIn}>
          <Text variant="label" color="primaryDeep">
            {text}…
          </Text>
        </Animated.View>
      </View>
      <Skeleton width="62%" height={26} radius={radii.button} />
      <Skeleton width="40%" height={16} />
      <View style={styles.grid}>
        <Skeleton width="48.5%" height={58} radius={radii.cardSm} />
        <Skeleton width="48.5%" height={58} radius={radii.cardSm} />
        <Skeleton width="48.5%" height={58} radius={radii.cardSm} />
        <Skeleton width="48.5%" height={58} radius={radii.cardSm} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    gap: spacing.sm,
    paddingTop: spacing.lg,
    paddingHorizontal: layout.screenPadding,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.hero,
    borderTopRightRadius: radii.hero,
    boxShadow: shadows.raised,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.xs,
    marginTop: spacing.xs,
  },
});
