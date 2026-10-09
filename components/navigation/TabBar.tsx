import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { type BottomTabBarProps } from 'expo-router/js-tabs';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GradientBg, Icon, type IconName, PressableScale, Text } from '@/components/ui';
import { colors, layout, motion, radii, shadows, spacing } from '@/theme';

const TAB_META: Record<string, { label: string; icon: IconName; activeIcon: IconName }> = {
  index: { label: 'Home', icon: 'home', activeIcon: 'homeActive' },
  journal: { label: 'Finds', icon: 'journal', activeIcon: 'journalActive' },
};

// How far the camera button rises above the bar.
const RAISE = Math.round(layout.cameraButton * 0.42);

const bottomPadding = (insetBottom: number) => Math.max(insetBottom, spacing.xs);

// The bar floats this far above the bottom edge and the side edges.
const FLOAT_GAP = spacing.sm;

/** Bottom padding a tab screen needs so its content clears the floating tab bar. */
export function useTabBarInset() {
  const { bottom } = useSafeAreaInsets();
  return layout.tabBarHeight + bottomPadding(bottom) + FLOAT_GAP + spacing.md;
}

const openIdentify = () => router.push('/identify');

type TabItemProps = {
  label: string;
  icon: IconName;
  activeIcon: IconName;
  focused: boolean;
  onPress: () => void;
};

function TabItem({ label, icon, activeIcon, focused, onPress }: TabItemProps) {
  const progress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    progress.set(
      withTiming(focused ? 1 : 0, {
        duration: motion.duration.base,
        easing: motion.easing,
        reduceMotion: ReduceMotion.System,
      }),
    );
  }, [focused, progress]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: progress.get(),
    transform: [{ scaleX: 0.55 + 0.45 * progress.get() }],
  }));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      style={styles.tab}
    >
      <View style={styles.iconWrap}>
        <Animated.View style={[styles.pill, pillStyle]} />
        <Icon
          name={focused ? activeIcon : icon}
          size={22}
          color={focused ? 'primary' : 'inkFaint'}
        />
      </View>
      <Text variant="captionStrong" color={focused ? 'primary' : 'inkFaint'}>
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * Floating bar: Home · raised camera button · Finds. It overlays the scene so the gradient
 * shows behind its rounded corners, and the wrapper includes the raised area so the camera
 * button stays touchable on Android.
 */
export function TabBar({ state, navigation, insets }: BottomTabBarProps) {
  const tabs = state.routes.map((route, index) => {
    const meta = TAB_META[route.name];
    if (!meta) return null;
    const focused = state.index === index;

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      if (!focused && !event.defaultPrevented) {
        Haptics.selectionAsync().catch(() => {});
        navigation.navigate(route.name, route.params);
      }
    };

    return <TabItem key={route.key} {...meta} focused={focused} onPress={onPress} />;
  });

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { paddingBottom: bottomPadding(insets.bottom) + FLOAT_GAP }]}
    >
      <View style={styles.bar}>
        {tabs[0]}
        <View style={styles.centerSlot} />
        {tabs[1]}
      </View>
      <PressableScale
        onPress={openIdentify}
        scaleTo={motion.pressScale.shutter}
        accessibilityLabel="Identify a specimen"
        accessibilityHint="Opens the camera"
        style={styles.cameraButton}
      >
        <GradientBg variant="primary" style={styles.cameraFill}>
          <GradientBg variant="gloss" style={styles.cameraGloss} />
          <Icon name="camera" size={28} color="onPrimary" />
        </GradientBg>
      </PressableScale>
    </View>
  );
}

const PILL_W = 58;
const PILL_H = 32;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: RAISE,
    alignItems: 'center',
  },
  bar: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
    paddingHorizontal: spacing.lg,
    boxShadow: shadows.raised,
  },
  tab: {
    flex: 1,
    height: layout.tabBarHeight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  iconWrap: {
    width: PILL_W,
    height: PILL_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    ...StyleSheet.absoluteFill,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
  },
  centerSlot: {
    width: layout.cameraButton + spacing.xl,
  },
  cameraButton: {
    position: 'absolute',
    top: 0,
    width: layout.cameraButton,
    height: layout.cameraButton,
    borderRadius: radii.pill,
    borderWidth: 4,
    borderColor: colors.surface,
    backgroundColor: colors.surface,
    boxShadow: `${shadows.button}, ${shadows.cameraHalo}`,
  },
  cameraFill: {
    flex: 1,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cameraGloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
});
