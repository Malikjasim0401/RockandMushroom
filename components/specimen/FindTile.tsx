import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { GradientBg, Icon, PressableScale, Text } from '@/components/ui';
import { formatSeenShort } from '@/lib/format';
import { type Find } from '@/lib/types';
import { colors, enter, motion, radii, shadows, spacing } from '@/theme';

import { KIND_META } from './kinds';
import { SpecimenPhoto } from './SpecimenPhoto';

export const TILE_WIDTH = 168;
export const TILE_HEIGHT = 212;

/** Tiles beyond this index skip the entrance, so the carousel never waits on a stagger. */
const ANIMATED_TILES = 6;

type FindTileProps = {
  find: Find;
  index: number;
  onPress: (id: string) => void;
};

/** Carousel tile for Home: the photo full-bleed with the name over a dark scrim. */
export const FindTile = memo(function FindTile({ find, index, onPress }: FindTileProps) {
  return (
    <Animated.View entering={index < ANIMATED_TILES ? enter(index) : undefined}>
      <PressableScale
        onPress={() => onPress(find.id)}
        scaleTo={motion.pressScale.card}
        accessibilityLabel={`${find.name}, ${find.kind}, found ${formatSeenShort(find.seenAt)}`}
        accessibilityHint="Opens the find"
        style={styles.tile}
      >
        <SpecimenPhoto find={find} style={StyleSheet.absoluteFill} />
        <GradientBg variant="camera" style={styles.scrim} />
        <View style={styles.kind}>
          <Icon name={KIND_META[find.kind].icon} size={16} color="primaryDeep" />
        </View>
        <View style={styles.text}>
          <Text variant="section" color="onCamera" numberOfLines={1}>
            {find.name}
          </Text>
          <Text variant="caption" color="onCameraMuted" numberOfLines={1}>
            {formatSeenShort(find.seenAt)}
          </Text>
        </View>
      </PressableScale>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  tile: {
    width: TILE_WIDTH,
    height: TILE_HEIGHT,
    borderRadius: radii.card,
    backgroundColor: colors.cameraBg,
    boxShadow: shadows.card,
    overflow: 'hidden',
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
  },
  kind: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    width: 30,
    height: 30,
    borderRadius: radii.pill,
    backgroundColor: colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    bottom: spacing.sm,
    gap: 1,
  },
});
