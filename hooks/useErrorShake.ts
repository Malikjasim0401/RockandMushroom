import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';
import {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const STEP = { duration: 50 };

/** Horizontal shake + error haptic for a rejected form. ~250 ms; skipped under Reduce Motion. */
export function useErrorShake() {
  const offset = useSharedValue(0);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.get() }],
  }));

  const shake = useCallback(() => {
    offset.set(
      withSequence(
        ReduceMotion.System,
        withTiming(-8, STEP),
        withTiming(8, STEP),
        withTiming(-5, STEP),
        withTiming(5, STEP),
        withTiming(0, STEP),
      ),
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  }, [offset]);

  return { shakeStyle, shake };
}
