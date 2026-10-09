import { StyleSheet, View } from 'react-native';

import { GradientBg, Icon } from '@/components/ui';
import { colors, radii, shadows } from '@/theme';

type LogoProps = {
  size?: number;
};

/** Brand mark: a gem in a terracotta roundel with a small amber spark. */
export function Logo({ size = 76 }: LogoProps) {
  const sun = Math.round(size * 0.26);
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="RockAndMushroom"
      style={[styles.root, { width: size, height: size, borderRadius: size * 0.34 }]}
    >
      <GradientBg variant="primary" style={[styles.fill, { borderRadius: size * 0.34 }]}>
        <GradientBg variant="gloss" style={styles.gloss} />
        <Icon name="mineral" size={size * 0.5} color="onPrimary" />
      </GradientBg>
      <GradientBg
        variant="warm"
        style={[styles.sun, { width: sun, height: sun, top: -sun * 0.25, right: -sun * 0.25 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    boxShadow: shadows.button,
  },
  fill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  sun: {
    position: 'absolute',
    borderRadius: radii.pill,
    borderWidth: 3,
    borderColor: colors.surface,
  },
});
