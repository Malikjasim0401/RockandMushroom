import * as Haptics from 'expo-haptics';
import { StyleSheet, View } from 'react-native';

import { PressableScale } from '@/components/ui';
import { colors, layout, motion, radii } from '@/theme';

type ShutterButtonProps = {
  onPress: () => void;
  disabled?: boolean;
};

const lightTap = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
};

/** Brief: scale 0.92 on press with a spring back, plus a light haptic. */
export function ShutterButton({ onPress, disabled }: ShutterButtonProps) {
  return (
    <PressableScale
      onPress={onPress}
      onPressIn={lightTap}
      disabled={disabled}
      scaleTo={motion.pressScale.shutter}
      accessibilityLabel="Take photo"
      accessibilityHint="Captures the photo and identifies the specimen"
      style={[styles.ring, disabled && styles.disabled]}
    >
      <View style={styles.core} />
    </PressableScale>
  );
}

const CORE = layout.shutter - 16;

const styles = StyleSheet.create({
  ring: {
    width: layout.shutter,
    height: layout.shutter,
    borderRadius: radii.pill,
    borderWidth: 4,
    borderColor: colors.shutterRing,
    alignItems: 'center',
    justifyContent: 'center',
  },
  core: {
    width: CORE,
    height: CORE,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
});
