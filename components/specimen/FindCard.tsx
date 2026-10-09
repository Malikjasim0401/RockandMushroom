import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Icon, PressableScale, Text } from '@/components/ui';
import { formatSeenShort } from '@/lib/format';
import { type Find } from '@/lib/types';
import { colors, enter, motion, radii, shadows, spacing } from '@/theme';

import { KIND_META } from './kinds';
import { SpecimenPhoto } from './SpecimenPhoto';

/** Cards beyond this index skip the entrance, so long lists never wait on a stagger. */
const ANIMATED_CARDS = 12;

type FindCardProps = {
  find: Find;
  index: number;
  onPress: (id: string) => void;
};

/** Journal grid card. Fades in and rises 8 px, staggered 40 ms. */
export const FindCard = memo(function FindCard({ find, index, onPress }: FindCardProps) {
  return (
    <Animated.View entering={index < ANIMATED_CARDS ? enter(index) : undefined} style={styles.wrap}>
      <PressableScale
        onPress={() => onPress(find.id)}
        scaleTo={motion.pressScale.card}
        accessibilityLabel={`${find.name}, ${find.kind}, found ${formatSeenShort(find.seenAt)}`}
        accessibilityHint="Opens the find"
        style={styles.card}
      >
        <View>
          <SpecimenPhoto find={find} recycle style={styles.photo} />
          <View style={styles.kind}>
            <Icon name={KIND_META[find.kind].icon} size={14} color="primaryDeep" />
            <Text variant="captionStrong" color="primaryDeep">
              {KIND_META[find.kind].label.toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={styles.body}>
          <Text variant="section" numberOfLines={1}>
            {find.name}
          </Text>
          <Text variant="scientificSmall" numberOfLines={1}>
            {find.scientificName}
          </Text>
          <Text variant="caption">{formatSeenShort(find.seenAt)}</Text>
        </View>
      </PressableScale>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  // Exact half width, so an odd last card doesn't stretch; the grid offsets the padding.
  wrap: {
    width: '50%',
    paddingHorizontal: spacing.sm / 2,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    boxShadow: shadows.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
    overflow: 'hidden',
  },
  photo: {
    aspectRatio: 1,
  },
  body: {
    padding: spacing.sm,
    gap: 2,
  },
  kind: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.glass,
  },
});
