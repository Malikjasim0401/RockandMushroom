import { type ReactNode, useCallback } from 'react';
import {
  type GestureResponderEvent,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { motion } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type PressableScaleProps = Omit<PressableProps, 'style' | 'children'> & {
  scaleTo?: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

/** Pressable that springs down on press. Falls back to an opacity dip under Reduce Motion. */
export function PressableScale({
  scaleTo = motion.pressScale.button,
  style,
  onPressIn,
  onPressOut,
  disabled,
  children,
  ...rest
}: PressableScaleProps) {
  const reduceMotion = useReducedMotion();
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    if (reduceMotion) return { opacity: 1 - pressed.get() * 0.25 };
    return { transform: [{ scale: 1 - pressed.get() * (1 - scaleTo) }] };
  });

  const handlePressIn = useCallback(
    (e: GestureResponderEvent) => {
      pressed.set(reduceMotion ? 1 : withSpring(1, motion.spring.press));
      onPressIn?.(e);
    },
    [pressed, reduceMotion, onPressIn],
  );

  const handlePressOut = useCallback(
    (e: GestureResponderEvent) => {
      pressed.set(reduceMotion ? 0 : withSpring(0, motion.spring.press));
      onPressOut?.(e);
    },
    [pressed, reduceMotion, onPressOut],
  );

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, animatedStyle]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
