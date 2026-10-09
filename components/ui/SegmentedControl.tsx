import { useEffect, useRef, useState } from 'react';
import { type LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { type ColorName, colors, layout, motion, radii, shadows, spacing } from '@/theme';

import { Badge } from './Badge';
import { Text } from './Text';

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
  disabled?: boolean;
  /** Small tag shown next to the label, e.g. "Soon". */
  badge?: string;
};

type SegmentedControlProps<T extends string> = {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  tone?: 'light' | 'dark';
  accessibilityLabel: string;
};

const PAD = 4;

const labelColor = {
  light: { on: 'primaryDeep', off: 'inkMuted' },
  dark: { on: 'ink', off: 'onCameraMuted' },
} as const satisfies Record<string, Record<'on' | 'off', ColorName>>;

/** Pill switch with a sliding thumb. `dark` sits on the camera panel. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  tone = 'light',
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  const [width, setWidth] = useState(0);
  const segment = width > 0 ? (width - PAD * 2) / options.length : 0;
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );

  const x = useSharedValue(0);
  const hasLaidOut = useRef(false);

  useEffect(() => {
    if (segment === 0) return;
    const target = index * segment;
    // First layout snaps into place; later changes slide.
    if (!hasLaidOut.current) {
      hasLaidOut.current = true;
      x.set(target);
      return;
    }
    x.set(
      withTiming(target, {
        duration: motion.duration.base,
        easing: motion.easing,
        reduceMotion: ReduceMotion.System,
      }),
    );
  }, [index, segment, x]);

  const thumbStyle = useAnimatedStyle(() => ({
    width: segment,
    transform: [{ translateX: x.get() }],
  }));

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const dark = tone === 'dark';

  return (
    <View
      onLayout={onLayout}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={[styles.track, dark ? styles.trackDark : styles.trackLight]}
    >
      {segment > 0 && (
        <Animated.View
          style={[styles.thumb, dark ? styles.thumbDark : styles.thumbLight, thumbStyle]}
        />
      )}
      {options.map((option) => {
        const selected = option.value === value;
        const fg = labelColor[tone][selected ? 'on' : 'off'];
        return (
          <Pressable
            key={option.value}
            onPress={() => !selected && onChange(option.value)}
            disabled={option.disabled}
            accessibilityRole="tab"
            accessibilityLabel={option.badge ? `${option.label}, ${option.badge}` : option.label}
            accessibilityState={{ selected, disabled: !!option.disabled }}
            style={[styles.segment, option.disabled && styles.disabled]}
          >
            {/* One line, shrinking slightly rather than wrapping when labels are long. */}
            <Text
              variant="label"
              color={fg}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {option.label}
            </Text>
            {option.badge && <Badge label={option.badge} tone="sun" style={styles.badge} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: PAD,
    borderRadius: radii.pill,
  },
  trackLight: {
    backgroundColor: colors.primarySoft,
  },
  trackDark: {
    backgroundColor: colors.cameraControl,
  },
  thumb: {
    position: 'absolute',
    top: PAD,
    bottom: PAD,
    left: PAD,
    borderRadius: radii.pill,
  },
  thumbLight: {
    backgroundColor: colors.surface,
    boxShadow: shadows.card,
  },
  thumbDark: {
    backgroundColor: colors.onCamera,
  },
  segment: {
    flex: 1,
    minHeight: layout.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
  },
  disabled: {
    opacity: 0.6,
  },
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
});
