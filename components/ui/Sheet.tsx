import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, layout, radii, shadows, spacing, transitions } from '@/theme';

type SheetProps = {
  children: ReactNode;
  /** Scrolls its content when taller than maxHeight. */
  maxHeight?: `${number}%`;
  style?: StyleProp<ViewStyle>;
};

/**
 * Bottom sheet that springs up when mounted (brief: damping 18) and fades out when unmounted.
 * Mount it with a `key` to replay the entrance for new content.
 */
export function Sheet({ children, maxHeight = '72%', style }: SheetProps) {
  const { bottom } = useSafeAreaInsets();
  return (
    <Animated.View
      entering={transitions.sheetIn}
      exiting={transitions.fadeOut}
      style={[styles.sheet, { maxHeight }, style]}
    >
      <View style={styles.handle} />
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: bottom + spacing.lg }]}
      >
        {children}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.hero,
    borderTopRightRadius: radii.hero,
    boxShadow: shadows.raised,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.divider,
    marginTop: spacing.sm,
  },
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
});
